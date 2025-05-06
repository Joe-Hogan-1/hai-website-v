/**
 * Utility for implementing smooth scrolling behavior
 */

// Debounce function to limit how often scroll events fire
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Smooth scroll to element
export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// Smooth scroll to position
export function scrollToPosition(y: number): void {
  window.scrollTo({
    top: y,
    behavior: "smooth",
  })
}

// Get scroll progress (0 to 1)
export function getScrollProgress(): number {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  return scrollTop / scrollHeight
}

// Optimize scroll performance by disabling animations during scroll
let scrollTimeout: NodeJS.Timeout | null = null
let isScrolling = false

export function initScrollOptimizer(): void {
  if (typeof window === "undefined") return

  const handleScroll = () => {
    if (!isScrolling) {
      isScrolling = true
      document.body.classList.add("is-scrolling")
    }

    if (scrollTimeout) clearTimeout(scrollTimeout)

    scrollTimeout = setTimeout(() => {
      isScrolling = false
      document.body.classList.remove("is-scrolling")
    }, 100)
  }

  window.addEventListener("scroll", debounce(handleScroll, 10), { passive: true })
}
