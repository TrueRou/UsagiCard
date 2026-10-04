import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { DEFAULT_VIEW, isSameView, normalizeView, resolveDisplayPref } from '../app/composables/function/MaimaiCN/useScoreDisplay'

describe('normalizeView', () => {
    it('falls back to defaults for missing or invalid fields', () => {
        assert.deepEqual(normalizeView(undefined), DEFAULT_VIEW)
        assert.deepEqual(normalizeView({ mode: 'grid', tile_content: 42 }), DEFAULT_VIEW)
        assert.deepEqual(normalizeView({ mode: 'tile' }), { mode: 'tile', tile_content: 'rating' })
    })
})

describe('resolveDisplayPref', () => {
    const card = { mode: 'tile', tile_content: 'fc' }

    it('prefers unsynced local changes over the card', () => {
        const local = { mode: 'list' as const, tile_content: 'achievement' as const, dirty: true }
        assert.deepEqual(resolveDisplayPref(card, local), { mode: 'list', tile_content: 'achievement' })
    })

    it('uses the card once local changes are synced', () => {
        const local = { mode: 'list' as const, tile_content: 'achievement' as const, dirty: false }
        assert.deepEqual(resolveDisplayPref(card, local), { mode: 'tile', tile_content: 'fc' })
    })

    it('falls back to local cache, then defaults, when the card has no view yet', () => {
        const local = { mode: 'tile' as const, tile_content: 'level' as const, dirty: false }
        assert.deepEqual(resolveDisplayPref(undefined, local), { mode: 'tile', tile_content: 'level' })
        assert.deepEqual(resolveDisplayPref(undefined, null), DEFAULT_VIEW)
    })

    it('ignores the dirty flag when comparing', () => {
        assert.equal(isSameView({ mode: 'tile', tile_content: 'fc' }, { mode: 'tile', tile_content: 'fc' }), true)
        assert.equal(isSameView({ mode: 'tile', tile_content: 'fc' }, { mode: 'list', tile_content: 'fc' }), false)
    })
})
