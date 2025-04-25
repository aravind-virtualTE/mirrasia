import { useAtom } from 'jotai';
import { Task, tasksAtom, createTaskFormAtom, users, deleteTask, statusColors, priorityColors } from './mTodoStore';
import { Edit, Flag, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import TaskDetailPopup from './TaskDetailPopup';

const TaskTable = ({ tasks }: { tasks: Task[] }) => {
    const [, setFormState] = useAtom(createTaskFormAtom);
    const [, setAllTasks] = useAtom(tasksAtom);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [popupTask, setPopupTask] = useState<Task | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const handleEditClick = (task: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        const assigneeNames = task.assignees.map(a => a.name);
        const selectedUserObjects = users.filter(user => assigneeNames.includes(user.name));

        setFormState({
            taskName: task.name,
            description: task.description || '',
            comment: '',
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            selectedUsers: selectedUserObjects,
            selectedCompany: task.company,
            selectedProject: task.project
        });
        setSelectedTask(task);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (task: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        setTaskToDelete(task);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete?._id) {
            await deleteTask(taskToDelete._id);
            setAllTasks((prevTasks: Task[]) =>
                prevTasks.filter((task) => task._id !== taskToDelete._id)
            );
        }
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
    };

    const handleRowClick = (task: Task) => {
        setPopupTask(task);
    };

    const renderAssignees = (assigneeNames: { id?: string; name: string }[]) => {
        const MAX_AVATARS = 3;
        if (assigneeNames.length === 0) return null;

        const tooltipText = assigneeNames.map((a) => a.name).join(", ");

        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            {assigneeNames.slice(0, MAX_AVATARS).map((item, index) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                    <AvatarFallback className="text-xs">
                                        {item.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}

                            {assigneeNames.length > MAX_AVATARS && (
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium text-gray-500 border-2 border-white">
                                    +{assigneeNames.length - MAX_AVATARS}
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs break-words">
                        {tooltipText}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    if (tasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>No To-do tasks available</p>
            </div>
        )
    }
    // console.log("tasks--->", tasks)
    return (
        <>
            <div className="mt-2 rounded-md border">
                <Table className="compact-table">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="w-[5px]">Status</TableHead>
                            <TableHead className="w-[300px]">Task</TableHead>
                            <TableHead className="w-[80px]">Assignee</TableHead>
                            <TableHead className="w-[80px]">Due Date</TableHead>
                            <TableHead className="w-[80px]">Priority</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow
                                onClick={() => handleRowClick(task)}
                                key={task._id}
                                className="h-12 cursor-pointer">
                                <TableCell className="py-1 max-w-[5px]">
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusColors[task.status]}`}>
                                        {task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-1 max-w-[300px]">
                                    <div className="flex items-center justify-between w-full ">
                                        <div className="flex flex-col flex-1 min-w-0 mr-2">
                                            <span
                                                className="text-base font-semibold truncate"
                                                title={task.name} 
                                            >
                                                {task.name}
                                            </span>
                                            {task.description && (
                                                <span
                                                    className="text-sm text-gray-500 truncate"
                                                    title={task.description} 
                                                >
                                                    {task.description}
                                                </span>
                                            )}
                                        </div>
                                        {task.company?.name && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] px-1.5 py-0.5 flex-shrink-0"
                                            >
                                                {task.company.name}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-1">
                                    {renderAssignees(task.assignees)}
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
                                <TableCell className="py-1" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-1 cursor-pointer">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => handleEditClick(task, e)}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => handleDeleteClick(task, e)}
                                        >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleRowClick(task)}
                                        >
                                            <MessageCircle className="h-3 w-3 text-green-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Delete Task"
                    description={
                        <>
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-red-600">{taskToDelete?.name}</span>?
                        </>
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={confirmDelete}
                />
            </div>

            {/* Task Detail Popup */}
            {popupTask && (
                <TaskDetailPopup
                    taskId={popupTask?._id ?? null}
                    onClose={() => setPopupTask(null)}
                />
            )}

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

export default TaskTable