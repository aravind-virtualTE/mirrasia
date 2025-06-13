export const roleMap = [
    { key: "maj", value: "shldrOptions.roleMaj" },
    { key: "gs", value: "shldrOptions.roleGs" },
    { key: "ns", value: "shldrOptions.roleNs" },
    { key: "ceo", value: "shldrOptions.roleCeo" },
    { key: "ged", value: "shldrOptions.roleGen" },
    { key: "nd", value: "shldrOptions.roleNd" },
    { key: "dcp", value: "shldrOptions.roleDcp" },
    { key: "etc", value: "shldrOptions.roleEtc" },
];
export const significantControllerMap = [
    { key: "s1", value: "shldrOptions.sigNiConS1" },
    { key: "s2", value: "shldrOptions.sigNiConS2" },
    { key: "s3", value: "shldrOptions.sigNiConS3" },
    { key: "s4", value: "shldrOptions.sigNiConS4" },
    { key: "s5", value: "shldrOptions.sigNiConS5" },
    { key: "s6", value: "shldrOptions.sigNiConS6" },
    { key: "s7", value: "shldrOptions.sigNiConS7" },
];

export const correspondenceAddressOptions = [
    {
        key: "residential",
        label: "shldrOptions.coresAddres",
    },
    {
        key: "business",
        label:
            "shldrOptions.coresAddres1",
    },
    {
        key: "different",
        label: "shldrOptions.coresAddress2",
    },
    {
        key: "other",
        label: "usa.Section2StateOptions.Other",
    },
];

export const overseasResidentStatusOptions = [
    { key: "yes", value: "AmlCdd.options.yes" },
    { key: "no", value: "AmlCdd.options.no" },
    { key: "unknown", value: "shldrOptions.dontKnow" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];

export const foreignInvestmentReportOptions = [
    { key: "yesReport", value: "AmlCdd.options.yes" },
    { key: "noReport", value: "AmlCdd.options.no" },
    { key: "handleIssue", value: "shldrOptions.handleIssue" },
    { key: "consultationRequired", value: "shldrOptions.consultationReq" },
    { key: "otherReport", value: "usa.Section2StateOptions.Other" },
];

export const foreignInvestmentOptions = [
    { key: "yes", value: "AmlCdd.options.yes" },
    { key: "no", value: "AmlCdd.options.no" },
    { key: "consultation", value: "shldrOptions.consultationReq" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];

export const politicallyExposedOptions = [
    { key: "publicOffice", value: "shldrOptions.pep1" },
    { key: "seniorManager", value: "shldrOptions.pep2" },
    { key: "politicalPerson", value: "shldrOptions.pep3" },
    { key: "none", value: "None" },
    { key: "unknown", value: "shldrOptions.sigNiConS7" },
    { key: "consultation", value: "shldrOptions.consultationReq" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];

export const legalIssuesOptions = [
    { key: "yes", value: "AmlCdd.options.yes" },
    { key: "no", value: "AmlCdd.options.no" },
    { key: "noInfo", value: "shldrOptions.optionsDoNotProvide" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];

export const usResidencyOptions = [
    { key: "yes", value: "AmlCdd.options.yes" },
    { key: "no", value: "AmlCdd.options.no" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];

export const natureOfFundsOptions = [
    {
        key: "profitsFromBusiness",
        value: "shldrOptions.natureFunds",
    },
    {
        key: "fundsFromAssetSales",
        value: "shldrOptions.fundsFromSales",
    },
    {
        key: "ownerInvestmentOrLoan",
        value: "shldrOptions.ownerInvestLoad",
    },
    {
        key: "groupOrParentInvestment",
        value: "shldrOptions.groupParentInvestment",
    },
    {
        key: "otherNatureOfFunds",
        value: "usa.Section2StateOptions.Other",
    },
];

export const sourceOfFundsOptions = [
    {
        key: "pastBusinessProfits",
        value:
            "shldrOptions.sourceFunds",
    },
    {
        key: "assetSaleFunds",
        value:
            "shldrOptions.assetSaleFunds",
    },
    {
        key: "borrowedFunds",
        value:
            "shldrOptions.borrowedFunds",
    },
    {
        key: "ownerPaidFunds",
        value:
            "shldrOptions.ownerPaidFunds",
    },
    {
        key: "earnedIncome",
        value:
            "shldrOptions.earnedIncome",
    },
    {
        key: "affiliatedCompanyFunds",
        value:
            "shldrOptions.affiliatedCompFunds",
    },
    {
        key: "bankOwnedFunds",
        value:
            "shldrOptions.bankOwnedFunds",
    },
    {
        key: "noPlanSmallAmount",
        value:
            "shldrOptions.noPlanSmallAmount",
    },
    {
        key: "otherSourceOfFunds",
        value: "usa.Section2StateOptions.Other",
    },
];

export const usShrDirEngOptions = [
    { key: "notaryTranslation", value: "Submit a notarized English translation of the shareholder register and copy of the register" },
    { key: "submitDocsHeldInHouse", value: "First, submit the documents held in-house, and if necessary, have them notarized through a translation agency affiliated with Mir Asia (separate translation notarization fee)" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];

export const usEgnArticleOptions = [
    { key: "submitEngVersion", value: "Submit the English version of the Articles of Incorporation or a notarized English translation of the Articles of Incorporation" },
    { key: "articlesSubmission", value: "First, submit the articles of incorporation held within the company, and if necessary, have them translated and notarized through a translation agency affiliated with Mir Asia (separate translation and notarization fee)" },
    { key: "other", value: "usa.Section2StateOptions.Other" },
];


export const relationMap = [
    { key: "shareHld", value: "shareholder" },
    { key: "officer", value: "move" },
    { key: "keyControl", value: "Trustee" },
    { key: "other", value: "Other" },
]
export const investmentOptionsMap = [
    { key: "shareHld", value: "Shareholders' capital or loans" },
    { key: "businessIncome", value: "Business income" },
    { key: "divident", value: "Dividend" },
    { key: "depositSaving", value: "Deposits, savings" },
    { key: "incomeFromRealEstate", value: "Income from real estate, stocks, and other investment assets" },
    { key: "loanAmount", value: "Loan amount" },
    { key: "saleOfCompany", value: "Proceeds from the sale of a company or shares" },
    { key: "inheritance", value: "Inheritance funds of shareholders/directors or special persons" },
    { key: "other", value: "Other" },
]

export const sourceFundMap = [
    { key: "businessIncome", value: "Business income" },
    { key: "intrestIncome", value: "Interest income" },
    { key: "realEstateIncm", value: "Income from real estate, stocks, and other investment assets" },
    { key: "saleOfcompanyShares", value: "Proceeds from the sale of a company or shares held" },
    { key: "inheritted", value: "Inheritance/Gift" },
    { key: "borrowing", value: "Borrowing/trusting/depositing, etc." },
    { key: "other", value: "Other" },
]