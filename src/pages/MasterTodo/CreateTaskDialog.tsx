import { useAtom } from 'jotai';
import { Task, TaskPriority, TaskStatus, tasksAtom, createTaskFormAtom, priorities, statuses, defaultFormState, usersAtom, updateTask, createTask } from './mTodoStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Plus, CalendarIcon, Flag, MessageCircle, X, Check, ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditMode?: boolean;
    taskToEdit?: Task;
}

export const CreateTaskDialog = ({
    open,
    onOpenChange,
    isEditMode = false,
    taskToEdit,
}: CreateTaskDialogProps) => {
    const [tasks, setTasks] = useAtom(tasksAtom);
    const [formState, setFormState] = useAtom(createTaskFormAtom);
    const [users,] = useAtom(usersAtom);
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    // State for multi-select dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userId = user ? user.id : ""
    // Effect to handle clicking outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initialize form state when editing a task
    useEffect(() => {
        if (isEditMode && taskToEdit && open) {
            // Find the user objects for each assignee name
            // const selectedUserObjects = taskToEdit.assignees.map(assigneeName => {
            //     return users.find(user => user.fullName === assigneeName) || users[0];
            // }).filter(Boolean);

            setFormState({
                taskName: taskToEdit.name,
                description: taskToEdit.description || '',
                comment: '',
                dueDate: taskToEdit.dueDate,
                priority: taskToEdit.priority,
                status: taskToEdit.status,
                selectedUsers: taskToEdit.assignees.map(assignee => ({
                    id: assignee._id || "",
                    name: assignee.name,
                }))
            });
        } else if (!isEditMode && open) {
            setFormState(defaultFormState);
        }
    }, [isEditMode, taskToEdit, open, setFormState]);

    // Handle user selection in multi-select
    const toggleUser = (user: { id: string; name: string }) => {
        // console.log("user._id", user)
        const isSelected = formState.selectedUsers.some(u => u.id === user.id);

        if (isSelected) {
            // Don't allow removing the last user
            if (formState.selectedUsers.length > 1) {
                setFormState({
                    ...formState,
                    selectedUsers: formState.selectedUsers.filter(u => u.id !== user.id)
                });
            }
        } else {
            setFormState({
                ...formState,
                selectedUsers: [...formState.selectedUsers, user]
            });
        }
    };

    const handleSubmit = async () => {
        if (!formState.taskName) return;

        if (isEditMode && taskToEdit) {
            // Update existing task
            const updatedTaskData: Task = {
                ...taskToEdit,
                name: formState.taskName,
                description: formState.description,
                assignees: formState.selectedUsers, // Extract names from selected users
                dueDate: formState.dueDate,
                priority: formState.priority,
                status: formState.status,
                comments: formState.comment
                    ? [
                        ...taskToEdit.comments,
                        {
                            text: formState.comment,
                            timestamp: new Date().toISOString(),
                        },
                    ]
                    : taskToEdit.comments,
            };
            if (!taskToEdit._id) {
                console.error("Task ID is undefined");
                return;
            }
            const updatedTask = await updateTask(taskToEdit._id, updatedTaskData);
            setTasks(tasks.map((task) => (task._id === taskToEdit._id ? updatedTask : task)));
        } else {
            // Create new task
            const newTaskData: Task = {
                name: formState.taskName,
                description: formState.description,
                assignees: formState.selectedUsers, // Extract names from selected users
                dueDate: formState.dueDate,
                priority: formState.priority,
                status: formState.status,
                userId,
                comments: formState.comment
                    ? [
                        {
                            text: formState.comment,
                            timestamp: new Date().toISOString(),
                        },
                    ]
                    : [],
            };
            const createdTask = await createTask(newTaskData);
            setTasks([createdTask,...tasks]);
        }
        setFormState(defaultFormState);
        onOpenChange(false);
    };

    // Display comments section if there are existing comments
    const showExistingComments = isEditMode && taskToEdit && taskToEdit.comments.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create new task
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Edit the task details below.'
                            : 'Create a new task with all the details below.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    {/* LEFT: Form fields (2/3 width) */}
                    <div className="md:col-span-2 space-y-4">
                        <Input
                            id="task-name"
                            value={formState.taskName}
                            onChange={(e) => setFormState({ ...formState, taskName: e.target.value })}
                            placeholder="Enter task title"
                            className="w-full"
                        />

                        <Textarea
                            id="description"
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            placeholder="Enter task description"
                            className="w-full"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Status */}
                            <Select
                                value={formState.status}
                                onValueChange={(value: TaskStatus) => setFormState({ ...formState, status: value })}
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue>{formState.status}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem key={s.label} value={s.label}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Multi-select Assignee with custom HTML/Tailwind */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="relative w-full flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                                        {formState.selectedUsers.length > 0 ? (
                                            formState.selectedUsers.map((user) => (
                                                <div key={user.id} className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs">
                                                    {user.name}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">Select assignees</span>
                                        )}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        <div className="p-1">
                                            {users.map((user) => {
                                                const isSelected = formState.selectedUsers.some(u => u.id === user._id);
                                                return (
                                                    <div
                                                        key={user._id}
                                                        onClick={() => toggleUser({ id: user._id || "", name: user.fullName })}
                                                        className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer ${isSelected ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <span>{user.fullName}</span>
                                                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Due Date */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formState.dueDate ? format(formState.dueDate, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formState.dueDate ?? undefined}
                                        className="pointer-events-auto"
                                        onSelect={(date) => {
                                            setFormState({ ...formState, dueDate: date });
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Priority */}
                            <Select
                                value={formState.priority}
                                onValueChange={(value: TaskPriority) => setFormState({ ...formState, priority: value })}
                            >
                                <SelectTrigger id="priority" className="w-full">
                                    <SelectValue>{formState.priority}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            <div className="flex items-center">
                                                <Flag
                                                    className={cn('mr-2 h-4 w-4', p.color)}
                                                    fill={'currentColor'}
                                                    strokeWidth={p.value === 'High' ? 2 : p.value === 'Medium' ? 1.5 : 1}
                                                />
                                                {p.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Display selected assignees with remove option */}
                        {formState.selectedUsers.length > 0 && (
                            <div className="pt-2">
                                <p className="text-sm font-medium mb-2">Assigned to:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formState.selectedUsers.map(user => (
                                        <div key={user.id} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                                            {user.name}
                                            {formState.selectedUsers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUser(user)}
                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Comments (1/3 width) */}
                    <div className="space-y-4">
                        {/* Existing Comments */}
                        {showExistingComments && (
                            <div>
                                <div className="flex items-center mb-2">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    <h3 className="text-sm font-medium">Comments ({taskToEdit.comments.length})</h3>
                                </div>
                                <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                                    {taskToEdit.comments.map((comment) => (
                                        <div key={comment._id} className="border-b last:border-0 py-2">
                                            <p className="text-sm">{comment.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add New Comment */}
                        <div>
                            <div className="flex items-center mb-2">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                <h3 className="text-sm font-medium">Add Comment</h3>
                            </div>
                            <Textarea
                                id="comment"
                                value={formState.comment}
                                onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                                placeholder="Write a comment..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} type="submit">
                        {isEditMode ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};