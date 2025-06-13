import React, { useState, useRef, useEffect } from 'react';
import { Send, X, FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomLoader from '@/components/ui/customLoader';

type Attachment = {
    id: number;
    file: File;
    preview: string | null;
    name: string;
    size: number;
    type: 'image' | 'document';
};

type MessageData = {
    message: string;
    attachments: Attachment[];
};

type ChatInputProps = {
    onSubmit: (data: MessageData) => void;
    disabled?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, disabled = false }) => {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData.items);
        for (const item of items) {
            if (item.type.startsWith('image/') && !attachment) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setAttachment({
                            id: Date.now() + Math.random(),
                            file,
                            preview: event.target?.result as string,
                            name: file.name,
                            size: file.size,
                            type: 'image',
                        });
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const supportedDocTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        const isImage = file.type.startsWith('image/');
        const isDocument = supportedDocTypes.includes(file.type);

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAttachment({
                    id: Date.now() + Math.random(),
                    file,
                    preview: event.target?.result as string,
                    name: file.name,
                    size: file.size,
                    type: 'image',
                });
            };
            reader.readAsDataURL(file);
        } else if (isDocument) {
            setAttachment({
                id: Date.now() + Math.random(),
                file,
                preview: null,
                name: file.name,
                size: file.size,
                type: 'document',
            });
        }

        e.target.value = '';
    };

    const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!message.trim() && !attachment) return;

        const submissionData: MessageData = {
            message: message.trim(),
            attachments: attachment ? [attachment] : [],
        };

        onSubmit(submissionData);
        setMessage('');
        setAttachment(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    // console.log("ChatInput rendered",disabled);
    return (
        <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
            {attachment && (
                <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-200">
                    <div className="relative group">
                        {attachment.type === 'image' ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                    src={attachment.preview!}
                                    alt={attachment.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-lg border-2 border-gray-200 bg-yellow-50 flex flex-col items-center justify-center">
                                <FileText className="text-yellow-600 mb-1" size={20} />
                                <span className="text-xs text-yellow-700 font-medium">DOC</span>
                            </div>
                        )}
                        <Button
                            type="button"
                            onClick={() => setAttachment(null)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={10} />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                            {attachment.name.length > 8 ? `${attachment.name.substring(0, 6)}...` : attachment.name}
                        </div>
                    </div>
                </div>
            )}

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (attach file or paste image)"
                    className="w-full p-3 border-none outline-none resize-none min-h-[50px] max-h-[120px] rounded-lg"
                    rows={1}
                    disabled={disabled}
                />

                <div className="flex items-center justify-between p-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-full transition-colors"
                            title="Attach a file"
                            disabled={disabled}
                        >
                            <Paperclip size={18} />
                        </Button>
                    </div>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={disabled || (!message.trim() && !attachment)}
                        className="p-2 transition-colors"
                        title="Send message"
                    >
                        {/* <Send size={18} /> */}
                        {disabled ? (
                            <>
                                <CustomLoader />
                                <span className="ml-2">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-1" />
                                <span>Send</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
