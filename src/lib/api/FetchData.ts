/* eslint-disable @typescript-eslint/no-explicit-any */
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

// export const createOrUpdateMemo = async (memoData: {
//   text: string;
//   author: string;
//   timestamp: string;
//   companyId: string;
//   // userId: string
// }) => {
//   const res = await api.post('/memo', memoData); // server will handle create or push
//   return res.data;
// };

export const createOrUpdateMemo = async (formData: FormData) => {
  const res = await api.post('/memo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

export const deleteMemo = async (memoId: string, companyId: string, fileUrl: string) => {
  const res = await api.delete(`/memo/${memoId}`, {data: { companyId,fileUrl }});
  return res.data;
};

export const shareMemo = async (
  companyId: string,
  personId: string
) => {
  const res = await api.put(`/memo/${companyId}/share`, {
    personId,
  });
  return res.data;
};


export const fetchTodosByCompany = async (companyId: string) => {
  try {
    const response = await api.get(`/todo/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
};

// Add a new todo for a company
export const addTodo = async (companyId: string, todo: { title: string; deadline?: Date | null }) => {
  try {
    const response = await api.post(`/todo/${companyId}`, todo);
    return response.data;
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
};

// Update a specific todo (status, title, or deadline)
export const updateTodo = async (
  companyId: string,
  todoId: string,
  updates: Partial<{ status: string; title: string; deadline: Date | null }>
) => {
  try {
    const response = await api.patch(`/todo/${companyId}/${todoId}`, updates);
    return response.data;
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
};

// Delete a specific todo
export const deleteTodo = async (companyId: string, todoId: string) => {
  try {
    const response = await api.delete(`/todo/${companyId}/${todoId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
};

export const reqEnquiry = async ( enquiry: any) => {
  try {
    const response = await api.post(`/utility/enquiry`, enquiry);
    return response.data;
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
};