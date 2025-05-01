"use client"

import { useEffect, useRef } from "react"
import { trackUserInteraction } from "@/utils/user-data"
import { trackInteraction } from "@/utils/cookies"

export default function InteractionTracker() {
  const isSetupRef = useRef(false)

  useEffect(() => {
    // Only set up once and only if user has consented to cookies
    if (isSetupRef.current || !document.cookie.includes("cookie_consent=true")) {
      return
    }

    isSetupRef.current = true

    // Track clicks on interactive elements
    const handleClick = (e: MouseEvent) => {
      // Find the closest element with an ID, data-id, or other identifiable attribute
      let target = e.target as HTMLElement
      let elementId = ""
      let elementType = ""

      // Try to find a trackable element by walking up the DOM tree
      while (target && target !== document.body) {
        // Check for ID
        if (target.id) {
          elementId = target.id
          elementType = target.tagName.toLowerCase()
          break
        }

        // Check for data-id attribute
        if (target.dataset.id) {
          elementId = target.dataset.id
          elementType = target.dataset.type || target.tagName.toLowerCase()
          break
        }

        // Check for common elements like buttons, links, etc.
        if (
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.classList.contains("button-hover") ||
          target.getAttribute("role") === "button"
        ) {
          elementId =
            target.id ||
            target.getAttribute("name") ||
            target.getAttribute("aria-label") ||
            target.textContent?.trim().substring(0, 20) ||
            `${target.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`

          elementType = target.tagName.toLowerCase()
          break
        }

        // Move up to parent
        target = target.parentElement as HTMLElement
      }

      // Only track if we found a trackable element
      if (elementId) {
        // Store locally
        trackInteraction(elementId, "click", elementType, {
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        })

        // Send to server if consent given
        trackUserInteraction("click", elementId, elementType, {
          x: e.clientX,
          y: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        }).catch(() => {
          // Silent error handling
        })
      }
    }

    // Track form submissions
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      const formId = form.id || form.getAttribute("name") || `form-${Math.random().toString(36).substring(2, 7)}`

      // Store locally
      trackInteraction(formId, "submit", "form", {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      })

      // Send to server if consent given
      trackUserInteraction("submit", formId, "form", {
        formAction: form.action,
        formMethod: form.method,
      }).catch(() => {
        // Silent error handling
      })
    }

    // Track video interactions
    const setupVideoTracking = () => {
      const videos = document.querySelectorAll("video")

      videos.forEach((video, index) => {
        const videoId = video.id || `video-${index}`

        // Play event
        video.addEventListener("play", () => {
          trackUserInteraction("play", videoId, "video", {
            currentTime: video.currentTime,
            duration: video.duration,
          }).catch(() => {
            // Silent error handling
          })
        })

        // Pause event
        video.addEventListener("pause", () => {
          trackUserInteraction("pause", videoId, "video", {
            currentTime: video.currentTime,
            duration: video.duration,
            percentWatched: (video.currentTime / video.duration) * 100,
          }).catch(() => {
            // Silent error handling
          })
        })

        // Ended event
        video.addEventListener("ended", () => {
          trackUserInteraction("ended", videoId, "video", {
            duration: video.duration,
          }).catch(() => {
            // Silent error handling
          })
        })
      })
    }

    // Set up event listeners
    document.addEventListener("click", handleClick)

    // Find and track all forms
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", handleSubmit)
    })

    // Set up video tracking
    setupVideoTracking()

    // Set up a mutation observer to track dynamically added elements
    const observer = new MutationObserver((mutations) => {
      let shouldCheckVideos = false
      let shouldCheckForms = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "VIDEO") {
              shouldCheckVideos = true
            } else if (node.nodeName === "FORM") {
              shouldCheckForms = true
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              if (element.querySelector("video")) {
                shouldCheckVideos = true
              }
              if (element.querySelector("form")) {
                shouldCheckForms = true
              }
            }
          })
        }
      })

      if (shouldCheckVideos) {
        setupVideoTracking()
      }

      if (shouldCheckForms) {
        document.querySelectorAll("form").forEach((form) => {
          if (!form.dataset.tracked) {
            form.addEventListener("submit", handleSubmit)
            form.dataset.tracked = "true"
          }
        })
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick)
      document.querySelectorAll("form").forEach((form) => {
        form.removeEventListener("submit", handleSubmit)
      })
      observer.disconnect()
    }
  }, [])

  return null // This component doesn't render anything
}
