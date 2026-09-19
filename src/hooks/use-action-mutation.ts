'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { ActionResult } from '@/lib/actions/result'
import { handleActionResult } from '@/lib/toast/action-feedback'

type UseActionMutationOptions<T> = {
  successMessage: string
  errorMessage?: string
  onSuccess?: (data: T | undefined) => void
  refresh?: boolean
}

export function useActionMutation<T = void>(
  action: () => Promise<ActionResult<T>>,
  options: UseActionMutationOptions<T>,
) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function run() {
    startTransition(async () => {
      const result = await action()
      handleActionResult(result, {
        successMessage: options.successMessage,
        errorMessage: options.errorMessage,
        onSuccess: options.onSuccess,
        onRefresh:
          options.refresh !== false && result.ok && !result.redirectTo
            ? () => router.refresh()
            : undefined,
      })
    })
  }

  return { run, pending }
}
