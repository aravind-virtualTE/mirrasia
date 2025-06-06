import React from "react";
import { Todo, } from "./todoAtom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { deleteTodoAtom, updateStatusAtom } from "./todoAtom";

interface TodoItemProps {
  todo: Todo;
  companyId: string;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, companyId }) => {
  const [, updateStatus] = useAtom(updateStatusAtom);
  const [, deleteTodo] = useAtom(deleteTodoAtom);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    Deadline: "bg-red-100 text-red-800 border-red-200",
    Urgent: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const handleCheck = () => {
    // console.log("todo",todo)
    updateStatus({ companyId, id: todo._id, status: todo.status === "Completed" ? "Pending" : "Completed" });
  };

  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100">
      <Checkbox checked={todo.status === "Completed"} onCheckedChange={handleCheck} className="mt-1" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${todo.status === "Completed" ? "line-through text-gray-500" : ""}`}>{todo.title}</p>
        {todo.deadline && (
          <div className="flex items-center text-xs text-gray-500 mt-0.5">
            <Calendar size={12} className="mr-1" />
            {format(new Date(todo.deadline), "dd MMM yyyy")}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[todo.status]}`}>{todo.status}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["Pending", "Processing", "Completed", "Deadline", "Urgent"] as const).map((status) => (
              <DropdownMenuItem key={status} onClick={() => updateStatus({ companyId, id: todo._id, status })}>
                Mark as {status}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => deleteTodo({ companyId, id: todo._id })} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TodoItem;