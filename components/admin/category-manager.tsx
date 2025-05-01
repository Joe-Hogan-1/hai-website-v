"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ProductCategory {
  id: string
  name: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<ProductCategory>>({
    name: "",
    is_active: true,
    display_order: 0,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("display_order", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentCategory({
      name: "",
      is_active: true,
      display_order: categories.length > 0 ? Math.max(...categories.map((c) => c.display_order)) + 1 : 1,
    })
    setIsEditing(true)
  }

  const handleEdit = (category: ProductCategory) => {
    setCurrentCategory(category)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentCategory({
      name: "",
      is_active: true,
      display_order: 0,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase.from("product_categories").delete().eq("id", id)

      if (error) throw error

      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  const handleSave = async () => {
    try {
      if (!currentCategory.name) {
        toast.error("Category name is required")
        return
      }

      if (currentCategory.id) {
        // Update existing category
        const { error } = await supabase
          .from("product_categories")
          .update({
            name: currentCategory.name,
            is_active: currentCategory.is_active,
            display_order: currentCategory.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentCategory.id)

        if (error) {
          throw error
        }
        toast.success("Category updated successfully")
      } else {
        // Create new category
        const { error } = await supabase.from("product_categories").insert({
          name: currentCategory.name,
          is_active: currentCategory.is_active,
          display_order: currentCategory.display_order,
        })

        if (error) {
          throw error
        }
        toast.success("Category created successfully")
      }

      setIsEditing(false)
      fetchCategories()
      setCurrentCategory({
        name: "",
        is_active: true,
        display_order: 0,
      })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to save category: ${error.message}`)
      } else {
        toast.error("Failed to save category")
      }
    }
  }

  const handleMoveUp = async (category: ProductCategory, index: number) => {
    if (index === 0) return

    try {
      const prevCategory = categories[index - 1]
      const newOrder = prevCategory.display_order

      // Update current category
      await supabase
        .from("product_categories")
        .update({
          display_order: newOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id)

      // Update previous category
      await supabase
        .from("product_categories")
        .update({
          display_order: category.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prevCategory.id)

      fetchCategories()
    } catch (error) {
      toast.error("Failed to reorder categories")
    }
  }

  const handleMoveDown = async (category: ProductCategory, index: number) => {
    if (index === categories.length - 1) return

    try {
      const nextCategory = categories[index + 1]
      const newOrder = nextCategory.display_order

      // Update current category
      await supabase
        .from("product_categories")
        .update({
          display_order: newOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id)

      // Update next category
      await supabase
        .from("product_categories")
        .update({
          display_order: category.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", nextCategory.id)

      fetchCategories()
    } catch (error) {
      toast.error("Failed to reorder categories")
    }
  }

  const handleToggleActive = async (category: ProductCategory) => {
    try {
      const { error } = await supabase
        .from("product_categories")
        .update({
          is_active: !category.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id)

      if (error) throw error

      toast.success(category.is_active ? "Category deactivated" : "Category activated")
      fetchCategories()
    } catch (error) {
      toast.error("Failed to update category status")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>
  }

  return (
    <div className="admin-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Product Categories</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Category
          </Button>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Manage the product categories that appear in the filter options. Active categories will be shown in the
          product filter, while inactive categories will be hidden.
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentCategory.id ? "Edit Category" : "Create New Category"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <Input
                id="name"
                value={currentCategory.name || ""}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={currentCategory.is_active || false}
                onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (visible in filters)
              </Label>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
                <Save className="mr-2 h-4 w-4" /> Save Category
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No categories yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Category
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category, index) => (
                      <tr key={category.id} className={!category.is_active ? "bg-gray-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(category, index)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(category, index)}
                              disabled={index === categories.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium text-gray-900">{category.display_order}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Switch
                              id={`active-${category.id}`}
                              checked={category.is_active}
                              onCheckedChange={() => handleToggleActive(category)}
                              className="mr-2"
                            />
                            <Label htmlFor={`active-${category.id}`} className="text-sm">
                              {category.is_active ? "Active" : "Inactive"}
                            </Label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
