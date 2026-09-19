'use client'

import { toast } from 'sonner'
import type { ActionResult } from '@/lib/actions/result'

export function toastActionSuccess(message: string) {
  toast.success(message)
}

export function toastActionError(error: unknown, fallback = 'Something went wrong') {
  if (typeof error === 'string') {
    toast.error(error)
    return
  }

  toast.error(error instanceof Error ? error.message : fallback)
}

type HandleActionResultOptions<T> = {
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: T | undefined) => void
  onRedirect?: (path: string) => void
  onRefresh?: () => void
}

export function handleActionResult<T>(
  result: ActionResult<T>,
  options: HandleActionResultOptions<T> = {},
): boolean {
  if (!result.ok) {
    toastActionError(result.error, options.errorMessage)
    return false
  }

  if (options.successMessage) {
    toastActionSuccess(options.successMessage)
  }

  options.onSuccess?.(result.data)

  if (result.redirectTo) {
    ;(options.onRedirect ?? defaultRedirect)(result.redirectTo)
    return true
  }

  options.onRefresh?.()
  return true
}

function defaultRedirect(path: string) {
  window.location.assign(path)
}
