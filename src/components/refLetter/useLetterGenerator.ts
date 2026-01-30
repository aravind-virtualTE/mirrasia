import { useState, useCallback } from 'react';
import { CLAIM_SETS, RELATIONSHIP_MAP } from './claimSets';

export interface FormData {
  app_name: string;
  app_dob: string;
  app_email: string;
  app_phone: string;
  ref_name: string;
  ref_role: string;
  ref_company: string;
  ref_relationship: string;
  ref_site: string;
  ref_phone: string;
  ref_email: string;
  ref_address: string;
  years: string;
  tone: string;
  customText: string;
  twoColumn: boolean;
}

export interface LetterSection {
  title: string;
  html: string;
}

export interface GeneratedLetter {
  opening: string;
  sections: LetterSection[];
  signature: {
    name: string;
    role: string;
    company: string;
    address?: string;
    phone?: string;
    email?: string;
    site?: string;
  };
}

const initialFormData: FormData = {
  app_name: '',
  app_dob: '',
  app_email: '',
  app_phone: '',
  ref_name: '',
  ref_role: 'Lawyer',
  ref_company: '',
  ref_relationship: 'client',
  ref_site: '',
  ref_phone: '',
  ref_email: '',
  ref_address: '',
  years: '',
  tone: 'general',
  customText: '',
  twoColumn: false,
};

export function useLetterGenerator() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);

  const updateField = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleClaim = useCallback((key: string) => {
    setSelectedClaims(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setSelectedClaims(new Set());
    setGeneratedLetter(null);
  }, []);

  const generateLetter = useCallback(() => {
    const ctx = {
      app_name: formData.app_name || 'Applicant Name',
      app_dob: formData.app_dob,
      years: formData.years || '2',
    };

    const relPhrase = RELATIONSHIP_MAP[formData.ref_relationship] || RELATIONSHIP_MAP.client;
    const refName = formData.ref_name || 'Referee Name';
    const refRole = formData.ref_role;
    const refCompany = formData.ref_company || 'Company / Chambers / Office';

    // Build opening based on tone
    let opening = '';
    const dobPart = ctx.app_dob ? ` (born ${ctx.app_dob})` : '';

    switch (formData.tone) {
      case 'banking':
        opening = `I, ${refName}, ${refRole} at ${refCompany}, provide this professional reference for ${ctx.app_name}${dobPart} for banking and customer due diligence purposes.`;
        break;
      case 'immigration':
        opening = `I, ${refName}, ${refRole} at ${refCompany}, hereby provide a professional reference in support of ${ctx.app_name}${dobPart}.`;
        break;
      case 'employment':
        opening = `I, ${refName}, ${refRole} at ${refCompany}, submit this professional reference regarding ${ctx.app_name}${dobPart}.`;
        break;
      default:
        opening = `I, ${refName}, ${refRole} at ${refCompany}, am pleased to provide this professional reference for ${ctx.app_name}${dobPart}.`;
    }

    // Collect selected statements
    const picked: string[] = [];
    selectedClaims.forEach(key => {
      const [i, j] = key.split(':').map(Number);
      picked.push(CLAIM_SETS[i].items[j].en(ctx));
    });

    // Categorize statements
    const themed: Record<string, string[]> = {
      'Professional Capability': [],
      'Communication & Collaboration': [],
      'Ethics & Compliance': [],
      'Results & Impact': [],
      'Character & Standing': [],
    };

    picked.forEach(s => {
      if (/KYC|AML|confidential|compliance|tax|contractual/i.test(s)) {
        themed['Ethics & Compliance'].push(s);
      } else if (/communicat|stakeholder|conflict|team|lead/i.test(s)) {
        themed['Communication & Collaboration'].push(s);
      } else if (/KPI|outcome|result|improvement|control/i.test(s)) {
        themed['Results & Impact'].push(s);
      } else if (/law-abiding|criminal|recommend|reliable|citizen|accessible/i.test(s)) {
        themed['Character & Standing'].push(s);
      } else {
        themed['Professional Capability'].push(s);
      }
    });

    // Build sections
    const sections: LetterSection[] = [
      {
        title: 'BACKGROUND & TENURE',
        html: `I have known ${ctx.app_name} for more than ${ctx.years} year(s) ${relPhrase}. During this period I have engaged with ${ctx.app_name} in a regular professional capacity through my role at ${refCompany}.`
      }
    ];

    ['Professional Capability', 'Communication & Collaboration', 'Ethics & Compliance', 'Results & Impact', 'Character & Standing'].forEach(title => {
      if (themed[title].length > 0) {
        sections.push({ title: title.toUpperCase(), html: themed[title].join(' ') });
      }
    });

    if (formData.customText.trim()) {
      sections.push({ title: 'ADDITIONAL NOTES', html: formData.customText.trim() });
    }

    setGeneratedLetter({
      opening,
      sections,
      signature: {
        name: refName,
        role: refRole,
        company: refCompany,
        address: formData.ref_address || undefined,
        phone: formData.ref_phone || undefined,
        email: formData.ref_email || undefined,
        site: formData.ref_site || undefined,
      }
    });
  }, [formData, selectedClaims]);

  return {
    formData,
    updateField,
    selectedClaims,
    toggleClaim,
    generatedLetter,
    generateLetter,
    reset,
  };
}
