/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from 'jotai';
import { Task, tasksAtom, TaskStatus, viewModeAtom,  statusColors, } from './mTodoStore';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import TaskDetailPopup from './TaskDetailPopup';
import TaskTable from './TaskTable';
import GanttChart from './GanttChart';


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
            {popupTask && (
                <TaskDetailPopup
                    taskId={popupTask?._id ?? null}
                    onClose={() => setPopupTask(null)}
                />
            )}
        </>
    );
};

export const TaskList = () => {
    const [tasks] = useAtom(tasksAtom);
    const [viewMode] = useAtom(viewModeAtom);
    const completedTasks = tasks.filter((task) => task.status == 'COMPLETED');
    const normalTasks = tasks.filter((task) => task.status !== 'COMPLETED');

    switch (viewMode) {
        case 'expanded':
            return <TaskTable tasks={normalTasks} />; 
        case 'completed':
            return <TaskTable tasks={completedTasks} />;
        case 'ganttChart':
            return <GanttChart items={tasks  as any} />;
        default:
            return <GroupedTasks tasks={tasks} />;
    }
};