import { useAtom } from "jotai";
import { useEffect, 
  // useState 
} from "react";
// import { loadTodosAtom, todosAtom } from "../AdminTodo/adminTodoAtom";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
// import AdminTodoList from "../AdminTodo/TodoApp";
// import ToDoList from "@/pages/MasterTodo/Mtodo";
import { getTasks, tasksAtom } from "@/pages/MasterTodo/mTodoStore";
import { useNavigate } from "react-router-dom";


const AdminTodo: React.FC = () => {
  // const [open, setOpen] = useState(false)
  // const [todos] = useAtom(todosAtom);
  // const [, loadTodos] = useAtom(loadTodosAtom);
  const navigate = useNavigate();
  const [todos, setListState] = useAtom(tasksAtom);
  useEffect(() => {
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const id = user ? user.id : ""
    let filters = {}
    if (user.role === 'admin') filters = { userId: id, }
    const fetchUser = async () => {
      await getTasks(filters).then((response) => {
        // console.log("response--->", response)
        setListState(response);
      })
    }
    fetchUser()

    // loadTodos(id, user.role);
  }, [])

  const handleCardClick = () => {
    navigate("/MasterTodo");
  };
  return (
    // <Dialog open={open} onOpenChange={setOpen}>
    //   <DialogTrigger asChild>
    //     <Card onClick={() => setOpen(true)} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
    //       <div className="flex items-center justify-between">
    //         <div className="flex items-center gap-2">
    //           <ListTodo className="h-4 w-4 text-green-500" />
    //           <span className="text-sm font-medium">To-do List</span>
    //         </div>
    //         <span className="text-sm text-muted-foreground">Active: <span className="font-bold">{todos.length}</span></span>
    //       </div>
    //     </Card>
    //   </DialogTrigger>
    //   <DialogContent
    //     className="w-[70vw] h-[70vh] max-w-none flex flex-col p-0"        
    //   >
    //     <DialogHeader>
    //       <DialogTitle>To-do List</DialogTitle>
    //     </DialogHeader>
    //     {/* <AdminTodoList /> */}
    //     <ToDoList />
    //   </DialogContent>
    // </Dialog>
    <Card onClick={handleCardClick} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">To-do List</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Active: <span className="font-bold">{todos.length}</span>
        </span>
      </div>
    </Card>
  )
}

export default AdminTodo