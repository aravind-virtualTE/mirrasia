// TaskList.tsx
import { useAtom } from 'jotai';
import { Task, tasksAtom, TaskStatus, viewModeAtom, createTaskFormAtom, users, deleteTask } from './mTodoStore';
import { Edit, Flag, Trash2, X } from 'lucide-react';
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

// Task Detail Popup Component
const TaskDetailPopup = ({ task, onClose }: { task: Task | null, onClose: () => void }) => {
    if (!task) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
            <div className="absolute inset-0 bg-black opacity-20" />
            <div
                className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={`text-xs px-2 py-1 ${statusColors[task.status]}`}>
                        {task.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <h3 className="text-xl font-semibold mb-2">{task.name}</h3>

                <div className="space-y-4">
                    {task.description && (
                        <div className="max-w-full">
                            <p className="text-sm text-gray-700 whitespace-normal break-words">
                                {task.description}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Priority:</span>
                        <div className="flex items-center gap-1">
                            <Flag className={`h-4 w-4 ${priorityColors[task.priority]}`} fill={'currentColor'} />
                            <span className="text-sm">{task.priority}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-sm font-medium">Due date:</span>
                        <span className="text-sm ml-2">
                            {task.dueDate ? format(new Date(task.dueDate), "dd MMMM yyyy") : "No due date"}
                        </span>
                    </div>

                    {task.assignees.length > 0 && (
                        <div>
                            <span className="text-sm font-medium">Assignees:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {task.assignees.map((assignee, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {assignee.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{assignee.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.comments && task.comments.length > 0 && (
                        <div>
                            <span className="text-sm font-medium">Comments:</span>
                            <div className="mt-1 space-y-2">
                                {task.comments.map((comment, index) => (
                                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                        {typeof comment === 'string' ? comment : JSON.stringify(comment)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TaskTable = ({ tasks }: { tasks: Task[] }) => {
    const [, setFormState] = useAtom(createTaskFormAtom);
    const [, setAllTasks] = useAtom(tasksAtom);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [popupTask, setPopupTask] = useState<Task | null>(null);

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
        });
        setSelectedTask(task);
        setEditDialogOpen(true);
    };

    const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click from triggering
        await deleteTask(id);
        setAllTasks((prevTasks: Task[]) => prevTasks.filter((task) => task._id !== id));
    };

    // const handleRowClick = (task: Task) => {
    //     setPopupTask(task);
    // };

    const renderAssignees = (assigneeNames: { _id?: string, name: string }[]) => {
        const MAX_AVATARS = 3;
        if (assigneeNames.length === 0) return null;
        return (
            <div className="flex items-center -space-x-2">
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
        );
    };

    return (
        <>
            <div className="mt-4">
                <Table className="compact-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Task</TableHead>
                            <TableHead className="w-[100px]">Assignee</TableHead>
                            <TableHead className="w-[100px]">Due Date</TableHead>
                            <TableHead className="w-[100px]">Priority</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow
                                key={task._id}
                                className="h-12 hover:bg-gray-100 "
                            // onClick={() => handleRowClick(task)}cursor-pointer ${statusColors[task.status]}
                            >
                                <TableCell className="py-1">
                                    <div className="flex items-center">
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusColors[task.status]}`}>
                                            {task.status}
                                        </Badge>                                       
                                        <div className="flex flex-col ml-2" style={{ width: '200px' }}>
                                            <span className="text-base font-semibold truncate">{task.name}</span>
                                            {task.description && (
                                                <span className="text-sm text-gray-500 truncate w-48 sm:w-56 md:w-64 lg:w-96" >
                                                    {task.description}
                                                </span>
                                            )}
                                        </div>
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
                                    <div className="flex gap-1">
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
                                            onClick={(e) => handleDeleteTask(task._id || '', e)}
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

            {/* Task Detail Popup */}
            {popupTask && (
                <TaskDetailPopup
                    task={popupTask}
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

const GroupedTasks = ({ tasks }: { tasks: Task[] }) => {
    const statuses: TaskStatus[] = ['IN REVIEW', 'IN PROGRESS', 'TO DO', 'COMPLETED'];
    const [popupTask, setPopupTask] = useState<Task | null>(null);

    return (
        <>
            <Accordion type="multiple" className="mt-4 space-y-2">
                {statuses.map((status) => {
                    const statusTasks = tasks.filter((task) => task.status === status);
                    if (statusTasks.length === 0) return null;
                    return (
                        <AccordionItem value={status} key={status} className="rounded-md border shadow-sm">
                            <AccordionTrigger className={`px-4 py-2 text-left font-medium ${statusColors[status]} [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-2 [&>svg]:text-gray-800`}>
                                {status}
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-2">
                                <TaskTable tasks={statusTasks} />
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Task Detail Popup at GroupedTasks level */}
            {popupTask && (
                <TaskDetailPopup
                    task={popupTask}
                    onClose={() => setPopupTask(null)}
                />
            )}
        </>
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