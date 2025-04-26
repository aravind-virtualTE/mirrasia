import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { createTaskFormAtom, defaultFormState, getTasks, tasksAtom } from '@/pages/MasterTodo/mTodoStore';
import TaskTable from '@/pages/MasterTodo/TaskTable';
import { CreateTaskDialog } from '@/pages/MasterTodo/CreateTaskDialog';

const ProjectsTask: React.FC<{id: string, name:string}> = ({id, name}) => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [openDialog, setOpenDialog] = useState(false);

  const [, setFormState] = useAtom(createTaskFormAtom);
  useEffect(() => {
    const fetchTask = async () => {
      const filters = {isProject: true}      
      await getTasks(filters).then((response) => {
        setTasks(response)
      })
    }
    fetchTask()
  }, [])

  const createTaskAction = () => {
    defaultFormState.isProject = true
    defaultFormState.selectedProject = {'id': id, 'name': name}
    setOpenDialog(true)
    setFormState(defaultFormState);
  }

  const projectsTasks = tasks?.filter((task) => task.project?.id == id) || [];
  return (
    <Card className="w-full shadow-sm border-orange-100">
      <CardContent className="p-6 ">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
          <Button onClick={createTaskAction} size="sm" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Task
          </Button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No tasks yet. Add a new task above.
          </p>
        ) : (
          <TaskTable tasks={projectsTasks} />
        )}
        <CreateTaskDialog open={openDialog} onOpenChange={setOpenDialog} disbleProject={false}/>
      </CardContent>
    </Card>
  )
}

export default ProjectsTask