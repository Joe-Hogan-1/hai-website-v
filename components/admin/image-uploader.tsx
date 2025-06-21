"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ImageUploaderProps {
  existingImageUrl?: string
  onImageSelected: (file: File | null) => void
  uploadProgress: number
}

export default function ImageUploader({ existingImageUrl, onImageSelected, uploadProgress }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (25MB = 25 * 1024 * 1024 bytes)
      if (file.size > 25 * 1024 * 1024) {
        alert("File size must be less than 25MB")
        return
      }

      onImageSelected(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Check file size (25MB = 25 * 1024 * 1024 bytes)
      if (file.size > 25 * 1024 * 1024) {
        alert("File size must be less than 25MB")
        return
      }

      onImageSelected(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageSelected(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="image-upload"
      />

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? "border-[#ffd6c0] bg-[#ffd6c0]/10" : "border-gray-300 hover:border-[#ffd6c0]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Drag and drop an image here, or click to select</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 25MB</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
    </div>
  )
}
