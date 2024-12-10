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