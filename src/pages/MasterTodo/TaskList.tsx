// TaskList.tsx
import { useAtom } from 'jotai';
import { Task, tasksAtom, TaskStatus, viewModeAtom, createTaskFormAtom, users } from './mTodoStore';
import { Edit, Flag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format} from 'date-fns';
import { useState } from 'react';
import { CreateTaskDialog } from './CreateTaskDialog';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const statusColors: Record<TaskStatus, string> = {
    'TO DO': 'bg-blue-100 text-blue-800',
    'IN PROGRESS': 'bg-green-100 text-green-800',
    'IN REVIEW': 'bg-orange-100 text-orange-800',
    'COMPLETED': 'bg-purple-100 text-purple-800',
};

const priorityColors: Record<string, string> = {
    'Low': 'text-green-500',
    'Medium': 'text-yellow-500',
    'High': 'text-red-500',
};


const TaskTable = ({ tasks }: { tasks: Task[] }) => {
    const [, setFormState] = useAtom(createTaskFormAtom);
    const [, setAllTasks] = useAtom(tasksAtom);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

    const handleEditClick = (task: Task) => {
        setFormState({
            taskName: task.name,
            description: task.description || '',
            comment: '',
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            selectedUser: users.find((u) => u.name === task.assignee) || users[0],
        });
        setSelectedTask(task);
        setEditDialogOpen(true);
    };

    const handleDeleteTask = (id: string) => {
        setAllTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    };
    return (
        <>
            <div className="mt-4">
                <Table className="compact-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Task</TableHead>
                            <TableHead className="w-[100px]">Assignee</TableHead>
                            <TableHead className="w-[100px]">Due</TableHead>
                            <TableHead className="w-[100px]">Priority</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id} className="h-12 hover:bg-gray-50">
                                <TableCell className="py-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`text-xs ${statusColors[task.status]}`}>
                                            {task.status}
                                        </Badge>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium line-clamp-1">{task.name}</span>
                                            {task.description && (
                                                <span className="text-xs text-gray-500 line-clamp-1">{task.description}</span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {task.assignee.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="py-1 text-sm">
                                    {task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "No due date"}
                                </TableCell>
                                <TableCell className="py-1">
                                    <div className="flex items-center gap-1">
                                        <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} fill={'currentColor'} />
                                        <span className="text-sm">{task.priority}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-1">
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleEditClick(task)}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleDeleteTask(task.id)}
                                        >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {editDialogOpen && (
                <CreateTaskDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    isEditMode={true}
                    taskToEdit={selectedTask}
                />
            )}
        </>
    );
};

const GroupedTasks = ({ tasks }: { tasks: Task[] }) => {
    const statuses: TaskStatus[] = ['IN REVIEW', 'IN PROGRESS', 'TO DO', 'COMPLETED'];

    return (
        <Accordion type="multiple" className="mt-4 space-y-2">
            {statuses.map((status) => {
                const statusTasks = tasks.filter((task) => task.status === status);
                if (statusTasks.length === 0) return null;

                return (
                    <AccordionItem value={status} key={status} className="rounded-md border shadow-sm">
                        <AccordionTrigger className={`px-4 py-2 text-left font-medium ${statusColors[status]}`}>
                            {status}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2">
                            <TaskTable tasks={statusTasks} />
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
};

export const TaskList = () => {
    const [tasks] = useAtom(tasksAtom);
    const [viewMode] = useAtom(viewModeAtom);

    return viewMode === 'expanded' ? (
        <TaskTable tasks={tasks} />
    ) : (
        <GroupedTasks tasks={tasks} />
    );
};