"use client"

import { BlogList } from "./blog-list"

interface BlogListWrapperProps {
  limit?: number
  showExcerpt?: boolean
  className?: string
}

export function BlogListWrapper({ limit, showExcerpt, className }: BlogListWrapperProps) {
  return <BlogList limit={limit} showExcerpt={showExcerpt} className={className} />
}
