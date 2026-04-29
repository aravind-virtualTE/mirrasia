/**
 * serviceCatalogData.ts
 * ─────────────────────
 * Centralized, read-only data extraction layer that normalizes pricing from
 * every MCAP country config into a single unified schema.
 *
 * This file is the ONLY consumer of raw pricing constants for the Service
 * Catalog page — individual config files remain untouched.
 *
 * If a new country is added to the registry, add a corresponding entry here.
 */

/* ── Shared types ──────────────────────────────────────────────────────── */

export type CatalogServiceItem = {
  id: string;
  label: string;
  amount: number;
  originalAmount?: number;
  currency: string;
  mandatory: boolean;
  kind: "government" | "service" | "optional" | "other";
  info?: string;
};

export type CatalogCountryEntry = {
  countryCode: string;
  countryName: string;
  flag: string;
  baseCurrency: string;
  entityTypes?: string[];
  services: CatalogServiceItem[];
  totalMandatory: number;
  notes?: string;
};

/* ── Helpers ───────────────────────────────────────────────────────────── */

const sumMandatory = (items: CatalogServiceItem[]): number =>
  items
    .filter((i) => i.mandatory)
    .reduce((sum, i) => sum + (i.amount ?? 0), 0);

const item = (
  id: string,
  label: string,
  amount: number,
  currency: string,
  mandatory: boolean,
  kind: CatalogServiceItem["kind"] = "service",
  opts?: { originalAmount?: number; info?: string }
): CatalogServiceItem => ({
  id,
  label,
  amount,
  currency,
  mandatory,
  kind,
  ...(opts?.originalAmount !== undefined ? { originalAmount: opts.originalAmount } : {}),
  ...(opts?.info ? { info: opts.info } : {}),
});

/* ── Country Entries ───────────────────────────────────────────────────── */

const HK_ENTRY: CatalogCountryEntry = (() => {
  const c = "HKD";
  const services: CatalogServiceItem[] = [
    item("cr_fee", "Companies Registry Fee", 222, c, true, "government"),
    item("br_fee", "Business Registration Fee", 303, c, true, "government"),
    item("inc_service", "Incorporation Service", 0, c, true, "service", { originalAmount: 219, info: "Fully discounted in the package" }),
    item("sec_annual", "Company Secretary (Annual)", 225, c, true, "service", { originalAmount: 450, info: "Statutory record keeping & filings" }),
    item("reg_office", "Registered Office Address", 161, c, false, "optional", { originalAmount: 322, info: "50% off first year" }),
    item("bank_arr", "Bank Account Arrangement", 400, c, false, "optional"),
    item("kit", "Company Kit (Chop + Certificates)", 70, c, false, "optional"),
    item("correspondence", "Correspondence Address", 500, c, false, "optional"),
  ];
  return {
    countryCode: "HK",
    countryName: "Hong Kong",
    flag: "🇭🇰",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "Pricing in HKD. Card surcharge: 4% HKD / 6% USD.",
  };
})();

const US_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("us_incorporation", "State Incorporation (varies by state)", 0, c, true, "service", { info: "Dynamic pricing — depends on selected state and entity type" }),
  ];
  return {
    countryCode: "US",
    countryName: "United States",
    flag: "🇺🇸",
    baseCurrency: c,
    services,
    totalMandatory: 0,
    notes: "Pricing is state-dependent. Fee computed dynamically via getEntityBasicPrice().",
  };
})();

const SG_ENTRY: CatalogCountryEntry = (() => {
  const c = "SGD";
  const services: CatalogServiceItem[] = [
    item("companyIncorporation", "Company Incorporation", 350, c, true, "service"),
    item("companySecretary", "Company Secretary", 480, c, true, "service"),
    item("registeredAddress", "Registered Address", 300, c, true, "service"),
    item("bankAccountAdvisory", "Bank Account Advisory", 1200, c, false, "optional"),
    item("emiEAccount", "EMI E-Account", 0, c, false, "optional"),
  ];
  return {
    countryCode: "SG",
    countryName: "Singapore",
    flag: "🇸🇬",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "Currency: SGD. Card surcharge: 4% SGD / 6% USD.",
  };
})();

const PA_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("base", "Corporation Setup", 3000, c, true, "service"),
    item("ndSetup_1", "Nominee Director (1 person)", 1200, c, false, "optional"),
    item("ndSetup_2", "Nominee Director (2 persons)", 1700, c, false, "optional"),
    item("ndSetup_3", "Nominee Director (3 persons)", 2200, c, false, "optional"),
    item("nsSetup", "Nominee Shareholder", 1300, c, false, "optional"),
    item("optEmi", "EMI Account Opening", 400, c, false, "optional"),
    item("optBank", "Bank Account Arrangement", 2000, c, false, "optional"),
    item("optCbi", "CBI Application", 3880, c, false, "optional"),
    item("recordStorage", "Record Storage (Mirr)", 350, c, false, "optional"),
  ];
  return {
    countryCode: "PA",
    countryName: "Panama",
    flag: "🇵🇦",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "Nominee directors priced in tiers (1/2/3 persons).",
  };
})();

const PPIF_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("base", "Foundation Setup", 3800, c, true, "service"),
    item("ndSetup_1", "Nominee Director (1 person)", 1200, c, false, "optional"),
    item("ndSetup_2", "Nominee Director (2 persons)", 1700, c, false, "optional"),
    item("ndSetup_3", "Nominee Director (3 persons)", 2200, c, false, "optional"),
    item("nsSetup", "Nominee Shareholder", 1300, c, false, "optional"),
    item("optEmi", "EMI Account Opening", 400, c, false, "optional"),
    item("optBank", "Bank Account Arrangement", 2000, c, false, "optional"),
    item("optCbi", "CBI Application", 3880, c, false, "optional"),
    item("recordStorage", "Record Storage (Mirr)", 350, c, false, "optional"),
  ];
  return {
    countryCode: "PPIF",
    countryName: "Panama PIF",
    flag: "🇵🇦",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "Private Interest Foundation. Nominee directors priced in tiers.",
  };
})();

const CR_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("cr_base", "Corporation Setup", 4500, c, true, "service"),
    item("cr_nominee", "Nominee Director", 2500, c, false, "optional"),
  ];
  return {
    countryCode: "CR",
    countryName: "Costa Rica",
    flag: "🇨🇷",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
  };
})();

const UK_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("uk_base_incorporation", "Incorporation (Individual/Subsidiary)", 1700, c, true, "service"),
    item("uk_branch_incorporation", "Incorporation (Branch)", 1000, c, false, "service", { info: "Branch registration route" }),
    item("uk_base_registered_office", "Registered Office Address", 600, c, true, "service"),
    item("uk_emi_list_provision", "EMI List Provision", 0, c, false, "optional"),
    item("uk_bank_account_advisory", "Bank Account Advisory", 2400, c, false, "optional"),
    item("uk_vat_registration", "VAT Registration", 650, c, false, "optional"),
  ];
  return {
    countryCode: "UK",
    countryName: "United Kingdom",
    flag: "🇬🇧",
    baseCurrency: c,
    entityTypes: ["Individual", "Subsidiary", "Branch"],
    services,
    totalMandatory: sumMandatory(services),
    notes: "Branch incorporation is $1,000 vs $1,700 for individual/subsidiary.",
  };
})();

const EE_ENTRY: CatalogCountryEntry = (() => {
  const c = "EUR";
  const services: CatalogServiceItem[] = [
    item("ee_incorporation", "Incorporation Professional Fee", 700, c, true, "service"),
    item("ee_state_fee", "State Registration Fee", 190, c, true, "government"),
    item("ee_business_address", "Business Address (1 year)", 300, c, true, "service"),
    item("ee_contact_person", "Contact Person (1 year)", 400, c, true, "service"),
    item("ee_management_followup", "Management Follow-up (1 year)", 400, c, true, "service"),
    item("ee_poa_addon", "Power of Attorney Add-on", 150, c, false, "optional"),
    item("ee_emi_list", "EMI List", 0, c, false, "optional"),
  ];
  return {
    countryCode: "EE",
    countryName: "Estonia",
    flag: "🇪🇪",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
  };
})();

const LT_ENTRY: CatalogCountryEntry = (() => {
  const c = "EUR";
  const services: CatalogServiceItem[] = [
    item("lt_incorporation", "Standard Incorporation", 1100, c, true, "service"),
    item("lt_notary", "Notary Fee", 250, c, true, "service"),
    item("lt_registration", "Registration Fee", 100, c, true, "government"),
    item("lt_corporate_address", "Corporate Address (1 year)", 350, c, true, "service"),
    item("lt_bank_opening", "Bank Opening", 400, c, true, "service"),
    item("lt_vasp", "VASP Full Package", 25000, c, false, "optional"),
    item("lt_emi_level_1_9", "EMI License (Level 1-9)", 60000, c, false, "optional"),
    item("lt_emi_gov_fee", "EMI Government Fee", 1463, c, false, "government"),
    item("lt_aml_basic", "AML Officer (Basic, Annual)", 12000, c, false, "optional"),
    item("lt_aml_experienced", "AML Officer (Experienced, Annual)", 24000, c, false, "optional"),
    item("lt_accounting_50", "Accounting (up to 50 invoices/yr)", 4800, c, false, "optional"),
    item("lt_accounting_100", "Accounting (up to 100 invoices/yr)", 6120, c, false, "optional"),
    item("lt_accounting_200", "Accounting (up to 200 invoices/yr)", 9240, c, false, "optional"),
    item("lt_accounting_500", "Accounting (up to 500 invoices/yr)", 13560, c, false, "optional"),
    item("lt_statutory_interest", "Statutory Interest (Capital Unpaid)", 4900, c, false, "other"),
  ];
  return {
    countryCode: "LT",
    countryName: "Lithuania",
    flag: "🇱🇹",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "VASP/EMI licensing available. Accounting tiered by invoice volume.",
  };
})();

const HU_ENTRY: CatalogCountryEntry = (() => {
  const c = "EUR";
  const services: CatalogServiceItem[] = [
    item("hu_incorporation", "Incorporation & First Year", 3500, c, true, "service"),
    item("hu_bank_opening", "Bank Account Opening", 0, c, false, "other", { info: "Complementary advisory" }),
    item("hu_entity_kyc", "Entity Shareholder KYC (per entity)", 700, c, false, "service"),
    item("hu_accounting", "Accounting (6 months, from)", 1000, c, false, "service"),
    item("hu_residence_permit", "Representative Residence Permit", 3000, c, false, "optional"),
    item("hu_family_residence", "Family Residence Permit Pack (per 2 persons)", 2000, c, false, "optional"),
    item("hu_legal_whitepaper", "Legal Opinion / Whitepaper Review", 0, c, false, "other"),
    item("hu_legal_exchange", "Legal Opinion / Domestic Exchange", 0, c, false, "other"),
    item("hu_regulatory_consulting", "Business Regulatory Consulting", 0, c, false, "other"),
  ];
  return {
    countryCode: "HU",
    countryName: "Hungary Kft",
    flag: "🇭🇺",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "Entity shareholder KYC charged per entity. Family permits in 2-person packs.",
  };
})();

const IE_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ie_incorporation", "Incorporation & First Year Package", 3100, c, true, "service"),
    item("ie_bank_opening", "Bank Account Opening", 1200, c, false, "service"),
    item("ie_bond", "Bond (2 year, EUR reference)", 2000, c, false, "other"),
    item("ie_local_director", "Local Director Registration (1 year)", 5500, c, false, "service"),
    item("ie_additional_director", "Additional Local Director (1 year)", 2500, c, false, "service"),
    item("ie_annual_renewal", "Annual Company Renewal", 2500, c, false, "service"),
  ];
  return {
    countryCode: "IE",
    countryName: "Ireland",
    flag: "🇮🇪",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "EEA director or bond may be required for non-EEA directors.",
  };
})();

const AU_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("au_incorporation", "Base Incorporation", 2000, c, true, "service"),
    item("au_nominee_director", "Nominee Director (Annual)", 5000, c, false, "service", { info: "Required if no Australian resident director" }),
    item("au_registered_address", "Registered Address (Annual)", 700, c, false, "service", { info: "Required if no own Australian address" }),
    item("au_express", "Express Service", 550, c, false, "optional"),
    item("au_emi_assistance", "EMI Account Assistance", 600, c, false, "optional"),
  ];
  return {
    countryCode: "AU",
    countryName: "Australia",
    flag: "🇦🇺",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "Nominee director mandatory if no Australian resident director.",
  };
})();

const BVI_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("bvi_incorporation", "Incorporation & First Year Maintenance", 3250, c, true, "service"),
    item("bvi_fsc_registration", "FSC Registration Professional Service", 6500, c, false, "service"),
    item("bvi_fsc_fees", "FSC Fees", 2050, c, false, "government"),
    item("bvi_legal_representative", "Authorized Legal Representative", 8500, c, false, "service"),
    item("bvi_offering_memorandum", "Offering Memorandum", 6500, c, false, "service"),
    item("bvi_mlro_base", "MLRO Base", 9000, c, false, "service"),
    item("bvi_mlro_per_investor", "MLRO Per Investor", 500, c, false, "service", { info: "Per investor on top of MLRO base" }),
  ];
  return {
    countryCode: "BVI",
    countryName: "British Virgin Islands",
    flag: "🇻🇬",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
    notes: "MLRO per-investor fees stack on top of MLRO base.",
  };
})();

const GE_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ge_formation", "LLC Remote Formation", 2950, c, true, "service"),
    item("ge_bank_opening", "Remote Bank Opening", 2500, c, false, "service"),
    item("ge_sekerbank", "Şekerbank Offshore Alternative", 400, c, false, "service"),
  ];
  return {
    countryCode: "GE",
    countryName: "Georgia",
    flag: "🇬🇪",
    baseCurrency: c,
    services,
    totalMandatory: sumMandatory(services),
  };
})();

/* ── UAE Sub-jurisdictions ─────────────────────────────────────────────── */

const UAE_IFZA_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ifza_license", "License with Visa", 4605, c, true, "government"),
    item("ifza_establishment_card", "Establishment Card", 545, c, true, "government"),
    item("ifza_setup", "Setup & License Handling", 3000, c, true, "service"),
    item("ifza_tax_vat", "Tax & VAT Registration", 800, c, true, "service"),
    item("uae_medical_emirates_id", "Medical + Emirates ID (per person)", 850, c, false, "optional"),
    item("uae_fast_track", "Fast Track Biometrics (per request)", 1600, c, false, "optional"),
    item("uae_visa", "Visa Processing (per person)", 1600, c, false, "optional"),
    item("uae_visa_status", "Visa Status Change (per request)", 650, c, false, "optional"),
    item("uae_investor_title", "Investor Title Registration (per request)", 450, c, false, "optional"),
    item("uae_bank_setup", "Bank Account Setup Support", 2500, c, false, "optional"),
    item("uae_extra_activity", "Extra Business Activity", 550, c, false, "optional"),
    item("uae_bookkeeping", "Bookkeeping (per year)", 6000, c, false, "optional"),
    item("uae_audit", "Audit (per year)", 2000, c, false, "optional"),
  ];
  return {
    countryCode: "UAE",
    countryName: "UAE — Dubai IFZA",
    flag: "🇦🇪",
    baseCurrency: c,
    entityTypes: ["IFZA FZCO"],
    services,
    totalMandatory: sumMandatory(services),
    notes: "IFZA free zone. Optional add-ons support quantity control.",
  };
})();

const UAE_AD_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ad_business_app", "Business Application", 300, c, true, "government"),
    item("ad_name_reservation", "Name Reservation", 200, c, true, "government"),
    item("ad_registration", "Company Registration", 1500, c, true, "government"),
    item("ad_commercial_license", "Commercial License", 4000, c, true, "government"),
    item("ad_business_activity", "Business Activity License", 4000, c, true, "government"),
    item("ad_info_protection", "Info Protection", 300, c, true, "government"),
    item("ad_mailbox", "Mailbox", 250, c, true, "government"),
    item("ad_consulting", "Setup Consulting", 9500, c, true, "service"),
    item("ad_bank_intro", "Bank Opening Support", 2500, c, true, "service"),
    item("ad_vat_gov", "VAT (Government)", 527.5, c, true, "government"),
    item("ad_vat_service", "VAT (Service)", 600, c, true, "service"),
  ];
  return {
    countryCode: "UAE-AD",
    countryName: "UAE — Abu Dhabi Mainland",
    flag: "🇦🇪",
    baseCurrency: c,
    entityTypes: ["AD Mainland"],
    services,
    totalMandatory: sumMandatory(services),
    notes: "Abu Dhabi mainland. All services mandatory in base package.",
  };
})();

const UAE_MEYDAN_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("meydan_incorporation", "Company Incorporation Fee", 2357, c, true, "service"),
    item("meydan_management", "Management Fee", 943, c, true, "service"),
  ];
  return {
    countryCode: "UAE-MY",
    countryName: "UAE — Meydan Free Zone",
    flag: "🇦🇪",
    baseCurrency: c,
    entityTypes: ["Meydan FZCO"],
    services,
    totalMandatory: sumMandatory(services),
  };
})();

const UAE_JAFZA_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("jafza_registration", "Registration Fee", 6010, c, true, "government"),
    item("jafza_incorporation", "Company Incorporation Fee", 2357, c, true, "service"),
    item("jafza_management", "Management Fee", 943, c, true, "service"),
  ];
  return {
    countryCode: "UAE-JA",
    countryName: "UAE — JAFZA Free Zone",
    flag: "🇦🇪",
    baseCurrency: c,
    entityTypes: ["JAFZA FZCO"],
    services,
    totalMandatory: sumMandatory(services),
  };
})();

/* ── Switzerland ───────────────────────────────────────────────────────── */

const CH_AG_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ch_setup_maintenance", "Setup & Maintenance (1 year)", 8500, c, true, "service"),
    item("ch_local_director", "Local Director Support (1 year)", 18000, c, false, "service", { info: "If Mirr-provided board member" }),
    item("ch_bank_opening", "Bank Opening (Capital + Operating)", 2500, c, false, "service"),
    item("ch_office_pobox", "Registered Office PO Box (1 year)", 3000, c, false, "service"),
    item("ch_office_flexidesk", "Registered Office Flexi-Desk (1 year)", 6800, c, false, "service"),
    item("ch_emi_list", "EMI List Provision", 0, c, false, "optional"),
  ];
  return {
    countryCode: "CH-AG",
    countryName: "Switzerland AG",
    flag: "🇨🇭",
    baseCurrency: c,
    entityTypes: ["AG (Corporation)"],
    services,
    totalMandatory: sumMandatory(services),
    notes: "Local director & office mode selected at service step.",
  };
})();

const CH_GMBH_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ch_setup_maintenance", "Setup & Maintenance (1 year)", 8500, c, true, "service"),
    item("ch_local_manager", "Local Manager Support (1 year)", 18000, c, false, "service", { info: "If Mirr-provided managing director" }),
    item("ch_bank_opening", "Bank Opening (Capital + Operating)", 2500, c, false, "service"),
    item("ch_office_pobox", "Registered Office PO Box (1 year)", 3000, c, false, "service"),
    item("ch_office_flexidesk", "Registered Office Flexi-Desk (1 year)", 6800, c, false, "service"),
    item("ch_emi_list", "EMI List Provision", 0, c, false, "optional"),
  ];
  return {
    countryCode: "CH-GMBH",
    countryName: "Switzerland GmbH",
    flag: "🇨🇭",
    baseCurrency: c,
    entityTypes: ["GmbH (LLC)"],
    services,
    totalMandatory: sumMandatory(services),
    notes: "Same pricing as AG. Local manager & office mode selected at service step.",
  };
})();

const CH_FOUNDATION_ENTRY: CatalogCountryEntry = (() => {
  const c = "USD";
  const services: CatalogServiceItem[] = [
    item("ch_fdn_setup", "Foundation Setup", 13500, c, true, "service"),
    item("ch_fdn_board", "Local Board Member (1 year)", 20000, c, false, "service"),
    item("ch_fdn_office_pobox", "Registered Office PO Box (1 year)", 3000, c, false, "service"),
    item("ch_fdn_office_flexidesk", "Registered Office Flexi-Desk (1 year)", 6800, c, false, "service"),
    item("ch_fdn_bank", "Bank Opening (Capital + Operating)", 2500, c, false, "service"),
    item("ch_fdn_accounting", "Accounting & Tax (Annual)", 3800, c, false, "service"),
    item("ch_fdn_annual_report", "Annual Foundation Report (estimated)", 6000, c, false, "service"),
  ];
  return {
    countryCode: "CH-FDN",
    countryName: "Switzerland Foundation",
    flag: "🇨🇭",
    baseCurrency: c,
    entityTypes: ["Foundation"],
    services,
    totalMandatory: sumMandatory(services),
    notes: "Annual report cost is estimated. Board member & office mode selected at service step.",
  };
})();

/* ── Exported catalog ──────────────────────────────────────────────────── */

export const SERVICE_CATALOG: CatalogCountryEntry[] = [
  HK_ENTRY,
  SG_ENTRY,
  US_ENTRY,
  UK_ENTRY,
  AU_ENTRY,
  IE_ENTRY,
  EE_ENTRY,
  LT_ENTRY,
  HU_ENTRY,
  GE_ENTRY,
  BVI_ENTRY,
  PA_ENTRY,
  PPIF_ENTRY,
  CR_ENTRY,
  UAE_IFZA_ENTRY,
  UAE_AD_ENTRY,
  UAE_MEYDAN_ENTRY,
  UAE_JAFZA_ENTRY,
  CH_AG_ENTRY,
  CH_GMBH_ENTRY,
  CH_FOUNDATION_ENTRY,
];

/** Unique list of currencies across all catalog entries */
export const CATALOG_CURRENCIES = Array.from(
  new Set(SERVICE_CATALOG.map((e) => e.baseCurrency))
).sort();

/** Region groupings for visual categorisation */
export const REGION_GROUPS: Record<string, string[]> = {
  "Asia Pacific": ["HK", "SG", "AU"],
  "Europe": ["UK", "IE", "EE", "LT", "HU", "GE", "CH-AG", "CH-GMBH", "CH-FDN"],
  "Middle East": ["UAE", "UAE-AD", "UAE-MY", "UAE-JA"],
  "Americas": ["US", "PA", "PPIF", "CR"],
  "Caribbean": ["BVI"],
};
