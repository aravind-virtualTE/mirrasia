export interface ClaimItem {
  label: string;
  en: (ctx: Record<string, string>) => string;
}

export interface ClaimSet {
  cat: string;
  items: ClaimItem[];
}

export const CLAIM_SETS: ClaimSet[] = [
  {
    cat: "Relationship & Tenure",
    items: [
      {
        label: "Longstanding professional relationship (2+ years).",
        en: (c) => `I confirm that I have known ${c.app_name} in a professional capacity for more than ${c.years} year(s), maintaining an ongoing relationship.`
      },
      {
        label: "Consistency and responsiveness across engagements.",
        en: (c) => `${c.app_name} demonstrates continuity and responsiveness throughout engagements.`
      },
      {
        label: "Stability under scope/budget/schedule changes.",
        en: (c) => `${c.app_name} remained steady and constructive despite scope, budget, or timeline changes.`
      },
    ]
  },
  {
    cat: "Professional Capability",
    items: [
      {
        label: "Strong domain expertise and problem solving.",
        en: (c) => `${c.app_name} brings domain expertise and pragmatic problem-solving, delivering high-quality results.`
      },
      {
        label: "Data-driven decisions and excellent documentation.",
        en: (c) => `${c.app_name} applies data-driven decision-making and maintains excellent documentation standards.`
      },
      {
        label: "High QA standards and on-time delivery.",
        en: (c) => `${c.app_name} maintains high standards in quality assurance and on-time delivery.`
      },
      {
        label: "Effective in cross-border/multi-jurisdiction contexts.",
        en: (c) => `${c.app_name} performs effectively across cross-border, multi-jurisdictional, and multicultural settings.`
      },
    ]
  },
  {
    cat: "Ethics & Compliance",
    items: [
      {
        label: "Principled and compliance-conscious conduct.",
        en: (c) => `${c.app_name} is principled and compliance-conscious, adhering to best practices.`
      },
      {
        label: "Cooperative with KYC/AML and documentation.",
        en: (c) => `${c.app_name} cooperates proactively with KYC/AML due diligence and provides supporting documentation promptly.`
      },
      {
        label: "Strict confidentiality and data protection.",
        en: (c) => `${c.app_name} rigorously respects confidentiality and data protection obligations.`
      },
      {
        label: "Timely fulfillment of financial/contractual duties.",
        en: (c) => `${c.app_name} fulfills financial obligations (tax, accounting, contractual payments) in a timely manner.`
      },
    ]
  },
  {
    cat: "Communication & Collaboration",
    items: [
      {
        label: "Clear communication and stakeholder management.",
        en: (c) => `${c.app_name} communicates with clarity and manages stakeholders effectively.`
      },
      {
        label: "Solution-oriented conflict handling.",
        en: (c) => `${c.app_name} handles conflicts with a solution-oriented approach, facilitating workable consensus.`
      },
      {
        label: "Leadership with teamwork; positive influence.",
        en: (c) => `${c.app_name} combines teamwork with leadership, positively influencing colleagues and partners.`
      },
    ]
  },
  {
    cat: "Results & Impact",
    items: [
      {
        label: "Consistently positive project outcomes.",
        en: () => `Our continued collaboration yielded positive outcomes across numerous projects.`
      },
      {
        label: "Strong performance against KPIs/OKRs.",
        en: (c) => `${c.app_name} demonstrates strong performance against agreed KPIs/OKRs.`
      },
      {
        label: "Improvements in risk management/internal controls.",
        en: (c) => `${c.app_name} led improvements in risk management and internal controls.`
      },
    ]
  },
  {
    cat: "Character & Standing",
    items: [
      {
        label: "Reliable; keeps commitments in full and on time.",
        en: (c) => `${c.app_name} is reliable and honors commitments in full and on time.`
      },
      {
        label: "Accessible and responsive; ready to assist.",
        en: (c) => `${c.app_name} remains accessible and responsive, ready to assist when needed.`
      },
      {
        label: "Law-abiding; to my knowledge, no criminal record.",
        en: (c) => `To the best of my knowledge, ${c.app_name} has no criminal record and is a responsible, law-abiding citizen.`
      },
      {
        label: "Ready to recommend to third parties.",
        en: (c) => `I have no hesitation in recommending ${c.app_name} to third parties and counterparties.`
      },
    ]
  },
];

export const RELATIONSHIP_MAP: Record<string, string> = {
  client: 'as our client',
  customer: 'as our customer',
  advisor: 'as a professional advisor engaged by us',
  partner: 'as a business partner',
  employment: 'in an employment relationship (supervisor/employer)'
};

export const PROFESSIONAL_ROLES = [
  'Lawyer',
  'Certified Public Accountant',
  'Tax Advisor',
  'Judicial Scrivener',
  'Labor Consultant',
  'Administrative Scrivener',
  'Financial Services Professional',
  'Government Officer',
  'Insurance/Wealth Planner',
  'Medical Doctor',
  'Professor',
  'Employer',
  'Other'
];

export const RELATIONSHIP_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'customer', label: 'Customer' },
  { value: 'advisor', label: 'Engaged as Professional Advisor' },
  { value: 'partner', label: 'Business Partner' },
  { value: 'employment', label: 'Employment (Supervisor/Employer)' },
];

export const TONE_OPTIONS = [
  { value: 'general', label: 'General / To Whom It May Concern' },
  { value: 'banking', label: 'Banking & KYC Emphasis' },
  { value: 'immigration', label: 'Immigration / Government Emphasis' },
  { value: 'employment', label: 'Employment / HR Emphasis' },
];
