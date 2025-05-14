import type React from "react"

interface LeftAlignedTitleProps {
  children: React.ReactNode
  className?: string
}

export default function LeftAlignedTitle({ children, className = "" }: LeftAlignedTitleProps) {
  return (
    <h1
      className={`text-4xl font-bold mb-4 text-left w-full ${className}`}
      style={{
        textAlign: "left",
        position: "relative",
        left: 0,
        marginLeft: 0,
        paddingLeft: "2rem", // Match the CSS variable --title-left-padding
        textTransform: "lowercase",
        marginTop: "2.5rem", // Match the CSS variable --title-top-margin
      }}
    >
      {children}
    </h1>
  )
}
