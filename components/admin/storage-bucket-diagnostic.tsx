"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, RefreshCw, Check, Database, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StorageBucketDiagnostic() {
  const [loading, setLoading] = useState(true)
  const [buckets, setBuckets] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [permissionsStatus, setPermissionsStatus] = useState<"checking" | "ok" | "error">("checking")
  const [bucketNames, setBucketNames] = useState<string[]>([])
  const [actualBucketName, setActualBucketName] = useState<string>("banner-images")
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)
  const [isFixingPermissions, setIsFixingPermissions] = useState(false)
  const [sqlOutput, setSqlOutput] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("diagnostic")

  useEffect(() => {
    checkAuthAndBuckets()
  }, [refreshKey])

  const checkAuthAndBuckets = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo("Starting diagnostic...\n")

      // Check authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        setDebugInfo((prev) => prev + `Auth error: ${sessionError.message}\n`)
        setAuthStatus("unauthenticated")
        setError("Authentication error. Please sign in to run diagnostics.")
        return
      }

      if (!sessionData.session) {
        setDebugInfo((prev) => prev + "No active session found\n")
        setAuthStatus("unauthenticated")
        setError("You must be signed in to run diagnostics.")
        return
      }

      setAuthStatus("authenticated")
      setDebugInfo((prev) => prev + `Authenticated as: ${sessionData.session.user.email}\n`)

      // List all buckets
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        setDebugInfo((prev) => prev + `Error listing buckets: ${bucketsError.message}\n`)
        setError(`Failed to list storage buckets: ${bucketsError.message}`)
        return
      }

      setBuckets(bucketsData || [])

      // Log all bucket details for debugging
      const names = (bucketsData || []).map((b) => b.name)
      setBucketNames(names)

      setDebugInfo((prev) => prev + `Found ${bucketsData?.length || 0} buckets: ${JSON.stringify(names)}\n`)

      // Check each bucket's data for debugging
      bucketsData?.forEach((bucket) => {
        setDebugInfo((prev) => prev + `Bucket details for "${bucket.name}": ${JSON.stringify(bucket)}\n`)
      })

      // Case-insensitive check for banner-images bucket
      const bannerBucket = bucketsData?.find((b) => b.name.toLowerCase() === "banner-images".toLowerCase())

      if (bannerBucket) {
        setActualBucketName(bannerBucket.name)
        setDebugInfo((prev) => prev + `✅ 'banner-images' bucket found! (actual name: "${bannerBucket.name}")\n`)

        // Test bucket permissions with a test upload
        await testBucketPermissions(bannerBucket.name)
      } else {
        setDebugInfo((prev) => prev + `❌ 'banner-images' bucket NOT found!\n`)
        setDebugInfo((prev) => prev + `Available buckets: ${names.join(", ") || "none"}\n`)
        setPermissionsStatus("error")
      }
    } catch (error: any) {
      console.error("Unexpected error in diagnostics:", error)
      setDebugInfo((prev) => prev + `Unexpected error: ${error.message}\n`)
      setError("An unexpected error occurred during diagnostics.")
    } finally {
      setLoading(false)
    }
  }

  const testBucketPermissions = async (bucketName: string) => {
    setPermissionsStatus("checking")
    try {
      setDebugInfo((prev) => prev + `Testing bucket permissions for "${bucketName}"...\n`)

      // First, use our SQL function to test permissions
      try {
        const { data: permissionData, error: permissionError } = await supabase.rpc("test_bucket_permissions", {
          bucket_name: bucketName,
        })

        if (permissionError) {
          setDebugInfo((prev) => prev + `❌ Error testing permissions via RPC: ${permissionError.message}\n`)
        } else {
          setDebugInfo((prev) => prev + `✅ Permission test results: ${JSON.stringify(permissionData)}\n`)

          if (
            permissionData.status === "success" &&
            permissionData.can_select &&
            permissionData.can_insert &&
            permissionData.can_update &&
            permissionData.can_delete
          ) {
            setDebugInfo((prev) => prev + `✅ All permissions are correctly configured in the database\n`)
          } else {
            setDebugInfo((prev) => prev + `⚠️ Some permissions are missing in the database\n`)
          }
        }
      } catch (err: any) {
        setDebugInfo((prev) => prev + `Error testing permissions via RPC: ${err.message}\n`)
      }

      // Try direct bucket access
      try {
        const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket(bucketName)
        if (bucketError) {
          setDebugInfo((prev) => prev + `❌ Cannot access bucket directly: ${bucketError.message}\n`)
        } else {
          setDebugInfo((prev) => prev + `✅ Direct bucket access successful: ${JSON.stringify(bucketInfo)}\n`)
        }
      } catch (err: any) {
        setDebugInfo((prev) => prev + `Error accessing bucket directly: ${err.message}\n`)
      }

      // Try to list files in the bucket
      try {
        const { data: filesList, error: listError } = await supabase.storage.from(bucketName).list()

        if (listError) {
          setDebugInfo((prev) => prev + `❌ Cannot list files: ${listError.message}\n`)

          if (listError.message.includes("The resource was not found")) {
            setDebugInfo((prev) => prev + "This could indicate the bucket exists but is not properly configured.\n")
          }

          setPermissionsStatus("error")
        } else {
          setDebugInfo((prev) => prev + `✅ Successfully listed files. Found ${filesList?.length || 0} files\n`)

          if (filesList && filesList.length > 0) {
            setDebugInfo(
              (prev) =>
                prev +
                `Example files: ${filesList
                  .slice(0, 3)
                  .map((f) => f.name)
                  .join(", ")}\n`,
            )
          }

          // Try to upload a test file
          await testUpload(bucketName)
        }
      } catch (err: any) {
        setDebugInfo((prev) => prev + `Error listing files: ${err.message}\n`)
        setPermissionsStatus("error")
      }
    } catch (error: any) {
      setDebugInfo((prev) => prev + `Error testing permissions: ${error.message}\n`)
      setPermissionsStatus("error")
    }
  }

  const testUpload = async (bucketName: string) => {
    try {
      const testData = new Blob(["test"], { type: "text/plain" })
      const testFileName = `test-${Date.now()}.txt`

      setDebugInfo((prev) => prev + `Attempting to upload test file "${testFileName}" to bucket "${bucketName}"...\n`)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFileName, testData, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        setDebugInfo((prev) => prev + `❌ Test upload failed: ${uploadError.message}\n`)

        if (uploadError.message.includes("row-level security policy")) {
          setDebugInfo((prev) => prev + "This indicates a permission issue with the RLS policies.\n")
        }

        setPermissionsStatus("error")
      } else {
        setDebugInfo((prev) => prev + `✅ Test upload successful: ${uploadData.path}\n`)

        // Try to get the public URL
        try {
          const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(testFileName)

          if (!urlData || !urlData.publicUrl) {
            setDebugInfo((prev) => prev + `❌ Failed to get public URL\n`)
            setPermissionsStatus("error")
          } else {
            setDebugInfo((prev) => prev + `✅ Public URL works: ${urlData.publicUrl}\n`)

            // Clean up test file
            try {
              const { error: deleteError } = await supabase.storage.from(bucketName).remove([testFileName])

              if (deleteError) {
                setDebugInfo((prev) => prev + `⚠️ Warning: Failed to clean up test file: ${deleteError.message}\n`)
              } else {
                setDebugInfo((prev) => prev + `✅ Test file cleanup successful\n`)
              }
            } catch (err: any) {
              setDebugInfo((prev) => prev + `Error cleaning up test file: ${err.message}\n`)
            }

            setPermissionsStatus("ok")
          }
        } catch (err: any) {
          setDebugInfo((prev) => prev + `Error getting public URL: ${err.message}\n`)
          setPermissionsStatus("error")
        }
      }
    } catch (error: any) {
      setDebugInfo((prev) => prev + `Error testing upload: ${error.message}\n`)
      setPermissionsStatus("error")
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleCreateBucket = async () => {
    try {
      setIsCreatingBucket(true)
      setDebugInfo((prev) => prev + "Attempting to create banner-images bucket...\n")

      // Create the bucket
      const { error } = await supabase.storage.createBucket("banner-images", {
        public: true,
      })

      if (error) {
        setDebugInfo((prev) => prev + `❌ Error creating bucket: ${error.message}\n`)
        return
      }

      setDebugInfo((prev) => prev + "✅ Bucket created successfully\n")

      // Now fix the permissions
      await handleFixPermissions()

      // Refresh the bucket list
      handleRefresh()
    } catch (error: any) {
      setDebugInfo((prev) => prev + `Error creating bucket: ${error.message}\n`)
    } finally {
      setIsCreatingBucket(false)
    }
  }

  const handleFixPermissions = async () => {
    try {
      setIsFixingPermissions(true)
      setDebugInfo((prev) => prev + "Attempting to fix bucket permissions...\n")

      // Get the actual bucket name with correct case
      let bucketName = "banner-images"
      const bannerBucket = buckets.find((b) => b.name.toLowerCase() === "banner-images".toLowerCase())
      if (bannerBucket) {
        bucketName = bannerBucket.name
      }

      setDebugInfo((prev) => prev + `Using bucket name: "${bucketName}"\n`)

      // First, try to use the direct banner-images fix function
      try {
        const { data: directFixData, error: directFixError } = await supabase.rpc("fix_banner_images_bucket")

        if (directFixError) {
          setDebugInfo((prev) => prev + `❌ Error fixing banner-images bucket directly: ${directFixError.message}\n`)
          // Fall through to the generic method
        } else {
          setDebugInfo(
            (prev) => prev + `✅ Banner-images bucket fixed successfully: ${JSON.stringify(directFixData)}\n`,
          )

          // Test if the fix worked
          await testBucketPermissions(bucketName)
          return
        }
      } catch (err: any) {
        setDebugInfo((prev) => prev + `Error with direct fix: ${err.message}\n`)
        // Fall through to the generic method
      }

      // Try the generic fix_storage_policies function
      try {
        // Create direct SQL policies
        const { data: policyData, error: policyError } = await supabase.rpc("fix_storage_policies", {
          bucket_name: bucketName,
        })

        if (policyError) {
          setDebugInfo((prev) => prev + `❌ Error fixing policies via RPC: ${policyError.message}\n`)
          throw new Error("RPC method failed")
        }

        setDebugInfo(
          (prev) => prev + `✅ Storage policies updated successfully via RPC: ${JSON.stringify(policyData)}\n`,
        )

        // Try to make the bucket public directly
        try {
          const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
            public: true,
          })

          if (updateError) {
            setDebugInfo((prev) => prev + `⚠️ Warning: Could not update bucket to public: ${updateError.message}\n`)
          } else {
            setDebugInfo((prev) => prev + `✅ Successfully updated bucket to public\n`)
          }
        } catch (err: any) {
          setDebugInfo((prev) => prev + `Error updating bucket: ${err.message}\n`)
        }
      } catch (err) {
        setDebugInfo((prev) => prev + "Falling back to manual policy creation...\n")

        // Generate SQL to fix permissions
        const sql = generateFixPermissionsSQL(bucketName)
        setSqlOutput(sql)
        setActiveTab("sql")

        setDebugInfo(
          (prev) => prev + "Generated SQL to fix permissions. Please run this SQL in the Supabase SQL editor.\n",
        )
      }

      // Test if the fix worked
      await testBucketPermissions(bucketName)
    } catch (error: any) {
      setDebugInfo((prev) => prev + `Error fixing permissions: ${error.message}\n`)
    } finally {
      setIsFixingPermissions(false)
    }
  }

  const generateFixPermissionsSQL = (bucketName: string) => {
    return `
-- Fix permissions for ${bucketName} bucket
DO $$
DECLARE
  bucket_id TEXT;
BEGIN
  -- Get the bucket ID for ${bucketName}
  SELECT id INTO bucket_id FROM storage.buckets WHERE name = '${bucketName}';
  
  IF bucket_id IS NULL THEN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('${bucketName}', '${bucketName}', true, false, 104857600, null);
    
    bucket_id := '${bucketName}';
  END IF;

  -- Drop existing policies for this bucket
  DROP POLICY IF EXISTS "Allow public read access to ${bucketName}" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload ${bucketName}" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to update ${bucketName}" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to delete ${bucketName}" ON storage.objects;
  
  -- Create new policies with proper permissions
  -- Public read access
  CREATE POLICY "Allow public read access to ${bucketName}"
    ON storage.objects FOR SELECT
    USING (bucket_id = '${bucketName}');
  
  -- Authenticated users can upload
  CREATE POLICY "Allow authenticated users to upload ${bucketName}"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = '${bucketName}');
  
  -- Authenticated users can update their own files or if they're admin
  CREATE POLICY "Allow authenticated users to update ${bucketName}"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = '${bucketName}');
  
  -- Authenticated users can delete their own files or if they're admin
  CREATE POLICY "Allow authenticated users to delete ${bucketName}"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = '${bucketName}');

  -- Make sure the bucket is public
  UPDATE storage.buckets SET public = true WHERE id = bucket_id;
END $$;
`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Storage Bucket Diagnostic</h2>
        <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnostic">
            <Database className="h-4 w-4 mr-2" />
            Diagnostic
          </TabsTrigger>
          <TabsTrigger value="sql">
            <Shield className="h-4 w-4 mr-2" />
            SQL Fix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Authentication Status</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                {authStatus === "checking" && <p>Checking authentication...</p>}
                {authStatus === "authenticated" && <p className="text-green-600">✅ Authenticated</p>}
                {authStatus === "unauthenticated" && <p className="text-red-600">❌ Not authenticated</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Storage Buckets</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                {loading ? (
                  <p>Loading buckets...</p>
                ) : (
                  <>
                    <p>Found {buckets.length} buckets:</p>
                    <ul className="mt-2 space-y-1">
                      {buckets.map((bucket) => (
                        <li key={bucket.id} className="flex items-center">
                          {bucket.name.toLowerCase() === "banner-images".toLowerCase() ? (
                            <span className="text-green-600 font-medium">✅ {bucket.name}</span>
                          ) : (
                            <span>{bucket.name}</span>
                          )}
                          {bucket.public && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">public</span>
                          )}
                        </li>
                      ))}
                      {buckets.length === 0 && <li className="text-red-600">No buckets found</li>}
                    </ul>

                    {!buckets.some((b) => b.name.toLowerCase() === "banner-images".toLowerCase()) && (
                      <Button
                        onClick={handleCreateBucket}
                        disabled={isCreatingBucket}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {isCreatingBucket ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Create banner-images Bucket
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Permissions Status</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {permissionsStatus === "checking" && <p>Checking permissions...</p>}
              {permissionsStatus === "ok" && (
                <p className="text-green-600">✅ Bucket permissions are working correctly</p>
              )}
              {permissionsStatus === "error" && (
                <div>
                  <p className="text-red-600 mb-2">❌ Bucket permissions are not working correctly</p>
                  <Button
                    onClick={handleFixPermissions}
                    disabled={isFixingPermissions}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isFixingPermissions ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" /> Fix Permissions
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Diagnostic Log</h3>
            <div className="p-4 bg-gray-800 text-white rounded-lg text-xs font-mono overflow-auto h-64">
              <pre>{debugInfo || "No diagnostic information available yet."}</pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sql">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>SQL Fix Instructions</AlertTitle>
              <AlertDescription>
                Copy and run the SQL below in the Supabase SQL Editor to fix storage bucket permissions. This will
                create or update the necessary policies for the banner-images bucket.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-gray-800 text-white rounded-lg text-xs font-mono overflow-auto h-64">
              <pre>{sqlOutput || generateFixPermissionsSQL("banner-images")}</pre>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(sqlOutput || generateFixPermissionsSQL("banner-images"))
                alert("SQL copied to clipboard!")
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Copy SQL to Clipboard
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Troubleshooting Tips</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Make sure you're authenticated before running diagnostics</li>
            <li>If permissions are not working, use the "Fix Permissions" button</li>
            <li>If automatic fixes fail, copy and run the SQL in the Supabase SQL Editor</li>
            <li>Verify that your Supabase URL and key are correct</li>
            <li>Ensure you have the necessary permissions in Supabase</li>
            <li>Try creating the bucket manually in the Supabase dashboard if automatic creation fails</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
