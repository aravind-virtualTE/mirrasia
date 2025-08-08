/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { User, Building2 } from 'lucide-react';
import { Task } from './mTodoStore';


interface GanttChartProps {
  tasks: Task[];
}

const GanttChart = ({ tasks }: GanttChartProps) => {
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
//   const [timeRange, setTimeRange] = useState('3months');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'TO DO': 'bg-slate-400',
      'IN PROGRESS': 'bg-blue-500',
      'IN REVIEW': 'bg-amber-500',
      'COMPLETED': 'bg-green-500'
    };
    return colors[status] || 'bg-slate-400';
  };

  const getPriorityHeight = (priority: string) => {
    const heights: Record<string, string> = {
      'Urgent': 'h-8',
      'High': 'h-7',
      'Medium': 'h-6',
      'Low': 'h-5'
    };
    return heights[priority] || 'h-6';
  };

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const filteredData = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = selectedStatus === 'ALL' || task.status === selectedStatus;
      const priorityMatch = selectedPriority === 'ALL' || task.priority === selectedPriority;
      return statusMatch && priorityMatch;
    });
  }, [selectedStatus, selectedPriority,tasks]);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const dates: Date[] = [];
    filteredData.forEach(task => {
      dates.push(new Date(task.createdAt));
      if (task.dueDate) {
        dates.push(new Date(task.dueDate));
      }
    });
    
    if (dates.length === 0) return { start: new Date(), end: new Date() };
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add some padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);
    
    return { start: minDate, end: maxDate };
  }, [filteredData]);

  // Generate timeline columns
  const generateTimelineColumns = (start: string | number | Date, end: number | Date) => {
    const columns = [];
    const current = new Date(start);
    const timeDiff = new Date(end).getTime() - new Date(start).getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Determine the step based on the time range
    let step = 7; // weeks
    if (daysDiff > 180) step = 30; // months
    if (daysDiff > 365) step = 90; // quarters
    
    while (current <= end) {
      columns.push(new Date(current));
      current.setDate(current.getDate() + step);
    }
    
    return columns;
  };

  const timelineColumns = generateTimelineColumns(timelineBounds.start, timelineBounds.end);

  const calculateBarPosition = (task: Task) => {
      const startDate = new Date(task.createdAt);
      const endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days if no due date
      
      const totalDuration = timelineBounds.end.getTime() - timelineBounds.start.getTime();
      const startOffset = ((startDate.getTime() - timelineBounds.start.getTime()) / totalDuration) * 100;
      const duration = ((endDate.getTime() - startDate.getTime()) / totalDuration) * 100;
      
      return {
        left: Math.max(0, startOffset),
        width: Math.max(2, duration) // Minimum 2% width
      };
    };

  const formatColumnDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="w-full bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 mb-4">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="TO DO">To Do</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="IN REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
          
          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="ALL">All Priority</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded"></div>
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded"></div>
            <span>In Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span>Overdue</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ minWidth: '1200px' }}>
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-80 p-4 font-semibold text-gray-700 border-r border-gray-200">
              Task Details
            </div>
            <div className="flex-1 relative">
              <div className="flex h-12 items-center">
                {timelineColumns.map((date, index) => (
                  <div 
                    key={index}
                    className="flex-1 text-center text-xs text-gray-600 border-r border-gray-200 last:border-r-0 px-2"
                  >
                    {formatColumnDate(date)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-100">
            {filteredData.map((task, index) => {
              const barPosition = calculateBarPosition(task);
              const overdue = isOverdue(task);
              
              return (
                <div key={task._id} className={`flex hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  {/* Task Info */}
                  <div className="w-80 p-4 border-r border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {task.name}
                          </h4>
                          {task.isProject && (
                            <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                              Project
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {task.company && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{task.company.name}</span>
                            </div>
                          )}
                          
                          {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              <span className="truncate">{task.assignees[0].name}</span>
                              {task.assignees.length > 1 && (
                                <span className="text-gray-500">+{task.assignees.length - 1}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full text-white ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className="text-gray-600">{task.priority}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative p-4">
                    <div className="relative h-10 flex items-center">
                      {/* Grid lines */}
                      {timelineColumns.map((_, colIndex) => (
                        <div 
                          key={colIndex}
                          className="absolute top-0 bottom-0 border-l border-gray-100"
                          style={{ left: `${(colIndex / (timelineColumns.length - 1)) * 100}%` }}
                        />
                      ))}
                      
                      {/* Task bar */}
                      <div
                        className={`absolute rounded-md flex items-center justify-center text-white text-xs font-medium transition-all hover:shadow-md cursor-pointer group ${
                          overdue ? 'bg-red-500' : getStatusColor(task.status)
                        } ${getPriorityHeight(task.priority)}`}
                        style={{
                          left: `${barPosition.left}%`,
                          width: `${barPosition.width}%`
                        }}
                        title={`${task.name} - ${task.status} (${task.priority})`}
                      >
                        <span className="truncate px-2">
                          {task.name}
                        </span>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                            <div className="font-medium">{task.name}</div>
                            <div className="text-gray-300">
                              {formatDate(task.createdAt)?.toLocaleDateString()} - 
                              {task.dueDate ? formatDate(task.dueDate)?.toLocaleDateString() : 'No due date'}
                            </div>
                            <div className="text-gray-300">{task.status} • {task.priority}</div>
                            {overdue && <div className="text-red-400">Overdue</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No tasks match the selected filters</div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;