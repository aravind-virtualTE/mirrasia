import { useAtom } from 'jotai';
import { Task, TaskPriority, TaskStatus, tasksAtom, createTaskFormAtom, users, priorities, statuses, defaultFormState } from './mTodoStore';
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
import { Plus, CalendarIcon, Flag, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

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

    const handleSubmit = () => {
        if (!formState.taskName) return;

        if (isEditMode && taskToEdit) {
            // Update existing task
            const updatedTask: Task = {
                ...taskToEdit,
                name: formState.taskName,
                description: formState.description,
                assignee: formState.selectedUser.name,
                dueDate :formState.dueDate,
                priority: formState.priority,
                status: formState.status,
                comments: formState.comment
                    ? [
                        ...taskToEdit.comments,
                        {
                            id: (taskToEdit.comments.length + 1).toString(),
                            text: formState.comment,
                            timestamp: new Date().toISOString(),
                        },
                    ]
                    : taskToEdit.comments,
            };

            setTasks(tasks.map((task) => (task.id === taskToEdit.id ? updatedTask : task)));
        } else {
            // Create new task
            const newTask: Task = {
                id: (tasks.length + 1).toString(),
                name: formState.taskName,
                description: formState.description,
                assignee: formState.selectedUser.name,
                dueDate: formState.dueDate,
                priority: formState.priority,
                status: formState.status,
                comments: formState.comment
                    ? [
                        {
                            id: '1',
                            text: formState.comment,
                            timestamp: new Date().toISOString(),
                        },
                    ]
                    : [],
            };

            setTasks([...tasks, newTask]);
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

                            {/* Assignee */}
                            <Select
                                value={formState.selectedUser.id}
                                onValueChange={(value) => {
                                    const user = users.find((u) => u.id === value);
                                    if (user) setFormState({ ...formState, selectedUser: user });
                                }}
                            >
                                <SelectTrigger id="assignee" className="w-full">
                                    <SelectValue>{formState.selectedUser.name}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                            console.log("Date selected:", date);
                                            setFormState({ ...formState, dueDate:date })
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
                                        <div key={comment.id} className="border-b last:border-0 py-2">
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