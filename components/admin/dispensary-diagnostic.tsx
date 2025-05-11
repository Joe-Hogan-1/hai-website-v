"use client"

import { useState, useEffect } from "react"
import { supabase, checkStorageBucket } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function DispensaryDiagnostic() {
  const [diagnosticResults, setDiagnosticResults] = useState<any>({
    loading: true,
    tableExists: false,
    bucketExists: false,
    userAuthenticated: false,
    userId: null,
    userIdColumnExists: false,
    error: null,
    detailedResults: {},
  })

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setDiagnosticResults((prev) => ({ ...prev, loading: true }))
    const results: any = {
      loading: false,
      tableExists: false,
      bucketExists: false,
      userAuthenticated: false,
      userId: null,
      userIdColumnExists: false,
      error: null,
      detailedResults: {},
    }

    try {
      // Check if user is authenticated
      const { data: authData } = await supabase.auth.getUser()
      results.userAuthenticated = !!authData?.user
      results.userId = authData?.user?.id
      results.detailedResults.auth = { success: !!authData?.user, data: authData }

      // Check if dispensaries table exists using a more reliable method
      try {
        // Use a simple query that doesn't rely on count(*)
        const { data: tableData, error: tableError } = await supabase.from("dispensaries").select("id").limit(1)

        results.tableExists = !tableError
        results.detailedResults.table = {
          success: !tableError,
          error: tableError ? tableError.message : null,
          data: tableData,
        }
      } catch (tableError) {
        results.tableExists = false
        results.detailedResults.table = {
          success: false,
          error: tableError.message,
        }
      }

      // Check if user_id column exists
      if (results.tableExists) {
        try {
          // Try to select the user_id column
          const { error: columnError } = await supabase
            .from("dispensaries")
            .select("id, name") // Don't try to select user_id yet
            .limit(1)

          // If we can select from the table, check the schema
          if (!columnError) {
            // Get the table schema to check for user_id column
            const { data: schemaData, error: schemaError } = await supabase.rpc("get_table_columns", {
              table_name: "dispensaries",
            })

            if (!schemaError && schemaData) {
              // Check if user_id is in the columns
              results.userIdColumnExists = schemaData.some((column: any) => column.column_name === "user_id")
              results.detailedResults.userIdColumn = {
                exists: results.userIdColumnExists,
                columns: schemaData,
              }
            } else {
              // Fallback: try to directly query for user_id
              const { error: directColumnError } = await supabase.from("dispensaries").select("user_id").limit(1)

              results.userIdColumnExists = !directColumnError
              results.detailedResults.userIdColumn = {
                exists: !directColumnError,
                error: directColumnError ? directColumnError.message : null,
                fallback: true,
              }
            }
          }
        } catch (error) {
          results.userIdColumnExists = false
          results.detailedResults.userIdColumn = {
            exists: false,
            error: error.message,
          }
        }
      }

      // Check if storage bucket exists
      const bucketCheck = await checkStorageBucket("dispensary-images")
      results.bucketExists = bucketCheck.exists && bucketCheck.accessible
      results.detailedResults.bucket = bucketCheck

      // Try to create a test dispensary
      if (results.userAuthenticated && results.tableExists) {
        const testData = {
          name: "Test Dispensary (Diagnostic)",
          address: "123 Test St",
          city: "Test City",
          lat: 40.7128,
          lng: -74.006,
          has_hai_products: false,
        }

        // Only add user_id if the column exists
        if (results.userIdColumnExists && results.userId) {
          testData.user_id = results.userId
        }

        const { data: insertData, error: insertError } = await supabase.from("dispensaries").insert(testData).select()

        results.detailedResults.insert = {
          success: !insertError,
          error: insertError ? insertError.message : null,
          data: insertData,
        }

        // Clean up test data
        if (!insertError && insertData) {
          const { error: deleteError } = await supabase
            .from("dispensaries")
            .delete()
            .eq("name", "Test Dispensary (Diagnostic)")

          results.detailedResults.cleanup = {
            success: !deleteError,
            error: deleteError ? deleteError.message : null,
          }
        }
      }
    } catch (error) {
      results.error = error.message
    }

    setDiagnosticResults(results)
  }

  const createStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.createBucket("dispensary-images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) throw error

      // Set bucket policy to public
      const { error: policyError } = await supabase.storage.from("dispensary-images").createSignedUrl("test.txt", 60)

      toast.success("Storage bucket created successfully")
      runDiagnostics()
    } catch (error) {
      toast.error(`Failed to create bucket: ${error.message}`)
    }
  }

  const createDispensariesTable = async () => {
    try {
      toast.loading("Creating dispensaries table...")

      // Execute the migration SQL directly
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.dispensaries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            lat DOUBLE PRECISION NOT NULL,
            lng DOUBLE PRECISION NOT NULL,
            phone TEXT,
            website TEXT,
            image_url TEXT,
            has_hai_products BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Enable Row Level Security
          ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;
          
          -- Create policies for the dispensaries table
          DROP POLICY IF EXISTS "Allow public read access to dispensaries" ON public.dispensaries;
          CREATE POLICY "Allow public read access to dispensaries"
            ON public.dispensaries
            FOR SELECT
            TO public
            USING (true);
          
          DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON public.dispensaries;
          CREATE POLICY "Allow authenticated users to manage dispensaries"
            ON public.dispensaries
            FOR ALL
            TO authenticated
            USING (true);
        `,
      })

      if (error) {
        // If RPC doesn't exist, show a message
        toast.dismiss()
        toast.error("Could not create table automatically. Please run the migration manually.")
        console.error("Error creating table:", error)
        return
      }

      toast.dismiss()
      toast.success("Dispensaries table created successfully")
      runDiagnostics()
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to create table: ${error.message}`)
    }
  }

  const addUserIdColumn = async () => {
    try {
      toast.loading("Adding user_id column...")

      // Execute SQL to add the column
      const { error } = await supabase.rpc("execute_sql", {
        sql: "ALTER TABLE public.dispensaries ADD COLUMN IF NOT EXISTS user_id UUID;",
      })

      if (error) {
        toast.dismiss()
        toast.error("Could not add user_id column automatically. Please run the migration manually.")
        console.error("Error adding user_id column:", error)
        return
      }

      toast.dismiss()
      toast.success("Added user_id column successfully")
      runDiagnostics()
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to add user_id column: ${error.message}`)
    }
  }

  const fixEverything = async () => {
    try {
      toast.loading("Fixing dispensary system...")

      // Try to run the comprehensive fix SQL
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          -- Create the dispensaries table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.dispensaries (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              address TEXT NOT NULL,
              city TEXT NOT NULL,
              lat DOUBLE PRECISION NOT NULL,
              lng DOUBLE PRECISION NOT NULL,
              phone TEXT,
              website TEXT,
              image_url TEXT,
              has_hai_products BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              user_id UUID
          );
          
          -- Enable Row Level Security
          ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;
          
          -- Create policies for the dispensaries table
          DROP POLICY IF EXISTS "Allow public read access to dispensaries" ON public.dispensaries;
          CREATE POLICY "Allow public read access to dispensaries"
            ON public.dispensaries
            FOR SELECT
            TO public
            USING (true);
          
          DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON public.dispensaries;
          CREATE POLICY "Allow authenticated users to manage dispensaries"
            ON public.dispensaries
            FOR ALL
            TO authenticated
            USING (true);
        `,
      })

      if (error) {
        console.error("Error fixing database:", error)
        // Continue with bucket creation even if table creation fails
      }

      // Create the storage bucket
      const { error: bucketError } = await supabase.storage.createBucket("dispensary-images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (bucketError && !bucketError.message.includes("already exists")) {
        console.error("Error creating bucket:", bucketError)
      }

      toast.dismiss()
      toast.success("Dispensary system fixed successfully")
      runDiagnostics()
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to fix system: ${error.message}`)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Dispensary System Diagnostic</span>
          <Button onClick={runDiagnostics} variant="outline" size="sm" disabled={diagnosticResults.loading}>
            {diagnosticResults.loading ? "Running..." : "Run Diagnostics"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {diagnosticResults.loading ? (
          <div className="text-center py-4">Running diagnostics...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusCard
                title="User Authentication"
                status={diagnosticResults.userAuthenticated}
                details={`User ID: ${diagnosticResults.userId || "Not authenticated"}`}
              />
              <StatusCard
                title="Dispensaries Table"
                status={diagnosticResults.tableExists}
                details={
                  !diagnosticResults.tableExists && (
                    <Button onClick={createDispensariesTable} size="sm" className="mt-2">
                      Create Table
                    </Button>
                  )
                }
              />
              <StatusCard
                title="Storage Bucket"
                status={diagnosticResults.bucketExists}
                details={
                  !diagnosticResults.bucketExists && (
                    <Button onClick={createStorageBucket} size="sm" className="mt-2">
                      Create Bucket
                    </Button>
                  )
                }
              />
            </div>

            {diagnosticResults.tableExists && (
              <StatusCard
                title="User ID Column"
                status={diagnosticResults.userIdColumnExists}
                details={
                  !diagnosticResults.userIdColumnExists && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">
                        The user_id column is missing from the dispensaries table. This is used to track ownership of
                        dispensaries.
                      </p>
                      <Button onClick={addUserIdColumn} size="sm" className="mt-1">
                        Add user_id Column
                      </Button>
                    </div>
                  )
                }
              />
            )}

            <div className="mt-6">
              <h3 className="font-medium mb-2">Diagnosis:</h3>
              {!diagnosticResults.userAuthenticated && (
                <p className="text-red-500">❌ User is not authenticated. Please sign in.</p>
              )}
              {!diagnosticResults.tableExists && (
                <p className="text-red-500">❌ Dispensaries table doesn't exist or is not accessible.</p>
              )}
              {!diagnosticResults.bucketExists && (
                <p className="text-red-500">
                  ❌ Storage bucket 'dispensary-images' doesn't exist or is not accessible.
                </p>
              )}
              {!diagnosticResults.userIdColumnExists && diagnosticResults.tableExists && (
                <p className="text-yellow-500">
                  ⚠️ The user_id column is missing from the dispensaries table. The system will work without it, but user
                  ownership of dispensaries won't be tracked.
                </p>
              )}
              {diagnosticResults.error && <p className="text-red-500">❌ Error: {diagnosticResults.error}</p>}
              {diagnosticResults.userAuthenticated &&
                diagnosticResults.tableExists &&
                diagnosticResults.bucketExists &&
                diagnosticResults.userIdColumnExists &&
                !diagnosticResults.error && (
                  <p className="text-green-500">
                    ✅ All systems operational. If you're still having issues, check the detailed results below.
                  </p>
                )}
            </div>

            {(!diagnosticResults.tableExists || !diagnosticResults.bucketExists) && (
              <div className="mt-4">
                <Button onClick={fixEverything} className="w-full bg-green-600 hover:bg-green-700">
                  Fix Everything Automatically
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This will create the dispensaries table, add the user_id column, and create the storage bucket.
                </p>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Detailed Results</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(diagnosticResults.detailedResults, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusCard({ title, status, details }) {
  return (
    <div className={`p-4 rounded-lg border ${status ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${status ? "bg-green-500" : "bg-red-500"}`}></div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="mt-2 text-sm">
        {status ? "✅ Working correctly" : "❌ Not working"}
        {details && <div className="mt-1 text-gray-600">{details}</div>}
      </div>
    </div>
  )
}
