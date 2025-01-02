import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import InlineSignatureCreator from './InlineSignatureCreator';
import { signaturesAtom } from '@/store/hongkong';
// import { Button } from '../ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
// import { ScrollArea } from '../ui/scroll-area';

interface SignatureModalProps {
  onSelectSignature: (signature: string | "") => void;
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
  //   <Dialog open={isOpen} onOpenChange={setIsOpen}>
  //   <DialogTrigger asChild>
  //     <Button variant="outline">Open Signatures</Button>
  //   </DialogTrigger>
  //   <DialogContent className="sm:max-w-md">
  //     <DialogHeader>
  //       <DialogTitle>Signatures</DialogTitle>
  //     </DialogHeader>
  //     {isEditing ? (
  //       <InlineSignatureCreator
  //         onSignatureCreate={handleSignature}
  //         maxWidth={256}
  //         maxHeight={100}
  //       />
  //     ) : (
  //       <div className="space-y-4">
  //         <Button
  //           onClick={() => setIsEditing(true)}
  //           variant="outline"
  //           className="w-full"
  //         >
  //           Create New Signature
  //         </Button>
  //         <ScrollArea className="h-[200px] w-full rounded-md border p-4">
  //           {signatures.map((signature, index) => (
  //             <div key={index} className="flex items-center justify-between py-2 border-b">
  //               <img
  //                 src={signature}
  //                 alt={`Saved signature ${index + 1}`}
  //                 className="max-h-12 object-contain cursor-pointer"
  //                 onClick={() => onSelectSignature(signature)}
  //               />
  //               <Button
  //                 onClick={() => handleDeleteSignature(signature)}
  //                 variant="destructive"
  //                 size="sm"
  //               >
  //                 Delete
  //               </Button>
  //             </div>
  //           ))}
  //         </ScrollArea>
  //       </div>
  //     )}
  //     <Button onClick={() => setIsOpen(false)} className="mt-4 w-full">
  //       Close
  //     </Button>
  //   </DialogContent>
  // </Dialog>
  );
};

export default SignatureModal;