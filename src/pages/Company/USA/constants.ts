/* eslint-disable @typescript-eslint/no-explicit-any */
import { t } from "i18next";
import { FieldBase } from "../NewHKForm/hkIncorpo";
import { ReactNode } from "react";

  export interface PricingData {
    companyFormation: {
      [state: string]: {
        [entityType: string]: number | {
          basePrice: number;
          governmentLicenseFee?: number;
          newsPublishingFee?: number;
          total: number;
          note?: string;
        };
      };
    };
    // bankingServices: {
    //   [provider: string]: {
    //     accountOpening: string | number;
    //   };
    // };
  }
  
  export const pricingData: PricingData = {
    "companyFormation": {
      "Delaware": {
        "LLC": 1200,
        "Corporation": 1200
      },
      "New York": {
        "LLC": 1800,
        "Corporation": {
          "basePrice": 1800,
          "newsPublishingFee": 550,
          "total": 2350,
          "note": "In New York State, you must publish your articles of incorporation in a newspaper upon formation and submit a certificate of publication."
        }
      },
      "Wyoming": {
        "LLC": 1200,
        "Corporation": 1200
      },
      "California": {
        "LLC": {
          "basePrice": 1200,
          "governmentLicenseFee": 900,
          "total": 2100
        },
        "Corporation": 1200
      },
      "Washington": {
        "LLC": 1200,
        "Corporation": 1200
      },
      "Washington D.C.": {
        "LLC": 1200,
        "Corporation": 1200
      }
    },    
    // "bankingServices": {
    //   "Airwallex": {
    //     "accountOpening": "free"
    //   },
    //   "Payoneer": {
    //     "accountOpening": "free"
    //   },
    //   "OtherEMI": {
    //     "accountOpening": 400
    //   }
    // }
  };
  
  // export const service_list = [
  //   "Other EMI(Digital Bank) account opening arrangement",
  //   "US company formation + Company maintenance until the renewal date or anniversary date of its incorporation (standard service)",
  //   "Airwallex Account opening arrangement",
  //   "Payoneer Account opening arrangement",
  //   "Bank account opening application and advice (separate quotation after review of business documents)",
  //   "US legal opinion (separate quote after review of white paper)",
  //   "Legal opinion for listing on domestic stock exchanges (separate quote after review of white paper)",
  //   "Consulting services such as business regulatory confirmation, feasibility review, document preparation and operational advice (separate quotation)"
  // ];
  export const service_list = [
    // {
    //   id: "otherEmi",
    //   key: "usa.serviceSelection.otherEmi",
    //   price: 400,
    // },
    // {
    //   id: "usCompanyFormation",
    //   key: "usa.serviceSelection.usCompanyFormation",
    // },
    {
      id: "airwallex",
      key: "usa.serviceSelection.airwallex",
      price: 0,
    },
    {
      id: "payoneer",
      key: "usa.serviceSelection.payoneer",
      price: 0,
    },
    // {
    //   id: "bankAdvice",
    //   key: "usa.serviceSelection.bankAdvice",
    // },
    // {
    //   id: "usLegalOpinion",
    //   key: "usa.serviceSelection.usLegalOpinion",
    // },
    // {
    //   id: "stockLegalOpinion",
    //   key: "usa.serviceSelection.stockLegalOpinion",
    // },
    // {
    //   id: "consulting",
    //   key: "usa.serviceSelection.consulting",
    // },
  ];

  
  export const entity_types = [
    'LLC (limited liability company)',
    'Corporation',
    'Consultation required before proceeding'
  ];
  
  export function getEntityBasicPrice(state: string | number, entityType: string): {price : number, note?: string} | null {
    const stateData = pricingData.companyFormation[state];
    if (!stateData) return null;
  
    let entityData;
    if (entityType.includes("LLC")) {
      entityData = stateData["LLC"];
    } else if (entityType.includes("Corporation")) {
      entityData = stateData["Corporation"];
    } else {
      return null;
    }
  
    if (typeof entityData === "number") {
      return { price: entityData, note: '' } ;
    } else if (entityData) {
        // console.log("entityData",entityData)
        if(entityType.includes("Corporation")) {
            // console.log("entered")
            return entityData.note 
                ? { price: entityData.total, note: entityData.note } 
                : { price: entityData.total };
        }
        else return {price: entityData.basePrice, note: ''};
    }
    
    return null;
  }
  
  export function getEntityTotalPrice(state: string, entityType: string): number | null {
    const stateData = pricingData.companyFormation[state];
    if (!stateData) return null;
  
    let entityData;
    if (entityType.includes("LLC")) {
      entityData = stateData["LLC"];
    } else if (entityType.includes("Corporation")) {
      entityData = stateData["Corporation"];
    } else {
      return null;
    }
  
    if (typeof entityData === "number") {
      return entityData;
    } else if (entityData) {
      return entityData.total;
    }
    
    return null;
  }
  
  export function getEntityAdditionalFees(state: string, entityType: string): Record<string, number> | null {
    const stateData = pricingData.companyFormation[state];
    if (!stateData) return null;
  
    let entityData;
    if (entityType.includes("LLC")) {
      entityData = stateData["LLC"];
    } else if (entityType.includes("Corporation")) {
      entityData = stateData["Corporation"];
    } else {
      return null;
    }
  
    if (typeof entityData === "number") {
      return null;
    } else if (entityData) {
      const fees: Record<string, number> = {};
      
      if (entityData.governmentLicenseFee) {
        fees['Government License Fee'] = entityData.governmentLicenseFee;
      }
      
      if (entityData.newsPublishingFee) {
        fees['News Publishing Fee'] = entityData.newsPublishingFee;
      }
      
      return Object.keys(fees).length > 0 ? fees : null;
    }
    
    return null;
  }
  
  export function getEntityNote(state: string, entityType: string): string | null {
    const stateData = pricingData.companyFormation[state];
    if (!stateData) return null;
  
    let entityData;
    if (entityType.includes("LLC")) {
      entityData = stateData["LLC"];
    } else if (entityType.includes("Corporation")) {
      entityData = stateData["Corporation"];
    } else {
      return null;
    }
  
    if (typeof entityData === "object" && entityData.note) {
      return entityData.note;
    }
    
    return null;
  }

  export const usaList = [
    {code : "Delaware", label: t('usa.Section2StateOptions.Delaware')},
    {code : "Wyoming", label: t('usa.Section2StateOptions.Wyoming')},
    {code : "California", label: t('usa.Section2StateOptions.California')},
    {code : "Washington", label: t('usa.Section2StateOptions.Washington')},
    {code : "New York", label: t('usa.Section2StateOptions.New York')},
    {code : "Washington D.C.", label: t('usa.Section2StateOptions.Washington D.C.')},
    {code : "State of Texas", label: t('usa.Section2StateOptions.State of Texas')},
    {code : "Nevada", label: t('usa.Section2StateOptions.Nevada')},
    {code : "Florida", label: t('usa.Section2StateOptions.Florida')},
    {code : "Georgia", label: t('usa.Section2StateOptions.Georgia')},
    // t('usa.Section2StateOptions.Other'),
  ];

export type StepDefBase = {
  id: string;
  title: string;
  description?: string;
};

export type SectionDef =
  | {
      kind: "fields";
      asideTitle?: string;
      asideText?: string;
      fields: FieldBase[];
    }
  | {
      kind: "widget";
      widget: "shareholders" | "corpVsLlc";
      asideTitle?: string;
      asideText?: string;
    };

export type StepDef =
  | (StepDefBase & { type: "fields"; fields: FieldBase[] })
  | (StepDefBase & { type: "sections"; sections: SectionDef[] })
  | (StepDefBase & { type: "placeholder" })
  // NEW: render-only step (no `type` needed)
  | (StepDefBase & { render: (ctx?: any) => ReactNode });

export type FormConfig = {
  title: string;
  steps: StepDef[];
};
  