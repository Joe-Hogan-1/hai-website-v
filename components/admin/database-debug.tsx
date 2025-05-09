"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function DatabaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking...")
  const [tables, setTables] = useState<string[]>([])
  const [bannerMediaItems, setBannerMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
    listTables()
    fetchBannerMedia()
  }, [])

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from("_test_connection_").select("*").limit(1)

      if (error && error.message.includes("does not exist")) {
        // This is expected since the table doesn't exist
        setConnectionStatus("Connected to Supabase")
      } else if (error) {
        console.error("Connection error:", error)
        setConnectionStatus(`Connection Error: ${error.message}`)
      } else {
        setConnectionStatus("Connected to Supabase")
      }
    } catch (error: any) {
      console.error("Unexpected connection error:", error)
      setConnectionStatus(`Unexpected Error: ${error.message}`)
    }
  }

  const listTables = async () => {
    try {
      const { data, error } = await supabase.rpc("get_tables")

      if (error) {
        console.error("Error listing tables:", error)
        return
      }

      if (data) {
        setTables(data)
      }
    } catch (error) {
      console.error("Unexpected error listing tables:", error)
    }
  }

  const fetchBannerMedia = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("banner_media").select("*").limit(10)

      if (error) {
        console.error("Error fetching banner_media:", error)
        return
      }

      setBannerMediaItems(data || [])
    } catch (error) {
      console.error("Unexpected error fetching banner_media:", error)
    } finally {
      setLoading(false)
    }
  }

  const insertTestMessage = async () => {
    try {
      const { data, error } = await supabase
        .from("banner_media")
        .insert({
          title: "Test Item",
          description: "This is a test item created from the debug panel",
          media_url: "/test-image.png",
          media_type: "image",
          text_overlay: "Test Overlay",
          text_position: "bottom-left",
          is_active: true,
          display_order: 999,
        })
        .select()

      if (error) {
        console.error("Error inserting test item:", error)
        toast.error(`Failed to insert test item: ${error.message}`)
        return
      }

      toast.success("Test item inserted successfully")
      fetchBannerMedia()
    } catch (error: any) {
      console.error("Unexpected error inserting test item:", error)
      toast.error(`Unexpected error: ${error.message}`)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Database Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Connection Status</h3>
            <p className={`mt-1 ${connectionStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}>
              {connectionStatus}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Available Tables</h3>
            {tables.length > 0 ? (
              <ul className="mt-1 list-disc pl-5">
                {tables.map((table, index) => (
                  <li key={index}>{table}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-gray-500">No tables found or unable to list tables</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Banner Media Entries</h3>
              <Button size="sm" onClick={insertTestMessage}>
                Insert Test Message
              </Button>
            </div>
            {loading ? (
              <p className="mt-1 text-gray-500">Loading...</p>
            ) : bannerMediaItems.length > 0 ? (
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bannerMediaItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{item.id}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{item.title}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{item.media_type}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{item.is_active ? "Yes" : "No"}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{item.display_order}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-1 text-gray-500">No banner media entries found</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
