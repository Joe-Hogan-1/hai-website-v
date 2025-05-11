"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function StorageBucketFixer() {
  const [loading, setLoading] = useState(true)
  const [bucketStatus, setBucketStatus] = useState<any>({
    exists: false,
    accessible: false,
    policies: [],
    error: null,
    details: null,
  })
  const [repairStatus, setRepairStatus] = useState<string | null>(null)
  const [repairLoading, setRepairLoading] = useState(false)
  const [testFileStatus, setTestFileStatus] = useState<any>({
    uploaded: false,
    accessible: false,
    url: null,
    error: null,
  })

  useEffect(() => {
    checkBucketStatus()
  }, [])

  const checkBucketStatus = async () => {
    setLoading(true)
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        setBucketStatus({
          exists: false,
          accessible: false,
          policies: [],
          error: bucketsError.message,
          details: bucketsError,
        })
        setLoading(false)
        return
      }

      // Find the dispensary-images bucket (case insensitive)
      const bucket = buckets.find((b) => b.name.toLowerCase() === "dispensary-images")

      if (!bucket) {
        setBucketStatus({
          exists: false,
          accessible: false,
          policies: [],
          error: "Bucket not found",
          details: { buckets: buckets.map((b) => b.name) },
        })
        setLoading(false)
        return
      }

      // Try to list files to check access
      const { data: files, error: listError } = await supabase.storage.from("dispensary-images").list()

      // Get bucket policies
      const policies = []
      try {
        // This is a workaround since there's no direct API to get policies
        // We'll try different operations to infer policies
        const { data: signedUrl, error: signError } = await supabase.storage
          .from("dispensary-images")
          .createSignedUrl("test-policy-check.txt", 60)

        policies.push({
          operation: "createSignedUrl",
          allowed: !signError,
          error: signError?.message,
        })

        // Check if we can get public URL (should always work)
        const { data: publicUrl } = supabase.storage.from("dispensary-images").getPublicUrl("test-policy-check.txt")
        policies.push({
          operation: "getPublicUrl",
          allowed: !!publicUrl,
        })
      } catch (policiesError) {
        console.error("Error checking policies:", policiesError)
      }

      setBucketStatus({
        exists: true,
        accessible: !listError,
        files: files || [],
        policies,
        error: listError?.message || null,
        details: {
          bucket,
          listError: listError || null,
        },
      })

      // If bucket is accessible, check if we can upload and access a test file
      if (!listError) {
        await testFileUpload()
      }
    } catch (error) {
      console.error("Error checking bucket status:", error)
      setBucketStatus({
        exists: false,
        accessible: false,
        policies: [],
        error: error.message,
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const testFileUpload = async () => {
    try {
      // Create a small text file for testing
      const testContent = "This is a test file to verify storage bucket access."
      const testFile = new Blob([testContent], { type: "text/plain" })

      // Upload the test file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("dispensary-images")
        .upload("test-access-" + Date.now() + ".txt", testFile, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        setTestFileStatus({
          uploaded: false,
          accessible: false,
          url: null,
          error: uploadError.message,
        })
        return
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("dispensary-images").getPublicUrl(uploadData.path)
      const publicUrl = urlData.publicUrl

      // Try to access the file
      let accessible = false
      try {
        const response = await fetch(publicUrl, { method: "HEAD" })
        accessible = response.ok
      } catch (fetchError) {
        console.error("Error fetching test file:", fetchError)
      }

      setTestFileStatus({
        uploaded: true,
        accessible,
        url: publicUrl,
        error: null,
      })
    } catch (error) {
      console.error("Error testing file upload:", error)
      setTestFileStatus({
        uploaded: false,
        accessible: false,
        url: null,
        error: error.message,
      })
    }
  }

  const repairBucket = async () => {
    setRepairLoading(true)
    setRepairStatus("Starting bucket repair...")

    try {
      // Step 1: Check if bucket exists, create if not
      setRepairStatus("Checking if bucket exists...")
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        throw new Error(`Failed to list buckets: ${bucketsError.message}`)
      }

      const bucket = buckets.find((b) => b.name.toLowerCase() === "dispensary-images")

      if (!bucket) {
        setRepairStatus("Creating dispensary-images bucket...")
        const { error: createError } = await supabase.storage.createBucket("dispensary-images", {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          throw new Error(`Failed to create bucket: ${createError.message}`)
        }
      }

      // Step 2: Fix bucket policies using SQL function
      setRepairStatus("Fixing bucket policies...")

      // Try to use a direct SQL function if available
      const { error: policyError } = await supabase.rpc("fix_storage_bucket_policies", {
        bucket_name: "dispensary-images",
      })

      if (policyError) {
        console.warn("Could not use RPC to fix policies:", policyError)
        setRepairStatus("Using alternative method to fix policies...")

        // Alternative: Try to update bucket to be public
        const { error: updateError } = await supabase.storage.updateBucket("dispensary-images", {
          public: true,
        })

        if (updateError) {
          console.warn("Could not update bucket:", updateError)
        }
      }

      // Step 3: Test upload to verify fix
      setRepairStatus("Testing bucket access...")
      await testFileUpload()

      // Step 4: Final verification
      setRepairStatus("Verifying bucket status...")
      await checkBucketStatus()

      setRepairStatus("Repair completed successfully!")
    } catch (error) {
      console.error("Error repairing bucket:", error)
      setRepairStatus(`Repair failed: ${error.message}`)
    } finally {
      setRepairLoading(false)
    }
  }

  const createDirectBucketPolicies = async () => {
    setRepairLoading(true)
    setRepairStatus("Creating direct bucket policies...")

    try {
      // Execute SQL to create policies directly
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          -- Create policies for the dispensary-images bucket
          INSERT INTO storage.policies (name, bucket_id, definition, permission)
          VALUES 
            ('Allow public read access', 'dispensary-images', '{"bucket_id":"dispensary-images"}', 'SELECT'),
            ('Allow authenticated users to upload', 'dispensary-images', '{"bucket_id":"dispensary-images","auth.role":"authenticated"}', 'INSERT'),
            ('Allow authenticated users to update', 'dispensary-images', '{"bucket_id":"dispensary-images","auth.role":"authenticated"}', 'UPDATE'),
            ('Allow authenticated users to delete', 'dispensary-images', '{"bucket_id":"dispensary-images","auth.role":"authenticated"}', 'DELETE')
          ON CONFLICT (name, bucket_id, permission) 
          DO UPDATE SET definition = EXCLUDED.definition;
        `,
      })

      if (error) {
        throw new Error(`Failed to create policies: ${error.message}`)
      }

      setRepairStatus("Policies created successfully!")
      await checkBucketStatus()
    } catch (error) {
      console.error("Error creating policies:", error)
      setRepairStatus(`Failed to create policies: ${error.message}`)
    } finally {
      setRepairLoading(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Storage Bucket Diagnostic</span>
          <Button
            onClick={checkBucketStatus}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Checking..." : "Check Status"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Checking storage bucket status...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusCard
                title="Bucket Exists"
                status={bucketStatus.exists}
                icon={bucketStatus.exists ? CheckCircle : XCircle}
                details={
                  bucketStatus.exists
                    ? "The dispensary-images bucket exists in your Supabase project."
                    : "The dispensary-images bucket does not exist."
                }
              />
              <StatusCard
                title="Bucket Accessible"
                status={bucketStatus.accessible}
                icon={bucketStatus.accessible ? CheckCircle : XCircle}
                details={
                  bucketStatus.accessible
                    ? `The bucket is accessible. Found ${bucketStatus.files?.length || 0} files.`
                    : `Cannot access the bucket. Error: ${bucketStatus.error || "Unknown error"}`
                }
              />
            </div>

            {bucketStatus.exists && bucketStatus.accessible && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusCard
                  title="Test File Upload"
                  status={testFileStatus.uploaded}
                  icon={testFileStatus.uploaded ? CheckCircle : XCircle}
                  details={
                    testFileStatus.uploaded
                      ? "Successfully uploaded a test file to the bucket."
                      : `Failed to upload test file. Error: ${testFileStatus.error || "Unknown error"}`
                  }
                />
                <StatusCard
                  title="Test File Access"
                  status={testFileStatus.accessible}
                  icon={testFileStatus.accessible ? CheckCircle : XCircle}
                  details={
                    testFileStatus.accessible ? (
                      <div>
                        <p>Successfully accessed the test file.</p>
                        <a
                          href={testFileStatus.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                        >
                          View file
                        </a>
                      </div>
                    ) : (
                      "Could not access the test file. This indicates a permissions issue."
                    )
                  }
                />
              </div>
            )}

            {(!bucketStatus.exists || !bucketStatus.accessible || !testFileStatus.accessible) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                <AlertTriangle className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium text-yellow-800">Storage Bucket Issues Detected</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {!bucketStatus.exists && "The dispensary-images bucket does not exist. "}
                    {bucketStatus.exists &&
                      !bucketStatus.accessible &&
                      "The bucket exists but cannot be accessed. This is likely a permissions issue. "}
                    {bucketStatus.exists &&
                      bucketStatus.accessible &&
                      !testFileStatus.accessible &&
                      "The bucket is accessible but files cannot be accessed publicly. This is likely a policy issue. "}
                    These issues will prevent image uploads for dispensaries.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={repairBucket}
                      disabled={repairLoading}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      {repairLoading ? "Repairing..." : "Repair Bucket Automatically"}
                    </Button>
                    {bucketStatus.exists && (
                      <Button
                        onClick={createDirectBucketPolicies}
                        disabled={repairLoading}
                        size="sm"
                        variant="outline"
                        className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                      >
                        Fix Policies Only
                      </Button>
                    )}
                  </div>
                  {repairStatus && (
                    <div className="mt-2 text-sm text-yellow-800 bg-yellow-100 p-2 rounded">{repairStatus}</div>
                  )}
                </div>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Bucket Details</summary>
              <div className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                <h4 className="font-semibold mb-2">Policies:</h4>
                {bucketStatus.policies.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {bucketStatus.policies.map((policy, index) => (
                      <li key={index} className={policy.allowed ? "text-green-600" : "text-red-600"}>
                        {policy.operation}: {policy.allowed ? "Allowed" : "Denied"}
                        {policy.error && <span className="text-gray-500"> - {policy.error}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No policy information available</p>
                )}

                <h4 className="font-semibold mt-4 mb-2">Raw Details:</h4>
                <pre className="whitespace-pre-wrap">{JSON.stringify(bucketStatus.details, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusCard({ title, status, icon: Icon, details }) {
  return (
    <div className={`p-4 rounded-lg border ${status ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center">
        <Icon className={`h-5 w-5 mr-2 ${status ? "text-green-500" : "text-red-500"}`} />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="mt-2 text-sm text-gray-600">{details}</div>
    </div>
  )
}
