import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { getTasks } from "@/pages/MasterTodo/mTodoStore";
import { useNavigate } from "react-router-dom";


const AdminTodo: React.FC = () => {

  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState<number>(0);
  useEffect(() => {
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const id = user ? user.id : ""
    // Active tasks = everything except COMPLETED. We only need the count, so pageSize: 1.
    const filters: Record<string, unknown> = { excludeStatus: 'COMPLETED', pageSize: 1 }
    if (user?.role === 'admin') filters.userId = id
    const fetchUser = async () => {
      await getTasks(filters).then((response) => {
        setActiveCount(response.pagination?.total ?? 0);
      })
    }
    fetchUser()
  }, [])

  const handleCardClick = () => {
    navigate("/MasterTodo");
  };
  return ( 
    <Card onClick={handleCardClick} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">To-do List</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Active: <span className="font-bold">{activeCount}</span>
        </span>
      </div>
    </Card>
  )
}

export default AdminTodo