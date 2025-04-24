import { User } from '@/components/userList/UsersList';
import { atom } from 'jotai';
import api from '@/services/fetch';


export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'TO DO' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED';

export interface Comment {
  _id?: string;
  text: string;
  author?:string;
  timestamp: string;
}

export interface Task {
  _id?: string;
  name: string;
  description?: string;
  assignees: {
    id?: string;
    name: string;
  }[];
  dueDate: Date | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  comments: Comment[];
  company?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  userId?: string;
}

export const tasksAtom = atom<Task[]>([]);

export const viewModeAtom = atom<'expanded' | 'grouped'>('expanded');

export interface CreateTaskFormState {
  taskName: string;
  description: string;
  comment: string;
  dueDate?: Date | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  selectedUsers: { id: string; name: string }[];
  selectedCompany: { id: string ; name: string } | undefined;
  selectedProject: { id: string  ; name: string } | undefined;
}

export const defaultFormState: CreateTaskFormState = {
  taskName: '',
  description: '',
  comment: '',
  dueDate: undefined,
  priority: 'Medium',
  status: 'TO DO',
  selectedUsers: [],
  selectedCompany: undefined,
  selectedProject: undefined
};

export const createTaskFormAtom = atom<CreateTaskFormState>(defaultFormState);

export const usersAtom = atom<User[]>([]);

export const priorities: { label: string; value: TaskPriority; color: string }[] = [
  { label: "High", value: "High", color: "text-yellow-500" },
  { label: "Medium", value: "Medium", color: "text-blue-500" },
  { label: "Low", value: "Low", color: "text-gray-500" },
  { label: "Urgent", value: "Urgent", color: "text-red-500" },
];

export const statuses: { label: TaskStatus; color: string; bgColor: string }[] = [
  { label: "TO DO", color: "text-blue-800", bgColor: "bg-blue-100" },
  { label: "IN PROGRESS", color: "text-green-800", bgColor: "bg-green-100" },
  { label: "IN REVIEW", color: "text-orange-800", bgColor: "bg-orange-100" },
  { label: "COMPLETED", color: "text-purple-800", bgColor: "bg-purple-100" },
];


export const statusColors: Record<TaskStatus, string> = {
    'TO DO': 'bg-blue-100 text-blue-800',
    'IN PROGRESS': 'bg-green-100 text-green-800',
    'IN REVIEW': 'bg-orange-100 text-orange-800',
    'COMPLETED': 'bg-purple-100 text-purple-800',
};

export const priorityColors: Record<string, string> = {
    'Low': 'text-gray-700',
    'Medium': 'text-blue-600',
    'High': 'text-yellow-500',
    'Urgent': 'text-red-600',
};

export const users = [
    { id: "1", name: "Nolan Kim" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "Alex Wong" },
    { id: "4", name: "Maria Garcia" },
    { id: "5", name: "David Lee" },
  ];
  

export const createTask = async (taskData:Task) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
  
  export const getTasks = async (filters = {}) => {
    try {
      const response = await api.get('/tasks', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };
  
  // GET a single task by ID
  export const getTaskById = async (id: string) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  };
  
  // UPDATE a task by ID
  export const updateTask = async (id:string, updates:Task) => {
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  };
  
  // DELETE a task by ID
  export const deleteTask = async (id:string) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  };