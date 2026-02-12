/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PartyField, PartyFieldType, PartyFormConfig, PartyStep } from "./partyKycTypes";
import sgQuestions from "./questionBank/sg-questions.json";
import paQuestions from "./questionBank/pa-questions.json";

type QuestionOption = {
  value: string;
  label: string;
  description?: string;
};

type QuestionItem = {
  id: string;
  type: string;
  question: string;
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
  infoText?: string;
  showIf?: { questionId: string; value: string };
};

const normalizeCountryCode = (countryCode?: string) =>
  String(countryCode || "").split("_")[0].toUpperCase();

// Toggle corporate-party support by country.
// Set HK to true in the future if/when entity KYC is introduced.
export const PARTY_ENTITY_TYPE_ENABLED_BY_COUNTRY: Record<string, boolean> = {
  HK: false,
};

export const isEntityPartyTypeEnabledForCountry = (countryCode?: string) => {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) return true;
  return PARTY_ENTITY_TYPE_ENABLED_BY_COUNTRY[normalized] ?? true;
};

const mapQuestionType = (type: string, hasOptions: boolean): PartyFieldType => {
  if (type === "checkbox" && hasOptions) return "checkbox-group";
  if (type === "checkbox") return "checkbox";
  if (type === "radio") return "radio";
  if (type === "select") return "select";
  if (type === "email") return "email";
  if (type === "date") return "date";
  if (type === "textarea") return "textarea";
  if (type === "tel") return "tel";
  if (type === "file") return "file";
  return "text";
};

const mapQuestionsToFields = (questions: QuestionItem[]): PartyField[] => {
  return (questions || []).map((q) => ({
    name: q.id,
    label: q.question,
    type: mapQuestionType(q.type, Array.isArray(q.options) && q.options.length > 0),
    required: !!q.required,
    placeholder: q.placeholder,
    tooltip: q.infoText,
    accept: q.type === "file" ? "image/*,.pdf" : undefined,
    options: q.options?.map((opt) => ({
      value: opt.value,
      label: opt.label,
      description: opt.description,
    })),
    condition: q.showIf
      ? (values) => String(values[q.showIf!.questionId] ?? "") === String(q.showIf!.value)
      : undefined,
  }));
};

const buildStepsFromGroups = (
  allFields: PartyField[],
  groups: { id: string; title: string; ids: string[] }[]
): PartyStep[] => {
  const fieldMap = new Map(allFields.map((f) => [f.name, f]));
  const used = new Set<string>();
  const steps: PartyStep[] = groups
    .map((group) => {
      const fields = group.ids
        .map((id) => fieldMap.get(id))
        .filter((f): f is PartyField => Boolean(f));
      fields.forEach((f) => used.add(f.name));
      return { id: group.id, title: group.title, fields };
    })
    .filter((step) => step.fields.length > 0);

  const remaining = allFields.filter((f) => !used.has(f.name));
  if (remaining.length > 0) {
    steps.push({
      id: "additional",
      title: "Additional Details",
      fields: remaining,
    });
  }
  return steps;
};

const yesNoOptions = [
  { value: "yes", label: "AmlCdd.options.yes" },
  { value: "no", label: "AmlCdd.options.no" },
];

const partyRoleOptions = [
  { value: "director", label: "Director" },
  { value: "shareholder", label: "Shareholder" },
  { value: "dcp", label: "Designated Contact Person" },
];

// --- HK options (mirrors ShrDirConstants keys for compatibility) ---
const hkSignificantControllerOptions = [
  { value: "s1", label: "shldrOptions.sigNiConS1" },
  { value: "s2", label: "shldrOptions.sigNiConS2" },
  { value: "s3", label: "shldrOptions.sigNiConS3" },
  { value: "s4", label: "shldrOptions.sigNiConS4" },
  { value: "s5", label: "shldrOptions.sigNiConS5" },
  { value: "s6", label: "shldrOptions.sigNiConS6" },
  { value: "s7", label: "shldrOptions.sigNiConS7" },
];

const hkCorrespondenceAddressOptions = [
  { value: "residential", label: "shldrOptions.coresAddres" },
  { value: "business", label: "shldrOptions.coresAddres1" },
  { value: "different", label: "shldrOptions.coresAddress2" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const hkOverseasResidentOptions = [
  { value: "yes", label: "AmlCdd.options.yes" },
  { value: "no", label: "AmlCdd.options.no" },
  { value: "unknown", label: "shldrOptions.dontKnow" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const hkForeignInvestmentReportOptions = [
  { value: "yesReport", label: "AmlCdd.options.yes" },
  { value: "noReport", label: "AmlCdd.options.no" },
  { value: "handleIssue", label: "shldrOptions.handleIssue" },
  { value: "consultationRequired", label: "shldrOptions.consultationReq" },
  { value: "otherReport", label: "usa.Section2StateOptions.Other" },
];

const hkForeignInvestmentOptions = [
  { value: "yes", label: "AmlCdd.options.yes" },
  { value: "no", label: "AmlCdd.options.no" },
  { value: "consultation", label: "shldrOptions.consultationReq" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const hkPoliticallyExposedOptions = [
  { value: "publicOffice", label: "shldrOptions.pep1" },
  { value: "seniorManager", label: "shldrOptions.pep2" },
  { value: "politicalPerson", label: "shldrOptions.pep3" },
  { value: "none", label: "None" },
  { value: "unknown", label: "shldrOptions.sigNiConS7" },
  { value: "consultation", label: "shldrOptions.consultationReq" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const hkLegalIssuesOptions = [
  { value: "yes", label: "AmlCdd.options.yes" },
  { value: "no", label: "AmlCdd.options.no" },
  { value: "noInfo", label: "shldrOptions.optionsDoNotProvide" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const hkUsResidencyOptions = [
  { value: "yes", label: "AmlCdd.options.yes" },
  { value: "no", label: "AmlCdd.options.no" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const hkNatureOfFundsOptions = [
  { value: "profitsFromBusiness", label: "shldrOptions.natureFunds" },
  { value: "fundsFromAssetSales", label: "shldrOptions.fundsFromSales" },
  { value: "ownerInvestmentOrLoan", label: "shldrOptions.ownerInvestLoad" },
  { value: "groupOrParentInvestment", label: "shldrOptions.groupParentInvestment" },
  { value: "otherNatureOfFunds", label: "usa.Section2StateOptions.Other" },
];

const hkSourceOfFundsOptions = [
  { value: "pastBusinessProfits", label: "shldrOptions.sourceFunds" },
  { value: "assetSaleFunds", label: "shldrOptions.assetSaleFunds" },
  { value: "borrowedFunds", label: "shldrOptions.borrowedFunds" },
  { value: "ownerPaidFunds", label: "shldrOptions.ownerPaidFunds" },
  { value: "earnedIncome", label: "shldrOptions.earnedIncome" },
  { value: "affiliatedCompanyFunds", label: "shldrOptions.affiliatedCompFunds" },
  { value: "bankOwnedFunds", label: "shldrOptions.bankOwnedFunds" },
  { value: "noPlanSmallAmount", label: "shldrOptions.noPlanSmallAmount" },
  { value: "otherSourceOfFunds", label: "usa.Section2StateOptions.Other" },
];

// --- US options ---
const usRoleOptions = [
  { value: "shareHld", label: "shareholder" },
  { value: "officer", label: "Officer" },
  { value: "keyControl", label: "Key controller (25%+)" },
  { value: "designatedContact", label: "Designated Contact Person" },
  { value: "oficialPartner", label: "Official partner" },
  { value: "other", label: "Other" },
];

const usSourceOptions = [
  { value: "earnedIncme", label: "Earned income" },
  { value: "depositSave", label: "Deposits, savings" },
  { value: "realEstateIncome", label: "Real estate / investment income" },
  { value: "loan", label: "Loan" },
  { value: "saleOfCompanyShares", label: "Sale of company shares" },
  { value: "businessIncome", label: "Business income / dividends" },
  { value: "succession", label: "Succession" },
  { value: "other", label: "Other" },
];

const usSourceReceivedOptions = [
  { value: "businessIncme", label: "Business income and distribution" },
  { value: "earnedIncme", label: "Earned income" },
  { value: "interest", label: "Interest income" },
  { value: "realEstStk", label: "Real estate / investment income" },
  { value: "saleCompShare", label: "Sale of company shares" },
  { value: "inherit", label: "Inheritance / Gift" },
  { value: "borowing", label: "Borrowing / trust / deposit" },
  { value: "other", label: "Other" },
];

const usSourceWithdrawOptions = [
  { value: "paymentGoods", label: "Payment for goods" },
  { value: "salaryBonus", label: "Salary / Bonus" },
  { value: "loanFunds", label: "Loan of funds" },
  { value: "realestateBuy", label: "Real estate / investment purchase" },
  { value: "divident", label: "Dividend payment" },
  { value: "operatingExpense", label: "Operating expenses" },
  { value: "other", label: "Other" },
];

const usCorporateRelationOptions = [
  { value: "shareHld", label: "shareholder" },
  { value: "officer", label: "Officer" },
  { value: "keyControl", label: "Trustee" },
  { value: "other", label: "Other" },
];

const usInvestmentSourceOptions = [
  { value: "shareHldCptloan", label: "Shareholders' capital or loans" },
  { value: "businessIncome", label: "Business income" },
  { value: "divident", label: "Dividend" },
  { value: "depositSaving", label: "Deposits, savings" },
  { value: "incomeFromRealEstate", label: "Real estate / investment income" },
  { value: "loanAmount", label: "Loan amount" },
  { value: "saleOfCompany", label: "Sale of company or shares" },
  { value: "inheritance", label: "Inheritance funds" },
  { value: "other", label: "Other" },
];

const usSourceFundOptions = [
  { value: "businessIncome", label: "Business income" },
  { value: "intrestIncome", label: "Interest income" },
  { value: "realEstateIncm", label: "Real estate / investment income" },
  { value: "saleOfcompanyShares", label: "Sale of company shares" },
  { value: "inheritted", label: "Inheritance / Gift" },
  { value: "borrowing", label: "Borrowing / trust / deposit" },
  { value: "other", label: "Other" },
];

const usShrDirEngOptions = [
  { value: "notaryTranslation", label: "Submit notarized English translation" },
  { value: "submitDocsHeldInHouse", label: "Submit in-house docs, translate if needed" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const usEgnArticleOptions = [
  { value: "submitEngVersion", label: "Submit English articles / translation" },
  { value: "articlesSubmission", label: "Submit articles held within company" },
  { value: "other", label: "usa.Section2StateOptions.Other" },
];

const simpleFundOptions = [
  { value: "earnedIncome", label: "Earned income" },
  { value: "businessIncome", label: "Business income" },
  { value: "realEstateIncome", label: "Real estate income" },
  { value: "loan", label: "Loan" },
  { value: "inheritance", label: "Inheritance / Gift" },
  { value: "other", label: "Other" },
];

// --- UK options ---
const yesNoOtherOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "other", label: "Other" },
];

const ukNameChangedOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "other", label: "Other" },
];

const ukMailingAddressOptions = [
  { value: "same", label: "Same as residential address" },
  { value: "different", label: "Different mailing address" },
];

const ukMemberRoleOptions = [
  { value: "shareholder", label: "Shareholder" },
  { value: "director", label: "Director" },
  { value: "psc", label: "Person with Significant Control (25%+ direct/indirect)" },
  { value: "dcp", label: "Designated Contact Person" },
  { value: "official_partner", label: "Official Partner registered with Mirr Asia" },
  { value: "other", label: "Other" },
];

const ukCorporateRelationOptions = [
  { value: "shareHld", label: "shareholder" },
  { value: "officer", label: "move" },
  { value: "keyControl", label: "Trustee" },
  { value: "other", label: "Other" },
];

const ukInvestmentSourceOptions = [
  { value: "earned_income", label: "Earned income" },
  { value: "savings", label: "Savings / installment savings" },
  { value: "investment_income", label: "Income from real estate/stocks/other investments" },
  { value: "loan", label: "Loan" },
  { value: "equity_sale", label: "Company or equity sale proceeds" },
  { value: "business_income_dividend", label: "Business income/dividends" },
  { value: "inheritance", label: "Inheritance" },
  { value: "parent_company_investment", label: "Investment from parent company" },
  { value: "other", label: "Other" },
];

const ukFutureFundSourceOptions = [
  { value: "business_income_distribution", label: "Business income and distribution" },
  { value: "earned_income", label: "Earned income" },
  { value: "interest_income", label: "Interest income" },
  { value: "investment_income", label: "Income from real estate/stocks/other investments" },
  { value: "equity_sale", label: "Company or equity sale proceeds" },
  { value: "inheritance_gift", label: "Inheritance/gift" },
  { value: "borrowing_trust_deposit", label: "Borrowing/trust/deposit, etc." },
  { value: "other", label: "Other" },
];

const ukTaxResidencyOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "other", label: "Other" },
];

const ukPepOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const ukDeclarationOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const shouldShowUkDeclarationDetails = (values: Record<string, any>) =>
  [
    "declArrestedOrConvicted",
    "declInvestigatedByAuthority",
    "declIllegalFundsOrCrime",
    "declPersonalBankruptcy",
    "declExecutiveBankruptcy",
  ].some((key) => String(values?.[key] || "").toLowerCase() === "yes");

const shouldShowUkCorporateDeclarationDetails = (values: Record<string, any>) =>
  [
    "isArrestedBefore",
    "isInvestigatedBefore",
    "isInvolvedInCriminal",
    "gotBankruptBefore",
    "officerBankruptBefore",
  ].some((key) => String(values?.[key] || "").toLowerCase() === "yes");

const applyReadOnly = (fields: PartyField[], names: string[]) =>
  fields.map((field) => (names.includes(field.name) ? { ...field, readOnly: true } : field));

const sgFields = applyReadOnly(mapQuestionsToFields((sgQuestions as any)?.questions || []), [
  "email",
  "companyName",
]);
const paFields = applyReadOnly(mapQuestionsToFields((paQuestions as any)?.questions || []), [
  "email",
  "companyName",
]);

const sgSteps = buildStepsFromGroups(sgFields, [
  {
    id: "contact",
    title: "Contact",
    ids: [
      "email",
      "companyName",
      "name",
      "nameChanged",
      "previousName",
      "birthdate",
      "nationality",
      "passport",
      "residenceAddress",
      "postalAddressSame",
      "postalAddress",
      "phone",
      "kakaoId",
      "otherSNSIds",
    ],
  },
  {
    id: "relationship",
    title: "Relationship",
    ids: ["companyRelation", "amountContributed"],
  },
  {
    id: "funds",
    title: "Funds",
    ids: [
      "fundSource",
      "originFundInvestFromCountry",
      "fundGenerated",
      "originFundGenerateCountry",
    ],
  },
  {
    id: "tax-pep",
    title: "Tax / PEP",
    ids: ["usTaxStatus", "usTIN", "isPoliticallyProminentFig", "descPoliticImpRel"],
  },
  {
    id: "legal",
    title: "Legal",
    ids: [
      "isCrimeConvitted",
      "lawEnforced",
      "isMoneyLaundered",
      "isBankRupted",
      "isInvolvedBankRuptedOfficer",
      "describeIfInvolvedBankRupted",
    ],
  },
  {
    id: "consent",
    title: "Consent",
    ids: ["declarationAgreement"],
  },
]);

const paSteps = buildStepsFromGroups(paFields, [
  {
    id: "contact",
    title: "Contact",
    ids: [
      "name",
      "email",
      "nameChanged",
      "previousName",
      "birthdate",
      "maritalStatus",
      "nationality",
      "passport",
      "job",
      "residenceAddress",
      "postalAddressSame",
      "postalAddress",
      "phone",
      "companyName",
    ],
  },
  {
    id: "relationship",
    title: "Relationship",
    ids: ["corporationRelationship", "investedAmount", "sharesAcquired"],
  },
  {
    id: "funds",
    title: "Funds",
    ids: [
      "fundSource",
      "originFundInvestFromCountry",
      "fundGenerated",
      "originFundGenerateCountry",
      "taxCountry",
      "taxNumber",
      "annualSaleIncomePrevYr",
      "currentNetWorth",
    ],
  },
  {
    id: "pep",
    title: "PEP",
    ids: ["isPoliticallyProminentFig", "descPoliticImpRel"],
  },
  {
    id: "documents",
    title: "Documents",
    ids: [
      "passportId",
      "bankStatement3Mnth",
      "addressProof",
      "profRefLetter",
      "engResume",
    ],
  },
  {
    id: "legal",
    title: "Legal",
    ids: [
      "isCrimeConvitted",
      "lawEnforced",
      "isMoneyLaundered",
      "isBankRupted",
      "isInvolvedBankRuptedOfficer",
      "isPartnerOfOtherComp",
      "otherPartnerOtherComp",
    ],
  },
  {
    id: "consent",
    title: "Consent",
    ids: ["declarationAgreement"],
  },
]);

export const PARTY_KYC_REGISTRY: PartyFormConfig[] = [
  // --- HK Individual ---
  {
    id: "HK_PERSON",
    title: "hk_shldr.heading",
    countryCode: "HK",
    partyType: "person",
    steps: [
      {
        id: "contact",
        title: "Company/Contact",
        fields: [
          { name: "email", label: "ApplicantInfoForm.email", type: "email", required: true, readOnly: true },
          { name: "companyName", label: "hk_shldr.compName", type: "text", required: true, readOnly: true },
          { name: "fullName", label: "hk_shldr.fullName", type: "text", required: true },
          { name: "mobileNumber", label: "hk_shldr.mobile", type: "text", required: true },
          { name: "kakaoTalkId", label: "KakaoTalk ID", type: "text" },
          { name: "weChatId", label: "WeChat ID", type: "text" },
        ],
      },
      {
        id: "roles",
        title: "hk_shldr.rolesPlayed",
        fields: [
          {
            name: "roles",
            label: "hk_shldr.rolesPlayed",
            type: "checkbox-group",
            required: true,
            options: partyRoleOptions,
            tooltip: "hk_shldr.rolesPlayedInfo",
          },
          {
            name: "significantController",
            label: "hk_shldr.significantController",
            type: "radio",
            required: true,
            options: hkSignificantControllerOptions,
          },
        ],
      },
      {
        id: "personal",
        title: "Personal",
        fields: [
          { name: "passportDigits", label: "hk_shldr.passportDigits", type: "text", required: true },
          { name: "birthCountry", label: "hk_shldr.birthCountry", type: "text", required: true },
          { name: "currentResidence", label: "hk_shldr.currentResidence", type: "text", required: true },
        ],
      },
      {
        id: "uploads",
        title: "Uploads",
        fields: [
          { name: "passportCopy", label: "hk_shldr.passportCopy", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "personalCertificate", label: "hk_shldr.personalCertificate", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "proofOfAddress", label: "hk_shldr.proofOfAddress", type: "file", required: true, accept: "image/*,.pdf" },
        ],
      },
      {
        id: "foreign",
        title: "Compliance",
        fields: [
          {
            name: "nomineeParticipation",
            label: "hk_shldr.nomineeParticipation",
            type: "radio",
            required: true,
            options: hkOverseasResidentOptions,
          },
          {
            name: "correspondenceAddress",
            label: "hk_shldr.whatAddress",
            type: "radio",
            required: true,
            options: hkCorrespondenceAddressOptions,
          },
          {
            name: "overseasResidentStatus",
            label: "hk_shldr.overSeasResident",
            type: "radio",
            required: true,
            options: hkOverseasResidentOptions,
          },
          {
            name: "foreignInvestmentReport",
            label: "hk_shldr.foreignDirectRep",
            type: "radio",
            required: true,
            options: hkForeignInvestmentReportOptions,
          },
          {
            name: "foreignInvestmentAgreement",
            label: "hk_shldr.accordanceLaws",
            type: "radio",
            required: true,
            options: hkForeignInvestmentOptions,
          },
        ],
      },
      {
        id: "legal",
        title: "PEP / Legal / US",
        fields: [
          {
            name: "politicallyExposedStatus",
            label: "hk_shldr.politicalExposePersn",
            type: "radio",
            required: true,
            options: hkPoliticallyExposedOptions,
          },
          { name: "politicalDetails", label: "hk_shldr.politicalExplainDetails", type: "text" },
          {
            name: "legalIssuesStatus",
            label: "hk_shldr.pendingThretenClaim",
            type: "radio",
            required: true,
            options: hkLegalIssuesOptions,
          },
          {
            name: "usResidencyStatus",
            label: "hk_shldr.youCitizen",
            type: "radio",
            required: true,
            options: hkUsResidencyOptions,
          },
          { name: "usResidencyDetails", label: "hk_shldr.iitnNum", type: "text" },
        ],
      },
      {
        id: "funds",
        title: "Funds",
        fields: [
          { name: "natureOfFunds", label: "hk_shldr.natureOfFunds", type: "checkbox-group", required: true, options: hkNatureOfFundsOptions },
          { name: "sourceOfFunds", label: "hk_shldr.sourceOfFunds", type: "checkbox-group", required: true, options: hkSourceOfFundsOptions },
          { name: "countryOfFundOrigin", label: "hk_shldr.countryFundsFlow", type: "text", required: true },
        ],
      },
      {
        id: "misc",
        title: "Miscellaneous",
        fields: [
          { name: "undischargedBankruptcy", label: "hk_shldr.undischargedBankruptcy", type: "radio", required: true, options: hkLegalIssuesOptions },
          { name: "pastParticipation", label: "hk_shldr.pastParticipation", type: "radio", required: true, options: hkLegalIssuesOptions },
          { name: "additionalInfo", label: "hk_shldr.anyQuestionsApply", type: "text" },
        ],
      },
      {
        id: "consent",
        title: "Final Confirmation",
        fields: [
          { name: "agreementDeclaration", label: "hk_shldr.agreeDocsInfo", type: "radio", required: true, options: yesNoOptions },
        ],
      },
    ],
  },

  // --- US Individual ---
  {
    id: "US_PERSON",
    title: "US Individual Party KYC",
    countryCode: "US",
    partyType: "person",
    steps: [
      {
        id: "contact",
        title: "Contact",
        fields: [
          { name: "email", label: "Email", type: "email", required: true, readOnly: true },
          { name: "companyName", label: "Company Name", type: "text", required: true, readOnly: true },
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "otherName", label: "Other Name", type: "text" },
          { name: "birthdate", label: "Birthdate", type: "date", required: true },
          { name: "nationality", label: "Nationality", type: "text", required: true },
          { name: "passportNum", label: "Passport Number", type: "text", required: true },
          { name: "addressResidence", label: "Residential Address", type: "text", required: true },
          { name: "mailingAdress", label: "Mailing Address", type: "text" },
          { name: "mobileNumber", label: "Mobile Number", type: "text", required: true },
          { name: "kakaoTalkId", label: "KakaoTalk ID", type: "text" },
          { name: "weChatId", label: "WeChat ID", type: "text" },
        ],
      },
      {
        id: "roles",
        title: "Relationship",
        fields: [
          { name: "relationWithUs", label: "Relation with Company", type: "checkbox-group", required: true, options: usRoleOptions },
          { name: "otherRelation", label: "Other Relation", type: "text" },
          { name: "percentShares", label: "Percentage of Shares", type: "text" },
        ],
      },
      {
        id: "funds",
        title: "Funds",
        fields: [
          { name: "sourceOfFunds", label: "Source of Funds", type: "checkbox-group", required: true, options: usSourceOptions },
          { name: "otherSourceFund", label: "Other Source", type: "text" },
          { name: "countryOriginFunds", label: "Country of Fund Origin", type: "text" },
          { name: "sourceReceivedUs", label: "Source of Funds Received in US", type: "checkbox-group", required: true, options: usSourceReceivedOptions },
          { name: "sourceWithDrawUs", label: "Source of Funds Withdrawn in US", type: "checkbox-group", required: true, options: usSourceWithdrawOptions },
          { name: "countryWithDrawFunds", label: "Country of Withdrawal", type: "text" },
        ],
      },
      {
        id: "tax",
        title: "Tax and PEP",
        fields: [
          { name: "usResidenceTaxPurpose", label: "US Tax Residency", type: "radio", required: true, options: yesNoOptions },
          { name: "otherResidenceTaxPurpose", label: "Other Tax Residency Details", type: "text" },
          { name: "tinNumber", label: "TIN Number", type: "text" },
          { name: "isPoliticalFigure", label: "Politically Exposed Person", type: "radio", required: true, options: yesNoOptions },
        ],
      },
      {
        id: "documents",
        title: "Documents",
        fields: [
          { name: "passPortCopy", label: "Passport Copy", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "proofOfAddress", label: "Proof of Address", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "driverLicense", label: "Driver License", type: "file", required: true, accept: "image/*,.pdf" },
        ],
      },
      {
        id: "legal",
        title: "Legal",
        fields: [
          { name: "isArrested", label: "Arrested before", type: "radio", required: true, options: yesNoOptions },
          { name: "investigation", label: "Under investigation", type: "radio", required: true, options: yesNoOptions },
          { name: "criminalActivity", label: "Involved in criminal activity", type: "radio", required: true, options: yesNoOptions },
          { name: "personalBankruptcy", label: "Personal bankruptcy", type: "radio", required: true, options: yesNoOptions },
          { name: "companyBankruptcy", label: "Company bankruptcy", type: "radio", required: true, options: yesNoOptions },
          { name: "declaration", label: "Declaration", type: "radio", required: true, options: yesNoOptions },
          { name: "otherDeclaration", label: "Other Declaration", type: "text" },
        ],
      },
    ],
  },

  // --- US Corporate ---
  {
    id: "US_ENTITY",
    title: "US Corporate Party KYC",
    countryCode: "US",
    partyType: "entity",
    steps: [
      {
        id: "company",
        title: "Corporate Details",
        fields: [
          { name: "companyName", label: "Company Name", type: "text", required: true, readOnly: true },
          { name: "dateOfEstablishment", label: "Date of Establishment", type: "date", required: true },
          { name: "countryOfEstablishment", label: "Country of Establishment", type: "text", required: true },
          { name: "listedOnStockExchange", label: "Listed on Stock Exchange", type: "text", required: true },
          { name: "otherListedOnStockExchange", label: "Other Stock Exchange", type: "text" },
          { name: "representativeName", label: "Representative Name", type: "text", required: true },
          { name: "englishNamesOfShareholders", label: "English Names of Shareholders", type: "radio", required: true, options: usShrDirEngOptions },
          { name: "otherEnglishNamesOfShareholders", label: "Other Shareholder Detail", type: "text" },
          { name: "articlesOfAssociation", label: "Articles of Association", type: "radio", required: true, options: usEgnArticleOptions },
          { name: "otherArticlesOfAssociation", label: "Other Articles Detail", type: "text" },
          { name: "businessAddress", label: "Business Address", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true, readOnly: true },
          { name: "kakaoTalkId", label: "KakaoTalk ID", type: "text" },
          { name: "socialMediaId", label: "Social Media ID", type: "text" },
        ],
      },
      {
        id: "relation",
        title: "Relationship",
        fields: [
          { name: "relationWithUs", label: "Relation with Company", type: "checkbox-group", required: true, options: usCorporateRelationOptions },
          { name: "otherRelation", label: "Other Relation", type: "text" },
          { name: "amountInvestedAndShares", label: "Amount Invested & Shares", type: "text", required: true },
        ],
      },
      {
        id: "funds",
        title: "Funds",
        fields: [
          { name: "investmentSource", label: "Investment Source", type: "checkbox-group", required: true, options: usInvestmentSourceOptions },
          { name: "otherInvestmentSource", label: "Other Investment Source", type: "text" },
          { name: "fundsOrigin", label: "Funds Origin", type: "text", required: true },
          { name: "sourceFundExpected", label: "Expected Source of Funds", type: "checkbox-group", required: true, options: usSourceFundOptions },
          { name: "otherSourceFund", label: "Other Source", type: "text" },
          { name: "fundsOrigin2", label: "Funds Origin (2)", type: "text", required: true },
        ],
      },
      {
        id: "compliance",
        title: "Compliance",
        fields: [
          { name: "isUsLegalEntity", label: "Is US Legal Entity", type: "radio", required: true, options: yesNoOptions },
          { name: "usTinNumber", label: "US TIN Number", type: "text" },
          { name: "isPoliticalFigure", label: "Politically Exposed", type: "radio", required: true, options: yesNoOptions },
          { name: "describePoliticallyImp", label: "Political Details", type: "text" },
          { name: "isArrestedBefore", label: "Arrested before", type: "radio", required: true, options: yesNoOptions },
          { name: "isInvestigatedBefore", label: "Under investigation", type: "radio", required: true, options: yesNoOptions },
          { name: "isInvolvedInCriminal", label: "Involved in criminal activity", type: "radio", required: true, options: yesNoOptions },
          { name: "gotBankruptBefore", label: "Bankruptcy (company)", type: "radio", required: true, options: yesNoOptions },
          { name: "officerBankruptBefore", label: "Bankruptcy (officer)", type: "radio", required: true, options: yesNoOptions },
        ],
      },
      {
        id: "consent",
        title: "Declaration",
        fields: [
          { name: "declarationDesc", label: "Declaration Details", type: "textarea" },
          { name: "isAgreed", label: "Agree to proceed", type: "radio", required: true, options: yesNoOptions },
          { name: "otherIsAgreed", label: "Other Agreement", type: "text" },
        ],
      },
    ],
  },

  // --- UK Individual ---
  {
    id: "UK_PERSON",
    title: "UK Member Registration KYC",
    countryCode: "UK",
    partyType: "person",
    steps: [
      {
        id: "identity",
        title: "Member Identity",
        fields: [
          { name: "email", label: "Email", type: "email", required: true, readOnly: true },
          { name: "companyName", label: "UK Legal Entity Name to be Registered", type: "text", required: true, readOnly: true },
          { name: "name", label: "Full Name", type: "text", required: true },
          {
            name: "hasChangedName",
            label: "Have you ever changed your name?",
            type: "radio",
            required: true,
            options: ukNameChangedOptions,
          },
          {
            name: "formerNameInEnglish",
            label: "Former name in English / other details",
            type: "text",
            condition: (values) => {
              const value = String(values?.hasChangedName || "").toLowerCase();
              return value === "yes" || value === "other";
            },
            required: true,
          },
          { name: "birthdate", label: "Date of Birth", type: "date", required: true },
          { name: "birthPlace", label: "Place of Birth", type: "text", required: true },
          { name: "nationality", label: "Nationality", type: "text", required: true },
          { name: "passportNumber", label: "Passport Number", type: "text", required: true },
          {
            name: "residentialAddress",
            label: "Residential address (include postal code and period lived in this country)",
            type: "textarea",
            required: true,
            colSpan: 2,
          },
          {
            name: "mailingAddressType",
            label: "Mailing address",
            type: "radio",
            required: true,
            options: ukMailingAddressOptions,
            colSpan: 2,
          },
          {
            name: "mailingAddress",
            label: "Mailing address (if different from residential address)",
            type: "textarea",
            condition: (values) => values?.mailingAddressType === "different",
            required: true,
            colSpan: 2,
          },
          {
            name: "mobileNumber",
            label: "Contactable mobile phone number",
            type: "tel",
            required: true,
            tooltip:
              "We will use this for major communications. If your contact information changes, communications continue to this number until formally updated.",
            colSpan: 2,
          },
          { name: "kakaoTalkId", label: "KakaoTalk ID (if applicable)", type: "text" },
          { name: "otherSnsId", label: "Telegram, WeChat, or other SNS ID (if applicable)", type: "text" },
        ],
      },
      {
        id: "relationship",
        title: "Relationship and Role",
        fields: [
          {
            name: "relationshipWithUkEntity",
            label: "Relationship with the UK Legal Entity",
            type: "text",
            required: true,
            colSpan: 2,
          },
          {
            name: "ukEntityRelationshipRoles",
            label: "Relationship role(s) with the UK Legal Entity",
            type: "checkbox-group",
            required: true,
            options: ukMemberRoleOptions,
            tooltip:
              "Designated Contact Person handles key business communications. First contact person is free. Additional contacts are charged annually.",
            colSpan: 2,
          },
          {
            name: "ukEntityRelationshipRolesOther",
            label: "Other relationship role details",
            type: "text",
            condition: (values) =>
              Array.isArray(values?.ukEntityRelationshipRoles) &&
              values.ukEntityRelationshipRoles.includes("other"),
            required: true,
            colSpan: 2,
          },
          {
            name: "shareholdingPercentage",
            label: "Shareholding percentage (%) in the UK legal entity",
            type: "text",
            required: true,
          },
        ],
      },
      {
        id: "funds",
        title: "Source of Funds",
        fields: [
          {
            name: "investmentFundSource",
            label: "Source of funds for investment/loan into UK corporation (multiple selections possible)",
            type: "checkbox-group",
            required: true,
            options: ukInvestmentSourceOptions,
            tooltip: "Supporting documents for source of funds may be requested later.",
            colSpan: 2,
          },
          {
            name: "investmentFundSourceOther",
            label: "Other source of investment funds",
            type: "text",
            condition: (values) =>
              Array.isArray(values?.investmentFundSource) &&
              values.investmentFundSource.includes("other"),
            required: true,
            colSpan: 2,
          },
          {
            name: "investmentFundInflowCountries",
            label: "Country of fund inflow for the above investment source(s)",
            type: "textarea",
            required: true,
            colSpan: 2,
          },
          {
            name: "futureFundSource",
            label: "Expected future source of funds flowing into UK corporation (multiple selections possible)",
            type: "checkbox-group",
            required: true,
            options: ukFutureFundSourceOptions,
            tooltip: "Supporting documents for source of funds may be requested later.",
            colSpan: 2,
          },
          {
            name: "futureFundSourceOther",
            label: "Other expected source of future funds",
            type: "text",
            condition: (values) =>
              Array.isArray(values?.futureFundSource) &&
              values.futureFundSource.includes("other"),
            required: true,
            colSpan: 2,
          },
          {
            name: "futureFundInflowCountries",
            label: "Country of fund inflow for the above future source(s)",
            type: "textarea",
            required: true,
            colSpan: 2,
          },
        ],
      },
      {
        id: "tax-pep",
        title: "Tax and PEP",
        fields: [
          {
            name: "usTaxResidency",
            label: "Are you a U.S. citizen, permanent resident, or U.S. tax resident?",
            type: "radio",
            required: true,
            options: ukTaxResidencyOptions,
            colSpan: 2,
          },
          {
            name: "irsTin",
            label: "IRS Taxpayer Identification Number (TIN)",
            type: "text",
            condition: (values) => String(values?.usTaxResidency || "").toLowerCase() === "yes",
            required: true,
            colSpan: 2,
          },
          {
            name: "pepStatus",
            label: "Are you, your immediate family, or close associates politically exposed persons (PEP)?",
            type: "radio",
            required: true,
            options: ukPepOptions,
            tooltip:
              "Covers foreign/domestic/international organization PEP, family relationship PEP, and close associate PEP as per FATF guidance.",
            colSpan: 2,
          },
          {
            name: "pepDetails",
            label: "Describe the key political figure or relationship in detail",
            type: "textarea",
            condition: (values) => String(values?.pepStatus || "").toLowerCase() === "yes",
            required: true,
            colSpan: 2,
          },
        ],
      },
      {
        id: "documents",
        title: "Document Upload",
        fields: [
          {
            name: "passportCopyCertificate",
            label: "Passport copy and Certificate of Passport Copy",
            type: "file",
            required: true,
            accept: "image/*,.pdf,.doc,.docx",
            tooltip: "Upload one file (max 10 MB).",
            colSpan: 2,
          },
          {
            name: "proofOfAddress",
            label: "Proof of address (English resident registration or abstract)",
            type: "file",
            required: true,
            accept: "image/*,.pdf,.doc,.docx",
            tooltip: "Upload one file (max 10 MB).",
            colSpan: 2,
          },
          {
            name: "driverLicenseFrontBack",
            label: "Driver's license scan (front and back)",
            type: "file",
            required: true,
            accept: "image/*,.pdf,.doc,.docx",
            tooltip: "Upload one file (max 10 MB).",
            colSpan: 2,
          },
        ],
      },
      {
        id: "declaration",
        title: "Declaration and Agreement",
        fields: [
          {
            name: "declArrestedOrConvicted",
            label: "Have you ever been arrested or convicted of a crime?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "declInvestigatedByAuthority",
            label: "Have you ever been investigated by law enforcement or tax authorities?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "declIllegalFundsOrCrime",
            label: "Are you involved in crime, money laundering, bribery, terrorism, or other illegal-source funds?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
            colSpan: 2,
          },
          {
            name: "declPersonalBankruptcy",
            label: "Have you ever been personally involved in bankruptcy or liquidation?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "declExecutiveBankruptcy",
            label: "Have you been involved in bankruptcy or liquidation as a company executive?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "declarationYesDetails",
            label: "Detailed description of items marked 'Yes'",
            type: "textarea",
            condition: shouldShowUkDeclarationDetails,
            required: true,
            colSpan: 2,
          },
          {
            name: "applicationAgreement",
            label: "Do you agree to the application declaration and legal-use statement?",
            type: "radio",
            required: true,
            options: yesNoOtherOptions,
            colSpan: 2,
          },
          {
            name: "applicationAgreementOther",
            label: "Other agreement details",
            type: "text",
            condition: (values) => String(values?.applicationAgreement || "").toLowerCase() === "other",
            required: true,
            colSpan: 2,
          },
        ],
      },
    ],
  },

  // --- UK Corporate ---
  {
    id: "UK_ENTITY",
    title: "UK Corporate Member Registration KYC",
    countryCode: "UK",
    partyType: "entity",
    steps: [
      {
        id: "company",
        title: "Corporate Details",
        fields: [
          {
            name: "email",
            label: "Representative email address",
            type: "email",
            required: true,
            readOnly: true,
            tooltip:
              "We will use this email for official communications regarding important matters. If contact changes, we continue using this address until formally updated.",
            colSpan: 2,
          },
          {
            name: "companyName",
            label: "Name of the UK company to be registered",
            type: "text",
            required: true,
            readOnly: true,
            colSpan: 2,
          },
          { name: "dateOfEstablishment", label: "Date of establishment", type: "date", required: true },
          { name: "countryOfEstablishment", label: "Country of establishment", type: "text", required: true },
          {
            name: "registrationNumber",
            label: "Corporate registration number or business registration number",
            type: "text",
            required: true,
            colSpan: 2,
          },
          {
            name: "listedOnStockExchange",
            label: "Whether listed on a stock exchange",
            type: "radio",
            required: true,
            options: yesNoOtherOptions,
            colSpan: 2,
          },
          {
            name: "otherListedOnStockExchange",
            label: "Other stock exchange details",
            type: "text",
            condition: (values) =>
              String(values?.listedOnStockExchange || "").toLowerCase() === "other",
            required: true,
            colSpan: 2,
          },
          { name: "representativeName", label: "Representative name", type: "text", required: true },
          {
            name: "mobileNumber",
            label: "Contactable representative mobile phone number",
            type: "tel",
            required: true,
            tooltip:
              "We use this number for official communications. If contact changes, we continue using this number until formally updated.",
          },
          {
            name: "englishNamesOfShareholders",
            label: "Documents showing English names of shareholders/directors and stockholding status",
            type: "radio",
            required: true,
            options: usShrDirEngOptions,
            colSpan: 2,
          },
          {
            name: "otherEnglishNamesOfShareholders",
            label: "Other shareholder/director document details",
            type: "text",
            condition: (values) =>
              String(values?.englishNamesOfShareholders || "").toLowerCase() === "other",
            required: true,
            colSpan: 2,
          },
          {
            name: "articlesOfAssociation",
            label: "English Articles of Incorporation",
            type: "radio",
            required: true,
            options: usEgnArticleOptions,
            colSpan: 2,
          },
          {
            name: "otherArticlesOfAssociation",
            label: "Other Articles of Incorporation details",
            type: "text",
            condition: (values) =>
              String(values?.articlesOfAssociation || "").toLowerCase() === "other",
            required: true,
            colSpan: 2,
          },
          {
            name: "businessAddress",
            label: "Business address (if different from registration certificate address)",
            type: "textarea",
            required: true,
            colSpan: 2,
          },
        ],
      },
      {
        id: "relationship",
        title: "Relationship",
        fields: [
          {
            name: "relationWithUs",
            label: "Relationship with UK corporations",
            type: "checkbox-group",
            required: true,
            options: ukCorporateRelationOptions,
            colSpan: 2,
          },
          {
            name: "otherRelation",
            label: "Other relationship details",
            type: "text",
            condition: (values) =>
              Array.isArray(values?.relationWithUs) && values.relationWithUs.includes("other"),
            required: true,
            colSpan: 2,
          },
          {
            name: "amountInvestedAndShares",
            label: "Amount to be invested and number of shares to be acquired",
            type: "text",
            required: true,
            colSpan: 2,
          },
        ],
      },
      {
        id: "funds",
        title: "Source of Funds",
        fields: [
          {
            name: "investmentSource",
            label: "Source of investment funds (multiple selections possible)",
            type: "checkbox-group",
            required: true,
            options: usInvestmentSourceOptions,
            tooltip: "Supporting source-of-funds documents may be requested later.",
            colSpan: 2,
          },
          {
            name: "otherInvestmentSource",
            label: "Other source of investment funds",
            type: "text",
            condition: (values) =>
              Array.isArray(values?.investmentSource) && values.investmentSource.includes("other"),
            required: true,
            colSpan: 2,
          },
          {
            name: "fundsOrigin",
            label: "Countries receiving funds for the above items (list all countries)",
            type: "textarea",
            required: true,
            colSpan: 2,
          },
          {
            name: "sourceFundExpected",
            label: "Expected future funds generated or received (multiple selections possible)",
            type: "checkbox-group",
            required: true,
            options: usSourceFundOptions,
            tooltip: "Supporting source-of-funds documents may be requested later.",
            colSpan: 2,
          },
          {
            name: "otherSourceFund",
            label: "Other expected future fund source",
            type: "text",
            condition: (values) =>
              Array.isArray(values?.sourceFundExpected) && values.sourceFundExpected.includes("other"),
            required: true,
            colSpan: 2,
          },
          {
            name: "fundsOrigin2",
            label: "Countries receiving future funds for the above items (list all countries)",
            type: "textarea",
            required: true,
            colSpan: 2,
          },
        ],
      },
      {
        id: "tax-pep",
        title: "Tax and PEP",
        fields: [
          {
            name: "isUsLegalEntity",
            label:
              "Is your company under U.S. legal jurisdiction or a U.S. permanent establishment for tax purposes?",
            type: "radio",
            required: true,
            options: yesNoOtherOptions,
            colSpan: 2,
          },
          {
            name: "otherResidenceTaxPurpose",
            label: "Other U.S. legal/tax jurisdiction details",
            type: "text",
            condition: (values) => String(values?.isUsLegalEntity || "").toLowerCase() === "other",
            required: true,
            colSpan: 2,
          },
          {
            name: "usTinNumber",
            label: "IRS U.S. Tax Identification Number (TIN)",
            type: "text",
            condition: (values) => String(values?.isUsLegalEntity || "").toLowerCase() === "yes",
            required: true,
            colSpan: 2,
          },
          {
            name: "isPoliticalFigure",
            label:
              "Do any company officials, immediate family, or close associates qualify as politically exposed persons (PEP)?",
            type: "radio",
            required: true,
            options: ukPepOptions,
            colSpan: 2,
          },
          {
            name: "describePoliticallyImp",
            label: "Description of major political figures / relationships",
            type: "textarea",
            condition: (values) => String(values?.isPoliticalFigure || "").toLowerCase() === "yes",
            required: true,
            colSpan: 2,
          },
        ],
      },
      {
        id: "declaration",
        title: "Declaration and Consent",
        fields: [
          {
            name: "isArrestedBefore",
            label: "Has any company official been arrested or convicted?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "isInvestigatedBefore",
            label: "Has any company official been investigated by law enforcement or tax authorities?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "isInvolvedInCriminal",
            label:
              "Is any company official involved in criminal, money laundering, bribery, terrorism, or other illicit-source funds activity?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
            colSpan: 2,
          },
          {
            name: "gotBankruptBefore",
            label: "Has any company official been personally involved in bankruptcy or liquidation?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "officerBankruptBefore",
            label:
              "Has any company official been involved in bankruptcy or liquidation as a company executive?",
            type: "radio",
            required: true,
            options: ukDeclarationOptions,
          },
          {
            name: "declarationDesc",
            label: "Detailed description of items marked 'Yes'",
            type: "textarea",
            condition: shouldShowUkCorporateDeclarationDetails,
            required: true,
            colSpan: 2,
          },
          {
            name: "isAgreed",
            label: "Do you agree to the consent and declaration on application?",
            type: "radio",
            required: true,
            options: yesNoOtherOptions,
            colSpan: 2,
          },
          {
            name: "otherIsAgreed",
            label: "Other agreement details",
            type: "text",
            condition: (values) => String(values?.isAgreed || "").toLowerCase() === "other",
            required: true,
            colSpan: 2,
          },
        ],
      },
    ],
  },

  // --- SG Individual (simplified) ---
  {
    id: "SG_PERSON",
    title: "Singapore Party KYC",
    countryCode: "SG",
    partyType: "person",
    steps: sgSteps,
  },

  // --- SG Corporate (simplified) ---
  {
    id: "SG_ENTITY",
    title: "Singapore Corporate Party KYC",
    countryCode: "SG",
    partyType: "entity",
    steps: [
      {
        id: "entity",
        title: "Corporate Details",
        fields: [
          { name: "entityName", label: "Entity Name", type: "text", required: true },
          { name: "registrationNumber", label: "Registration Number", type: "text", required: true },
          { name: "incorporationCountry", label: "Country of Incorporation", type: "text", required: true },
          { name: "registeredAddress", label: "Registered Address", type: "text", required: true },
          { name: "representativeName", label: "Representative Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true, readOnly: true },
        ],
      },
      {
        id: "ownership",
        title: "Ownership",
        fields: [
          { name: "shareholders", label: "Shareholder Names", type: "textarea", required: true },
          { name: "sharesAcquired", label: "Shares / Stake", type: "text" },
          { name: "fundSource", label: "Source of Funds", type: "checkbox-group", required: true, options: simpleFundOptions },
        ],
      },
      {
        id: "documents",
        title: "Documents",
        fields: [
          { name: "certificateOfIncorporation", label: "Certificate of Incorporation", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "registerOfMembers", label: "Register of Members", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "addressProof", label: "Proof of Address", type: "file", accept: "image/*,.pdf" },
        ],
      },
      {
        id: "consent",
        title: "Consent",
        fields: [
          { name: "isPoliticalFigure", label: "Politically Exposed", type: "radio", required: true, options: yesNoOptions },
          { name: "declaration", label: "Declaration", type: "radio", required: true, options: yesNoOptions },
        ],
      },
    ],
  },

  // --- PA Individual (simplified) ---
  {
    id: "PA_PERSON",
    title: "Panama Party KYC",
    countryCode: "PA",
    partyType: "person",
    steps: paSteps,
  },

  // --- PA Corporate (simplified) ---
  {
    id: "PA_ENTITY",
    title: "Panama Corporate Party KYC",
    countryCode: "PA",
    partyType: "entity",
    steps: [
      {
        id: "entity",
        title: "Corporate Details",
        fields: [
          { name: "entityName", label: "Entity Name", type: "text", required: true },
          { name: "registrationNumber", label: "Registration Number", type: "text", required: true },
          { name: "incorporationCountry", label: "Country of Incorporation", type: "text", required: true },
          { name: "registeredAddress", label: "Registered Address", type: "text", required: true },
          { name: "representativeName", label: "Representative Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true, readOnly: true },
        ],
      },
      {
        id: "ownership",
        title: "Ownership",
        fields: [
          { name: "relationshipToCompany", label: "Relationship to Company", type: "text" },
          { name: "sharesAcquired", label: "Shares Acquired", type: "text" },
          { name: "investedAmount", label: "Invested Amount", type: "text" },
        ],
      },
      {
        id: "funds",
        title: "Funds",
        fields: [
          { name: "fundSource", label: "Source of Funds", type: "checkbox-group", required: true, options: simpleFundOptions },
          { name: "originFundCountry", label: "Country of Fund Origin", type: "text", required: true },
        ],
      },
      {
        id: "documents",
        title: "Documents",
        fields: [
          { name: "certificateOfIncorporation", label: "Certificate of Incorporation", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "registerOfDirectors", label: "Register of Directors", type: "file", required: true, accept: "image/*,.pdf" },
          { name: "addressProof", label: "Proof of Address", type: "file", accept: "image/*,.pdf" },
        ],
      },
      {
        id: "consent",
        title: "Consent",
        fields: [
          { name: "declaration", label: "Declaration", type: "radio", required: true, options: yesNoOptions },
        ],
      },
    ],
  },
];

export const resolvePartyKycConfig = ({
  countryCode,
  partyType,
  roles,
}: {
  countryCode?: string;
  partyType?: "person" | "entity";
  roles?: string[];
}) => {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!normalizedCountryCode) return null;

  const effectivePartyType =
    partyType === "entity" && !isEntityPartyTypeEnabledForCountry(normalizedCountryCode)
      ? "person"
      : partyType;

  const byCountry = PARTY_KYC_REGISTRY.filter(
    (c) => normalizeCountryCode(c.countryCode) === normalizedCountryCode
  );
  if (!byCountry.length) return null;
  const byType = byCountry.find((c) => (c.partyType ? c.partyType === effectivePartyType : true));
  if (byType) return byType;
  if (effectivePartyType) return null;
  const byRole = byCountry.find((c) => c.roles && roles?.some((r) => c.roles?.includes(r)));
  return byRole || byCountry[0];
};
