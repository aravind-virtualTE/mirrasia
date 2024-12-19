import React, { useState, useEffect,useRef  } from 'react';
const PdfTest: React.FC = () => {
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null); // Ref for the iframe

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/pdf/generate-pdf');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // console.log("responsebody",response.json())
                
                // const blob = await response.blob();
                // const blobUrl = URL.createObjectURL(blob);
                // setPdfBlobUrl(blobUrl);
                const data = await response.arrayBuffer();
                const blob = new Blob([data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setPdfBlobUrl(url);
            } catch (error) {
                console.error("Error fetching PDF:", error);
            }
        };

        fetchPdf();
    }, []);

    const handleDownload = () => {
        if (pdfBlobUrl) {
            const link = document.createElement('a');
            link.href = pdfBlobUrl;
            link.download = 'appointment_letter.pdf';
            link.click();

            // Important: Revoke the URL *after* a short delay or after the iframe has loaded (more reliable)
            setTimeout(() => {
                URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(null); // Optionally clear the state
            }, 100); // Small delay (adjust if needed)

            // Or, even better, revoke after the iframe has loaded:
            // if(iframeRef.current){
            //     iframeRef.current.onload = () => {
            //         URL.revokeObjectURL(pdfBlobUrl);
            //         setPdfBlobUrl(null);
            //     }
            // }
        }
    };
// 'https://mirrasia-pdf.s3.ap-southeast-1.amazonaws.com/output.pdf'
    return (
        <div className="App">
            {pdfBlobUrl && (
                <div>
                    <iframe src={pdfBlobUrl} title="PDF Viewer" width="100%" height="600px" ref={iframeRef} /> {/* Add the ref */}
                    <button onClick={handleDownload}>Download PDF</button>
                </div>
            )}
            {!pdfBlobUrl && <p>Loading PDF...</p>}
        </div>
    );
};

export default PdfTest;