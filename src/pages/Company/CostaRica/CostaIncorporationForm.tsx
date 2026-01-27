/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from 'jotai';
import { useState } from 'react';
import { formConfig } from './costaFormConfig';
import { costaRicaFormAtom, isSubmittedAtom, createOrUpdateCRIncorpo } from './costaState';
import { FormProgress } from './FormProgress';
import { FormStepComponent } from './FormStep';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from "jwt-decode";
import { useToast } from '@/hooks/use-toast';
import { TokenData } from '@/middleware/ProtectedRoutes';

export const CostaIncorporationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useAtom(costaRicaFormAtom);
  const [, setIsSubmitted] = useAtom(isSubmittedAtom);
  const navigate = useNavigate();
  const { toast } = useToast();

  const step = formConfig[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === formConfig.length - 1;
  // const country = {code: "CR", name: "Costa Rica"}
  const handleFieldChange = (fieldId: string, value: string | string[] | boolean | number) => {
    setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
  };

  const validateStep = () => {
    if (!step.fields) return true;

    for (const field of step.fields) {
      // Skip if condition is not met
      if (field.condition && !field.condition(formData)) {
        continue;
      }

      // 1. Check required fields
      if (field.required) {
        const val = formData[field.id];
        // Checks for empty string, empty array, or undefined/null
        const isEmpty =
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          toast({
            title: "Required Field Missing",
            description: `Please fill in: ${field.label}`,
            variant: "destructive",
          });
          return false;
        }
      }

      // 2. Check OTP verification
      // if (field.type === 'email-otp') {
      //   if (!formData.emailOtpVerified) {
      //     toast({
      //       title: "Verification Required",
      //       description: "Please verify your email address.",
      //       variant: "destructive",
      //     });
      //     return false;
      //   }
      // }

      // if (field.type === 'mobile-otp') {
      //   if (!formData.mobileOtpVerified) {
      //     toast({
      //       title: "Verification Required",
      //       description: "Please verify your phone number.",
      //       variant: "destructive",
      //     });
      //     return false;
      //   }
      // }
    }
    return true;
  };
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode<TokenData>(token);
  const navigateRoute = () => {
    localStorage.removeItem("companyRecordId");
    if (["admin", "master"].includes(decodedToken.role)) navigate("/admin-dashboard");
    else navigate("/dashboard");
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }
    const payload = { ...formData, countryCode: 'CR' };

    // console.log('📝 Step Data:', {
    //   step: step.title,
    //   stepIndex: currentStep + 1,
    //   data: payload
    // });

    if (!payload.userId) {
      payload.userId = decodedToken.userId;
      payload.users = [{ "userId": decodedToken.userId, "role": "applicant" }];
    } else {
      // If userId exists but belongs to someone else, do NOT override
      if (payload.userId !== decodedToken.userId) {
        // Just leave it as is — do nothing
      } else {
        // Same user — keep as is or update (your choice)
      }
    }
    const result = await createOrUpdateCRIncorpo(payload);
    // console.log("Saved Costa Rica Incorporation Data:", result);
    localStorage.setItem("companyRecordId", result.data._id);
    setFormData(result.data)
    window.history.pushState({}, "", `/company-register/CR/${result.data._id}`);
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to any step (in real app, you might want to validate)
    setCurrentStep(stepIndex);
  };

  const handleSubmit = () => {
    // console.log('🚀 Form Submitted - Complete Data:', formData);
    setIsSubmitted(true);
    navigateRoute()
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Costa Rica SLR Establishment
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete each step. Helpful tips appear where terms may be unclear.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-width mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">

                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">SSL</span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">AML/KYC</span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">Secure</span>
                </div>
                <FormProgress currentStep={currentStep} onStepClick={handleStepClick} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-card border border-border rounded-xl shadow-sm">
              <div className="p-6 lg:p-8">
                <FormStepComponent
                  step={step}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  setFormData={setFormData}
                />
              </div>

              {/* Navigation */}
              <div className="border-t border-border px-6 lg:px-8 py-4 flex justify-between items-center bg-secondary/30 rounded-b-xl">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLastStep ? (
                    <>
                      Submit
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
