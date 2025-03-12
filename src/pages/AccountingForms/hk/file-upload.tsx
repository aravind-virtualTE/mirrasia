import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number
  accept?: string
  onFilesSelected?: (files: File[]) => void
}

export function FileUpload({
  maxFiles = 10,
  maxSize = 10, // MB
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif",
  onFilesSelected,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`)
      return
    }

    const newFiles: File[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} exceeds the maximum size of ${maxSize}MB.`)
        continue
      }
      newFiles.push(file)
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)

    if (onFilesSelected) {
      onFilesSelected(updatedFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)

    if (onFilesSelected) {
      onFilesSelected(newFiles)
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Drag and drop files here or</p>
          <Button type="button" variant="outline" size="sm" onClick={openFileDialog}>
            Browse files
          </Button>
          <input ref={inputRef} type="file" multiple accept={accept} onChange={handleChange} className="hidden" />
          <p className="text-xs text-muted-foreground mt-2">
            Upload up to {maxFiles} files (max {maxSize}MB each)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 rounded-md border p-2">
              <File className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2">
                  <Progress value={(file.size / (maxSize * 1024 * 1024)) * 100} className="h-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatFileSize(file.size)}</span>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}