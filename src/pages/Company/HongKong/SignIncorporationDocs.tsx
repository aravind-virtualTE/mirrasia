// import React, { useRef, useState } from 'react'
// import SignatureCanvas from 'react-signature-canvas'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// type SignatureType = {
//   type: 'drawn' | 'uploaded'
//   data: string
// }

// const SignIncorporationDocs: React.FC = () => {
//   const [signatures, setSignatures] = useState<SignatureType[]>([])
//   const [selectedSignature, setSelectedSignature] = useState<SignatureType | null>(null)
//   const signaturePad = useRef<SignatureCanvas>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleClearSignature = () => {
//     if (signaturePad.current) {
//       signaturePad.current.clear()
//     }
//     setSelectedSignature(null)
//   }

//   const handleSaveSignature = () => {
//     if (signaturePad.current && !signaturePad.current.isEmpty()) {
//       const newSignature: SignatureType = {
//         type: 'drawn',
//         data: signaturePad.current.toDataURL()
//       }
//       setSignatures([...signatures, newSignature])
//       setSelectedSignature(newSignature)
//       signaturePad.current.clear()
//     } else if (selectedSignature) {
//       setSignatures([...signatures, selectedSignature])
//     } else {
//       alert('Please draw a signature or upload an image before saving.')
//     }
//   }

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         const newSignature: SignatureType = {
//           type: 'uploaded',
//           data: e.target?.result as string
//         }
//         setSelectedSignature(newSignature)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleSignatureSelect = (signature: SignatureType) => {
//     setSelectedSignature(signature)
//   }

//   return (
//     <Card className="w-full max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle>Signature Capture</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div>
//           <h3 className="text-lg font-medium mb-2">Draw your signature:</h3>
//           <div className="border border-gray-300 rounded">
//             <SignatureCanvas
//               ref={signaturePad}
//               canvasProps={{
//                 width: 500,
//                 height: 200,
//                 className: 'signature-canvas'
//               }}
//             />
//           </div>
//         </div>

//         <div>
//           <h3 className="text-lg font-medium mb-2">Or upload a signature image:</h3>
//           <div className="flex items-center space-x-2">
//             <Input
//               type="file"
//               accept="image/*"
//               ref={fileInputRef}
//               onChange={handleFileUpload}
//               className="hidden"
//               id="signature-upload"
//             />
//             <Button
//               onClick={() => fileInputRef.current?.click()}
//               variant="outline"
//             >
//               Upload Image
//             </Button>
//             <Label htmlFor="signature-upload" className="text-sm text-gray-500">
//               {selectedSignature?.type === 'uploaded' ? 'Image selected' : 'No image selected'}
//             </Label>
//           </div>
//         </div>

//         <div className="flex justify-between">
//           <Button onClick={handleClearSignature} variant="outline">
//             Clear Signature
//           </Button>
//           <Button onClick={handleSaveSignature}>
//             Save Signature
//           </Button>
//         </div>

//         {selectedSignature && (
//           <div>
//             <h3 className="text-lg font-medium mb-2">Selected Signature:</h3>
//             <div className="border p-2">
//               <img
//                 src={selectedSignature.data}
//                 alt="Selected signature"
//                 style={{ maxWidth: '100%', height: 'auto' }}
//               />
//             </div>
//           </div>
//         )}

//         {signatures.length > 0 && (
//           <div>
//             <h3 className="text-lg font-medium mb-2">Saved Signatures:</h3>
//             <div className="grid grid-cols-2 gap-4">
//               {signatures.map((sig, index) => (
//                 <div
//                   key={index}
//                   className="border p-2 cursor-pointer hover:bg-gray-100 transition-colors"
//                   onClick={() => handleSignatureSelect(sig)}
//                 >
//                   <img
//                     src={sig.data}
//                     alt={`Signature ${index + 1}`}
//                     style={{ maxWidth: '100%', height: 'auto' }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// export default SignIncorporationDocs

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Type, Pencil, Upload } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';


const fontStyles = [
  { value: "font-style-1", label: "La Belle Aurore", className: "font-['La_Belle_Aurore']" },
  { value: "font-style-2", label: "Dancing Script", className: "font-['Dancing_Script']" },
  { value: "font-style-3", label: "Homemade Apple", className: "font-['Homemade_Apple']" },
];

export default function SignIncorporationDocs() {
  const [isOpen, setIsOpen] = useState(false);
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] = useState(fontStyles[0].value);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);

  const handleFontChange = (value: string) => {
    setSelectedFont(value);
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedSignature(result);
        setPreviewSignature(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearDrawing = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setDrawnSignature(null);
      setPreviewSignature(null);
    }
  };

  const saveDrawing = () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current.toDataURL();
      setDrawnSignature(dataUrl);
      setPreviewSignature(dataUrl);
      handleSubmit(dataUrl);
    }
  };

  const handleSubmit = (signature: string) => {
    // onSignatureCreate(signature);
    console.log(drawnSignature,"signature", signature)
    setIsOpen(false);
    setPreviewSignature(null);
  };

  const updateTypedSignature = (value: string) => {
    setTypedSignature(value);
    // Create a temporary canvas to render the typed signature
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 400;
      canvas.height = 100;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      const font = fontStyles.find(f => f.value === selectedFont);
      ctx.font = `48px ${font?.label}`;
      ctx.fillText(value, 10, 60);
      setPreviewSignature(canvas.toDataURL());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Signature</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Signature</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="type" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              TYPE
            </TabsTrigger>
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              DRAW
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              UPLOAD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4">
            <div className="flex flex-col space-y-4 pt-4">
              <Select value={selectedFont} onValueChange={handleFontChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select font style" />
                </SelectTrigger>
                <SelectContent>
                  {fontStyles.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span className={font.className}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Type your signature"
                value={typedSignature}
                onChange={(e) => updateTypedSignature(e.target.value)}
                className={
                  fontStyles.find((f) => f.value === selectedFont)?.className
                }
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTypedSignature("");
                    setPreviewSignature(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={() => previewSignature && handleSubmit(previewSignature)}
                  disabled={!typedSignature}
                >
                  Add Signature
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="draw" className="space-y-4">
            <div className="flex flex-col space-y-4 pt-4">
              <div className="h-[200px] border rounded-md">
                <SignatureCanvas
                  ref={signaturePadRef}
                  canvasProps={{
                    className: 'w-full h-full',
                    style: { 
                      border: 'none',
                      background: 'white',
                      touchAction: 'none'
                    }
                  }}
                  onEnd={() => {
                    if (signaturePadRef.current) {
                      setPreviewSignature(signaturePadRef.current.toDataURL());
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={clearDrawing}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
                <Button onClick={saveDrawing}>
                  Add Signature
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col space-y-4 pt-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="cursor-pointer"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedSignature(null);
                    setPreviewSignature(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={() => uploadedSignature && handleSubmit(uploadedSignature)}
                  disabled={!uploadedSignature}
                >
                  Add Signature
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        {previewSignature && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={previewSignature} 
                alt="Signature preview" 
                className="max-h-20 object-contain mx-auto"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}