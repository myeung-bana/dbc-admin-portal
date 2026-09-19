'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  clampPage,
  DEFAULT_PAGE_SIZE,
  getPageSlice,
  getTotalPages,
} from '@/lib/pagination'

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const totalItems = items.length
  const totalPages = getTotalPages(totalItems, pageSize)
  const safePage = clampPage(page, totalItems, pageSize)

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const pageItems = useMemo(
    () => getPageSlice(items, safePage, pageSize),
    [items, safePage, pageSize],
  )

  function goToPage(nextPage: number) {
    setPage(clampPage(nextPage, totalItems, pageSize))
  }

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    goToPage,
  }
}
