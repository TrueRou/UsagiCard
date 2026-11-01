import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
// eslint-disable-next-line test/no-import-node-test -- Run with Bun without adding a test framework.
import { describe, it } from 'node:test'
import { useMaimaiUtils } from '../app/composables/function/MaimaiCN/useMaimaiUtils'

describe('maimai jacket URLs', () => {
    const { getSongJacketUrl } = useMaimaiUtils()

    it('always uses WebP images', () => {
        assert.equal(getSongJacketUrl(123), 'https://eo.assets.turou.fun/mai-jacket/images/123.webp')
    })

    it('uses the same jacket helper for lists and details', () => {
        for (const file of ['shared/chart-detail-modal.vue', 'shared/score-card.vue', 'shared/score-tile.vue', 'plates/plate-cell.vue']) {
            const source = readFileSync(new URL(`../app/components/function/maimai-cn/${file}`, import.meta.url), 'utf8')
            assert.match(source, /:src="getSongJacketUrl\([^)\s,]+\)"/)
            assert.doesNotMatch(source, /thumbnails/)
        }
    })
})
