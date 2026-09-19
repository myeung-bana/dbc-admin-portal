'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type FormEvent } from 'react'
import type { ActionResult } from '@/lib/actions/result'
import { handleActionResult } from '@/lib/toast/action-feedback'

type UseActionFormOptions<T> = {
  successMessage: string
  errorMessage?: string
  onSuccess?: (data: T | undefined) => void
  refresh?: boolean
}

export function useActionForm<T = void>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
  options: UseActionFormOptions<T>,
) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await action(formData)
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

  return { onSubmit, pending }
}
