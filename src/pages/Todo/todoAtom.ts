import { atom } from 'jotai';
import { toast } from 'sonner';

export type TodoStatus = "Pending" | "Processing" | "Completed" | "Deadline";

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  deadline: Date | null;
  createdAt: Date;
}

// Initial todos state
const initialTodos: Todo[] = [
  {
    id: "1",
    title: "Contact HSBC whether this client can open a bank account",
    status: "Pending",
    deadline: new Date("2025-04-15"),
    createdAt: new Date()
  },
  {
    id: "2",
    title: "Complete the financial statements before 31 Apr 2025",
    status: "Processing",
    deadline: new Date("2025-04-31"),
    createdAt: new Date()
  },
  {
    id: "3",
    title: "Notify this client regarding the process of incorporation procedures for its subsidiary",
    status: "Completed",
    deadline: new Date("2025-03-15"),
    createdAt: new Date()
  }
];

// Base atom for todos
export const todosAtom = atom<Todo[]>(initialTodos);

// Derived atoms for todo operations
export const addTodoAtom = atom(
  null,
  (get, set, params: { title: string; deadline: Date | null }) => {
    const { title, deadline } = params;
    const todos = get(todosAtom);
    
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      status: "Pending",
      deadline,
      createdAt: new Date()
    };
    
    set(todosAtom, [...todos, newTodo]);
    toast.success("Todo added successfully");
  }
);

export const updateTodoAtom = atom(
  null,
  (get, set, params: { id: string; updates: Partial<Todo> }) => {
    const { id, updates } = params;
    const todos = get(todosAtom);
    
    const updatedTodos = todos.map((todo) => 
      todo.id === id ? { ...todo, ...updates } : todo
    );
    
    set(todosAtom, updatedTodos);
    toast.success("Todo updated successfully");
  }
);

export const deleteTodoAtom = atom(
  null,
  (get, set, id: string) => {
    const todos = get(todosAtom);
    const filteredTodos = todos.filter((todo) => todo.id !== id);
    
    set(todosAtom, filteredTodos);
    toast.success("Todo deleted successfully");
  }
);

export const updateStatusAtom = atom(
  null,
  (get, set, params: { id: string; status: TodoStatus }) => {
    const { id, status } = params;
    const todos = get(todosAtom);
    
    const updatedTodos = todos.map((todo) => 
      todo.id === id ? { ...todo, status } : todo
    );
    
    set(todosAtom, updatedTodos);
    toast.success(`Status updated to ${status}`);
  }
);