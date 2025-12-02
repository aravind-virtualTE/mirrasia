import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { MemberForm } from "../ShrDirForm/ppif/ppifState";

interface DetailPifMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: (MemberForm & { createdAt?: string; updatedAt?: string }) | null;
}

const formatDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString();
};

const formatYesNo = (v?: string | boolean | null) => {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  if (!v) return "-";
  return v;
};

const PPifDetail: React.FC<DetailPifMemberDialogProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  const { t } = useTranslation("incorporation");

  if (!userData) return null;

  const sourceOfFunds = userData.sourceOfFunds || [];
  const futureFunds = userData.futureFunds || [];
  const roles = userData.roles || [];

  const docs = [
    { key: "doc_passport", label: t("ppifMember.sections.docs.items.doc_passport"), value: userData.doc_passport },
    { key: "doc_bank", label: t("ppifMember.sections.docs.items.doc_bank"), value: userData.doc_bank },
    { key: "doc_address", label: t("ppifMember.sections.docs.items.doc_address"), value: userData.doc_address },
    { key: "doc_profref", label: t("ppifMember.sections.docs.items.doc_profref"), value: userData.doc_profref },
    { key: "doc_cv", label: t("ppifMember.sections.docs.items.doc_cv"), value: userData.doc_cv },
    { key: "doc_other", label: t("ppifMember.sections.docs.items.doc_other"), value: userData.doc_other },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {t("ppifMember.view.title", "PIF userData Details")}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          {(userData.createdAt || userData.updatedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {userData.createdAt && (
                <>
                  {t("ppifMember.view.createdAt", "Created")} :{" "}
                  {formatDate(userData.createdAt)}
                </>
              )}
              {userData.updatedAt && (
                <>
                  {"  ·  "}
                  {t("ppifMember.view.updatedAt", "Last Updated")} :{" "}
                  {formatDate(userData.updatedAt)}
                </>
              )}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-6rem)] px-6 pb-6">
          {/* Basic Information */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.basic.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.basic.fields.email.label")}
                value={userData.email}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.fullName.label")}
                value={userData.fullName}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.renamed.label")}
                value={formatYesNo(userData.renamed)}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.dob.label")}
                value={formatDate(userData.dob)}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.pob.label")}
                value={userData.pob}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.maritalStatus.label")}
                value={userData.maritalStatus}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.nationality.label")}
                value={userData.nationality}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.passport.label")}
                value={userData.passport}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.occupation.label")}
                value={userData.occupation}
              />
              <Row
                label={t("ppifMember.sections.basic.fields.mobile.label")}
                value={userData.mobile}
              />
              <Row
                label={t(
                  "ppifMember.sections.basic.fields.residentialAddress.label",
                )}
                value={userData.residentialAddress}
              />
              <Row
                label={t(
                  "ppifMember.sections.basic.fields.postalAddress.label",
                )}
                value={userData.postalAddress || "-"}
              />
            </div>
          </section>

          <Separator className="my-6" />

          {/* Founder & Contribution / Source of Funds */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.founder.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.founder.isFounder.label")}
                value={formatYesNo(userData.is_founder)}
              />
              <Row
                label={t("ppifMember.sections.founder.contribution.label")}
                value={userData.contribution || "-"}
              />
              <Row
                label={t("ppifMember.sections.founder.inflowCountries.label")}
                value={userData.inflowCountries}
              />
              <Row
                label={t("ppifMember.sections.founder.remarks.label")}
                value={userData.remarks || "-"}
              />
              <Row
                label={t("ppifMember.sections.founder.sof.label")}
                isBadges
                badges={sourceOfFunds}
              />
              {sourceOfFunds.includes("other") && (
                <Row
                  label={t("ppifMember.sections.founder.sof.otherLabel")}
                  value={userData.sourceOther || "-"}
                />
              )}
            </div>
          </section>

          <Separator className="my-6" />

          {/* Tax Information */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.tax.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t(
                  "ppifMember.sections.tax.fields.taxResidence.label",
                )}
                value={userData.taxResidence}
              />
              <Row
                label={t("ppifMember.sections.tax.fields.tin.label")}
                value={userData.tin}
              />
            </div>
          </section>

          <Separator className="my-6" />

          {/* Roles in PIF */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.roles.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.roles.title")}
                isBadges
                badges={roles}
              />
            </div>
          </section>

          <Separator className="my-6" />

          {/* Future Funds */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.futureFunds.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.futureFunds.title")}
                isBadges
                badges={futureFunds}
              />
            </div>
          </section>

          <Separator className="my-6" />

          {/* PEP */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.pep.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.pep.title")}
                value={formatYesNo(userData.pep)}
              />
              {userData.pep === "yes" && (
                <Row
                  label={t("ppifMember.sections.pep.detailLabel")}
                  value={userData.pepDetail || "-"}
                />
              )}
            </div>
          </section>

          <Separator className="my-6" />

          {/* Beneficial Owner */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.bo.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.bo.title")}
                value={formatYesNo(userData.is_bo)}
              />
              <Row
                label={t("ppifMember.sections.bo.fields.lastIncome.label")}
                value={userData.lastIncome || "-"}
              />
              <Row
                label={t("ppifMember.sections.bo.fields.netWorth.label")}
                value={userData.netWorth || "-"}
              />
            </div>
          </section>

          <Separator className="my-6" />

          {/* Documents (checklist style – booleans) */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.docs.title")}
            </h3>
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.key}
                  className="flex items-center justify-between border rounded-md p-3 text-sm"
                >
                  <span className="text-muted-foreground">{doc.label}</span>
                  <Badge
                    variant={doc.value ? "default" : "outline"}
                    className={doc.value ? "" : "opacity-70"}
                  >
                    {doc.value
                      ? t("ppifMember.view.uploaded", "Provided")
                      : t("ppifMember.view.notProvided", "Not Provided")}
                  </Badge>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-6" />

          {/* Declarations */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {t("ppifMember.sections.decls.title")}
            </h3>
            <div className="space-y-2">
              <Row
                label={t("ppifMember.sections.decls.title")}
                value={formatYesNo(userData.agreeAll)}
              />
            </div>
          </section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface RowProps {
  label: string;
  value?: React.ReactNode;
  isBadges?: boolean;
  badges?: string[];
}

function Row({ label, value, isBadges, badges = [] }: RowProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      <div className="font-medium">
        {isBadges ? (
          badges.length ? (
            <div className="flex flex-wrap gap-1">
              {badges.map((val) => (
                <Badge key={val} variant="outline">
                  {val}
                </Badge>
              ))}
            </div>
          ) : (
            "-"
          )
        ) : (
          (value as React.ReactNode) ?? "-"
        )}
      </div>
    </div>
  );
}

export default PPifDetail;
