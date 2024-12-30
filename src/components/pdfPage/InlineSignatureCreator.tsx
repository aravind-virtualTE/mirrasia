import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Type, Pencil, Upload } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureCreatorProps {
  onSignatureCreate: (signature: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

const fontStyles = [
  { value: "font-style-1", label: "La Belle Aurore", className: "font-['La_Belle_Aurore']" },
  { value: "font-style-2", label: "Dancing Script", className: "font-['Dancing_Script']" },
  { value: "font-style-3", label: "Homemade Apple", className: "font-['Homemade_Apple']" },
];

export default function InlineSignatureCreator({ 
  onSignatureCreate, 
  maxWidth = 400,
  maxHeight = 200,
  className = ""
}: SignatureCreatorProps) {
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] = useState(fontStyles[0].value);
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const [activeTab, setActiveTab] = useState("type");
  const [, setIsDrawing] = useState(false);

  const convertToStandardFormat = async (
    input: string | File | null, 
    type: 'typed' | 'drawn' | 'uploaded'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject('Canvas context not available');
        return;
      }

      canvas.width = maxWidth;
      canvas.height = maxHeight;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';

      if (type === 'typed') {
        const font = fontStyles.find(f => f.value === selectedFont);
        ctx.font = `48px ${font?.label}`;
        ctx.textBaseline = 'middle';
        ctx.fillText(input as string, 10, canvas.height / 2);
        resolve(canvas.toDataURL('image/png'));
      } 
      else if (type === 'drawn' || type === 'uploaded') {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(
            maxWidth / img.width,
            maxHeight / img.height
          );
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          ctx.drawImage(img, x, y, width, height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject('Error loading image');
        img.src = input as string;
      }
    });
  };

  const handleFontChange = (value: string) => {
    setSelectedFont(value);
    if (typedSignature) {
      updateTypedSignature(typedSignature);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const standardized = await convertToStandardFormat(result, 'uploaded');
        setPreviewSignature(standardized);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawStart = () => {
    setIsDrawing(true);
  };

  const handleDrawEnd = async () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current.toDataURL();
      const standardized = await convertToStandardFormat(dataUrl, 'drawn');
      setPreviewSignature(standardized);
    }
  };

  const handleSubmit = () => {
    if (previewSignature) {
      onSignatureCreate(previewSignature);
      clearAll();
    }
  };

  const clearAll = () => {
    setTypedSignature("");
    setPreviewSignature(null);
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setIsDrawing(false);
  };

  const updateTypedSignature = async (value: string) => {
    setTypedSignature(value);
    if (value) {
      const standardized = await convertToStandardFormat(value, 'typed');
      setPreviewSignature(standardized);
    } else {
      setPreviewSignature(null);
    }
  };

  return (
    <div className={`border rounded-lg shadow-sm p-4 bg-white ${className}`}>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
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
          </div>
        </TabsContent>

        <TabsContent value="draw" className="space-y-4">
          <div className="flex flex-col space-y-4 pt-4">
            <div className="border rounded-md" style={{ height: `${maxHeight}px` }}>
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
                onBegin={handleDrawStart}
                onEnd={handleDrawEnd}
              />
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
          </div>
        </TabsContent>

        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={clearAll}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!previewSignature}
          >
            Add Signature
          </Button>
        </div>

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
      </Tabs>
    </div>
  );
}