/**
 * 舞萌 DX 达成率计算（纯函数，无框架依赖）。
 *
 * 规则：
 * - 基础分 100%：按权重分摊，TAP/TOUCH=1，HOLD=2，SLIDE=3，BREAK=5。
 *   非 BREAK：PERFECT 100%，GREAT 80%，GOOD 50%，MISS 0。
 *   BREAK：PERFECT 5，GREAT 4/3/2.5（2000/1500/1250），GOOD 2，MISS 0。
 * - 绝赞奖励 1%：按 BREAK 数平分，CRITICAL 1，PERFECT 0.75/0.5，GREAT 0.4，GOOD 0.3，MISS 0。
 * - 达成率显示截断到 4 位小数。
 */

export interface NoteCounts {
    tap: number
    hold: number
    slide: number
    touch: number
    break: number
}

export type NoteKind = keyof NoteCounts

export const NOTE_KINDS: NoteKind[] = ['tap', 'hold', 'slide', 'touch', 'break']

export const NOTE_WEIGHTS: Record<NoteKind, number> = {
    tap: 1,
    hold: 2,
    slide: 3,
    touch: 1,
    break: 5,
}

/** 鸟加阈值 */
export const SSS_PLUS_THRESHOLD = 100.5

export function totalWeight(notes: NoteCounts): number {
    return NOTE_KINDS.reduce((sum, kind) => sum + notes[kind] * NOTE_WEIGHTS[kind], 0)
}

export function totalNotes(notes: NoteCounts): number {
    return NOTE_KINDS.reduce((sum, kind) => sum + notes[kind], 0)
}

/** 截断到 4 位小数（加入极小偏移抵消浮点误差） */
export function truncateAchievement(value: number): number {
    return Math.floor(value * 10000 + 1e-6) / 10000
}

// ===== 权重矩阵 =====

export type WeightMode = '101-' | '100-' | '0+'

export interface WeightRow {
    kind: NoteKind
    count: number
    /** 非 BREAK 长度为 1；BREAK 为 [CRITICAL, PERFECT 0.75, PERFECT 0.5] */
    perfect: number[]
    /** 非 BREAK 长度为 1；BREAK 为 [2000, 1500, 1250] */
    great: number[]
    good: number
    miss: number
}

const NON_BREAK_RATIO = { perfect: 1, great: 0.8, good: 0.5, miss: 0 }
const BREAK_BASE = { perfect: 5, great: [4, 3, 2.5], good: 2, miss: 0 }
const BREAK_BONUS = { critical: 1, perfect: [0.75, 0.5], great: 0.4, good: 0.3, miss: 0 }

/**
 * 每个判定对达成率的影响（百分比）。
 * - `0+`：该判定贡献的达成率
 * - `101-`：相对理论值（101%）的扣分
 * - `100-`：基础分相对满分的扣分，绝赞奖励记为正数
 */
export function weightMatrix(notes: NoteCounts, mode: WeightMode): WeightRow[] {
    const weight = totalWeight(notes)
    const breakNum = notes.break
    const basePct = (base: number) => weight > 0 ? base / weight * 100 : 0
    const bonusPct = (bonus: number) => breakNum > 0 ? bonus / breakNum : 0

    return NOTE_KINDS.map((kind) => {
        if (kind !== 'break') {
            const w = NOTE_WEIGHTS[kind]
            const max = basePct(w)
            const value = (ratio: number) => {
                const contribution = basePct(w * ratio)
                return mode === '0+' ? contribution : contribution - max
            }
            return {
                kind,
                count: notes[kind],
                perfect: [value(NON_BREAK_RATIO.perfect)],
                great: [value(NON_BREAK_RATIO.great)],
                good: value(NON_BREAK_RATIO.good),
                miss: value(NON_BREAK_RATIO.miss),
            }
        }

        const maxBase = basePct(BREAK_BASE.perfect)
        const maxBonus = bonusPct(BREAK_BONUS.critical)
        const value = (base: number, bonus: number) => {
            const b = basePct(base)
            const p = bonusPct(bonus)
            if (mode === '0+')
                return b + p
            if (mode === '101-')
                return b + p - maxBase - maxBonus
            return b - maxBase + p
        }
        return {
            kind,
            count: notes.break,
            perfect: [
                value(BREAK_BASE.perfect, BREAK_BONUS.critical),
                value(BREAK_BASE.perfect, BREAK_BONUS.perfect[0]!),
                value(BREAK_BASE.perfect, BREAK_BONUS.perfect[1]!),
            ],
            great: BREAK_BASE.great.map(base => value(base, BREAK_BONUS.great)),
            good: value(BREAK_BASE.good, BREAK_BONUS.good),
            miss: value(BREAK_BASE.miss, BREAK_BONUS.miss),
        }
    })
}

// ===== 鸟加容错 =====

/**
 * 在给定绝赞 CRITICAL 比例下（其余绝赞按 PERFECT 0.75 计），
 * 保持达成率 ≥ 100.5% 时最多可容纳的 TAP GREAT 数量。
 * 没有 BREAK 的谱面理论最高 100%，返回 null 表示不可达成。
 *
 * 推导：100 - 20k/W + (cp + 0.75(b - cp)) / b ≥ 100.5  ⇒  k ≤ (cp + b)·W / (80b)
 */
export function sssPlusTolerance(notes: NoteCounts, criticalRatio: number): number | null {
    const breakNum = notes.break
    if (breakNum <= 0)
        return null
    const critical = Math.round(breakNum * Math.min(Math.max(criticalRatio, 0), 1))
    const weight = totalWeight(notes)
    return Math.floor((critical + breakNum) * weight / (80 * breakNum))
}

/** 单个 TAP GREAT 造成的达成率损失（百分比） */
export function tapGreatLoss(notes: NoteCounts): number {
    const weight = totalWeight(notes)
    return weight > 0 ? 20 / weight : 0
}

// ===== 判定矩阵 → 达成率 =====

export interface JudgeRow {
    critical: number
    perfect: number
    great: number
    good: number
    miss: number
}

export type JudgeMatrix = Record<NoteKind, JudgeRow>

export interface BreakSplit {
    /** PERFECT 中 0.75 奖励的数量，其余为 0.5 */
    perfectHigh: number
    /** GREAT 中各档的数量 */
    great2000: number
    great1500: number
    great1250: number
}

export function judgeRowTotal(row: JudgeRow): number {
    return row.critical + row.perfect + row.great + row.good + row.miss
}

export function createPerfectMatrix(notes: NoteCounts): JudgeMatrix {
    const matrix = {} as JudgeMatrix
    for (const kind of NOTE_KINDS)
        matrix[kind] = { critical: notes[kind], perfect: 0, great: 0, good: 0, miss: 0 }
    return matrix
}

export function matrixNoteCounts(matrix: JudgeMatrix): NoteCounts {
    const notes = {} as NoteCounts
    for (const kind of NOTE_KINDS)
        notes[kind] = judgeRowTotal(matrix[kind])
    return notes
}

/** 计算未截断的达成率（百分比） */
export function calcAchievement(matrix: JudgeMatrix, split: BreakSplit): number {
    const notes = matrixNoteCounts(matrix)
    const weight = totalWeight(notes)
    if (weight <= 0)
        return 0

    let base = 0
    for (const kind of NOTE_KINDS) {
        if (kind === 'break')
            continue
        const row = matrix[kind]
        const w = NOTE_WEIGHTS[kind]
        base += (row.critical + row.perfect) * w
            + row.great * w * NON_BREAK_RATIO.great
            + row.good * w * NON_BREAK_RATIO.good
    }

    const br = matrix.break
    const perfectLow = br.perfect - split.perfectHigh
    base += (br.critical + br.perfect) * BREAK_BASE.perfect
        + split.great2000 * BREAK_BASE.great[0]!
        + split.great1500 * BREAK_BASE.great[1]!
        + split.great1250 * BREAK_BASE.great[2]!
        + br.good * BREAK_BASE.good

    const bonus = br.critical * BREAK_BONUS.critical
        + split.perfectHigh * BREAK_BONUS.perfect[0]!
        + perfectLow * BREAK_BONUS.perfect[1]!
        + br.great * BREAK_BONUS.great
        + br.good * BREAK_BONUS.good

    const breakNum = notes.break
    return base / weight * 100 + (breakNum > 0 ? bonus / breakNum : 0)
}

/** 最好情况（PERFECT 全 0.75、GREAT 全 2000）与最坏情况（PERFECT 全 0.5、GREAT 全 1250） */
export function achievementBounds(matrix: JudgeMatrix): { best: number, worst: number } {
    const br = matrix.break
    return {
        best: calcAchievement(matrix, { perfectHigh: br.perfect, great2000: br.great, great1500: 0, great1250: 0 }),
        worst: calcAchievement(matrix, { perfectHigh: 0, great2000: 0, great1500: 0, great1250: br.great }),
    }
}

/** 当前达成率还能容纳多少个 TAP GREAT 仍保持鸟加；已低于鸟加返回 null */
export function remainingSssPlusTolerance(achievement: number, notes: NoteCounts): number | null {
    const loss = tapGreatLoss(notes)
    if (loss <= 0 || achievement + 1e-9 < SSS_PLUS_THRESHOLD)
        return null
    return Math.floor((achievement - SSS_PLUS_THRESHOLD) / loss + 1e-9)
}

export interface BreakSplitResult extends BreakSplit {
    perfectLow: number
    achievement: number
    tolerance: number | null
}

/**
 * 枚举 BREAK 的 PERFECT（0.75/0.5）与 GREAT（2000/1500/1250）分档组合，
 * 按截断后达成率与目标值的差距升序排列。
 */
export function enumerateBreakSplits(matrix: JudgeMatrix, target: number): BreakSplitResult[] {
    const notes = matrixNoteCounts(matrix)
    const { perfect, great } = matrix.break
    const results: BreakSplitResult[] = []

    for (let perfectHigh = 0; perfectHigh <= perfect; perfectHigh++) {
        for (let great2000 = 0; great2000 <= great; great2000++) {
            for (let great1500 = 0; great1500 <= great - great2000; great1500++) {
                const split = { perfectHigh, great2000, great1500, great1250: great - great2000 - great1500 }
                const achievement = truncateAchievement(calcAchievement(matrix, split))
                results.push({
                    ...split,
                    perfectLow: perfect - perfectHigh,
                    achievement,
                    tolerance: remainingSssPlusTolerance(achievement, notes),
                })
            }
        }
    }

    return results.sort((a, b) => Math.abs(a.achievement - target) - Math.abs(b.achievement - target)
        || b.achievement - a.achievement)
}

// ===== 达成率合法性验证 =====

/*
 * 整数化：基础分以「TAP 权重的 1/10」为单位，满分 10W；
 * 非 BREAK 的扣分选项：TAP/TOUCH {2,5,10}，HOLD {4,10,20}，SLIDE {6,15,30}；
 * BREAK 每个判定对应（奖励损失 BL，单位 0.05；基础分损失 BBL，单位 5）：
 *   CRITICAL (0,0) PERFECT75 (5,0) PERFECT50 (10,0)
 *   GREAT2000 (12,2) GREAT1500 (12,4) GREAT1250 (12,5) GOOD (14,6) MISS (20,10)
 * 设总基础损失 D（单位 0.1）、奖励损失 BL（单位 0.05），达成率 ×10000 为：
 *   X = 1010000 - D·100000/W - BL·500/b
 */

const NON_BREAK_LOSSES: Record<Exclude<NoteKind, 'break'>, number[]> = {
    tap: [2, 5, 10],
    hold: [4, 10, 20],
    slide: [6, 15, 30],
    touch: [2, 5, 10],
}

const BREAK_OPTIONS: [number, number][] = [
    [0, 0],
    [5, 0],
    [10, 0],
    [12, 2],
    [12, 4],
    [12, 5],
    [14, 6],
    [20, 10],
]

class BitSet {
    readonly words: Uint32Array
    constructor(readonly size: number) {
        this.words = new Uint32Array((size >> 5) + 1)
    }

    set(index: number) {
        this.words[index >> 5]! |= 1 << (index & 31)
    }

    has(index: number) {
        return index >= 0 && index < this.size && (this.words[index >> 5]! & (1 << (index & 31))) !== 0
    }

    isEmpty() {
        return this.words.every(word => word === 0)
    }

    /** this |= source << shift（截断超出 size 的位） */
    orShifted(source: BitSet, shift: number) {
        const wordShift = shift >> 5
        const bitShift = shift & 31
        const words = this.words
        const src = source.words
        for (let i = words.length - 1; i >= wordShift; i--) {
            const j = i - wordShift
            let value = src[j]! << bitShift
            if (bitShift !== 0 && j > 0)
                value |= src[j - 1]! >>> (32 - bitShift)
            words[i]! |= value
        }
        const extra = (words.length << 5) - this.size
        if (extra > 0)
            words[words.length - 1]! &= 0xFFFFFFFF >>> extra
    }

    forEach(callback: (index: number) => boolean | void) {
        for (let i = 0; i < this.words.length; i++) {
            let word = this.words[i]!
            while (word !== 0) {
                const bit = 31 - Math.clz32(word & -word)
                if (callback((i << 5) + bit) === true)
                    return
                word &= word - 1
            }
        }
    }
}

/** 非 BREAK 音符所有可能的基础分损失（单位：TAP 权重 1/10） */
function nonBreakLossSet(notes: NoteCounts): BitSet {
    const maxLoss = 10 * (notes.tap + notes.touch + 2 * notes.hold + 3 * notes.slide)
    let current = new BitSet(maxLoss + 1)
    current.set(0)
    for (const kind of ['tap', 'touch', 'hold', 'slide'] as const) {
        for (let i = 0; i < notes[kind]; i++) {
            const next = new BitSet(maxLoss + 1)
            next.orShifted(current, 0)
            for (const loss of NON_BREAK_LOSSES[kind])
                next.orShifted(current, loss)
            current = next
        }
    }
    return current
}

/** BREAK 的可达组合：table[BL] = 可达 BBL 的集合 */
function breakLossTable(breakNum: number, maxBonusLoss: number): BitSet[] {
    const bblSize = 10 * breakNum + 1
    const blSize = Math.min(20 * breakNum, maxBonusLoss) + 1
    let table: BitSet[] = Array.from({ length: blSize }, () => new BitSet(bblSize))
    table[0]!.set(0)
    for (let i = 0; i < breakNum; i++) {
        const next: BitSet[] = Array.from({ length: blSize }, () => new BitSet(bblSize))
        for (let bl = 0; bl < blSize; bl++) {
            const row = table[bl]!
            if (row.isEmpty())
                continue
            for (const [dBl, dBbl] of BREAK_OPTIONS) {
                if (bl + dBl < blSize)
                    next[bl + dBl]!.orShifted(row, dBbl)
            }
        }
        table = next
    }
    return table
}

/**
 * 判断达成率是否能由某种判定组合得到。
 * 兼容截断与四舍五入两种显示方式：要求真实值 X 满足 V - 0.5 ≤ X < V + 1（单位 0.0001%）。
 */
export function verifyAchievement(notes: NoteCounts, achievement: number): boolean {
    if (!Number.isFinite(achievement) || achievement < 0)
        return false
    const weight = totalWeight(notes)
    if (weight <= 0)
        return false
    const breakNum = notes.break
    const maxAchievement = breakNum > 0 ? 101 : 100
    if (achievement > maxAchievement)
        return false

    const target = Math.round(achievement * 10000)
    const nonBreak = nonBreakLossSet(notes)
    const nonBreakMax = nonBreak.size - 1
    // 基础分总损失 D 的可行区间（2X 的不等式，避免 0.5）
    const lossTarget = (breakNum > 0 ? 1010000 : 1000000) - target

    if (breakNum === 0) {
        // 1000000 - D·100000/W ∈ [V - 0.5, V + 1)
        const lo = Math.floor((2 * lossTarget - 2) * weight / 200000) + 1
        const hi = Math.floor((2 * lossTarget + 1) * weight / 200000)
        for (let d = Math.max(lo, 0); d <= Math.min(hi, nonBreakMax); d++) {
            if (nonBreak.has(d))
                return true
        }
        return false
    }

    // 2E = 200000·D/W + 1000·BL/b，要求 2L - 2 < 2E ≤ 2L + 1
    // BL·500/b ≤ L + 0.5 ⇒ 剪枝奖励损失上限
    const maxBonusLoss = Math.floor((2 * lossTarget + 1) * breakNum / 1000)
    if (maxBonusLoss < 0)
        return false
    const table = breakLossTable(breakNum, maxBonusLoss)
    const wb = weight * breakNum

    for (let bl = 0; bl < table.length; bl++) {
        const row = table[bl]!
        if (row.isEmpty())
            continue
        const bonusTerm = 1000 * weight * bl
        const lo = Math.floor(((2 * lossTarget - 2) * wb - bonusTerm) / (200000 * breakNum)) + 1
        const hi = Math.floor(((2 * lossTarget + 1) * wb - bonusTerm) / (200000 * breakNum))
        if (hi < 0 || lo > hi)
            continue
        let found = false
        row.forEach((bblUnit) => {
            const bbl = bblUnit * 5
            for (let d = Math.max(lo, bbl); d <= hi; d++) {
                if (nonBreak.has(d - bbl)) {
                    found = true
                    return true
                }
            }
            return false
        })
        if (found)
            return true
    }
    return false
}
