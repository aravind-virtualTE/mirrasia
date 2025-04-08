import api from '@/services/fetch';

export const getNotificList = async () => {
    try {
      const response = await api.get(`company/getNotifications`);
      // console.log("response-->",response)
      return response.data;
    } catch (error) {
      console.error("Error fetching Notification list by userId:", error);
      // throw new Error('Fetching Failed For Company Incorporation List');
    }
};


export const getSignCompNames = async (id?: string) => {
  try {
    const response = await api.get(`company/getCompanySignData/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching company documents:", error);
  }  
}

export const updateNotifications = async (ids: string[]): Promise<{ message: string; modifiedCount?: number } | void> => {
    try {
        const response = await api.post('company/updateNotificationStatus', { ids });
        return response.data;
    } catch (error) {
        console.error("Error updating notifications:", error);
    }
}

export const getSwitchServicesList = async (id?: string) => {
  try {
    const response = await api.get('/switch/switch_services', {
      params: id ? { id } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching switch services:", error);
  }
};

export const createMemo = async (memoData: {
  text: string;
  author: string;
  timestamp: string;
  companyId: string;
}) => {
  const res = await api.post('/memo', memoData);
  return res.data;
};

export const getMemos = async (companyId: string) => {
  const res = await api.get(`/memo?companyId=${companyId}`);
  return res.data;
};

export const updateMemo = async (memoId: string, text: string) => {
  const res = await api.put(`/memo/${memoId}`, { text });
  return res.data;
};

export const shareMemo = async (memoId: string, personName: string) => {
  const res = await api.put(`/memo/${memoId}/share`, { personName });
  return res.data;
};