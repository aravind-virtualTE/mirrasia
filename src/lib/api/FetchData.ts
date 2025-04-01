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
  