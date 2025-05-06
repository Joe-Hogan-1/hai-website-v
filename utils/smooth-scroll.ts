/**
 * Utility for implementing smooth scrolling behavior
 * Simplified to avoid initialization errors
 */

// Debounce function to limit how often scroll events fire
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Smooth scroll to position
export function scrollToPosition(y: number): void {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: y,
      behavior: "smooth",
    })
  }
}

// Get scroll progress (0 to 1)
export function getScrollProgress(): number {
  if (typeof window === "undefined") return 0

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  return scrollHeight > 0 ? scrollTop / scrollHeight : 0
}
