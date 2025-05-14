"use client"

import { useEffect, useRef } from "react"

export default function AlignmentDebug() {
  const alignmentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get the title and category elements
    const titleElement = document.querySelector("h1.exact-align") as HTMLElement
    const categoryElement = document.querySelector("h2.exact-align") as HTMLElement

    if (!titleElement || !categoryElement || !alignmentRef.current) return

    // Get the position of the 'o' in "our products"
    const titleText = titleElement.textContent || ""
    const titleRect = titleElement.getBoundingClientRect()
    const titleStyle = window.getComputedStyle(titleElement)
    const titleFontSize = Number.parseFloat(titleStyle.fontSize)

    // Calculate the position of the 'o'
    const oPosition = titleElement.offsetLeft

    // Set the position for both elements
    titleElement.style.position = "relative"
    categoryElement.style.position = "relative"

    // Clear the elements
    const titleContent = titleElement.innerHTML
    const categoryContent = categoryElement.innerHTML

    // Reset the content
    titleElement.innerHTML = ""
    categoryElement.innerHTML = ""

    // Create a container for the title with exact positioning
    const titleContainer = document.createElement("div")
    titleContainer.innerHTML = titleContent
    titleContainer.style.position = "relative"
    titleContainer.style.left = "0"
    titleElement.appendChild(titleContainer)

    // Create a container for the category with exact positioning
    const categoryContainer = document.createElement("div")
    categoryContainer.innerHTML = categoryContent
    categoryContainer.style.position = "relative"

    // Calculate the offset needed to align 'C' with 'o'
    // This accounts for font size and weight differences
    const categoryOffset = -8 // Adjust this value as needed
    categoryContainer.style.left = `${categoryOffset}px`
    categoryElement.appendChild(categoryContainer)

    // Add a visual guide for alignment (can be removed later)
    if (alignmentRef.current) {
      const guide = document.createElement("div")
      guide.style.position = "absolute"
      guide.style.top = "0"
      guide.style.bottom = "0"
      guide.style.left = `${oPosition}px`
      guide.style.width = "1px"
      guide.style.backgroundColor = "transparent" // Change to 'red' to see the guide
      guide.style.zIndex = "1000"
      alignmentRef.current.appendChild(guide)
    }
  }, [])

  return <div ref={alignmentRef} className="alignment-container" />
}
