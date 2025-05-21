import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useState } from "react"

interface FileUploadProps {
  title: string
  description?: string
  instruction?: string
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string
  onChange: (files: File[]) => void
}

function FileUpload({
  title,
  description,
  instruction,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png",
  onChange,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) => file.size <= maxSize * 1024 * 1024)
    setFiles((prev) => [...prev, ...validFiles])
    onChange(validFiles)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {instruction && <p className="text-sm text-muted-foreground">{instruction}</p>}
      <div className="grid gap-2">
        <label htmlFor={`file-upload-${title}`} className="cursor-pointer">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <Button variant="ghost" className="text-sm text-primary">
                Add file
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload up to {maxFiles} supported files: PDF, document, or drawing. Max {maxSize} MB per file.
              </p>
            </div>
          </div>
          <input
            id={`file-upload-${title}`}
            type="file"
            className="hidden"
            multiple
            accept={acceptedTypes}
            onChange={handleFileChange}
          />
        </label>
        {files.length > 0 && (
          <div className="grid gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocumentUploadForm() {
  const handleFileChange = (files: File[]) => {
    console.log("Files changed:", files)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-sky-100 dark:bg-sky-900">
        <CardTitle>Upload supporting documents</CardTitle>
        <p className="text-sm text-muted-foreground">
          *If you are unable to upload documents due to Google account problems, please submit them separately to the
          email of the person in charge.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <FileUpload
          title="Please upload a copy of your passport."
          description="A copy of your passport can be issued by going to the nearest ward office and applying for it. The title of the document is Certificate of Passport Copy."
          onChange={handleFileChange}
        />

        <FileUpload
          title="Please upload proof of address (English certified or abstract)."
          description="Please submit it at the nearest community center, a self-service issuing machine, or online."
          onChange={handleFileChange}
        />

        <FileUpload
          title="Scan the front and back of your driver's license and upload it."
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  )
}

