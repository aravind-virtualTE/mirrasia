import React from "react";
import { useTranslation } from "react-i18next";

type ServiceAgreementClause = {
  label?: string;
  text: string;
};

type ServiceAgreementSection = {
  title: string;
  note?: string;
  paragraphs?: string[];
  clauses?: ServiceAgreementClause[];
};

type ServiceAgreementContent = {
  title: string;
  sections: ServiceAgreementSection[];
};

const CommonServiceAgrementTxt: React.FC = () => {
  const { t } = useTranslation();
  const agreement = t("serviceAgreement.content", {
    returnObjects: true,
  }) as ServiceAgreementContent;

  if (!agreement || !Array.isArray(agreement.sections)) {
    return null;
  }

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-xl font-bold">{agreement.title}</h1>
      </header>

      {agreement.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-lg font-bold">{section.title}</h2>

          {section.note ? (
            <p className="text-sm italic text-muted-foreground">{section.note}</p>
          ) : null}

          {section.paragraphs?.map((paragraph) => (
            <p key={`${section.title}-${paragraph}`} className="leading-7">
              {paragraph}
            </p>
          ))}

          {section.clauses?.map((clause) => (
            <div
              key={`${section.title}-${clause.label ?? clause.text}`}
              className="space-y-1"
            >
              {clause.label ? <h3 className="font-semibold">{clause.label}</h3> : null}
              <p className="leading-7">{clause.text}</p>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default CommonServiceAgrementTxt;
