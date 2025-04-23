// mTodoStore.ts
import { atom } from 'jotai';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'TO DO' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED';

export interface Comment {
  id: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  assignee: string;
  dueDate: Date | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  comments: Comment[];
}

export const tasksAtom = atom<Task[]>([
  {
    id: '1',
    name: 'Lorem ipsum dolor sit amet',
    assignee: 'US1',
    dueDate: new Date(),
    priority: 'Medium',
    status: 'IN REVIEW',
    comments: [],
  },
  {
    id: '2',
    name: 'Lorem ipsum dolor sit amet',
    assignee: 'US2',
    dueDate: new Date('2025-04-10'),
    priority: 'Medium',
    status: 'IN REVIEW',
    comments: [],
  },
  {
    id: '3',
    name: 'Lorem ipsum dolor sit amet',
    assignee: 'US1',
    dueDate: new Date('2025-04-18'),
    priority: 'Medium',
    status: 'IN PROGRESS',
    comments: [],
  },
  {
    id: '4',
    name: 'Lorem ipsum dolor sit amet',
    assignee: 'US2',
    dueDate: new Date('2025-04-25'),
    priority: 'Low',
    status: 'TO DO',
    comments: [],
  },
]);

export const viewModeAtom = atom<'expanded' | 'grouped'>('expanded');

export interface CreateTaskFormState {
  taskName: string;
  description: string;
  comment: string;
  dueDate?: Date  | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  selectedUser: { id: string; name: string };
}

export const users = [
  { id: "1", name: "Nolan Kim" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Alex Wong" },
  { id: "4", name: "Maria Garcia" },
  { id: "5", name: "David Lee" },
];

export const defaultFormState: CreateTaskFormState = {
  taskName: '',
  description: '',
  comment: '',
  dueDate: new Date(),
  priority: 'Medium',
  status: 'TO DO',
  selectedUser: users[0], // Default to the first user
};

export const createTaskFormAtom = atom<CreateTaskFormState>(defaultFormState);

export const priorities: { label: string; value: TaskPriority; color: string }[] = [
  { label: "High", value: "High", color: "text-red-500" },
  { label: "Medium", value: "Medium", color: "text-yellow-500" },
  { label: "Low", value: "Low", color: "text-green-500" },
];

export const statuses: { label: TaskStatus; color: string; bgColor: string }[] = [
  { label: "TO DO", color: "text-blue-800", bgColor: "bg-blue-100" },
  { label: "IN PROGRESS", color: "text-green-800", bgColor: "bg-green-100" },
  { label: "IN REVIEW", color: "text-orange-800", bgColor: "bg-orange-100" },
  { label: "COMPLETED", color: "text-purple-800", bgColor: "bg-purple-100" },
];