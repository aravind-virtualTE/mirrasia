import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Webcam from "react-webcam";

export default function MobileUpload() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [mode, setMode] = useState<"select" | "webcam" | "upload">("select");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const webcamRef = useRef<Webcam>(null);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Invalid or missing session token.");
        }
    }, [token]);

    const handleCapture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setMode("select"); // Go back to preview
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setCapturedImage(URL.createObjectURL(e.target.files[0]));
            setMode("select");
        }
    };

    const handleSubmit = async () => {
        if (!token) return;
        setUploading(true);
        setStatus("idle");

        try {
            const formData = new FormData();

            if (selectedFile) {
                formData.append("selfie", selectedFile);
            } else if (capturedImage) {
                const blob = await fetch(capturedImage).then(r => r.blob());
                formData.append("selfie", blob, "selfie.jpg");
            } else {
                setErrorMessage("No image selected");
                setUploading(false);
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

            const response = await fetch(`${API_URL}/user/mobile-upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                setStatus("success");
            } else {
                const data = await response.json();
                setStatus("error");
                setErrorMessage(data.message || "Upload failed");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("Network error occurred");
        } finally {
            setUploading(false);
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Upload Successful!</CardTitle>
                        <CardDescription>
                            Your selfie has been verified. You can now return to your desktop screen.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === "error" && !uploading && !capturedImage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center border-red-200">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 p-4 rounded-full mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <CardTitle className="text-xl text-red-700">Error</CardTitle>
                        <CardDescription className="text-red-600/80">
                            {errorMessage}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center py-10">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center">Selfie Verification</CardTitle>
                    <CardDescription className="text-center">
                        Take a photo or upload an image to verify your identity.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Preview Area */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center border-2 border-dashed border-gray-300">
                        {mode === "webcam" ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "user" }}
                                className="w-full h-full object-cover"
                            />
                        ) : capturedImage ? (
                            <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-6 text-muted-foreground">
                                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No image captured</p>
                            </div>
                        )}

                        {/* Webcam Capture Button */}
                        {mode === "webcam" && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <Button onClick={handleCapture} size="lg" className="rounded-full w-16 h-16 p-0 border-4 border-white shadow-lg">
                                    <div className="w-12 h-12 bg-red-500 rounded-full" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    {mode !== "webcam" && (
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => { setMode("webcam"); setCapturedImage(null); setSelectedFile(null); }} className="h-auto py-4 flex flex-col gap-2">
                                <Camera className="w-6 h-6" />
                                <span>Camera</span>
                            </Button>
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full"
                                    onChange={handleFileUpload}
                                />
                                <Button variant="outline" className="w-full h-full py-4 flex flex-col gap-2">
                                    <Upload className="w-6 h-6" />
                                    <span>Upload</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Submit Action */}
                    {capturedImage && mode !== "webcam" && (
                        <div className="pt-4 border-t">
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "Submit Photo"}
                            </Button>
                            {errorMessage && <p className="text-center text-red-500 text-sm mt-2">{errorMessage}</p>}
                        </div>
                    )}

                    {mode === 'webcam' && (
                        <Button variant="ghost" onClick={() => setMode('select')} className="w-full">
                            Cancel
                        </Button>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
