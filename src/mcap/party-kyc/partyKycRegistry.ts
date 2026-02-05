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
  if (!countryCode) return null;
  const byCountry = PARTY_KYC_REGISTRY.filter((c) => c.countryCode === countryCode);
  if (!byCountry.length) return null;
  const byType = byCountry.find((c) => (c.partyType ? c.partyType === partyType : true));
  if (byType) return byType;
  const byRole = byCountry.find((c) => c.roles && roles?.some((r) => c.roles?.includes(r)));
  return byRole || byCountry[0];
};
