import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import InlineSignatureCreator from './InlineSignatureCreator';
import { signaturesAtom } from '@/store/hongkong';

interface SignatureModalProps {
  onSelectSignature: (signature: string | null) => void;
  onClose: () => void;
}

const SignatureModal = ({ onSelectSignature, onClose }: SignatureModalProps) => {
  const [signatures, setSignatures] = useAtom(signaturesAtom);
  const [isEditing, setIsEditing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSignature = (signature: string) => {
    setSignatures((prev) => [...prev, signature]);
    onSelectSignature(signature);
    setIsEditing(false);
  };

  const handleDeleteSignature = (signature: string) => {
    setSignatures((prev) => prev.filter((s) => s !== signature));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Signatures</h2>
        {isEditing ? (
          <InlineSignatureCreator
            onSignatureCreate={handleSignature}
            maxWidth={256}
            maxHeight={100}
          />
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create New Signature
            </button>
            <div className="max-h-40 overflow-y-auto">
              {signatures.map((signature, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b">
                  <img
                    src={signature}
                    alt={`Saved signature ${index + 1}`}
                    className="max-h-12 object-contain cursor-pointer"
                    onClick={() => onSelectSignature(signature)}
                  />
                  <button
                    onClick={() => handleDeleteSignature(signature)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SignatureModal;