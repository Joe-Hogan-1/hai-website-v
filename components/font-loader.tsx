"use client"

import { useEffect } from "react"

export function FontLoader() {
  useEffect(() => {
    // Add a class to the body when fonts are loaded
    if (typeof document !== "undefined") {
      document.fonts.ready.then(() => {
        document.body.classList.add("fonts-loaded")
      })
    }
  }, [])

  return null
}
