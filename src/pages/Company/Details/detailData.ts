import api from "@/services/fetch";

export const STATUS_OPTIONS = [
    "Pending",
    "KYC Verification",
    "Waiting for Payment",
    "Waiting for Documents",
    "Waiting for Incorporation",
    "Incorporation Completed",
    "Active",
    "Good Standing",
    "Renewal in Progress",
    "Renewal Completed",
    "De-registration in Progress",
    "De-registration Completed",
    "Dormant",
    "Services Discontinued"
  ];


export const getShrMemberData = async (id: string, email: string, country:string, type:string) => {
  try{
    const response = await api.post(`incorporation/getShrMemberData`, { id, email, country, type });
    return response.data;
  }catch(e){
    console.log("Error fetching HK member data:", e);
  }
} 