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