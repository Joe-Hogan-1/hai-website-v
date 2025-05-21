"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useToast } from "@/hooks/use-toast"
import { Edit, Save, Plus, Trash2 } from "lucide-react"

interface HomepageText {
  id: string
  title?: string
  content: string
  is_active: boolean
}

export default function HomepageTextManager({ userId }: { userId: string }) {
  const [text, setText] = useState<HomepageText | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [editorContent, setEditorContent] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchText()
  }, [])

  async function fetchText() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("homepage_text")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching homepage text:", error)
        setText(null)
      } else {
        setText(data || null)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setText(null)
    } finally {
      setLoading(false)
    }
  }

  function startEditing() {
    if (text) {
      setTitle(text.title || "")
      setEditorContent(text.content)
    } else {
      setTitle("")
      setEditorContent("")
    }
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function saveText() {
    try {
      if (!editorContent.trim()) {
        toast({
          title: "Error",
          description: "Content cannot be empty",
          variant: "destructive",
        })
        return
      }

      // Preserve the content exactly as entered, including whitespace and formatting
      const textData = {
        title: title.trim() || null,
        content: editorContent, // Don't trim to preserve whitespace
        is_active: true,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      if (text) {
        // Update existing text
        const { error } = await supabase.from("homepage_text").update(textData).eq("id", text.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Text updated successfully",
        })
      } else {
        // Create new text
        const { error } = await supabase.from("homepage_text").insert({
          ...textData,
          created_at: new Date().toISOString(),
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Text created successfully",
        })
      }

      setIsEditing(false)
      fetchText()
    } catch (error) {
      console.error("Error saving text:", error)
      toast({
        title: "Error",
        description: `Failed to save text: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  async function deleteText() {
    if (!text) return

    if (!confirm("Are you sure you want to delete this text?")) {
      return
    }

    try {
      const { error } = await supabase.from("homepage_text").delete().eq("id", text.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Text deleted successfully",
      })

      setText(null)
    } catch (error) {
      console.error("Error deleting text:", error)
      toast({
        title: "Error",
        description: "Failed to delete text",
        variant: "destructive",
      })
    }
  }

  // Enhanced function to convert text to HTML while preserving whitespace and formatting
  function formatTextAsHtml(text: string) {
    // First, preserve line breaks and indentation
    const html = text
      // Replace double line breaks with paragraph tags
      .replace(/\n\n/g, "</p><p>")
      // Replace single line breaks with <br> tags
      .replace(/\n/g, "<br>")
      // Preserve indentation by replacing spaces with non-breaking spaces
      .replace(/( {2,})/g, (match) => {
        return "&nbsp;".repeat(match.length)
      })
      // Replace tabs with non-breaking spaces
      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
      // Handle basic formatting
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")

    return html
  }

  // Helper function to add basic formatting instructions
  function FormattingHelp() {
    return (
      <div className="text-xs text-gray-500 mt-1 mb-2">
        <p>
          Formatting: <strong>**bold**</strong>, <em>*italic*</em>, # Heading 1, ## Heading 2, ### Heading 3
        </p>
        <p>Whitespace, indentation, and line breaks will be preserved in the published content.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Homepage Text Manager</h2>
      <p className="text-sm text-gray-500 mb-4">
        Manage the text that appears to the left of the photo grid on the homepage.
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
                  placeholder="Enter a title for the text block"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black min-h-[300px] font-mono"
                  placeholder="Enter content here. Use markdown-style formatting for basic styling."
                  style={{ whiteSpace: "pre-wrap" }}
                />
                {editorContent && (
                  <div className="mt-4 border rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                    <div
                      className="prose max-w-none text-sm whitespace-pre-wrap"
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
                  onClick={saveText}
                  className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  <Save size={16} className="inline mr-1" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              {text ? (
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">{text.title || "Untitled Content"}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={startEditing}
                        className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        <Edit size={16} className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={deleteText}
                        className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="prose max-w-none border-t pt-4 whitespace-pre-wrap">
                    <div dangerouslySetInnerHTML={{ __html: `<p>${formatTextAsHtml(text.content)}</p>` }} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-gray-500 mb-4">No text has been added yet.</p>
                  <button
                    onClick={startEditing}
                    className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    <Plus size={16} className="inline mr-1" /> Add Text
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
