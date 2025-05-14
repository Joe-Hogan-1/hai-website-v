"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useToast } from "@/hooks/use-toast"
import { Edit, Save, Plus, Trash2 } from "lucide-react"

interface LifestyleContent {
  id: string
  title?: string
  content: string
  is_active: boolean
}

export default function LifestyleContentManager({ userId }: { userId: string }) {
  const [content, setContent] = useState<LifestyleContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [editorContent, setEditorContent] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("lifestyle_content")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching lifestyle content:", error)
        setContent(null)
      } else {
        setContent(data || null)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setContent(null)
    } finally {
      setLoading(false)
    }
  }

  function startEditing() {
    if (content) {
      setTitle(content.title || "")
      setEditorContent(content.content)
    } else {
      setTitle("")
      setEditorContent("")
    }
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function saveContent() {
    try {
      if (!editorContent.trim()) {
        toast({
          title: "Error",
          description: "Content cannot be empty",
          variant: "destructive",
        })
        return
      }

      const contentData = {
        title: title.trim() || null,
        content: editorContent.trim(),
        is_active: true,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      if (content) {
        // Update existing content
        const { error } = await supabase.from("lifestyle_content").update(contentData).eq("id", content.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Content updated successfully",
        })
      } else {
        // Create new content
        const { error } = await supabase.from("lifestyle_content").insert({
          ...contentData,
          created_at: new Date().toISOString(),
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Content created successfully",
        })
      }

      setIsEditing(false)
      fetchContent()
    } catch (error) {
      console.error("Error saving content:", error)
      toast({
        title: "Error",
        description: `Failed to save content: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  async function deleteContent() {
    if (!content) return

    if (!confirm("Are you sure you want to delete this content?")) {
      return
    }

    try {
      const { error } = await supabase.from("lifestyle_content").delete().eq("id", content.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Content deleted successfully",
      })

      setContent(null)
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      })
    }
  }

  // Helper function to convert plain text to HTML with basic formatting
  function formatTextAsHtml(text: string) {
    // Replace line breaks with <br> tags
    return text
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
  }

  // Helper function to add basic formatting instructions
  function FormattingHelp() {
    return (
      <div className="text-xs text-gray-500 mt-1 mb-2">
        <p>
          Formatting: <strong>**bold**</strong>, <em>*italic*</em>, # Heading 1, ## Heading 2, ### Heading 3
        </p>
        <p>Use line breaks for new paragraphs.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Lifestyle Page Content Manager</h2>
      <p className="text-sm text-gray-500 mb-4">
        Manage the content block that appears below the banner on the lifestyle page.
      </p>

      {loading ? (
        <div className="animate-pulse bg-gray-200 h-40 rounded-md"></div>
      ) : (
        <>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter a title for the content block"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <FormattingHelp />
                <textarea
                  id="content"
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black min-h-[300px]"
                  placeholder="Enter content here. Use markdown-style formatting for basic styling."
                />
                {editorContent && (
                  <div className="mt-4 border rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: `<p>${formatTextAsHtml(editorContent)}</p>` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={cancelEditing}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveContent}
                  className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  <Save size={16} className="inline mr-1" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              {content ? (
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">{content.title || "Untitled Content"}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={startEditing}
                        className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        <Edit size={16} className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={deleteContent}
                        className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="prose max-w-none border-t pt-4">
                    <div dangerouslySetInnerHTML={{ __html: `<p>${content.content}</p>` }} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-gray-500 mb-4">No content has been added yet.</p>
                  <button
                    onClick={startEditing}
                    className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    <Plus size={16} className="inline mr-1" /> Add Content
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
