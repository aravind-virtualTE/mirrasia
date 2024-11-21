import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { shareHolderDirectorControllerAtom } from '@/lib/atom';

interface ShareholderDirectorProps {
  name: string;
  ownershipRate: number;
  isDirector: boolean;
  isLegalPerson: boolean;
  onDelete: () => void;
  onUpdate: (updates: Partial<Omit<ShareholderDirectorProps, 'onDelete' | 'onUpdate'>>) => void;
  isRemovable: boolean;
}

const ShareholderDirector: React.FC<ShareholderDirectorProps> = ({
  name,
  ownershipRate,
  isDirector,
  isLegalPerson,
  onDelete,
  onUpdate,
  isRemovable,
}) => {
  return (
    <Card className="mb-4 pt-4">
      <CardContent className="grid grid-cols-5 gap-4 items-center">
        <Label className="font-medium">Shareholder(s) / Director(s) Name:</Label>
        <Input
          type="text"
          className="input col-span-2"
          placeholder="Name on passport/official documents"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <Label className="font-medium">Ownership Rate</Label>
        <Input
          type="number"
          className="input"
          min={0}
          max={100}
          step={0.01}
          value={ownershipRate}
          onChange={(e) => onUpdate({ ownershipRate: parseFloat(e.target.value) })}
        />
        <Label className="font-medium">Act as a director?</Label>
        <Select
          value={isDirector.toString()}
          onValueChange={(value) => onUpdate({ isDirector: value === 'true' })}
        >
          <SelectTrigger className="input">
            <SelectValue>{isDirector ? 'Yes' : 'No'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
        <Label className="font-medium">Legal Person?</Label>
        <Select
          value={isLegalPerson.toString()}
          onValueChange={(value) => onUpdate({ isLegalPerson: value === 'true' })}
        >
          <SelectTrigger className="input">
            <SelectValue>{isLegalPerson ? 'Yes' : 'No'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
        {isRemovable && (
          <button
            className="btn btn-icon text-red-500 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

const ShareholderDirectorForm: React.FC = () => {
  const [, setShareDirControllerInfo] = useAtom(shareHolderDirectorControllerAtom);
  const [shareholders, setShareholders] = useState<ShareholderDirectorProps[]>([
    {
      name: '',
      ownershipRate: 0,
      isDirector: false,
      isLegalPerson: false,
      onDelete: () => {},
      onUpdate: () => {},
      isRemovable: false,
    },
  ]);
  const [totalOwnership, setTotalOwnership] = useState(0);

  useEffect(() => {
    const filteredArray = shareholders.map(obj => ({
      name: obj.name,
      ownershipRate: obj.ownershipRate,
      isDirector: obj.isDirector,
      isLegalPerson: obj.isLegalPerson
    }));
    setShareDirControllerInfo((prev) => ({ ...prev, shareHolders: filteredArray }));
  }, [shareholders, setShareDirControllerInfo]);
  
  // Calculate total ownership whenever shareholders change
  useEffect(() => {
    const total = shareholders.reduce((sum, shareholder) => sum + shareholder.ownershipRate, 0);
    setTotalOwnership(total);
  }, [shareholders]);

  const addShareholder = () => {
    setShareholders([
      ...shareholders,
      {
        name: '',
        ownershipRate: 0,
        isDirector: false,
        isLegalPerson: false,
        onDelete: () => {},
        onUpdate: () => {},
        isRemovable: true,
      },
    ]);
  };

  const deleteShareholder = (index: number) => {
    if (shareholders.length > 1) {
      const newShareholders = [...shareholders];
      newShareholders.splice(index, 1);
      setShareholders(newShareholders);
    }
  };

  const updateShareholder = (index: number, updates: Partial<Omit<ShareholderDirectorProps, 'onDelete' | 'onUpdate'>>) => {
    const newShareholders = [...shareholders];
    newShareholders[index] = { ...newShareholders[index], ...updates };
    setShareholders(newShareholders);
  };
  return (
    <div className="flex flex-col">
      {totalOwnership > 100 && (
        <div className="text-red-500 mb-4 text-center">
          Total ownership cannot exceed 100%. Current total: {totalOwnership.toFixed(2)}%
        </div>
      )}
      <div>
        {shareholders.map((shareholder, index) => (
          <ShareholderDirector
            key={index}
            name={shareholder.name}
            ownershipRate={shareholder.ownershipRate}
            isDirector={shareholder.isDirector}
            isLegalPerson={shareholder.isLegalPerson}
            onDelete={() => deleteShareholder(index)}
            onUpdate={(updates) => updateShareholder(index, updates)}
            isRemovable={shareholder.isRemovable}
          />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Button 
          className="btn btn-primary w-fit" 
          onClick={addShareholder}
          disabled={totalOwnership >= 100}
        >
          Add Shareholder/director
        </Button>
      </div>
    </div>
  );
};

export default ShareholderDirectorForm;