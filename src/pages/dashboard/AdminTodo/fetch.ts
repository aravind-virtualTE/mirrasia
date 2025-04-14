import api from '@/services/fetch';


export const fetchTodosByUserId = async (userId: string, role: string) => {
    try {
      const response = await api.get(`/adminTodo/${userId}?role=${role}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  };
  
  // Add a new todo for a userId
  export const addTodo = async (userId: string, todo: { title: string; deadline?: Date | null }) => {
    try {
      const response = await api.post(`/adminTodo/${userId}`, todo);
      return response.data;
    } catch (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  };
  
  // Update a specific todo (status, title, or deadline)
  export const updateTodo = async (
    userId: string,
    todoId: string,
    updates: Partial<{ status: string; title: string; deadline: Date | null }>
  ) => {
    try {
      const response = await api.patch(`/adminTodo/${userId}/${todoId}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  };
  
  // Delete a specific todo
  export const deleteTodo = async (userId: string, todoId: string) => {
    try {
      const response = await api.delete(`/adminTodo/${userId}/${todoId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  };

  export const reassignTodo = async (fromUserId: string, todoId: string, toUserId: string) => {
    try {
      const response = await api.post(`/adminTodo/reassign/${fromUserId}/${todoId}/${toUserId}`);
      return response.data;
    } catch (error) {
      console.error("Error reassigning todo:", error);
      throw error;
    }
  };
  