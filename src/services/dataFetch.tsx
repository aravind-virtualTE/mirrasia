import api from "./fetch";

export const getIncorporationListByUserId = async (
    userId: string,
  ) => {
    try {
      const response = await api.get(`company/company-incorporation/user/${userId}`);
      console.log("response-->",response)
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
      console.log("response-->",response)
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