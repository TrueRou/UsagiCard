import type { ArtifactStorage, ArtifactUserResponse } from '../app/types/api'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { afterEach, describe, it } from 'node:test'
import { computed, ref, toRaw } from 'vue'
import { defaultScores } from '../app/composables/function/MaimaiCN/useScorePreferences'
import { useArtifact } from '../app/composables/useArtifact'
import { diffStorage, rollbackStoragePatch } from '../app/utils/storagePatch'

const originals = new Map(['computed', 'ref', 'toRaw', 'useNuxtApp', 'useLeporidae', 'useDesign']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))

afterEach(() => {
    for (const [key, descriptor] of originals) {
        if (descriptor)
            Object.defineProperty(globalThis, key, descriptor)
        else
            Reflect.deleteProperty(globalThis, key)
    }
})

function merge(current: unknown, patch: unknown): unknown {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch))
        return patch
    const previous = current && typeof current === 'object' ? current as Record<string, unknown> : {}
    const result = { ...previous }
    for (const [key, value] of Object.entries(patch))
        result[key] = merge(previous[key], value)
    return result
}

async function setup(beforeSave?: () => Promise<void>) {
    const data = ref({
        storage: {
            UsagiCard: {
                bio: { card_title: 'keep-title', card_avatar: null, card_profile: 'keep-profile' },
                menu: { menu_tabs: ['first', 'second'], swipe: { enabled_mode: 'off' } },
                derived: { enabled_mode: 'off', derived_from: null },
            },
            MaimaiCN: {
                bio: { player_name: 'keep-player', player_rating: null, friend_code: null },
                update: { enabled_mode: 'off', last_updated_at: null, strategy: { sources: [], targets: [] } },
                view: { mode: 'list', tile_content: 'rating' },
                scores: defaultScores(),
            },
        },
    } as unknown as ArtifactUserResponse & { storage: ArtifactStorage })
    const calls: { path: string, method: string, body: { storage: unknown } }[] = []
    Object.assign(globalThis, {
        ref,
        computed,
        toRaw,
        useNuxtApp: () => ({
            $leporidae: async (path: string, options: { method: string, body: { storage: unknown } }) => {
                calls.push({ path, method: options.method, body: JSON.parse(JSON.stringify(options.body)) })
                await beforeSave?.()
                return { ...data.value, storage: merge(data.value.storage, options.body.storage) }
            },
        }),
        useLeporidae: async () => ({ data, error: ref(null) }),
        useDesign: () => ({}),
    })
    return { ...await useArtifact('card-a'), data, calls }
}

describe('storage patch helpers', () => {
    it('diffs full objects down to changed leaves and ignores absent or undefined keys', () => {
        const before = { profile: { title: 'old', description: 'keep' }, menu: ['a', 'b'] }
        assert.deepEqual(diffStorage(before, { profile: { title: 'new' } }), { profile: { title: 'new' } })
        assert.deepEqual(diffStorage(before, { ...before, profile: { ...before.profile, title: 'new' } }), { profile: { title: 'new' } })
        assert.deepEqual(diffStorage(before, { profile: {}, menu: undefined }), {})
        assert.deepEqual(diffStorage(before, { menu: ['a', 'b'] }), {})
    })

    it('replaces arrays including empty arrays and preserves null', () => {
        const before = { title: 'old' as string | null, sources: [{ server: 'first' }, { server: 'second' }] }
        assert.deepEqual(diffStorage(before, { title: null, sources: [] }), { title: null, sources: [] })
        assert.deepEqual(diffStorage(before, { sources: [{ server: 'second' }] }), { sources: [{ server: 'second' }] })
    })

    it('does not mutate inputs or treat object key ordering as a change', () => {
        const before = { nodes: [{ a: 1, b: 2 }] }
        assert.deepEqual(diffStorage(before, { nodes: [{ b: 2, a: 1 }] }), {})
        assert.deepEqual(before, { nodes: [{ a: 1, b: 2 }] })
        assert.deepEqual(diffStorage(undefined, { view: { mode: 'list' } }), { view: { mode: 'list' } })
        assert.deepEqual(diffStorage({ view: null as null | object }, { view: {} }), { view: {} })
    })

    it('rolls back only submitted fields while retaining subsequent edits', () => {
        const before = { view: { mode: 'list', content: 'rating' } }
        const draft = { view: { mode: 'tile', content: 'fc' }, extra: 'unrelated' }
        rollbackStoragePatch(draft, before, { view: { mode: 'tile' } })
        assert.deepEqual(draft, { view: { mode: 'list', content: 'fc' }, extra: 'unrelated' })
        draft.view.mode = 'newer-choice'
        rollbackStoragePatch(draft, before, { view: { mode: 'tile' } })
        assert.equal(draft.view.mode, 'newer-choice')
    })
})

describe('useArtifact incremental storage requests', () => {
    it('sends a single changed leaf for an existing full-object caller', async () => {
        const { storageOf, storageSave, artifact, calls } = await setup()
        const draft = storageOf('MaimaiCN').value
        draft.scores!.sort.limit = 50
        await storageSave('MaimaiCN', draft)
        assert.deepEqual(calls, [{
            path: '/api/artifacts/card-a/storage',
            method: 'PATCH',
            body: { storage: { MaimaiCN: { scores: { sort: { limit: 50 } } } } },
        }])
        assert.equal(artifact.value.storage.UsagiCard!.bio.card_title, 'keep-title')
        assert.equal(artifact.value.storage.MaimaiCN!.bio.player_name, 'keep-player')
        assert.equal(artifact.value.storage.MaimaiCN!.scores!.sort.limit, 50)
    })

    it('accepts deep partial updates, empty arrays and explicit null', async () => {
        const { storageSave, artifact, calls } = await setup()
        await storageSave('UsagiCard', { bio: { card_title: null }, menu: { menu_tabs: [] } })
        assert.deepEqual(calls[0]!.body, { storage: { UsagiCard: { bio: { card_title: null }, menu: { menu_tabs: [] } } } })
        assert.equal(artifact.value.storage.UsagiCard!.bio.card_profile, 'keep-profile')
        assert.equal(artifact.value.storage.UsagiCard!.bio.card_title, null)
        assert.deepEqual(artifact.value.storage.UsagiCard!.menu.menu_tabs, [])
    })

    it('skips requests when nothing changed', async () => {
        const { storageOf, storageSave, calls, storageSaving } = await setup()
        await storageSave('MaimaiCN', storageOf('MaimaiCN').value)
        await storageSave('UsagiCard', { bio: {} })
        assert.equal(calls.length, 0)
        assert.equal(storageSaving.value, false)
    })

    it('rolls back a failed submitted value without filling a partial draft with unrelated fields', async () => {
        const { storageSave, artifact } = await setup(async () => {
            throw new Error('offline')
        })
        const draft = { bio: { card_title: 'new-title' } }
        await assert.rejects(storageSave('UsagiCard', draft))
        assert.deepEqual(draft, { bio: { card_title: 'keep-title' } })
        assert.equal(artifact.value.storage.UsagiCard!.bio.card_title, 'keep-title')
    })

    it('does not roll back a newer edit made while a save was in flight', async () => {
        let fail!: () => void
        const barrier = new Promise<void>((_resolve, reject) => {
            fail = () => reject(new Error('offline'))
        })
        const { storageSave } = await setup(() => barrier)
        const draft = { bio: { card_title: 'submitted-title' } }
        const saving = storageSave('UsagiCard', draft)
        draft.bio.card_title = 'newer-title'
        fail()
        await assert.rejects(saving)
        assert.equal(draft.bio.card_title, 'newer-title')
    })
})
