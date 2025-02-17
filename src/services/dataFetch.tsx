import { ShareHolderRegistrationForm } from "@/types/hkForm";
import api from "./fetch";

export const getIncorporationListByUserId = async (
  userId: string,
) => {
  try {
    const response = await api.get(`company/company-incorporation/user/${userId}`);
    // console.log("response-->",response)
    return response.data;
  } catch (error) {
    console.error("Error fetching company incorporation list by userId:", error);
    // throw new Error('Fetching Failed For Company Incorporation List');
  }
};

export const getIncorporationListByCompId = async (
  id: string,
) => {
  try {
    const response = await api.get(`company/company-incorporation/company/${id}`);
    // console.log("response-->",response)
    return response.data;
  } catch (error) {
    console.error("Error fetching company incorporation data by compId.", error);
    // throw new Error('Fetching Failed For Company Incorporation List');
  }
};


export const getIncorporationList = async () => { // country, companyStatus
  try {
    const response = await api.get('company/company-incorporation', {
      // params: { country, companyStatus },
    });
    console.log("response -->", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching company incorporation list with filters:", error);
    throw new Error('Fetching Failed For Company Incorporation List');
  }
};

export const getPdfDoc = async (id: string) => {
  try {
    const response = await api.get(`pdf/generate-pdf?docId=${id}`);
    console.log("generateResponse-->", response)
    return response.data;
  } catch (error) {
    console.error("Error fetching PDF:", error);
  }
}

interface InviteData {
  name: string;
  email: string;
}
interface SendInviteData {
  _id: string | null;
  inviteData: InviteData[];
}

export const sendInviteToShDir = async (data: SendInviteData) => {
  try {
    const response = await api.post('user/send-invite', data);
    return response.data;
  } catch (error) {
    console.error("Error sending invite to significant director:", error);
  }
};

export const getSavedServiceAggrmtData = async (id: string) => {
  try {
    const response = await api.get(`company/service-agreement/${id}`);
    // console.log("response -->", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching service Agreement Data:", error);
    throw new Error('Fetching Failed For service Agreement Data');
  }
};

export const fetchSavedServiceAggrmtData = async (id: string) => {
  try {
    const response = await api.get(`company/serviceAgreement/${id}`, {
      params: { 'test': 'test' },
    });
    console.log("response -->", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching service Agreement Data:", error);
    throw new Error('Fetching Failed For service Agreement Data');
  }
};

export const saveServiceAgreementData = async (data: string) => {
  try {
    const response = await api.post('company/service-agreement', data);
    return response.data;
  } catch (error) {
    console.error("Error saving service Agreement Data:", error);
  }
}

export const updateServiceAgreementData = async (data: string) => {
  try {
    const response = await api.post('company/update-service-agreement', data);
    return response.data;
  } catch (error) {
    console.error("Error saving service Agreement Data:", error);
  }
}

export const updateEditValues = async (data: string) => {
  try {
    const response = await api.post('company/updateCompanySession', data);
    return response.data;
  } catch (error) {
    console.error("Error saving service Agreement Data:", error);
  }
}


export const saveShrDirRegData = async (data: ShareHolderRegistrationForm, id?: string) => {
  try {
    const url = id ? `company/registerShrDir/${id}` : 'company/registerShrDir';
    const response = await api.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving service Agreement Data:", error);
  }
}



export const getShrDirRegData = async ( id?: string) => {
  try {
    const url = id ? `company/registerShrDir/${id}` : 'company/registerShrDir';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error saving service Agreement Data:", error);
  }
}

export const getShrDirSavedData = async (id?: string) =>{
  try {
    const response = await api.get(`company/getshrdirdata/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const fetchUsers = async () =>{
  try {
    const response = await api.get(`user/getUsers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const addUser = async (data: string) =>{
  try {
    const response = await api.post(`user/addUser`, data);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const updateUsers = async () =>{
  try {
    const response = await api.get(`user/updateUsers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}