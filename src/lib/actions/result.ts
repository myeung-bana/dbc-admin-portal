export type ActionResult<T = void> =
  | { ok: true; data?: T; redirectTo?: string }
  | { ok: false; error: string }

export function actionError(error: string): ActionResult<never> {
  return { ok: false, error }
}

export function actionSuccess<T>(data?: T, redirectTo?: string): ActionResult<T> {
  return redirectTo ? { ok: true, data, redirectTo } : { ok: true, data }
}

export function fromDataResult<T>(
  result: { ok: true; data: T } | { ok: false; error: string },
): ActionResult<T> {
  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return { ok: true, data: result.data }
}

export function validationError(message = 'Invalid input'): ActionResult<never> {
  return { ok: false, error: message }
}
