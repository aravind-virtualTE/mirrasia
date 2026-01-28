import api from '@/services/fetch';
import { atom } from "jotai"

// Define the task interface
export interface Task {
  _id?: string
  label: string
  completed: boolean
  timestamp?: string
  userid?: string
}

// Define the data structure
export interface FormData {
  _id?: string
  companyId : string
  incorporation: {
    tasks: Task[]
  }
  renewal: {
    years: Record<
      string,
      {
        tasks: Task[]
      }
    >
  },
  miscellaneous: {
    tasks: Task[]
  }
}


export const formDataAtom = atom<FormData>({
  incorporation: {
    tasks: [],
  },
  'companyId': "",
  renewal: {
    years: {
      "2025": {
        tasks: [
          
        ],
      },
    },
  },
   miscellaneous: {
    tasks: [],
  },
})


export const createCheckList = async (taskData:FormData) => {
    try {
      const response = await api.post('/checkList', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
  
  export const getCheckList = async (filters = {}) => {
    try {
      const response = await api.get('/checkList', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };