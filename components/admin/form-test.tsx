"use client"

import { useState } from "react"

export default function FormTest() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testFormspree = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT

      if (!formspreeEndpoint) {
        setTestResult("❌ Error: NEXT_PUBLIC_FORMSPREE_ENDPOINT is not defined")
        return
      }

      const testData = new FormData()
      testData.append("name", "Test User")
      testData.append("email", "test@example.com")
      testData.append("message", "This is a test submission from the admin panel")
      testData.append("form", "test")

      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: testData,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        setTestResult(`✅ Success! Formspree is working correctly.\nResponse: ${JSON.stringify(result, null, 2)}`)
      } else {
        const errorText = await response.text()
        setTestResult(`❌ Error: Formspree returned status ${response.status}\nResponse: ${errorText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Form Submission Test</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Test your Formspree integration by sending a test submission.</p>
        <p className="text-sm font-medium">
          Endpoint: {process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "Not configured"}
        </p>
      </div>

      <button
        onClick={testFormspree}
        disabled={isLoading}
        className="bg-black text-white px-4 py-2 rounded-sm text-sm disabled:opacity-50"
      >
        {isLoading ? "Testing..." : "Test Formspree Connection"}
      </button>

      {testResult && (
        <div className={`mt-4 p-3 rounded-sm text-sm ${testResult.startsWith("✅") ? "bg-green-50" : "bg-red-50"}`}>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  )
}
