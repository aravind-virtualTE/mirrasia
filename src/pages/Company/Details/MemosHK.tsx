// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { createOrUpdateMemo, getMemos, deleteMemo } from "@/lib/api/FetchData";
// import { Upload, Trash2 } from 'lucide-react';
// import CustomLoader from "@/components/ui/customLoader";
// import { toast } from '@/hooks/use-toast';

// type Message = {
//     _id: string;
//     text: string;
//     author: string;
//     timestamp: string;
//     fileUrl?: string;
//     fileType?: string;
// };
// export default function MemoApp({ id }: { id: string }) {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [newText, setNewText] = useState("");
//     const [file, setFile] = useState<File | null>(null);
//     const [isSaveLoading, setIsSaveLoading] = useState(false);
//     const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
//     const currentUser = user ? { role: user.role } : { role: "" };
//     // console.log("currentUser.role", currentUser)

//     useEffect(() => {
//         fetchMemos();
//     }, []);

//     const fetchMemos = async () => {
//         try {
//             const data = await getMemos(id);
//             // console.log("Data", data)
//             setMessages(data.messages || []);
//         } catch (err) {
//             console.error("Fetch error:", err);
//         }
//     };
//     const handleDeleteFile = () => {
//         setFile(null); // Clear the selected file
//     };

//     const handleCreateMemo = async () => {
        
//         if (!newText.trim()) {
//             toast({
//               title: "Enter Text",
//               description: "Enter Text related to file",
//             });
//             return
//         }  
//         setIsSaveLoading(true);
//         const timestamp = new Date().toLocaleString("en-GB");
//         try {
//             const formData = new FormData();
//             formData.append("text", newText);
//             formData.append("author", user?.fullName || "");
//             formData.append("timestamp", timestamp);
//             formData.append("companyId", id);
//             //   console.log("formData", formData);
//             if (file) formData.append("file", file);
//             await createOrUpdateMemo(formData);
//             setNewText("");
//             setFile(null);
//             fetchMemos();
//             setIsSaveLoading(false);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const renderFilePreview = () => {
//         if (!file) return null;

//         const fileName = file.name;
//         const isImage = file.type.startsWith("image/");
//         const isPDF = file.type === "application/pdf";

//         return (
//             <div className="mt-2 flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
//                 {isImage && (
//                     <img
//                         src={URL.createObjectURL(file)}
//                         alt="Preview"
//                         className="h-12 w-12 object-cover rounded"
//                     />
//                 )}
//                 {isPDF && (
//                     <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded">
//                         <span className="text-xs text-gray-600">PDF</span>
//                     </div>
//                 )}
//                 <div className="flex-1 text-sm text-gray-700 truncate">{fileName}</div>
//                 <Button
//                     onClick={handleDeleteFile}
//                     className="text-red-500 hover:text-red-700"
//                     aria-label="Delete file"
//                 >
//                     <Trash2 className="h-5 w-5" />
//                 </Button>
//             </div>
//         );
//     };

//     const handleDeleteMessage = async (messageId: string, fileUrl: string | "") => {
//         try {

//             await deleteMemo(messageId, id, fileUrl);
//             fetchMemos();
//         } catch (err) {
//             console.error("Error deleting message:", err);
//         }
//     };

//     return (
//         <div className="max-w-full mx-auto p-4">
//             <h1 className="text-2xl font-bold mb-4">Memo</h1>
//             <div className="mb-4 border rounded p-4 bg-gray-100 max-h-[400px] overflow-y-auto">
//                 {messages.length === 0 ? (
//                     <div className="text-gray-500">No messages yet.</div>
//                 ) : (
//                     messages.map((msg, idx) => (
//                         <div key={idx} className="mb-4">
//                             {msg.fileUrl && (
//                                 <iframe
//                                     src={msg.fileUrl}
//                                     title="PDF Viewer"
//                                     className="w-full h-64 rounded-md border mb-1"
//                                 />
//                             )}
//                             <div className="flex justify-between items-start space-x-4">
//                                 {msg.text && <div className="flex-1">{msg.text}</div>}
//                                 {currentUser.role === "master" && (
//                                     <Button
//                                         variant="ghost"
//                                         onClick={() =>
//                                             handleDeleteMessage(msg._id, msg.fileUrl || "")
//                                         }
//                                         className="text-red-500 hover:text-red-700"
//                                         aria-label="Delete message"
//                                     >
//                                         <Trash2 className="h-5 w-5" />
//                                     </Button>
//                                 )}
//                             </div>
//                             <div className="text-sm text-gray-600">
//                                 {msg.author}, {msg.timestamp}
//                             </div>
//                             <hr className="my-2" />
//                         </div>
//                     ))
//                 )}
//             </div>
//             <div className="mt-6 space-y-2">
//                 <div className="flex items-center space-x-2">
//                     <Input
//                         type="text"
//                         value={newText}
//                         onChange={(e) => setNewText(e.target.value)}
//                         placeholder="Type a message"
//                         className="flex-1"
//                     />
//                     <label className="flex items-center cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md">
//                         <Upload className="h-5 w-5 text-gray-600" />
//                         <Input
//                             type="file"
//                             onChange={(e) => setFile(e.target.files?.[0] || null)}
//                             className="hidden"
//                         />
//                     </label>
//                     <Button
//                         disabled={isSaveLoading}
//                         className="bg-orange-500 hover:bg-orange-600 text-white px-4"
//                         onClick={handleCreateMemo}
//                     >
//                         {isSaveLoading ? (
//                             <>
//                                 <CustomLoader />
//                                 <span className="ml-2">Saving...</span>
//                             </>
//                         ) : (
//                             "Save Details"
//                         )}
//                     </Button>
//                 </div>
//                 {/* File preview and delete option */}
//                 {renderFilePreview()}
//             </div>
//         </div>
//     );
// }
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createOrUpdateMemo, getMemos, deleteMemo } from "@/lib/api/FetchData";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ChatInput from "@/common/ChatInput";
// ⬇️ Update this import path as needed

type Message = {
  _id: string;
  text: string;
  author: string;
  timestamp: string;
  fileUrl?: string;
  fileType?: string; // optional; we also infer from URL when rendering
};

type ChatSubmission = {
  message: string;
  attachments: {
    id: number;
    file: File;
    preview: string | null;
    name: string;
    size: number;
    type: "image" | "document";
  }[];
};

export default function MemoApp({ id }: { id: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  const currentUser = user ? { role: user.role } : { role: "" };

  useEffect(() => {
    fetchMemos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMemos = async () => {
    try {
      const data = await getMemos(id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string, fileUrl: string | "") => {
    try {
      await deleteMemo(messageId, id, fileUrl);
      fetchMemos();
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Small helpers to render different attachment types
  const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);
  const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(url);

  // NEW: hook ChatInput submit to your memo API
  const handleChatSubmit = async (submission: ChatSubmission) => {
    const text = submission.message.trim();
    const fileAttachment = submission.attachments?.[0];

    if (!text && !fileAttachment) {
      toast({
        title: "Nothing to save",
        description: "Type a message or attach a file.",
      });
      return;
    }

    setIsSaveLoading(true);
    const timestamp = new Date().toLocaleString("en-GB");

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("author", user?.fullName || "");
      formData.append("timestamp", timestamp);
      formData.append("companyId", id);

      if (fileAttachment?.file) {
        formData.append("file", fileAttachment.file);
        // Optional: pass fileType to your API if it supports it
        formData.append("fileType", fileAttachment.type);
      }

      await createOrUpdateMemo(formData);
      await fetchMemos();
    } catch (err) {
      console.error(err);
      toast({
        title: "Save failed",
        description: "Could not save your memo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaveLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Memo (Internal Use)</h1>

      <div className="mb-4 border rounded p-4 bg-gray-100 max-h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-gray-500">No messages yet.</div>
        ) : (
          messages.map((msg, idx) => {
            const fileUrl = msg.fileUrl || "";
            const showPdf = fileUrl && (msg.fileType === "document" ? isPdf(fileUrl) : isPdf(fileUrl));
            const showImg = fileUrl && (msg.fileType === "image" || isImageUrl(fileUrl));

            return (
              <div key={idx} className="mb-4">
                {fileUrl && (
                  <>
                    {showPdf ? (
                      <iframe
                        src={fileUrl}
                        title="PDF Viewer"
                        className="w-full h-64 rounded-md border mb-1"
                      />
                    ) : showImg ? (
                      <img
                        src={fileUrl}
                        alt="Attachment"
                        className="w-full max-h-64 object-contain rounded-md border mb-1 bg-white"
                      />
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        View attachment
                      </a>
                    )}
                  </>
                )}

                <div className="flex justify-between items-start space-x-4">
                  {msg.text && <div className="flex-1 whitespace-pre-wrap">{msg.text}</div>}
                  {currentUser.role === "master" && (
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteMessage(msg._id, msg.fileUrl || "")}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {msg.author}, {msg.timestamp}
                </div>
                <hr className="my-2" />
              </div>
            );
          })
        )}
      </div>

      {/* ⬇️ Replaced the old inputs & button with ChatInput */}
      <ChatInput onSubmit={handleChatSubmit} disabled={isSaveLoading} />
    </div>
  );
}
