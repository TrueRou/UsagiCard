import type { Ref } from 'vue'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { createRenderer, defineComponent, h, nextTick, onMounted, ref, Suspense, Teleport } from 'vue'
import { useFunctionsHeader, useProvideFunctionsHeader } from '../app/composables/useFunctionsHeader'

interface HostNode {
    type: string
    text: string
    parent: HostNode | null
    children: HostNode[]
}

function node(type: string, text = ''): HostNode {
    return { type, text, parent: null, children: [] }
}

function remove(child: HostNode) {
    if (child.parent) {
        child.parent.children.splice(child.parent.children.indexOf(child), 1)
        child.parent = null
    }
}

const renderer = createRenderer<HostNode, HostNode>({
    createElement: type => node(type),
    createText: text => node('text', text),
    createComment: text => node('comment', text),
    setText: (target, text) => { target.text = text },
    setElementText: (target, text) => { target.text = text },
    parentNode: target => target.parent,
    nextSibling: target => target.parent?.children[target.parent.children.indexOf(target) + 1] ?? null,
    patchProp: () => {},
    remove,
    insert(child, parent, anchor) {
        remove(child)
        const index = anchor ? parent.children.indexOf(anchor) : -1
        parent.children.splice(index < 0 ? parent.children.length : index, 0, child)
        child.parent = parent
    },
})

describe('functions header Teleport', () => {
    async function checkHeader(suspended: boolean) {
        const warnings: string[] = []
        const label = ref('refresh')
        let injected!: Readonly<Ref<HTMLElement | null>>
        let release!: () => void
        const pending = new Promise<void>((resolve) => {
            release = resolve
        })
        let resolveMounted!: () => void
        const mounted = new Promise<void>((resolve) => {
            resolveMounted = resolve
        })

        const Actions = defineComponent({
            setup() {
                injected = useFunctionsHeader()
                return () => injected.value
                    ? h(Teleport, { to: injected.value }, [h('button', label.value)])
                    : null
            },
        })
        const Page = defineComponent({
            async setup() {
                await pending
                return () => h(Actions)
            },
        })
        const Shell = defineComponent({
            setup() {
                const target = useProvideFunctionsHeader()
                onMounted(resolveMounted)
                return () => h('main', [
                    h('header', { ref: target }),
                    h(suspended ? Page : Actions),
                ])
            },
        })
        const root = node('root')
        const app = renderer.createApp({
            render: () => suspended ? h(Suspense, null, { default: () => h(Shell) }) : h(Shell),
        })
        app.config.warnHandler = message => warnings.push(message)
        app.mount(root)

        if (suspended) {
            assert.equal(root.children.some(child => child.type === 'main'), false)
            release()
            await pending
        }
        await mounted
        await nextTick()

        const header = injected.value as unknown as HostNode
        assert.equal(header.parent?.parent, root)
        assert.equal(header.children.find(child => child.type === 'button')?.text, 'refresh')

        label.value = 'updated'
        await nextTick()
        assert.equal(header.children.find(child => child.type === 'button')?.text, 'updated')

        app.unmount()
        assert.equal(injected.value, null)
        assert.equal(header.children.some(child => child.type === 'button'), false)
        assert.deepEqual(warnings, [])
    }

    for (const suspended of [false, true]) {
        it(`waits for the shell and survives updates (Suspense: ${suspended})`, () => checkHeader(suspended))
    }
})
