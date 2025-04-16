import { atom } from 'jotai';
import { toast } from 'sonner';
import { fetchTodosByCompany, addTodo as addTodoApi, updateTodo as updateTodoApi, deleteTodo as deleteTodoApi } from '@/lib/api/FetchData';
export type TodoStatus = "Pending" | "Processing" | "Completed" | "Deadline" | "Urgent";

export interface Todo {
  _id: string;
  title: string;
  status: TodoStatus;
  deadline: Date | null;
  createdAt: Date;
}

// Initial todos state
const initialTodos: Todo[] = [];

// Base atom for todos
export const todosAtom = atom<Todo[]>(initialTodos);

export const loadTodosAtom = atom(null, async (_get, set, companyId: string) => {
  try {
    const todos = await fetchTodosByCompany(companyId);
    set(todosAtom, todos);
  } catch (error) {
    console.log("error",error)
    toast.error("Failed to fetch todos");
  }
});

// Add a todo via API
export const addTodoAtom = atom(null, async (_get, set, { companyId, title, deadline }: { companyId: string; title: string; deadline: Date | null }) => {
  try {
    await addTodoApi(companyId, { title, deadline }); // We don't need to directly use returned todo
    const todos = await fetchTodosByCompany(companyId); // Re-fetch from server to get fresh state
    set(todosAtom, todos); // Avoid duplicate entries
    toast.success("Todo added successfully");
  } catch {
    toast.error("Failed to add todo");
  }
});

// Update a todo via API
export const updateTodoAtom = atom(null, async (get, set, { companyId, id, updates }: { companyId: string; id: string; updates: Partial<Todo> }) => {
  try {
    const updated = await updateTodoApi(companyId, id, updates);
    const updatedTodos = get(todosAtom).map((todo) => (todo._id === id ? updated : todo));
    console.log("updatedTodos",updatedTodos[0])
    set(todosAtom, updatedTodos[0]);
    toast.success("Todo updated");
  } catch(error) {
    console.log("error",error)
    toast.error("Failed to update todo");
  }
});

// Delete a todo via API
export const deleteTodoAtom = atom(null, async (get, set, { companyId, id }: { companyId: string; id: string }) => {
  try {
    await deleteTodoApi(companyId, id);
    const filtered = get(todosAtom).filter((todo) => todo._id !== id);
    set(todosAtom, filtered);
    toast.success("Todo deleted");
  } catch(error) {
    console.log("error",error)
    toast.error("Failed to delete todo");
  }
});

// Update status only
export const updateStatusAtom = atom(
  null,
  async (_get,set,{companyId,id,status,}: {
      companyId: string; id: string; status: TodoStatus; }) => {
    try {
      await updateTodoApi(companyId, id, { status });
      const todos = await fetchTodosByCompany(companyId);
      set(todosAtom, todos);
      toast.success("Todo status updated");
    } catch (error) {
      console.log("error",error)
      toast.error("Failed to update status");
    }
  }
);

// Derived atoms for todo operations
// export const addTodoAtom = atom(
//   null,
//   (get, set, params: { title: string; deadline: Date | null }) => {
//     const { title, deadline } = params;
//     const todos = get(todosAtom);
    
//     const newTodo: Todo = {
//       id: Math.random().toString(36).substr(2, 9),
//       title,
//       status: "Pending",
//       deadline,
//       createdAt: new Date()
//     };
    
//     set(todosAtom, [...todos, newTodo]);
//     toast.success("Todo added successfully");
//   }
// );

// export const updateTodoAtom = atom(
//   null,
//   (get, set, params: { id: string; updates: Partial<Todo> }) => {
//     const { id, updates } = params;
//     const todos = get(todosAtom);
    
//     const updatedTodos = todos.map((todo) => 
//       todo.id === id ? { ...todo, ...updates } : todo
//     );
    
//     set(todosAtom, updatedTodos);
//     toast.success("Todo updated successfully");
//   }
// );

// export const deleteTodoAtom = atom(
//   null,
//   (get, set, id: string) => {
//     const todos = get(todosAtom);
//     const filteredTodos = todos.filter((todo) => todo.id !== id);
    
//     set(todosAtom, filteredTodos);
//     toast.success("Todo deleted successfully");
//   }
// );

// export const updateStatusAtom = atom(
//   null,
//   (get, set, params: { id: string; status: TodoStatus }) => {
//     const { id, status } = params;
//     const todos = get(todosAtom);
    
//     const updatedTodos = todos.map((todo) => 
//       todo.id === id ? { ...todo, status } : todo
//     );
    
//     set(todosAtom, updatedTodos);
//     toast.success(`Status updated to ${status}`);
//   }
// );

// {
//   id: "1",
//   title: "Contact HSBC whether this client can open a bank account",
//   status: "Pending",
//   deadline: new Date("2025-04-15"),
//   createdAt: new Date()
// },
// {
//   id: "2",
//   title: "Complete the financial statements before 31 Apr 2025",
//   status: "Processing",
//   deadline: new Date("2025-04-31"),
//   createdAt: new Date()
// },
// {
//   id: "3",
//   title: "Notify this client regarding the process of incorporation procedures for its subsidiary",
//   status: "Completed",
//   deadline: new Date("2025-03-15"),
//   createdAt: new Date()
// }
