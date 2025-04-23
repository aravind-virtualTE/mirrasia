import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { Layers, Plus } from "lucide-react";
import { TaskList } from "./TaskList";
import { createTaskFormAtom, defaultFormState, viewModeAtom } from "./mTodoStore";
import { CreateTaskDialog } from "./CreateTaskDialog";

const ToDoList = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [openDialog, setOpenDialog] = useState(false);
  const [, setFormState] = useAtom(createTaskFormAtom);

  const createTaskAction = () =>{
    setOpenDialog(true)
    setFormState(defaultFormState);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">To-do List</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "grouped" ? "default" : "outline"}
            onClick={() => setViewMode("grouped")}
          >
            <Layers className="mr-2 h-4 w-4" />
            Group By Status
          </Button>
          <Button
            variant={viewMode === "expanded" ? "default" : "outline"}
            onClick={() => setViewMode("expanded")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Expand
          </Button>
        </div>

        <Button onClick={createTaskAction}>          
          Create new task
        </Button>
      </div>

      <TaskList />

      <CreateTaskDialog open={openDialog} onOpenChange={setOpenDialog} />
    </div>
  );
};

export default ToDoList;