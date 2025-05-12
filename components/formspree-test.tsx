"use client"

import { useState } from "react"

export function FormspreeTest() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testFormspree = async () => {
    setLoading(true)
    setResult("Testing Formspree connection...")

    try {
      const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT

      if (!endpoint) {
        setResult("❌ Error: NEXT_PUBLIC_FORMSPREE_ENDPOINT is not defined")
        return
      }

      setResult(`Attempting to connect to: ${endpoint}`)

      const testData = new FormData()
      testData.append("_test", "true")
      testData.append("message", "This is a test submission")

      const response = await fetch(endpoint, {
        method: "POST",
        body: testData,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Success! Formspree is working. Response: ${JSON.stringify(data)}`)
      } else {
        const errorText = await response.text()
        setResult(`❌ Error: ${response.status} ${response.statusText}\n${errorText}`)
      }
    } catch (error) {
      setResult(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Formspree Connection Test</h3>
      <p className="mb-2">Current endpoint: {process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "Not defined"}</p>
      <button
        onClick={testFormspree}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-sm disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Formspree Connection"}
      </button>
      {result && <pre className="mt-4 p-3 bg-gray-100 rounded overflow-auto text-sm whitespace-pre-wrap">{result}</pre>}
    </div>
  )
}
