import type { ArtifactUserResponse } from '~/types/api'

export interface UseQButtonCtx {
    artifact: Ref<ArtifactUserResponse>
    switchQuickAction: (actionKey: string) => void
    qDialogOpen: (val: boolean) => void
    qDialogOpened: Ref<boolean>
    quickActions: Ref<Record<string, FunctionQuickActionMeta> | undefined>
    activeQuickActionKey: Ref<string | undefined>
    activeQuickAction: ComputedRef<FunctionQuickActionMeta | undefined>
}
