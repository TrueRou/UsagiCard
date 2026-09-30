import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { beforeEach, describe, it } from 'node:test'
import { ref } from 'vue'
import { useArtifactPin } from '../app/composables/useArtifactPin'
import { useSecondaryPinDialog } from '../app/composables/useSecondaryPinDialog'

const states = new Map<string, ReturnType<typeof ref>>()
const globals = globalThis as any

beforeEach(() => {
    states.clear()
    globals.useState = (key: string, init: () => unknown) => {
        if (!states.has(key))
            states.set(key, ref(init()))
        return states.get(key)
    }
    globals.useSecondaryPinDialog = useSecondaryPinDialog
})

describe('secondary PIN dialog', () => {
    it('shares a prompt between concurrent writes to the same artifact', async () => {
        const dialog = useSecondaryPinDialog()
        const first = dialog.request('card')
        const second = dialog.request('card')
        assert.equal(first, second)
        dialog.handleVerified('001234')
        assert.equal(await first, '001234')
        assert.equal(await second, '001234')
        assert.equal(dialog.open.value, false)
    })

    it('cancels an older artifact request and resets each prompt', async () => {
        const dialog = useSecondaryPinDialog()
        const first = dialog.request('first')
        const previousId = dialog.requestId.value
        const second = dialog.request('second', 'incorrect PIN')
        assert.equal(await first, null)
        assert.equal(dialog.errorMessage.value, 'incorrect PIN')
        assert.ok(dialog.requestId.value > previousId)
        dialog.handleClose()
        assert.equal(await second, null)
        assert.equal(dialog.artifactId.value, null)
    })
})

describe('artifact storage PIN requests', () => {
    it('does not prompt for unprotected writes', async () => {
        const { withSecondaryPin } = useArtifactPin('card')
        const result = await withSecondaryPin(async (headers) => {
            assert.deepEqual(headers, {})
            return 'saved'
        })
        assert.equal(result, 'saved')
    })

    it('re-prompts after a wrong PIN and clears the rejected cache', async () => {
        const prompts: string[] = []
        const pins = ['123456', '001234']
        globals.useSecondaryPinDialog = () => ({
            request: async (_id: string, message: string) => {
                assert.equal(states.get('artifact:card:secondary-pin')?.value, null)
                prompts.push(message)
                return pins.shift()
            },
        })
        const { withSecondaryPin } = useArtifactPin('card')
        const attempts: Record<string, string>[] = []
        const result = await withSecondaryPin(async (headers) => {
            attempts.push(headers)
            if (headers['X-Pin'] !== '001234')
                throw Object.assign(new Error('locked'), { statusCode: 423 })
            return 'saved'
        })
        assert.equal(result, 'saved')
        assert.deepEqual(attempts, [{}, { 'X-Pin': '123456' }, { 'X-Pin': '001234' }])
        assert.equal(prompts[0], '')
        assert.ok(prompts[1])
        assert.equal(states.get('artifact:card:secondary-pin')?.value, '001234')
    })

    it('does not retry or keep a stale PIN when cancelled', async () => {
        globals.useSecondaryPinDialog = () => ({ request: async () => null })
        const { withSecondaryPin } = useArtifactPin('card')
        states.get('artifact:card:secondary-pin')!.value = '123456'
        let attempts = 0
        const result = await withSecondaryPin(async () => {
            attempts += 1
            throw Object.assign(new Error('locked'), { status: 423 })
        })
        assert.equal(result, undefined)
        assert.equal(attempts, 1)
        assert.equal(states.get('artifact:card:secondary-pin')?.value, null)
    })

    it('does not intercept other errors', async () => {
        const { withSecondaryPin } = useArtifactPin('card')
        const error = Object.assign(new Error('forbidden'), { statusCode: 403 })
        await assert.rejects(withSecondaryPin(async () => {
            throw error
        }), error)
    })
})
