import { useState } from 'react';
import SignatureModal from './SignatureModal';

const ParentComponent = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };

  return (
    <div className="w-64 pt-2">
      <div
        onClick={handleBoxClick}
        className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {signature ? (
          <img
            src={signature}
            alt="Selected signature"
            className="max-h-20 max-w-full object-contain"
          />
        ) : (
          <p className="text-gray-400">Click to sign</p>
        )}
      </div>
      {isModalOpen && (
        <SignatureModal
          onSelectSignature={handleSelectSignature}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ParentComponent;