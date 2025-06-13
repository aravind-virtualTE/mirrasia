import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import CustomLoader from '@/components/ui/customLoader';
import { sendInviteToShDir } from '@/services/dataFetch';
import { isValidEmail } from '@/middleware';
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next";
import { usaFormWithResetAtom } from '../UsState';

interface ShareholderDirectorProps {
  name: string;
  email: string;
  phone: string;
  ownershipRate: number;
  isDirector: {
    value: string,
    id: string
  };
  isLegalPerson: {
    value: string,
    id: string
  };
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

  const yesNoOptions = [
    { id: "yes", value: "AmlCdd.options.yes" },
    { id: "no", value: "AmlCdd.options.no" },
  ];

  return (
    <Card className="mb-4 pt-4">
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="col-span-3 grid grid-cols-5 gap-4 items-center">
          <Label className="font-medium">{t('usa.bInfo.shrldSection.shareholderOfficer')}</Label>
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
            value={isDirector.id}
            onValueChange={(selectedId) => {
              const selectedOption = yesNoOptions.find(opt => opt.id === selectedId);
              if (selectedOption) {
                onUpdate({ isDirector: selectedOption });
              }
            }}
          >
            <SelectTrigger className="input">
              <SelectValue>{t(isDirector.value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {t(option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label className="font-medium">{t('CompanyInformation.isLegal')}</Label>
          <Select
            value={isLegalPerson.id}
            onValueChange={(selectedId) => {
              const selectedOption = yesNoOptions.find(opt => opt.id === selectedId);
              if (selectedOption) {
                onUpdate({ isLegalPerson: selectedOption });
              }
            }}
          >
            <SelectTrigger className="input">
              <SelectValue>{t(isLegalPerson.value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {t(option.value)}
                </SelectItem>
              ))}
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
  const { t } = useTranslation()
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);
  const [shareholders, setShareholders] = useState<ShareholderDirectorProps[]>([
    {
      name: '',
      email: '',
      phone: '',
      ownershipRate: 0,
      isDirector: { id: "no", value: t("AmlCdd.options.no") },
      isLegalPerson: { id: "no", value: t("AmlCdd.options.no") },
      onDelete: () => { },
      onUpdate: () => { },
      isRemovable: false,
    },
  ]);
  const [totalOwnership, setTotalOwnership] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()


  useEffect(() => {
    if (formData.shareHolders && formData.shareHolders.length > 0) {
      const hydratedShareholders = formData.shareHolders.map((shareholder, index) => ({
        ...shareholder,
        onDelete: () => { },
        onUpdate: () => { },
        isRemovable: index !== 0,
      }));
      setShareholders(hydratedShareholders);
    }
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
    setFormData({ ...formData, shareHolders: filteredArray });
  }, [shareholders, setFormData]);

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
        isDirector: { id: "no", value: t("AmlCdd.options.no") },
        isLegalPerson: { id: "no", value: t("AmlCdd.options.no") },
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
      console.log("formData",formData)
      let country  = "US_Individual"
      if(formData.selectedEntity == "Corporation") {
        country = "US_Corporate"
      }
      const payload = { _id: docId, inviteData: extractedData, country };
      const response = await sendInviteToShDir(payload);
      if (response.summary.successful > 0) {
        toast({
          title: 'Success',
          description: `Successfully sent invitation mail to ${response.summary.successful} people`,
        })
      }
      if (response.summary.alreadyExists > 0) {
        toast({
          title: 'Success',
          description: `Some Users Already Exist`,
        })
      }
      if (response.summary.failed > 0) {
        toast({
          title: 'Failed',
          description: `Some Invitations Failed`,
        })
      }
      setIsLoading(false);

    } catch (e) {
      console.log(e)
    }
  }
  return (
    <div className="flex flex-col">
      {totalOwnership === 0 && (
        <div className="text-red-500 mb-4 text-center">
          {t('usa.bInfo.shrldSection.ownerShp0')}
        </div>
      )}
      {totalOwnership > 0 && totalOwnership < 100 && (
        <div className="text-red-500 mb-4 text-center">
          {t('CompanyInformation.totalShrldrName')}: {totalOwnership.toFixed(2)}%
        </div>
      )}
      {totalOwnership === 100 && (
        <div className="text-green-600 font-medium mb-4 text-center">
          ✅{t('usa.bInfo.shrldSection.ownerShip100')}
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