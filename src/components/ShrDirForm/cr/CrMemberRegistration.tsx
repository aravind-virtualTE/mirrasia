/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  memberFormConfig,
  MemberFormData,
  MemberFormStep as StepConfig,
  createUpdateCrMember,
  getCrMemberData
} from './memberConfig';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { MemberFormField } from './MemberFormField';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { useNavigate, useParams } from 'react-router-dom';
import { multiShrDirResetAtom } from '@/components/shareholderDirector/constants';
import { useAtom } from 'jotai';

interface MemberFormStepProps {
  step: StepConfig;
  formData: MemberFormData;
  onFieldChange: (field: string, value: string | string[]) => void;
}

const PEP_INFO_TEXT = `Politically Exposed Persons (Source: FATF Guidance: Politically Exposed Persons (Rec 12 and 22))

A foreign Politically Exposed Person means an individual who currently or in the past has had political/social influence in a foreign country.

Examples include high-ranking officials in a foreign government's executive, judicial, national defense, or other government agencies, high-ranking officials of major foreign political parties, and executives of foreign state-owned enterprises.

A domestic Politically Exposed Person means an individual who currently or in the past has had political/social influence domestically.

(Examples include high-ranking officials in the domestic government's executive, judicial, national defense, or other government agencies, high-ranking officials of major domestic political parties, and executives of foreign state-owned enterprises.)

A Politically Exposed Person of an international organization means an individual with influence in an international organization, such as a director, officer, or board member, senior management, or a person with equivalent authority.

A Politically Exposed Person by family relationship means parents, siblings, spouse, children, blood relatives, or relatives by marriage.

A Politically Exposed Person by close association means an individual who has a close social or business relationship with a Politically Exposed Person.`;

const AGREEMENT_TEXT = `To the best of my knowledge, the foundation's assets, net assets, income, or activities are not related in any way to illegal weapons, money laundering, illegal drugs or other illegal controlled substances, or activities that I know to be illegal in my citizenship, residence, and/or place of incorporation.

I have no intention of obstructing, delaying, or defrauding creditors or engaging in illegal activities in relation to creditors or other parties, and I have no intention of using the services of a corporate service provider to facilitate or otherwise engage in such activities.

I agree to provide the necessary documents and information in connection with this service, and I agree that such information may be provided to institutions, government agencies, and companies essential for the provision of the service.

I will fully indemnify the company providing the corporate services and all related parties from all kinds of legal liability that may arise if any fact or statement contained in this declaration may later prove to be untrue or substantially inaccurate.`;

const MemberFormStep = ({ step, formData, onFieldChange }: MemberFormStepProps) => {
  const isPEPStep = step.id === 'pep-confirmation';
  const isAgreementStep = step.id === 'agreement';

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        {step.description && (
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        )}
      </div>

      {/* PEP Information Box */}
      {isPEPStep && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 whitespace-pre-line">{PEP_INFO_TEXT}</div>
          </div>
        </div>
      )}

      {/* Agreement Text Box */}
      {isAgreementStep && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm text-blue-800 whitespace-pre-line">{AGREEMENT_TEXT}</div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {step.fields.map((field) => (
          <MemberFormField
            key={field.id}
            field={field}
            value={(formData[field.id] as string | string[]) || ''}
            onChange={(value) => onFieldChange(field.id, value)}
            formData={formData}
          />
        ))}
      </div>
    </div>
  );
};

const CRMemberRegistration = () => {
  const [formData, setFormData] = useState<MemberFormData>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [multiData] = useAtom<any>(multiShrDirResetAtom);

  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);

  useEffect(() => {
    // Load existing member data (edit mode)
    if (id) {
      (async () => {
        const response = await getCrMemberData(id);
        setFormData((prev) => ({
          ...prev,
          ...response.data
        }));
      })();
    }

    // Load multi-shareholder/director selection
    const multiShId = localStorage.getItem('shdrItem');
    const findData =
      Array.isArray(multiData) && multiData.length > 0
        ? multiData.find((item: { _id: string | null }) => item._id === multiShId)
        : null;

    if (findData) {
      setFormData((prev) => ({
        ...prev,
        email: findData.email,
        companyName: findData.companyName,
        companyId: findData.companyId
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = { ...formData, userId: decodedToken.userId };
    const result = await createUpdateCrMember(payload);

    setFormData(result);
    setIsCompleted(true);
  };

  // ✅ NEW: edit handler when completed
  const handleEditAfterComplete = () => {
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>

            <h2 className="text-xl font-bold mb-2">Completed</h2>

            <p className="text-sm text-muted-foreground max-w-md mb-8">
              Thank you for your efforts. We will review the information you have provided and
              ensure the relevant person contacts you promptly.
            </p>

            {/* ✅ NEW: Edit button (pencil) */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={handleEditAfterComplete} className="w-full sm:w-auto">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Submission
              </Button>

              <Button
                onClick={() => {
                  // keep your old behavior
                  if (['admin', 'master'].includes(decodedToken.role)) navigate('/admin-dashboard');
                  else navigate('/dashboard');
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* compact container: less left/right padding */}
      <div className="mx-auto max-w-[980px] px-3 sm:px-4 lg:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">
            Costa Rica Member Registration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Please complete all sections below.
          </p>
        </div>

        {/* Form only */}
        <ScrollArea className="h-[calc(100vh-150px)]">
          <div className="space-y-4 pr-3">
            {memberFormConfig.map((step) => (
              <Card key={step.id} className="shadow-sm">
                <CardContent className="pt-4 pb-5 px-4 sm:px-5">
                  <MemberFormStep step={step} formData={formData} onFieldChange={updateFormData} />
                </CardContent>
              </Card>
            ))}

            {/* Submit Button */}
            <div className="pt-2 pb-10">
              <Button onClick={handleSubmit} size="lg" className="w-full h-11">
                Submit Registration
              </Button>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                Ensure all required fields are complete before submitting.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CRMemberRegistration;
