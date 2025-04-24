// import React from "react";
// import TodoList from "./TodoList";
// import { Provider } from "jotai";
// const TodoApp: React.FC<{ id: string;}> = ({id}) => {
//   return (
//     <Provider>
//         <TodoList companyId={id} />
//     </Provider>
//   );
// };
// export default TodoApp;

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { createTaskFormAtom, defaultFormState, getTasks, tasksAtom } from '../MasterTodo/mTodoStore';
import TaskTable from '../MasterTodo/TaskTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from '../MasterTodo/CreateTaskDialog';
import { useAtom } from 'jotai';
const TodoApp: React.FC<{ id: string;name:string }> = ({ id, name }) => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [openDialog, setOpenDialog] = useState(false);

  const [, setFormState] = useAtom(createTaskFormAtom);
  useEffect(() => {
    const fetchTask = async () => {
      let filters = {}
      if (id) filters = { companyId: id, }
      await getTasks(filters).then((response) => {
        setTasks(response)
      })
    }
    fetchTask()
  }, [])

  const createTaskAction = () => {
    defaultFormState.selectedCompany = {'id': id, 'name': name}
    setOpenDialog(true)
    setFormState(defaultFormState);
  }
  const companyTasks = tasks?.filter((task) => task.company?.id === id) || [];
  return (
    <Card className="w-full shadow-sm border-orange-100">
      <CardContent className="p-6 ">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
          <Button onClick={createTaskAction} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Task
          </Button>
        </div>
        {companyTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No tasks yet. Add a new task above.
          </p>
        ) : (
          <TaskTable tasks={companyTasks} />
        )}
        <CreateTaskDialog open={openDialog} onOpenChange={setOpenDialog} />
      </CardContent>
    </Card>
  )
}

export default TodoApp