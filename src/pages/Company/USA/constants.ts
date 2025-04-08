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
  
  export const service_list = [
    "US company formation + Company maintenance until the renewal date or anniversary date of its incorporation (standard service)",
    // "EMI (Electronic Money Institution) list provided (free to customers who use Mirr Asia's service)",
    // "EMI (Electronic Money Institution) account opening application and advice (separate quote after review of business documents)",
    "Bank account opening application and advice (separate quotation after review of business documents)",
    "US legal opinion (separate quote after review of white paper)",
    "Legal opinion for listing on domestic stock exchanges (separate quote after review of white paper)",
    "Consulting services such as business regulatory confirmation, feasibility review, document preparation and operational advice (separate quotation)"
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
        console.log("entityData",entityData)
        if(entityType.includes("Corporation")) {
            console.log("entered")
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