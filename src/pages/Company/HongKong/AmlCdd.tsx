import React, { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  businessInfoHkCompanyAtom,
  companyIncorporationAtom,
  legalAcknowledgementDialougeAtom,
  legalAssessmentDialougeAtom,
  useResetAllForms,
} from "@/lib/atom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/fetch";
import { authAtom } from "@/hooks/useAuth";
import { companyIncorporationList } from "@/services/state";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import { useTranslation } from "react-i18next";
type QuestionnaireItem = {
  id: string;
  question: string;
};

const AmlCdd: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authUser] = useAtom(authAtom);
  const [finalForm] = useAtom(companyIncorporationAtom);
  const [initialDialogOpen, setInitialDialogOpen] = useState(true);
  const [secondDialogOpen, setSecondDialogOpen] = useAtom(
    legalAcknowledgementDialougeAtom
  );
  const [acknowledgement, setAcknowledgement] = useState(false);
  const [dialogOpen, setDialogOpen] = useAtom(legalAssessmentDialougeAtom);
  const [businessInfoHkCompany, setBusinessInfoHkCompany] = useAtom(
    businessInfoHkCompanyAtom
  );
  // console.log("finalForm",finalForm)
  const [isDiabled] = useState(finalForm.isDisabled);
  const { t } = useTranslation();
  const [cList] = useAtom(companyIncorporationList);
  const { id } = useParams();
  
  useEffect(() => {
    console.log("cList",cList)
    if (id) {
      const company = cList.find((c) => c._id === id);
      //   console.log('company',company, '\n formData', businessInfoHkCompany);
      if (company?.businessInfoHkCompany) {
        // console.log('company',company, '\n formData', businessInfoHkCompany);
        setBusinessInfoHkCompany(
          company?.businessInfoHkCompany as Record<string, string | undefined>
        );
      }
    }
  }, []);

  const setCompIncList = useSetAtom(companyIncorporationList);

  const options = [
    { value: "yes", label: t("AmlCdd.options.yes") },
    { value: "no", label: t("AmlCdd.options.no") },
    { value: "unknown", label: t("AmlCdd.options.unknown") },
    { value: "legal-advice", label: t("AmlCdd.options.legal-advice") },
  ];

  const questions: QuestionnaireItem[] = [
    {
      id: "sanctioned_countries",
      question: t("AmlCdd.questions.sanctioned_countries"),
    },
    {
      id: "sanctions_presence",
      question: t("AmlCdd.questions.sanctions_presence"),
    },
    {
      id: "crimea_presence",
      question: t("AmlCdd.questions.crimea_presence"),
    },
    {
      id: "russian_business_presence",
      question: t("AmlCdd.questions.russian_business_presence"),
    },
  ];

  const handleQuestionChange = (questionId: string, value: string) => {
    setBusinessInfoHkCompany((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitSecondDialouge = (e: React.FormEvent) => {
    e.preventDefault();
    if (acknowledgement) {
      setDialogOpen(true);
      setSecondDialogOpen(false);
    } else {
      toast({
        description: t("AmlCdd.acknowledgement_error"),
        variant: "destructive",
      });
    }
  };

  const resetAllForms = useResetAllForms();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formdata = finalForm;
      const { id } = authUser.user || {};
      const token = localStorage.getItem("token") as string;
      const decodedToken = jwtDecode<TokenData>(token);
      console.log(id, "Form submitted:", formdata);
      formdata.userId = `${decodedToken.userId}`;
      formdata.isDisabled = true
      const docId = localStorage.getItem("companyRecordId");
      const payload = { _id: docId, ...formdata };
      const response = await api.post(
        "/company/company-incorporation",
        payload
      );
      // console.log('Response:', response);
      if (response.status === 200) {
        resetAllForms();
        const existingCompanyIndex = cList.findIndex((c) => c._id === docId);
        if (existingCompanyIndex !== -1) {
          const updatedList = [...cList];
          updatedList[existingCompanyIndex] = response.data.data;
          setCompIncList(updatedList);
        } else {
          setCompIncList([...cList, response.data.data]);
        }
        toast({ description: t("AmlCdd.success_message") });
        navigate("/dashboard");
        setDialogOpen(false);
      } else {
        // Handle errors, e.g., display error message to the user
        console.log("Error:", response);
        toast({ description: t("AmlCdd.error_message") });
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const { theme } = useTheme();
  // console.log("answers", businessInfoHkCompany)

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex w-full p-4">
            <aside
              className={`w-1/4 p-4 rounded-md shadow-sm ${
                theme === "light"
                  ? "bg-blue-50 text-gray-800"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2">
                {t("AmlCdd.legal_assessment_title")}
              </h2>
            </aside>
            <div className="w-3/4 ml-4">
              <p
                className={`text-sm mb-4 ${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}
              >
                {t("AmlCdd.legal_assessment_description")}
              </p>
              <RadioGroup
                value={businessInfoHkCompany.legal_assessment}
                onValueChange={(value) =>
                  handleQuestionChange("legal_assessment", value)
                }
                disabled={isDiabled}
              >
                {options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="flex w-full p-4">
            <aside
              className={`w-1/4 p-4 rounded-md shadow-sm ${
                theme === "light"
                  ? "bg-blue-50 text-gray-800"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2">
                {t("AmlCdd.business_information_title")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("AmlCdd.business_information_description")}
              </p>
            </aside>
            <div className="w-3/4 ml-4">
              {questions.map((q) => (
                <div key={q.id} className="space-y-4 py-4">
                  <p
                    className={`text-sm mb-4 ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    <span className="text-red-500">*</span> {q.question}
                  </p>
                  <RadioGroup
                    value={businessInfoHkCompany[q.id]}
                    onValueChange={(value) => handleQuestionChange(q.id, value)}
                    disabled={isDiabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                      <Label htmlFor={`${q.id}-yes`} className="text-sm">
                        {t("AmlCdd.options.yes")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${q.id}-no`} />
                      <Label htmlFor={`${q.id}-no`} className="text-sm">
                        {t("AmlCdd.options.no")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id={`${q.id}-unknown`} />
                      <Label htmlFor={`${q.id}-unknown`} className="text-sm">
                        {t("AmlCdd.options.unknown")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* first pop up dialog */}
      <Dialog open={initialDialogOpen} onOpenChange={setInitialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("AmlCdd.dialog_initial_title")}</DialogTitle>
          </DialogHeader>
          <p>{t("AmlCdd.dialog_initial_message")}</p>
          <Button onClick={() => setInitialDialogOpen(false)}>
            {t("AmlCdd.dialog_button")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={secondDialogOpen} onOpenChange={setSecondDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <form onSubmit={handleSubmitSecondDialouge} className="space-y-6">
            <Card className="flex flex-row items-start space-x-3 rounded-md border p-2 shadow">
              <input
                type="checkbox"
                checked={acknowledgement}
                onChange={(e) => setAcknowledgement(e.target.checked)}
                className="form-checkbox my-4 cursor-pointer"
              />
              <div className="space-y-1 leading-none">
                <DialogTitle className="font-medium text-gray-700">
                  {t("AmlCdd.dialog_acknowledgement_title")}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  {t("AmlCdd.dialog_acknowledgement_message")}
                </p>
              </div>
            </Card>
            <Button type="submit">{t("AmlCdd.dialog_button")}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4">
            <DialogTitle>{t("AmlCdd.dialog_consultation_title")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <p className="text-base text-gray-600 mb-6">
              {t("AmlCdd.dialog_consultation_message")}
            </p>
          </div>
          <div className="border-t px-6 py-4 mt-auto flex justify-center">
            <Button type="button" className="min-w-48" onClick={handleSubmit}>
              {t("AmlCdd.dialog_consultation_button")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AmlCdd;
