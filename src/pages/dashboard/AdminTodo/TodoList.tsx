import React, { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Todo, updateStatusAtom, deleteTodoAtom, reassignTodoAtom } from "./adminTodoAtom";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import TodoForm from "./TodoForm";
import { useAtom } from "jotai";
import { todosAtom, loadTodosAtom } from "./adminTodoAtom";
import { User } from "@/components/userList/UsersList";
import { Calendar, MoreVertical, Trash2 } from "lucide-react";


const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Processing: "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Deadline: "bg-red-100 text-red-800 border-red-300",
  Urgent: "bg-purple-100 text-purple-800 border-purple-200",
};

interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  provider: string;
  picture: string;
  role: "master" | "user" | "admin"; // Adjust roles as per your application
  emailVerified: boolean;
  lastLogin: string;
}

const TodoList: React.FC<{ userId: string, currentUser: CurrentUser, users: User[] }> = ({ userId, currentUser, users }) => {
  const [todos] = useAtom(todosAtom);
  const [, loadTodos] = useAtom(loadTodosAtom);
  const [, updateStatus] = useAtom(updateStatusAtom);
  const [, deleteTodo] = useAtom(deleteTodoAtom);
  const [, reAssignTodoByMaster] = useAtom(reassignTodoAtom);

  useEffect(() => {
    loadTodos(userId, currentUser.role);
  }, [userId, currentUser.role, loadTodos]);

  const isMaster = currentUser?.role === "master";

  const handleCheck = (todo: Todo) => {
    updateStatus({
      userId,
      role: currentUser.role,
      id: todo._id,
      status: todo.status === "Completed" ? "Pending" : "Completed",
      docId: todo.docId || ""
    });
  };

  const handleReassign = (todoId: string, fromId: string) => async (toUserId: string) => {
    if (!isMaster) return;
    try {
      await reAssignTodoByMaster({
        fromUserId: fromId,
        todoId: todoId,
        toUserId: toUserId,
        role: currentUser.role,
      });
    } catch (error) {
      console.error("Error reassigning todo", error);
    }
  };
  return (
    <Card className="w-full h-full shadow-sm border-orange-100">
      <CardContent className="pt-4">
        <TodoForm userId={userId} role={currentUser.role} />
        <div className="space-y-0">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No tasks yet. Add a new task above.
            </p>
          ) : (
            todos.map((todo) => (
              <div className="flex items-start gap-2 py-2 border-b border-gray-100" key={todo._id}>
                <Checkbox
                  checked={todo.status === "Completed"}
                  onCheckedChange={() => handleCheck(todo)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  {/* Title and Select in a row */}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm ${todo.status === "Completed" ? "line-through text-gray-500" : ""
                        }`}
                    >
                      {todo.title}
                    </p>

                    {/* Show reassignment dropdown only to master */}
                    {isMaster && (
                      <Select
                        onValueChange={handleReassign(todo._id, todo.userId || "")}
                        value={todo.userId}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue placeholder="Reassign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u._id} value={u._id || ""}>
                              {u.fullName || u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Deadline below title */}
                  {todo.deadline && (
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <Calendar size={12} className="mr-1" />
                      {format(new Date(todo.deadline), "dd MMM yyyy")}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[todo.status]
                      }`}
                  >
                    {todo.status}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(
                        [
                          "Pending",
                          "Processing",
                          "Completed",
                          "Deadline",
                          "Urgent",
                        ] as const
                      ).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            updateStatus({
                              userId,
                              role: currentUser.role,
                              id: todo._id,
                              status,
                              docId: todo.docId || ""
                            })
                          }
                        >
                          Mark as {status}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() => deleteTodo({ userId, id: todo._id })}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
