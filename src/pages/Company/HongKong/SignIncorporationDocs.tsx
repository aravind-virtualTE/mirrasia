import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eraser as EraserIcon, Undo2, Save, Palette, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";

// Predefined signature styles (same as previous)
const SIGNATURE_STYLES = [
  { 
    id: 'classic', 
    name: 'Classic Cursive', 
    strokeColor: '#000000', 
    lineWidth: 2 
  },
  { 
    id: 'bold', 
    name: 'Bold Signature', 
    strokeColor: '#333333', 
    lineWidth: 3 
  },
  { 
    id: 'artistic', 
    name: 'Artistic Flair', 
    strokeColor: '#4A4A4A', 
    lineWidth: 1.5 
  }
];

interface SignatureData {
  name: string;
  imageDataUrl: string;
  style: string;
  createdAt: Date;
}

const SignIncorporationDocs: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [name, setName] = useState('');
  const [savedSignatures, setSavedSignatures] = useState<SignatureData[]>([]);
  const [currentStyle, setCurrentStyle] = useState(SIGNATURE_STYLES[0]);
  const [strokes, setStrokes] = useState<ImageData[]>([]);
  
  // New state for eraser mode
  const [isEraserMode, setIsEraserMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      canvas.width = canvas.offsetWidth;
      canvas.height = 192;
      
      // Set up drawing context based on current mode
      if (isEraserMode) {
        // Eraser mode uses white color and larger line width
        context.strokeStyle = 'white';
        context.lineWidth = 20;
      } else {
        // Normal drawing mode
        context.strokeStyle = currentStyle.strokeColor;
        context.lineWidth = currentStyle.lineWidth;
      }
      context.lineCap = 'round';
    }
  }, [currentStyle, isEraserMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context && isDrawing) {
      context.closePath();
      setIsDrawing(false);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setStrokes(prev => [...prev, imageData]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setStrokes([]);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && name) {
      const context = canvas.getContext('2d');
      if (context) {
        const dataUrl = canvas.toDataURL('image/png');
        
        const newSignature: SignatureData = {
          name,
          imageDataUrl: dataUrl,
          style: currentStyle.id,
          createdAt: new Date()
        };

        setSavedSignatures(prev => [...prev, newSignature]);
      }
    }
  };

  const toggleEraserMode = () => {
    setIsEraserMode(!isEraserMode);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Capture Your Signature</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <Input 
            placeholder="Enter Your Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Palette className="mr-2 h-4 w-4" />
                Select Signature Style
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Signature Style</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                {SIGNATURE_STYLES.map((style) => (
                  <Button 
                    key={style.id}
                    variant={currentStyle.id === style.id ? 'default' : 'outline'}
                    onClick={() => setCurrentStyle(style)}
                    className="flex flex-col items-center"
                  >
                    {style.name}
                    <div 
                      className="w-16 h-8 mt-2 border rounded"
                      style={{ 
                        backgroundColor: style.strokeColor,
                        opacity: 0.7 
                      }}
                    />
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 border border-gray-200 rounded-lg relative">
          <canvas
            ref={canvasRef}
            className="w-full h-48 bg-white rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <Toggle 
              variant="outline"
              pressed={isEraserMode}
              onPressedChange={toggleEraserMode}
              aria-label="Toggle Eraser Mode"
            >
              {isEraserMode ? <Edit className="h-4 w-4" /> : <EraserIcon className="h-4 w-4" />}
            </Toggle>
          </div>
        </div>

        <div className="flex justify-between space-x-2 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setStrokes(prev => prev.slice(0, -1))}
                  disabled={strokes.length === 0}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo Last Stroke</p>
              </TooltipContent>
            </Tooltip>

            <Button 
              variant="outline"
              onClick={clearCanvas}
            >
              <EraserIcon className="h-4 w-4 mr-2" />
              Clear All
            </Button>

            <Button 
              onClick={saveSignature}
              disabled={!name}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Signature
            </Button>
          </TooltipProvider>
        </div>

        {savedSignatures.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Saved Signatures</h3>
            <div className="grid grid-cols-2 gap-2">
              {savedSignatures.map((sig, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-2 text-center"
                >
                  <img 
                    src={sig.imageDataUrl} 
                    alt={`${sig.name}'s signature`} 
                    className="w-full h-24 object-contain mb-2"
                  />
                  <p className="text-xs">{sig.name} - {sig.style}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignIncorporationDocs;