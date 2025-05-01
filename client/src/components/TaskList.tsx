import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, Category, TaskFilter } from "@shared/schema";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { ListOrdered, List, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TaskListProps = {
  activeFilter: string;
  onTaskSelect: (task: Task) => void;
  onAddTask: () => void;
};

export function TaskList({ activeFilter, onTaskSelect, onAddTask }: TaskListProps) {
  const [viewType, setViewType] = useState<"list" | "compact">("list");
  
  // Fetch tasks based on active filter
  const {
    data: tasks = [],
    isLoading
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks/filter', activeFilter],
  });
  
  // Fetch categories for mapping
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Format filter title
  const getFilterTitle = () => {
    switch (activeFilter) {
      case TaskFilter.ALL:
        return "All Tasks";
      case TaskFilter.ACTIVE:
        return "Active Tasks";
      case TaskFilter.COMPLETED:
        return "Completed Tasks";
      default:
        return "Tasks";
    }
  };

  // Count active tasks
  const activeTasks = tasks.filter(task => !task.completed).length;

  return (
    <main className="flex-1 flex flex-col bg-neutral-50 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 bg-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">{getFilterTitle()}</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {tasks.length} tasks, {activeTasks} active
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Task View Toggle */}
          <div className="bg-neutral-100 rounded-md p-1 hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1.5 rounded ${viewType === 'compact' ? 'bg-white shadow-sm text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              onClick={() => setViewType("compact")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1.5 rounded ${viewType === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              onClick={() => setViewType("list")}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Add Task Button */}
          <Button 
            className="flex items-center px-3 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-600 transition"
            onClick={onAddTask}
          >
            <Plus className="mr-1 h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
                <div className="flex items-start">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-4/5 mt-1" />
                    <div className="mt-2 flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-700">No tasks found</h3>
              <p className="text-neutral-500 mt-1">Create a new task to get started</p>
              <Button 
                className="mt-4"
                onClick={onAddTask}
              >
                <Plus className="mr-1 h-4 w-4" />
                New Task
              </Button>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                category={categories.find(c => c.id === task.categoryId)} 
                onSelect={() => onTaskSelect(task)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
