import { useState } from 'react';
import InlineSignatureCreator from './InlineSignatureCreator';

const SignSmpl = () => {
    const [signatures, setSignatures] = useState<string[]>([]);
    const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleSignature = (signature: string) => {
        setSignatures(prev => [...prev, signature]);
        setSelectedSignature(signature);
        setIsEditing(false);
    };

    const handleClear = () => {
        setSelectedSignature(null);
    };

    const handleBoxClick = () => {
        if (selectedSignature) {
            handleClear();
        } else {
            setIsEditing(true);
        }
    };

    const handleDeleteSignature = (signature: string) => {
        setSignatures(prev => prev.filter(s => s !== signature));
        if (selectedSignature === signature) {
            handleClear();
        }
    };

    return (
        <div>
            {isEditing ? (
                <InlineSignatureCreator
                    onSignatureCreate={handleSignature}
                    maxWidth={256}
                    maxHeight={100}
                />
            ) : (
                <div
                    onClick={handleBoxClick}
                    className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    {selectedSignature ? (
                        <img
                            src={selectedSignature}
                            alt="Director's signature"
                            className="max-h-20 max-w-full object-contain"
                        />
                    ) : (
                        <p className="text-gray-400">Click to sign</p>
                    )}
                </div>
            )}
            <div className="mt-4">
                <h3 className="text-lg font-semibold">Saved Signatures</h3>
                <ul className="space-y-2">
                    {signatures.map((signature, index) => (
                        <li key={index} className="flex items-center justify-between">
                            <img
                                src={signature}
                                alt={`Saved signature ${index + 1}`}
                                className="max-h-12 object-contain"
                                onClick={() => setSelectedSignature(signature)}
                            />
                            <button
                                onClick={() => handleDeleteSignature(signature)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SignSmpl;