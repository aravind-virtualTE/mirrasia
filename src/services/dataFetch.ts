import { ShareHolderRegistrationForm } from "@/types/hkForm";
import api from "./fetch";
import { Company } from "@/components/companyDocumentManager/CompanyDocumentManager";

export const getIncorporationListByUserId = async (
  userId: string,
  role:string
) => {
  try {
    const response = await api.get(`company/company-incorporation/user/${userId}/${role}`);
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
    // console.log("response -->", response);
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
  country: string
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
    console.error("Error updating service Agreement Data:", error);
  }
}

export const updateEditValues = async (data: string) => {
  try {
    const response = await api.post('company/updateCompanySession', data);
    return response.data;
  } catch (error) {
    console.error("Error updating Data:", error);
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
    console.error("Error saving Data:", error);
  }
}



export const getShrDirRegData = async ( id?: string) => {
  try {
    const url = id ? `company/registerShrDir/${id}` : 'company/registerShrDir';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Data:", error);
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

export const updateUserRole = async (userId: string, newRole: string) =>{
  try {
    const response = await api.post(`user/updateUserRole`, { data: { userId, newRole } });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const getCompDocs = async (id?: string) => {
  try {
    const response = await api.get(`company/getCompanyDocs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching company documents:", error);
  }  
}


export const uploadCompanyDocs = async (companiesData : Company[]) => {
  const formData = new FormData();

  const sanitizedCompanies = companiesData.map(company => {
    return {
      ...company,
      companyDocs: company.companyDocs.map(doc => {
        const { file, ...rest } = doc;
        return rest;
      }),
       kycDocs: (company.kycDocs ?? []).map(doc => {
        const { file, ...rest } = doc;
        return rest;
      }),
      letterDocs: (company.letterDocs ?? []).map(doc => {
        const { file, ...rest } = doc;
        return rest;
      })
    };
  });

  formData.append('data', JSON.stringify(sanitizedCompanies));

  companiesData.forEach(company => {
    company.companyDocs.forEach(doc => {
      if (doc.file) {
        formData.append('companyDocs', doc.file, doc.docName);
      }
    });
     company.kycDocs?.forEach((doc) => {
      if (doc.file) {
        formData.append('kycDocs', doc.file, doc.docName);
      }
    });
     company.letterDocs?.forEach((doc) => {
      if (doc.file) {
        formData.append('letterDocs', doc.file, doc.docName);
      }
    });
  });

  try {
    const response = await api.post('company/uploadCompanyDocs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading companies data:', error);
    throw error;
  }
}


export const deleteCompanyDoc = async (data: string) =>{
  try {
    const response = await api.post(`company/deleteCompanyDoc`,data);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const getUsIncorpoDataById = async (userId: string) => {
  try {
    const response = await api.get(`company/usa-form/${userId}`);
    // console.log("response-->",response)
    return response.data;
  } catch (error) {
    console.error("Error fetching company incorporation list by userId:", error);
  }
};

export const deleteCompanyRecord = async (data: { _id: string | null;country: string}) => {
  try {
    const response = await api.post('company/deleteCompanyById',data);
    return response.data;
  } catch (error) {
    console.error("Error sending invite to significant director:", error);
  }
};

export const markDeleteCompanyRecord = async (data: { _id: string | null;country: string}) => {
  try {
    const response = await api.post('company/markDeleteCompanyById',data);
    return response.data;
  } catch (error) {
    console.error("Error sending invite to significant director:", error);
  }
};

export const getPaIncorpoDataById = async (userId: string) => {
  try {
    const response = await api.get(`company/pa-form/${userId}`);
    // console.log("response-->",response)
    return response.data;
  } catch (error) {
    console.error("Error fetching company incorporation list by userId:", error);
  }
};

export const getMultiShrDirData = async (id?: string) =>{
  try {
    const response = await api.get(`company/getMultiShrDirData/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const getShareHolderDirData = async (id: string, email : string) =>{
try {
    const response = await api.get(`company/getShareHolderDirData`, { params: { id, email } });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved data:", error);
  }
}

export const usIndividualShareholderData = async (data: any, id?: string) => {
  try {
    const url = id ? `company/registerUsIndividualShrDir/${id}` : 'company/registerUsIndividualShrDir';
    const response = await api.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving Data:", error);
  }
}

export const getUsIndividualShrDirRegData = async ( id?: string) => {
  try {
    const url = id ? `company/registerUsIndividualShrDir/${id}` : 'company/registerUsIndividualShrDir';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching  Data:", error);
  }
}