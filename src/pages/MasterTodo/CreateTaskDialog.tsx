/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from 'jotai';
import {
    Task,
    TaskPriority,
    TaskStatus,
    tasksAtom,
    createTaskFormAtom,
    priorities,
    statuses,
    defaultFormState,
    usersAtom,
    updateTask,
    createTask,
} from './mTodoStore';
import { format, startOfDay, } from 'date-fns'; //endOfDay,
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Flag, X, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { allCompNameAtom } from '@/services/state';
import { fetchUsers } from '@/services/dataFetch';
import { projectsAtom } from '../dashboard/Admin/Projects/ProjectAtom';
import { RichTextEditor } from '@/components/rich-text-editor';
import CustomLoader from '@/components/ui/customLoader';
import { Switch } from '@/components/ui/switch';
import SearchSelectNew from '@/components/SearchSelect2';
import DatePicker from 'react-datepicker'; // Import react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Import styles

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
    disbleProject = false,
}: CreateTaskDialogProps) => {
    const [tasks, setTasks] = useAtom(tasksAtom);
    const [formState, setFormState] = useAtom(createTaskFormAtom);
    const [users, setUsers] = useAtom(usersAtom);
    const [allList] = useAtom(allCompNameAtom);
    const [projects] = useAtom(projectsAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState<{ id: string; name: string; } | null>(formState.selectedCompany || { id: '', name: '' });
    const [selectedProject, setSelectedProj] = useState<{ id: string; name: string; } | null>(formState.selectedProject || { id: '', name: '' });
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;

    // dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userId = user ? user.id : '';

    // Due date error
    const [dateError, setDateError] = useState<string>('');
    // console.log("allList",allList)
    // Get filtered companies
    // const getFilteredCompanies = () => {
    //     if (allList.length > 0) {
    //         return allList
    //             .map((company) => {
    //                 if (typeof company._id === 'string') {
    //                     const name =
    //                         typeof company.companyName === 'string'
    //                             ? company.companyName
    //                             : Array.isArray(company.companyName) && typeof company.companyName[0] === 'string'
    //                                 ? company.companyName[0]
    //                                 : '';
    //                     return {
    //                         id: company._id,
    //                         name,
    //                     };
    //                 }
    //                 return { id: '', name: '' };
    //             })
    //             .filter((company) => company.id !== '');
    //     }
    //     return [];
    // };
    const getFilteredCompanies = () => {
        if (!Array.isArray(allList) || allList.length === 0) return [];
        return allList
            .map((company: any) => {
                const id =
                    typeof company.id === 'string' ? company.id :
                        typeof company._id === 'string' ? company._id :
                            '';

                const rawName = Array.isArray(company.companyName)
                    ? company.companyName.find((n: any) => typeof n === 'string') ?? ''
                    : company.companyName ?? '';

                const name = typeof rawName === 'string'
                    ? rawName.replace(/\s+/g, ' ').trim()
                    : '';

                return { id, name };
            })
            .filter((c) => c.id !== '' && c.name !== '');
    };
    const filteredCompanies = getFilteredCompanies();
    // console.log("filteredCompanies" ,filteredCompanies)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const fetchUser = async () => {
            await fetchUsers().then((response) => {
                const data = response.filter((e: { role: string }) => e.role === 'admin' || e.role === 'master');
                setUsers(data);
            });
        };
        fetchUser();

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
                dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined,
                priority: taskToEdit.priority,
                status: taskToEdit.status,
                selectedUsers: taskToEdit.assignees.map((assignee) => ({
                    id: assignee.id || '',
                    name: assignee.name,
                })),
                selectedCompany: taskToEdit.company,
                selectedProject: taskToEdit.project,
                shareWithClient: taskToEdit.shareWithClient,
            });
        } else if (!isEditMode && open) {
            setFormState(defaultFormState);
        }
        setDateError('');
    }, [isEditMode, taskToEdit, open, setFormState]);

    const DateInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
        ({ className, ...props }, ref) => (
            <Input
                ref={ref}
                className={className ?? "w-full h-10"} // h-10 matches shadcn Input/Select height
                {...props}
            />
        )
    );
    DateInput.displayName = "DateInput";

    // Handle user selection
    const toggleUser = (user: { id: string; name: string }) => {
        const isSelected = formState.selectedUsers.some((u) => u.id === user.id);
        if (isSelected) {
            setFormState({
                ...formState,
                selectedUsers: formState.selectedUsers.filter((u) => u.id !== user.id),
            });
        } else {
            setFormState({
                ...formState,
                selectedUsers: [...formState.selectedUsers, user],
            });
        }
    };

    const dueDate = formState.dueDate ? format(new Date(formState.dueDate), 'yyyy-MM-dd') : undefined;

    const handleSubmit = async () => {
        if (!formState.taskName) return;

        // const today = endOfDay(new Date());
        // const picked = formState.dueDate ? startOfDay(formState.dueDate) : null;

        // if (!picked || picked.getTime() <= today.getTime()) {
        //     setDateError('Due date must be after today.');
        //     window.alert('Please select a due date after today.');
        //     return;
        // }

        setIsLoading(true);
        try {
            if (isEditMode && taskToEdit) {
                const updatedTaskData: any = {
                    ...taskToEdit,
                    name: formState.taskName,
                    description: formState.description,
                    assignees: formState.selectedUsers,
                    dueDate: dueDate,
                    priority: formState.priority,
                    status: formState.status,
                    company: formState.selectedCompany,
                    project: formState.selectedProject,
                    shareWithClient: formState.shareWithClient,
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
                    console.error('Task ID is undefined');
                    setIsLoading(false);
                    return;
                }
                if (formState.selectedProject !== undefined) updatedTaskData.isProject = true;
                const updatedTask = await updateTask(taskToEdit._id, updatedTaskData);
                setTasks(tasks.map((task) => (task._id === taskToEdit._id ? updatedTask : task)));
            } else {
                const newTaskData: any = {
                    name: formState.taskName,
                    description: formState.description,
                    assignees: formState.selectedUsers,
                    dueDate: dueDate,
                    priority: formState.priority,
                    status: formState.status,
                    userId,
                    company: formState.selectedCompany,
                    project: formState.selectedProject,
                    shareWithClient: formState.shareWithClient,
                    createdAt: new Date(),
                    comments: formState.comment
                        ? [
                            {
                                text: formState.comment,
                                timestamp: new Date().toISOString(),
                            },
                        ]
                        : [],
                };
                if (formState.selectedProject !== undefined) newTaskData.isProject = true;
                const createdTask = await createTask(newTaskData);
                setTasks([createdTask, ...tasks]);
            }

            setFormState(defaultFormState);
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCurrencySelect = (item: { id: string; name: string } | null) => {
        setSelectedValue(item);
        setFormState({ ...formState, selectedCompany: item });
    };

    const handleProjectySelect = (item: { id: string; name: string } | null) => {
        setSelectedProj(item);
        setFormState({ ...formState, selectedProject: item });
    };

    const allowedStatuses =
        user?.role === 'master' ? statuses : statuses.filter((s) => s.label !== 'COMPLETED');

    // Normalize dueDate to UTC for display
    const normalizedDueDate = formState.dueDate
        ? startOfDay(toZonedTime(new Date(formState.dueDate), 'UTC'))
        : undefined;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Edit the task details below.' : 'Create a new task with all the details below.'}
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

                    {/* Status + Assignees */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            value={formState.status}
                            onValueChange={(value: TaskStatus) => {
                                if (value === 'COMPLETED' && user?.role !== 'master') return;
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

                        {/* Multi-select Assignee */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="relative w-full flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                                    {formState.selectedUsers.length > 0 ? (
                                        formState.selectedUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs"
                                            >
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
                                        {users.map((u) => {
                                            const isSelected = formState.selectedUsers.some((sel) => sel.id === u._id);
                                            return (
                                                <div
                                                    key={u._id}
                                                    onClick={() => toggleUser({ id: u._id || '', name: u.fullName })}
                                                    className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer ${isSelected ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <span>{u.fullName}</span>
                                                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Due Date + Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <DatePicker
                                selected={normalizedDueDate}
                                onChange={(date: Date | null) => {
                                    if (!date) return;
                                    setDateError("");
                                    const utcDate = fromZonedTime(startOfDay(date), "UTC");
                                    setFormState({ ...formState, dueDate: utcDate });
                                }}
                                minDate={startOfDay(new Date())}
                                dateFormat="PPP"
                                placeholderText="Pick a date"
                                wrapperClassName="w-full"
                                customInput={<DateInput />}
                                calendarClassName="bg-white border border-gray-300 rounded-md shadow-lg"
                                popperClassName="z-[60]"
                            />
                            {dateError && <p className="text-xs text-red-600 mt-1">{dateError}</p>}
                        </div>

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

                    {/* Company & Project */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <SearchSelectNew
                                items={filteredCompanies}
                                placeholder="Select a Company"
                                onSelect={handleCurrencySelect}
                                selectedItem={selectedValue}
                                disabled={disbleCompany}
                            />
                        </div>

                        <div className="mb-4">
                            <SearchSelectNew
                                items={projects.map((project) => ({ id: project._id, name: project.projectName }))}
                                placeholder="Select a Project"
                                onSelect={handleProjectySelect}
                                selectedItem={selectedProject}
                                disabled={disbleProject}
                            />
                        </div>
                    </div>

                    {/* Share with Client Toggle */}
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-900">Share with Client</label>
                        </div>
                        <Switch
                            checked={formState.shareWithClient}
                            onCheckedChange={(value) => {
                                if (formState.selectedCompany?.id) {
                                    setFormState({
                                        ...formState,
                                        shareWithClient: value,
                                    });
                                }
                            }}
                            disabled={!formState.selectedCompany?.id}
                        />
                    </div>

                    {formState.selectedUsers.length > 0 && (
                        <div className="pt-2">
                            <p className="text-sm font-medium mb-2">Assigned to:</p>
                            <div className="flex flex-wrap gap-2">
                                {formState.selectedUsers.map((u) => (
                                    <div
                                        key={`user-${u.id}`}
                                        className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                                    >
                                        {u.name}
                                        <button
                                            type="button"
                                            onClick={() => toggleUser({ id: u.id || '', name: u.name })}
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
                        {isLoading ? (
                            <>
                                <CustomLoader />
                                <span className="ml-2">Saving...</span>
                            </>
                        ) : isEditMode ? (
                            'Update Task'
                        ) : (
                            'Create Task'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};