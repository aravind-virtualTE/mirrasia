import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { shareHolderDirectorControllerAtom } from '@/lib/atom';
import { isValidEmail } from '@/middleware';
import { sendInviteToShDir } from '@/services/dataFetch';
import CustomLoader from '@/components/ui/customLoader';
import { useToast } from "@/hooks/use-toast"
import { useTranslation  } from "react-i18next";

interface ShareholderDirectorProps {
  name: string;
  email: string;
  phone: string;
  ownershipRate: number;
  isDirector: boolean;
  isLegalPerson: boolean;
  onDelete: () => void;
  onUpdate: (updates: Partial<Omit<ShareholderDirectorProps, 'onDelete' | 'onUpdate'>>) => void;
  isRemovable: boolean;
}

const ShareholderDirector: React.FC<ShareholderDirectorProps> = ({
  name,
  email,
  phone,
  ownershipRate,
  isDirector,
  isLegalPerson,
  onDelete,
  onUpdate,
  isRemovable,
}) => {
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { t } = useTranslation();
  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Phone validation
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  return (
    <Card className="mb-4 pt-4">
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="col-span-3 grid grid-cols-5 gap-4 items-center">
          <Label className="font-medium">{t('CompanyInformation.shareDirName')}:</Label>
          <Input
            type="text"
            className="input col-span-2"
            placeholder="Name on passport/official documents"
            value={name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
          <Label className="font-medium">{t('CompanyInformation.ownerShpRte')}</Label>
          <Input
            type="number"
            className="input"
            min={0}
            max={100}
            step={0.01}
            value={ownershipRate}
            onChange={(e) => onUpdate({ ownershipRate: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-span-3 grid grid-cols-5 gap-4 items-center">
          <Label className="font-medium">{t('ApplicantInfoForm.email')}:</Label>
          <div className="col-span-2">
            <Input
              type="email"
              className={`input w-full ${emailError ? 'border-red-500' : ''}`}
              placeholder="email@example.com"
              value={email}
              onChange={(e) => {
                const newEmail = e.target.value;
                validateEmail(newEmail);
                onUpdate({ email: newEmail });
              }}
            />
            {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
          </div>

          <Label className="font-medium">{t('ApplicantInfoForm.phoneNum')}:</Label>
          <div>
            <Input
              type="tel"
              className={`input w-full ${phoneError ? 'border-red-500' : ''}`}
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => {
                const newPhone = e.target.value;
                validatePhone(newPhone);
                onUpdate({ phone: newPhone });
              }}
            />
            {phoneError && <span className="text-red-500 text-sm">{phoneError}</span>}
          </div>
        </div>

        <div className="col-span-3 grid grid-cols-5 gap-4 items-center">
          <Label className="font-medium">{t('CompanyInformation.actDirector')}</Label>
          <Select
            value={isDirector.toString()}
            onValueChange={(value) => {
              const newIsDirector = value === 'true';
              onUpdate({
                isDirector: newIsDirector,
                // If setting as director, automatically set legal person to false
                // ...(newIsDirector ? { isLegalPerson: false } : {})
              });
            }}
          >
            <SelectTrigger className="input">
              <SelectValue>{isDirector ? 'Yes' : 'No'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>

          <Label className="font-medium">{t('CompanyInformation.isLegal')}</Label>
          <Select
            value={isLegalPerson.toString()}
            onValueChange={(value) => onUpdate({ isLegalPerson: value === 'true' })}
            // disabled={isDirector}
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
        </div>
      </CardContent>
    </Card>
  );
};

const ShareholderDirectorForm: React.FC = () => {
  const [atomShareHolderState, setShareDirControllerInfo] = useAtom(shareHolderDirectorControllerAtom);
  const [shareholders, setShareholders] = useState<ShareholderDirectorProps[]>([
    {
      name: '',
      email: '',
      phone: '',
      ownershipRate: 0,
      isDirector: false,
      isLegalPerson: false,
      onDelete: () => { },
      onUpdate: () => { },
      isRemovable: false,
    },
  ]);
  const [totalOwnership, setTotalOwnership] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()
  const { t } = useTranslation();

  useEffect(() => {
    if (atomShareHolderState.shareHolders && atomShareHolderState.shareHolders.length > 0) {
      const hydratedShareholders = atomShareHolderState.shareHolders.map((shareholder, index) => ({
        ...shareholder,
        onDelete: () => { },
        onUpdate: () => { },
        isRemovable: index !== 0, // First shareholder is not removable
      }));
      setShareholders(hydratedShareholders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filteredArray = shareholders.map(obj => ({
      name: obj.name,
      email: obj.email,
      phone: obj.phone,
      ownershipRate: obj.ownershipRate,
      isDirector: obj.isDirector,
      isLegalPerson: obj.isLegalPerson
    }));
    setShareDirControllerInfo((prev) => ({ ...prev, shareHolders: filteredArray }));
  }, [shareholders, setShareDirControllerInfo]);

  useEffect(() => {
    const total = shareholders.reduce((sum, shareholder) => sum + shareholder.ownershipRate, 0);
    setTotalOwnership(total);
  }, [shareholders]);

  const addShareholder = () => {
    setShareholders([
      ...shareholders,
      {
        name: '',
        email: '',
        phone: '',
        ownershipRate: 0,
        isDirector: false,
        isLegalPerson: false,
        onDelete: () => { },
        onUpdate: () => { },
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

  const sendMailFunction = async () => {
    try {
      setIsLoading(true);
      const extractedData = shareholders.map(item => {
        const { name, email } = item;

        if (!isValidEmail(email)) {
          alert(`Invalid email format for ${name}: ${email}`);
        }

        return { name, email };
      });
      const docId = localStorage.getItem('companyRecordId');
      const payload = { _id: docId, inviteData: extractedData,country: 'HK'  };
      // console.log("send mail function", payload)
      const response = await sendInviteToShDir(payload);
      // console.log("send mail response", response)
      if (response.summary.successful > 0){
        toast({
          title: 'Success',
          description: `Successfully sent invitation mail to ${response.summary.successful} people`,
        })
      }
      if (response.summary.alreadyExists > 0){
        toast({
          title: 'Success',
          description: `Some Users Already Exist`,
        })
      }
      if (response.summary.failed > 0){
        toast({
          title: 'Failed',
          description: `Some Invitations Failed`,
        })
      }
      console.log("send mail response", response)
      setIsLoading(false);

    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="flex flex-col">
        {totalOwnership === 0 && (
        <div className="text-red-500 mb-4 text-center">
          Ownership is currently 0%. Please assign ownership.
        </div>
      )}
      {totalOwnership > 0 && totalOwnership < 100 && (
        <div className="text-red-500 mb-4 text-center">
          {t('CompanyInformation.totalShrldrName')}: {totalOwnership.toFixed(2)}%
        </div>
      )}
      {totalOwnership === 100 && (
        <div className="text-green-600 font-medium mb-4 text-center">
          ✅ Ownership perfectly distributed at 100%
        </div>
      )}
      {totalOwnership > 100 && (
        <div className="text-red-500 mb-4 text-center">
          {t('CompanyInformation.totalShrldrName')}: {totalOwnership.toFixed(2)}%
        </div>
      )}
      <div>
        {shareholders.map((shareholder, index) => (
          <ShareholderDirector
            key={index}
            {...shareholder}
            onDelete={() => deleteShareholder(index)}
            onUpdate={(updates) => updateShareholder(index, updates)}
          />
        ))}
      </div>
      <div className="flex justify-around mt-4">
        <Button onClick={sendMailFunction}
          disabled={isLoading}
          className="flex items-center"
          aria-busy={isLoading}
          aria-live="polite"
        >{isLoading ? (
          <>
            <CustomLoader />
            <span className="ml-2">Processing...</span>
          </>
        ) : (<span>{t("CompanyInformation.sendInvitation")}</span>)}</Button>
        <Button
          className="btn btn-primary w-fit"
          onClick={addShareholder}
        // disabled={totalOwnership >= 100}
        >
          {t('CompanyInformation.addShldrDir')}
        </Button>
      </div>
    </div>
  );
};

export default ShareholderDirectorForm;