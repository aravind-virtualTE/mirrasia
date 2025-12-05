import api from "@/services/fetch";



export const getShrMemberData = async (id: string, email: string, country:string, type:string) => {
  try{
    const response = await api.post(`incorporation/getShrMemberData`, { id, email, country, type });
    return response.data;
  }catch(e){
    console.log("Error fetching HK member data:", e);
  }
} 