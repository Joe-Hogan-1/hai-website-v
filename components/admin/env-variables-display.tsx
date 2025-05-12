"use client"

import { useState, useEffect } from "react"

export function EnvVariablesDisplay() {
  const [variables, setVariables] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    // Only show public variables that start with NEXT_PUBLIC_
    const publicVars: Record<string, string | undefined> = {}

    // Get all environment variables that start with NEXT_PUBLIC_
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        publicVars[key] = process.env[key]
      }
    })

    setVariables(publicVars)
  }, [])

  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
      <p className="text-sm text-gray-500 mb-4">Only public variables (NEXT_PUBLIC_*) are shown</p>

      {Object.keys(variables).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(variables).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="font-mono text-sm">{key}</span>
              <span className="font-mono text-xs text-gray-600 truncate">
                {value ? (key.includes("KEY") ? "********" : value) : "Not defined"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-amber-600">No public environment variables found</p>
      )}
    </div>
  )
}
