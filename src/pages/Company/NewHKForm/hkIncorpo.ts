/* eslint-disable @typescript-eslint/no-explicit-any */
import { Item } from '@/components/SearchSelect';
import api from '@/services/fetch';
import { atom } from "jotai";

export type Option = { label: string; value: string };
export type FieldBase = {
  type:
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "search-select"
  | "checkbox"
  | "checkbox-group"
  | "radio-group"
  | "derived" | "search-select-new" | "select-custom";
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
  colSpan?: 1 | 2;
  required?: boolean;
  options?: Option[];
  items?: Item[];
  defaultValue?: any;
  rows?: number;
  condition?: (form: Record<string, any>) => boolean;
  compute?: (form: Record<string, any>) => string;
};

// ---------- Complex Step Renderers
export type RenderCtx = {
  app: AppDoc;
  setApp: React.Dispatch<React.SetStateAction<AppDoc>>;
  form: any;
  setForm: (fn: (prev: any) => any) => void;
};

export type Step = {
  id: string;
  title: string;
  description?: string;
  fields?: FieldBase[];
  render?: (ctx: RenderCtx) => React.ReactNode;
};

export type FormConfig = {
  title: string;
  steps: Step[];
};



/** Share type ids used across the app */
export type ShareTypeId = "ordinary" | "preference";

export type Party = {
  name: string;
  email: string;
  phone: string;
  isCorp: boolean;
  isDirector: boolean;
  shares: number;
  invited: boolean;
  typeOfShare: ShareTypeId; // id only
  status?: string;
};

export type AppDoc = {
  stepIdx: number;
  userId:string;
  paymentStatus: string;
  form: Record<string, any>;
  parties: Party[];
  optionalFeeIds: string[];
  _id?: string;
  createdAt?: string;
  expiresAt?: string;
  updatedAt?: string;
};

/** Global HK incorporation state (null until hydrated) */
export const hkAppAtom = atom<AppDoc | null>(null);


export const getHkIncorpoData = async (id?: string) => {
  const response = await api.get(`/incorporation/hk/${id}`, );
  return response.data;
};

export const saveIncorporationData = async (data: any) => {
  const response = await api.post(`/incorporation/hk/`, data,
    //  { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};


export const updateInvoicePaymentIntent = (intentId: string, body: any) =>
  api.patch(`/incorporation/invoice-intent/${intentId}`, body).then(r => r.data);

export const notifyPaymentSuccess = async (payload: any) => {
  try {
    const res = await api.post("/incorporation/confirm-invoicePayment", payload);
    return res.data;
  } catch (err) {
    console.error("notifyPaymentSuccess error:", err);
    throw err;
  }
};

export const createInvoicePaymentIntent = async (data: any) => {
  try{
    const result = await api.post("/payment/invoice-intent-v1", data);
    return result.data;
  }catch(err){
    console.error("Error creating payment intent:", err);
  }
}

export const uploadIncorpoPaymentBankProof = async (docId: string,country:string, file: File, paymethod:string, expiresAt:string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id', docId);
  formData.append('country', country);
  formData.append('paymethod', paymethod);
  formData.append('expiresAt', expiresAt);
  const r = await api.post(`/incorporation/payment/${docId}/bank-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
}

export const deleteIncorpoPaymentBankProof = async (docId: string,country:string) => {
  const r = await api.delete(`/incorporation/payment/${docId}/bank-proof`, { data: { country } });
  return r.data;
}

export const updateCorporateInvoicePaymentIntent = async (data: any) => {
  try{
    const result = await api.post("/payment/update-intent-v1", data);
    return result.data;
  }catch(err){
    console.error("Error updating payment intent:", err);
  }
}

export const BusinessNatureList = [
  { "label": "businessIndustry.empty", "value": "000" },
  { "label": "businessIndustry.cropAnimalProduction", "value": "001" },
  { "label": "businessIndustry.forestryActivities", "value": "002" },
  { "label": "businessIndustry.fishingAndAquaculture", "value": "003" },
  { "label": "businessIndustry.miningCoalLignite", "value": "005" },
  { "label": "businessIndustry.extractionCrudePetroleumNaturalGas", "value": "006" },
  { "label": "businessIndustry.miningMetalOres", "value": "007" },
  { "label": "businessIndustry.quarryingNonMetalOres", "value": "008" },
  { "label": "businessIndustry.miningSupportServices", "value": "009" },
  { "label": "businessIndustry.manufactureFoodProducts", "value": "010" },
  { "label": "businessIndustry.manufactureBeverages", "value": "011" },
  { "label": "businessIndustry.manufactureTobaccoProducts", "value": "012" },
  { "label": "businessIndustry.manufactureTextiles", "value": "013" },
  { "label": "businessIndustry.manufactureWearingApparel", "value": "014" },
  { "label": "businessIndustry.manufactureLeatherProducts", "value": "015" },
  { "label": "businessIndustry.manufactureWoodCorkStraw", "value": "016" },
  { "label": "businessIndustry.manufacturePaperProducts", "value": "017" },
  { "label": "businessIndustry.printingMedia", "value": "018" },
  { "label": "businessIndustry.manufactureCokePetroleum", "value": "019" },
  { "label": "businessIndustry.manufactureChemicals", "value": "020" },
  { "label": "businessIndustry.manufacturePharmaceuticals", "value": "021" },
  { "label": "businessIndustry.manufactureRubberPlastics", "value": "022" },
  { "label": "businessIndustry.manufactureNonMetallicMinerals", "value": "023" },
  { "label": "businessIndustry.manufactureBasicMetals", "value": "024" },
  { "label": "businessIndustry.manufactureFabricatedMetals", "value": "025" },
  { "label": "businessIndustry.manufactureElectronics", "value": "026" },
  { "label": "businessIndustry.manufactureElectricalEquipment", "value": "027" },
  { "label": "businessIndustry.manufactureMachinery", "value": "028" },
  { "label": "businessIndustry.motorVehicleAssembly", "value": "029" },
  { "label": "businessIndustry.manufactureOtherTransport", "value": "030" },
  { "label": "businessIndustry.manufactureFurniture", "value": "031" },
  { "label": "businessIndustry.otherManufacturing", "value": "032" },
  { "label": "businessIndustry.repairMachinery", "value": "033" },
  { "label": "businessIndustry.electricityGasSupply", "value": "035" },
  { "label": "businessIndustry.waterSupply", "value": "036" },
  { "label": "businessIndustry.sewerage", "value": "037" },
  { "label": "businessIndustry.wasteManagement", "value": "038" },
  { "label": "businessIndustry.remediationServices", "value": "039" },
  { "label": "businessIndustry.constructionBuildings", "value": "041" },
  { "label": "businessIndustry.civilEngineering", "value": "042" },
  { "label": "businessIndustry.specialisedConstruction", "value": "043" },
  { "label": "businessIndustry.importExportTrade", "value": "045" },
  { "label": "businessIndustry.wholesale", "value": "046" },
  { "label": "businessIndustry.retailTrade", "value": "047" },
  { "label": "businessIndustry.landTransport", "value": "049" },
  { "label": "businessIndustry.waterTransport", "value": "050" },
  { "label": "businessIndustry.airTransport", "value": "051" },
  { "label": "businessIndustry.warehousingTransportSupport", "value": "052" },
  { "label": "businessIndustry.postalCourier", "value": "053" },
  { "label": "businessIndustry.shortTermAccommodation", "value": "055" },
  { "label": "businessIndustry.foodBeverageServices", "value": "056" },
  { "label": "businessIndustry.publishingActivities", "value": "058" },
  { "label": "businessIndustry.motionPictureAndMusic", "value": "059" },
  { "label": "businessIndustry.broadcastingActivities", "value": "060" },
  { "label": "businessIndustry.telecommunications", "value": "061" },
  { "label": "businessIndustry.itServices", "value": "062" },
  { "label": "businessIndustry.informationServices", "value": "063" },
  { "label": "businessIndustry.financialServices", "value": "064" },
  { "label": "businessIndustry.insurance", "value": "065" },
  { "label": "businessIndustry.financialAuxiliaryActivities", "value": "066" },
  { "label": "businessIndustry.realEstate", "value": "068" },
  { "label": "businessIndustry.legalAccounting", "value": "069" },
  { "label": "businessIndustry.managementConsultancy", "value": "070" },
  { "label": "businessIndustry.architectureEngineering", "value": "071" },
  { "label": "businessIndustry.scientificResearch", "value": "072" },
  { "label": "businessIndustry.veterinaryActivities", "value": "073" },
  { "label": "businessIndustry.advertisingMarketResearch", "value": "074" },
  { "label": "businessIndustry.otherProfessionalTechnical", "value": "075" },
  { "label": "businessIndustry.rentalLeasing", "value": "077" },
  { "label": "businessIndustry.employmentActivities", "value": "078" },
  { "label": "businessIndustry.travelAgency", "value": "079" },
  { "label": "businessIndustry.securityInvestigation", "value": "080" },
  { "label": "businessIndustry.buildingLandscapeServices", "value": "081" },
  { "label": "businessIndustry.officeAdminSupport", "value": "082" },
  { "label": "businessIndustry.publicAdministration", "value": "084" },
  { "label": "businessIndustry.education", "value": "085" },
  { "label": "businessIndustry.healthActivities", "value": "086" },
  { "label": "businessIndustry.residentialCare", "value": "087" },
  { "label": "businessIndustry.socialWork", "value": "088" },
  { "label": "businessIndustry.creativeArts", "value": "090" },
  { "label": "businessIndustry.culturalActivities", "value": "091" },
  { "label": "businessIndustry.themeParks", "value": "092" },
  { "label": "businessIndustry.sportsEntertainment", "value": "093" },
  { "label": "businessIndustry.membershipOrganisations", "value": "094" },
  { "label": "businessIndustry.repairServices", "value": "095" },
  { "label": "businessIndustry.personalServices", "value": "096" },
  { "label": "businessIndustry.householdEmployment", "value": "097" },
  { "label": "businessIndustry.householdProduction", "value": "098" },
  { "label": "businessIndustry.extraterritorialActivities", "value": "099" }
];
