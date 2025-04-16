import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { loadTodosAtom, todosAtom } from "../AdminTodo/adminTodoAtom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import AdminTodoList from "../AdminTodo/TodoApp";


const AdminTodo: React.FC = () => {
    const [open, setOpen] = useState(false)
      const [todos] = useAtom(todosAtom);
      const [, loadTodos] = useAtom(loadTodosAtom);
      useEffect(() =>{
         const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
        const id = user ? user.id : ""
        loadTodos(id, user.role);
      }, [])
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card onClick={() => setOpen(true)} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">To-do List</span>
              </div>
              <span className="text-sm text-muted-foreground">Active: <span className="font-bold">{todos.length}</span></span>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent
          className="w-[70vw] h-[70vh] max-w-none flex flex-col p-0"        
        >
          <DialogHeader>
            <DialogTitle>To-do List</DialogTitle>
          </DialogHeader>
          <AdminTodoList />
        </DialogContent>
      </Dialog>
    )
  }

  export default AdminTodo