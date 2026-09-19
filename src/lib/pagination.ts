export const DEFAULT_PAGE_SIZE = 10

export function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

export function getPageSlice<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function getPageRange(page: number, pageSize: number, totalItems: number) {
  if (totalItems === 0) {
    return { start: 0, end: 0 }
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  return { start, end }
}

export function clampPage(page: number, totalItems: number, pageSize: number) {
  return Math.min(Math.max(1, page), getTotalPages(totalItems, pageSize))
}
