import { useState } from 'react';
import { PDFDocument,      
    // rgb 
} from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function usePdfSignature() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const loadPdf = async (file: File) => {
    setPdfFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const url = URL.createObjectURL(new Blob([arrayBuffer], { type: 'application/pdf' }));
    console.log("url-->",url)
    setPdfUrl(url);
  };

  const addSignatureToPdf = async () => {
    if (!pdfFile || !signatureData) return null;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const pngImage = await pdfDoc.embedPng(signatureData);
    const pngDims = pngImage.scale(0.5);

    firstPage.drawImage(pngImage, {
      x: width / 2 - pngDims.width / 2,
      y: height / 4 - pngDims.height / 2,
      width: pngDims.width,
      height: pngDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  return {
    pdfUrl,
    loadPdf,
    setSignatureData,
    addSignatureToPdf,
  };
}

// const loadPdf = async (file: File) => {
//     setPdfFile(file);
    
//     // Create a URL for the PDF file
//     const url = URL.createObjectURL(file);
//     setPdfUrl(url);
//   };