import { atom } from 'jotai';
import { toast } from 'sonner';
import { fetchTodosByUserId, addTodo as addTodoApi, updateTodo as updateTodoApi, deleteTodo as deleteTodoApi,reassignTodo } from './fetch';
export type TodoStatus = "Pending" | "Processing" | "Completed" | "Deadline";

export interface Todo {
  _id: string;
  title: string;
  status: TodoStatus;
  deadline: Date | null;
  createdAt: Date;
  userId?: string;
}

// Initial todos state
const initialTodos: Todo[] = [];

// Base atom for todos
export const todosAtom = atom<Todo[]>(initialTodos);

export const loadTodosAtom = atom(
    null,
    async (_get, set, userId: string, role: "master" | "user" | "admin") => {
      try {
        const todos = await fetchTodosByUserId(userId, role);
        set(todosAtom, todos);
      } catch (error) {
        console.log("error", error);
        toast.error("Failed to fetch todos");
      }
    }
  );

// Add a todo via API
export const addTodoAtom = atom(null, async (_get, set, { userId, role, title, deadline }: { userId: string;role:string; title: string; deadline: Date | null }) => {
  try {
    await addTodoApi(userId, { title, deadline }); // We don't need to directly use returned todo
    const todos = await fetchTodosByUserId(userId,role); // Re-fetch from server to get fresh state
    set(todosAtom, todos); // Avoid duplicate entries
    toast.success("Todo added successfully");
  } catch {
    toast.error("Failed to add todo");
  }
});

// Update a todo via API
export const updateTodoAtom = atom(null, async (get, set, { userId, id, updates }: { userId: string; id: string; updates: Partial<Todo> }) => {
  try {
    const updated = await updateTodoApi(userId, id, updates);
    const updatedTodos = get(todosAtom).map((todo) => (todo._id === id ? updated : todo));
    // console.log("updatedTodos",updatedTodos[0])
    set(todosAtom, updatedTodos[0]);
    toast.success("Todo updated");
  } catch(error) {
    console.log("error",error)
    toast.error("Failed to update todo");
  }
});

// Delete a todo via API
export const deleteTodoAtom = atom(null, async (get, set, { userId, id }: { userId: string; id: string }) => {
  try {
    await deleteTodoApi(userId, id);
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
  async (_get,set,{userId,role,id,status,}: {
      userId: string;role:string; id: string; status: TodoStatus; }) => {
    try {
      await updateTodoApi(userId, id, { status });
      const todos = await fetchTodosByUserId(userId,role);
      set(todosAtom, todos);
      toast.success("Todo status updated");
    } catch (error) {
      console.log("error",error)
      toast.error("Failed to update status");
    }
  }
);


export const reassignTodoAtom = atom(
    null,
    async (_get, set, {
      fromUserId,
      todoId,
      toUserId,
      role
    }: {
      fromUserId: string;
      todoId: string;
      toUserId: string;
      role: string
    }) => {
      try {
        await reassignTodo(fromUserId, todoId, toUserId);
  
        // Optionally fetch todos for both users (if you show both lists somewhere)
        const updatedFromUserTodos = await fetchTodosByUserId(fromUserId,role);
        console.log("updatedFromUserTodos",updatedFromUserTodos)
        set(todosAtom, updatedFromUserTodos); // You can manage per-user atom separately if needed
  
        toast.success("Todo reassigned successfully");
      } catch (error) {
        console.error("Error reassigning todo:", error);
        toast.error("Failed to reassign todo");
      }
    }
  );