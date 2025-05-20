export const roleMap = [
    { key: "maj", value: "Major shareholder (holding the largest stake)" },
    { key: "gs", value: "General shareholder" },
    { key: "ns", value: "Nominee Shareholder" },
    { key: "ceo", value: "CEO" },
    { key: "ged", value: "General executive director" },
    { key: "nd", value: "Nominee Director" },
    { key: "dcp", value: "Designated Contact Person" },
    { key: "etc", value: "ETC" },
];
export const significantControllerMap = [
    { key: "s1", value: "Holds 25% or more of the company's total shares" },
    { key: "s2", value: "Holds less than 25% of the company's total shares, but has a higher stake than other shareholders (largest shareholder)" },
    { key: "s3", value: "Holds less than 25% of the company's total shares, but the same as the share of other shareholders (e.g., 20% of shares out of 5 shareholders)" },
    { key: "s4", value: "The entire share of the company is owned by another holding company, and I own 25% or more of the holding company." },
    { key: "s5", value: "The entire stake of the company is owned by another holding company, and I own less than 25% of the holding company, but the share is higher than other shareholders (the largest shareholder of the holding company)." },
    { key: "s6", value: "The entire share of the company is owned by another holding company, and I own less than 25% of the holding company, but the same as the share of other shareholders (e.g., 20% of the holding company, 5 shareholders)." },
    { key: "s7", value: "Do not know or do not understand" },
];

export const correspondenceAddressOptions = [
    {
        key: "residential",
        label: "Use residential address as the correspondence address",
    },
    {
        key: "business",
        label:
            "Use registered business address as a correspondence address (annual service fee of HKD 500 / billed per person)",
    },
    {
        key: "different",
        label:
            "Use a different address as a correspondence address (requires proof of address)",
    },
    {
        key: "other",
        label: "Other",
    },
];

export const overseasResidentStatusOptions = [
    { key: "yes", value: "Yes" },
    { key: "no", value: "No" },
    { key: "unknown", value: "Do not know" },
    { key: "other", value: "Other" },
];

export const foreignInvestmentReportOptions = [
    { key: "yesReport", value: "Yes" },
    { key: "noReport", value: "No" },
    { key: "handleIssue", value: "I can handle this issue" },
    { key: "consultationRequired", value: "Consultation required" },
    { key: "otherReport", value: "Other" },
];

export const foreignInvestmentOptions = [
    { key: "yes", value: "Yes" },
    { key: "no", value: "No" },
    { key: "consultation", value: "Consultation required" },
    { key: "other", value: "Other" },
];

export const politicallyExposedOptions = [
    { key: "publicOffice", value: "If you have worked for a current or past public office, or if there is such a person in your family" },
    { key: "seniorManager", value: "If you worked as a senior manager at a government agency, political party, social group, international NGO, etc." },
    { key: "politicalPerson", value: "Present or past politically or socially influential person, or someone in your family" },
    { key: "none", value: "None" },
    { key: "unknown", value: "Do not know or do not understand" },
    { key: "consultation", value: "Consultation required" },
    { key: "other", value: "Other" },
];

export const legalIssuesOptions = [
    { key: "yes", value: "Yes" },
    { key: "no", value: "No" },
    { key: "noInfo", value: "I do not want to provide information" },
    { key: "other", value: "Other" },
];

export const usResidencyOptions = [
    { key: "yes", value: "Yes" },
    { key: "no", value: "No" },
    { key: "other", value: "Other" },
];

export const natureOfFundsOptions = [
    {
        key: "profitsFromBusiness",
        value: "After the establishment of the company, profits will be generated through business such as sales",
    },
    {
        key: "fundsFromAssetSales",
        value: "After incorporation or registration, the funds for the sale of assets will flow into the account",
    },
    {
        key: "ownerInvestmentOrLoan",
        value: "After incorporation or registration, the actual owner will deposit investment or loan funds",
    },
    {
        key: "groupOrParentInvestment",
        value: "After incorporation or registration, the group or parent company will pay investment funds",
    },
    {
        key: "otherNatureOfFunds",
        value: "Other",
    },
];

export const sourceOfFundsOptions = [
    {
        key: "pastBusinessProfits",
        value:
            "Investments or loans will be paid to the Hong Kong company, and these funds are profits from other businesses in the past.",
    },
    {
        key: "assetSaleFunds",
        value:
            "Investments or loans will be paid to the Hong Kong company, which is generated from the sale of assets owned by the company in the past.",
    },
    {
        key: "borrowedFunds",
        value:
            "Investment funds or loans will be paid to the Hong Kong company, and these funds are loans (borrowed) from others.",
    },
    {
        key: "ownerPaidFunds",
        value:
            "Investments or loans will be paid to the Hong Kong company, and these are funds that other substantial owners wish to pay through their own.",
    },
    {
        key: "earnedIncome",
        value:
            "Investments or loans will be paid to the Hong Kong company, which is earned income from past tenure.",
    },
    {
        key: "affiliatedCompanyFunds",
        value:
            "Investments or loans will be paid to the Hong Kong company, and these funds are paid by the company or group to which the person is affiliated.",
    },
    {
        key: "bankOwnedFunds",
        value:
            "Investments or loans will be paid to the Hong Kong company, and these funds were deposited in and owned by the bank.",
    },
    {
        key: "noPlanSmallAmount",
        value:
            "There is no plan to pay investment or loans to the Hong Kong company, and even if there is, it is a small amount, so this will be paid from the funds deposited in the bank.",
    },
    {
        key: "otherSourceOfFunds",
        value: "Other",
    },
];