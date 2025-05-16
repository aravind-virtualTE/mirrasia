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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Flag, X, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { allCompListAtom } from '@/services/state';
import { fetchUsers } from '@/services/dataFetch';
import { projectsAtom } from '../dashboard/Admin/Projects/ProjectAtom';
import { RichTextEditor } from "@/components/rich-text-editor"
interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditMode?: boolean;
    taskToEdit?: Task;
    disbleCompany?: boolean;
    disbleProject?: boolean;
}

export const CreateTaskDialog = ({
    open,
    onOpenChange,
    isEditMode = false,
    taskToEdit,
    disbleCompany = false,
    disbleProject = false
}: CreateTaskDialogProps) => {
    const [tasks, setTasks] = useAtom(tasksAtom);
    const [formState, setFormState] = useAtom(createTaskFormAtom);
    const [users, setUsers] = useAtom(usersAtom);
    const [allList] = useAtom(allCompListAtom);
    const [projects,] = useAtom(projectsAtom);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    // State for multi-select dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userId = user ? user.id : "";

    // Get filtered companies from allList
    const getFilteredCompanies = () => {
        if (allList.length > 0) {
            return allList.map((company) => {
                if (typeof company._id === 'string' && Array.isArray(company.companyName) && typeof company.companyName[0] === 'string') {
                    return {
                        id: company._id,
                        name: company.companyName[0],
                    };
                }
                return { id: '', name: '' };
            }).filter(company => company.id !== '');
        }
        return [];
    };

    const filteredCompanies = getFilteredCompanies();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        const fetchUser = async () => {
            // const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
            await fetchUsers().then((response) => {
                const data = response.filter((e: { role: string; }) => e.role == 'admin' || e.role == 'master')
                setUsers(data);
            })
        }
        fetchUser()
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, []);

    useEffect(() => {
        if (isEditMode && taskToEdit && open) {
            setFormState({
                taskName: taskToEdit.name,
                description: taskToEdit.description || '',
                comment: '',
                dueDate: taskToEdit.dueDate,
                priority: taskToEdit.priority,
                status: taskToEdit.status,
                selectedUsers: taskToEdit.assignees.map(assignee => ({
                    id: assignee.id || "",
                    name: assignee.name,
                })),
                selectedCompany: taskToEdit.company,
                selectedProject: taskToEdit.project
            });
        } else if (!isEditMode && open) {
            setFormState(defaultFormState);
        }
    }, [isEditMode, taskToEdit, open, setFormState]);

    // Handle user selection in multi-select
    const toggleUser = (user: { id: string; name: string }) => {
        const isSelected = formState.selectedUsers.some(u => u.id === user.id);
        if (isSelected) {
            setFormState({
                ...formState,
                selectedUsers: formState.selectedUsers.filter(u => u.id !== user.id)
            });
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
                assignees: formState.selectedUsers,
                dueDate: formState.dueDate,
                priority: formState.priority,
                status: formState.status,
                company: formState.selectedCompany,
                project: formState.selectedProject,
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
            if (formState.selectedProject !== undefined) updatedTaskData.isProject = true
            const updatedTask = await updateTask(taskToEdit._id, updatedTaskData);
            setTasks(tasks.map((task) => (task._id === taskToEdit._id ? updatedTask : task)));
        } else {
            // Create new task
            const newTaskData: Task = {
                name: formState.taskName,
                description: formState.description,
                assignees: formState.selectedUsers,
                dueDate: formState.dueDate ?? undefined,
                priority: formState.priority,
                status: formState.status,
                userId,
                company: formState.selectedCompany,
                project: formState.selectedProject,
                comments: formState.comment
                    ? [
                        {
                            text: formState.comment,
                            timestamp: new Date().toISOString(),
                        },
                    ]
                    : [],
            };
            // console.log("newTaskData", formState.selectedProject)
            if (formState.selectedProject !== undefined) newTaskData.isProject = true
            const createdTask = await createTask(newTaskData);
            setTasks([createdTask, ...tasks]);
        }
        setFormState(defaultFormState);
        onOpenChange(false);
    };

    const handleCompanyChange = (companyId: string) => {
        const company = filteredCompanies.find(c => c.id === companyId);
        if (company) {
            setFormState({
                ...formState,
                selectedCompany: {
                    id: company.id,
                    name: company.name
                }
            });
        } else {
            setFormState({
                ...formState,
                selectedCompany: { id: "", name: "" }
            });
        }
    };

    const handleProjectChange = (projectId: string) => {
        // This is a placeholder - you would need to implement project filtering
        // similar to how companies are filtered
        const project = projects.find(c => c._id === projectId);
        if (project) {
            setFormState({
                ...formState,
                selectedProject: {
                    id: project._id,
                    name: project.projectName
                }
            });
        } else {
            setFormState({
                ...formState,
                selectedProject: { id: "", name: "" }
            });
        }
    };
    // console.log("formState.selectedProject",filteredCompanies)
    // console.log("user",user)
    const projectsList = projects.map((project) => ({ id: project._id, name: project.projectName }))
    const allowedStatuses = user.role === 'master'
    ? statuses
    : statuses.filter((s) => s.label !== 'COMPLETED');
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Edit the task details below.'
                            : 'Create a new task with all the details below.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="md:col-span-2 space-y-4">
                    <Input
                        id="task-name"
                        value={formState.taskName}
                        onChange={(e) => setFormState({ ...formState, taskName: e.target.value })}
                        placeholder="Enter task title *"
                        className="w-full placeholder:italic placeholder:text-red-500"
                        maxLength={80}
                        required
                    />
                    <RichTextEditor
                        value={formState.description}
                        onChange={(value) => setFormState({ ...formState, description: value })}
                        placeholder=""
                        className="w-full min-h-[150px]"
                    />
                    <div className="relative">
                    </div>
                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            value={formState.status}
                            // onValueChange={(value: TaskStatus) => setFormState({ ...formState, status: value })}
                            onValueChange={(value: TaskStatus) => {
                                if (value === 'COMPLETED' && user.role !== 'master') return;
                                setFormState({ ...formState, status: value });
                            }}
                        >
                            <SelectTrigger id="status" className="w-full">
                                <SelectValue>{formState.status}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {allowedStatuses.map((s) => (
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
                    <div className="grid grid-cols-2 gap-4">
                        {/* Company Selection */}
                        <div className="mb-4">
                            <Select
                                onValueChange={handleCompanyChange}
                                value={formState.selectedCompany?.id || ''}
                                disabled={disbleCompany}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={formState.selectedCompany?.name || "Select a Company"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{"Company"}</SelectLabel>
                                        {filteredCompanies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project Selection */}
                        <div className="mb-4">
                            <Select
                                onValueChange={handleProjectChange}
                                value={formState.selectedProject?.id || ''}
                                disabled={disbleProject}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={formState.selectedProject?.name || "Select a Project"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{"Project"}</SelectLabel>
                                        {projectsList.map((project) => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {formState.selectedUsers.length > 0 && (
                        <div className="pt-2">
                            <p className="text-sm font-medium mb-2">Assigned to:</p>
                            <div className="flex flex-wrap gap-2">
                                {formState.selectedUsers.map(user => (
                                    <div key={`user-${user.id}`} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                                        {user.name}
                                        <button
                                            type="button"
                                            onClick={() => toggleUser({ id: user.id || "", name: user.name })}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="w-full">
                    <Button onClick={handleSubmit} type="submit">
                        {isEditMode ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};