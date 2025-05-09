import { useAtom } from 'jotai';
import { Task, tasksAtom, createTaskFormAtom, users, deleteTask, statusColors, priorityColors } from './mTodoStore';
import { Edit, Flag, Trash2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [sortField, setSortField] = useState<'dueDate' | 'priority' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

    const handleSort = (field: 'dueDate' | 'priority') => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (!sortField) return 0;

        const aVal = a[sortField];
        const bVal = b[sortField];

        // Handle undefined or null values
        if (!aVal) return sortOrder === 'asc' ? 1 : -1;
        if (!bVal) return sortOrder === 'asc' ? -1 : 1;

        if (sortField === 'dueDate') {
            const aDate = new Date(aVal).getTime();
            const bDate = new Date(bVal).getTime();
            return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }

        if (sortField === 'priority') {
            const priorityMap = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
            return sortOrder === 'asc'
                ? priorityMap[aVal as keyof typeof priorityMap] - priorityMap[bVal as keyof typeof priorityMap]
                : (priorityMap[bVal as keyof typeof priorityMap] - priorityMap[aVal as keyof typeof priorityMap]);
        }

        return 0;
    });
    // console.log("tasks--->", tasks)
    return (
        <>
            <div className="mt-2 rounded-md border">
                <Table className="compact-table w-full table-fixed">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="w-[80px]">Status</TableHead>
                            <TableHead className="w-auto">Task</TableHead>
                            <TableHead className="w-[100px]">Assignee</TableHead>
                            <TableHead
                                className="w-[120px] cursor-pointer"
                                onClick={() => handleSort("dueDate")}
                            >
                                <div className="flex items-center">
                                    Due Date{" "}
                                    {sortField === "dueDate" &&
                                        (sortOrder === "asc" ? (
                                            <ChevronUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        ))}
                                </div>
                            </TableHead>
                            <TableHead
                                className="w-[100px] cursor-pointer"
                                onClick={() => handleSort("priority")}
                            >
                                <div className="flex items-center">
                                    Priority{" "}
                                    {sortField === "priority" &&
                                        (sortOrder === "asc" ? (
                                            <ChevronUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        ))}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTasks.map((task) => (
                            <TableRow
                                onClick={() => handleRowClick(task)}
                                key={task._id}
                                className="h-12 cursor-pointer"
                            >
                                <TableCell className="py-1">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0.5 ${statusColors[task.status]}`}
                                    >
                                        {task.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-1">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col flex-1 min-w-0 mr-2">
                                            <span
                                                className="text-base font-semibold truncate"
                                                title={task.name}
                                            >
                                                {task.name}
                                            </span>
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
                                <TableCell className="py-1 text-xs">{renderAssignees(task.assignees)}</TableCell>
                                <TableCell className="py-1 text-sm">
                                    {task.dueDate
                                        ? format(new Date(task.dueDate), "dd MMM yyyy")
                                        : "No due date"}
                                </TableCell>
                                <TableCell className="py-1 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Flag
                                            className={`h-3 w-3 ${priorityColors[task.priority]}`}
                                            fill={"currentColor"}
                                        />
                                        <span className="text-sm">{task.priority}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-1" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex space-x-1">
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