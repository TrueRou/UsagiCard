import type { ComputedRef } from 'vue'
import type { StorageSaveFn } from '~/composables/useArtifact'
import type { ArtifactStorage, ArtifactUserResponse } from '~/types/api'
import { useScoreDisplayPref } from './useScoreDisplayPref'

/** 「全部成绩」的筛选、排序及共享视图统一保存到卡片。关键词不持久化。 */
export function useScoreViewState(
    artifactId: string,
    artifact: ComputedRef<ArtifactUserResponse & { storage: ArtifactStorage }>,
    storageSave: StorageSaveFn,
) {
    return useScoreDisplayPref(artifactId, artifact, storageSave, true)
}
