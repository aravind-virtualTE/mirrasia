/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { PlusCircle } from 'lucide-react';
import { CreateTaskDialog } from '../MasterTodo/CreateTaskDialog';
import { useAtom } from 'jotai';

const TodoApp: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [openDialog, setOpenDialog] = useState(false);
  const [, setFormState] = useAtom(createTaskFormAtom);

  // read user from localStorage each render (optional: you could lift this up)
  const user = React.useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  // refetch tasks whenever the company changes
  useEffect(() => {
    const fetchTask = async () => {
      let filters: Record<string, any> = {};
      if (id) {
        filters = { companyId: id };
      }
      if (user?.role === "user") {
        filters.isUser = true;
      }

      const response = await getTasks(filters);
      setTasks(response);
    };

    if (id) {
      fetchTask();
    }
  }, [id, user?.role, setTasks]);

  // open create-task dialog with fresh state per company
  const createTaskAction = () => {
    const freshState = {
      ...defaultFormState,
      selectedCompany: { id, name },
    };

    setFormState(freshState);
    setOpenDialog(true);
  };

  const companyTasks = tasks?.filter((task) => task.company?.id === id) || [];

  return (
    <Card className="w-full shadow-sm border-orange-100">
      <CardContent className="p-6 ">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>

          {user?.role !== 'user' && (
            <Button
              onClick={createTaskAction}
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Create New Task
            </Button>
          )}
        </div>

        {companyTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {user?.role !== 'user'
              ? "No tasks yet. Add a new task above."
              : "No tasks yet."}
          </p>
        ) : (
          <TaskTable tasks={companyTasks} />
        )}

        <CreateTaskDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          disbleCompany={false}
        />
      </CardContent>
    </Card>
  );
};

export default TodoApp;
