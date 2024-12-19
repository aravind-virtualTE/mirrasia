import { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SignatureCanvas from 'react-signature-canvas'
import { usePdfSignature } from '@/hooks/usePdfSignature'

export default function PdfSignature() {
  const { pdfUrl, loadPdf, setSignatureData, addSignatureToPdf } = usePdfSignature()
  const [signing, setSigning] = useState(false)
  const signatureRef = useRef<SignatureCanvas>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      loadPdf(file)
    }
  }

  const handleSign = () => {
    setSigning(true)
  }

  const handleSaveSignature = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL('image/png')
      setSignatureData(signatureData)
      setSigning(false)
    }
  }

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  const handleDownload = async () => {
    const modifiedPdfBlob = await addSignatureToPdf()
    if (modifiedPdfBlob) {
      const url = URL.createObjectURL(modifiedPdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'signed_document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
  console.log("pdfUrl",pdfUrl)
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>PDF Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pdf-upload">Upload PDF</Label>
          <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
        </div>
        {pdfUrl && (
          <div className="aspect-[1/1.4142] border">
            <iframe src={pdfUrl} className="w-full h-full"  />           
          </div>
        )}
        {signing ? (
          <div className="space-y-2">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'border rounded w-full h-40',
              }}
            />
            <div className="flex space-x-2">
              <Button onClick={handleSaveSignature}>Save Signature</Button>
              <Button variant="outline" onClick={handleClearSignature}>Clear</Button>
            </div>
          </div>
        ) : (
          <Button onClick={handleSign}>Sign Document</Button>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload} disabled={!pdfUrl}>Download Signed PDF</Button>
      </CardFooter>
    </Card>
  )
}