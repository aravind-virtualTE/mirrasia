import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SignatureType = {
  type: 'drawn' | 'generated'
  data: string
}

export default function SignIncorporationDocs() {
  const [name, setName] = useState('')
  const [generatedSignatures, setGeneratedSignatures] = useState<string[]>([])
  const [selectedSignature, setSelectedSignature] = useState<SignatureType | null>(null)
  const signaturePad = useRef<SignatureCanvas>(null)

  const generateSignatures = (name: string) => {
    // This is a simple example. You might want to use more sophisticated signature generation logic.
    const fonts = ['Brush Script MT', 'Lucida Handwriting', 'Edwardian Script ITC']
    return fonts.map(font => `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="50">
        <text x="10" y="30" font-family="${font}" font-size="24" fill="black">
          ${name}
        </text>
      </svg>
    `)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (e.target.value) {
      setGeneratedSignatures(generateSignatures(e.target.value))
    } else {
      setGeneratedSignatures([])
    }
  }

  const handleGeneratedSignatureSelect = (signature: string) => {
    setSelectedSignature({ type: 'generated', data: signature })
  }

  const handleClearSignature = () => {
    if (signaturePad.current) {
      signaturePad.current.clear()
    }
    setSelectedSignature(null)
  }

  const handleSaveSignature = () => {
    if (!selectedSignature && signaturePad.current && !signaturePad.current.isEmpty()) {
      setSelectedSignature({
        type: 'drawn',
        data: signaturePad.current.toDataURL()
      })
    }

    if (selectedSignature) {
      // This is where you'd implement your database save logic
      console.log('Saving signature:', selectedSignature)
      alert('Signature saved successfully!')
    } else {
      alert('Please draw or select a signature before saving.')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Signature Capture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your name
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder="John Doe"
          />
        </div>

        {generatedSignatures.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Select a generated signature:</h3>
            <div className="flex flex-wrap gap-4">
              {generatedSignatures.map((sig, index) => (
                <div
                  key={index}
                  className="border p-2 cursor-pointer"
                  onClick={() => handleGeneratedSignatureSelect(sig)}
                  dangerouslySetInnerHTML={{ __html: sig }}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-2">Or draw your signature:</h3>
          <div className="border border-gray-300 rounded">
            <SignatureCanvas
              ref={signaturePad}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button onClick={handleClearSignature} variant="outline">
            Clear Signature
          </Button>
          <Button onClick={handleSaveSignature}>
            Save Signature
          </Button>
        </div>

        {selectedSignature && (
          <div>
            <h3 className="text-lg font-medium mb-2">Selected Signature:</h3>
            {selectedSignature.type === 'generated' ? (
              <div dangerouslySetInnerHTML={{ __html: selectedSignature.data }} />
            ) : (
              <img src={selectedSignature.data} alt="Drawn signature" className="border" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}