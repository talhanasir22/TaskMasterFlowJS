import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, Category } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Check, MoreHorizontal, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type TaskCardProps = {
  task: Task;
  category?: Category;
  onSelect: () => void;
};

export function TaskCard({ task, category, onSelect }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Toggle task completion status
  const toggleComplete = useMutation({
    mutationFn: async () => {
      setIsCompleting(true);
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: task.completed ? "Task marked as active" : "Task completed",
        description: task.title,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message,
      });
    },
    onSettled: () => {
      setIsCompleting(false);
    }
  });

  // Format due date
  const formatDueDate = (date: Date | null) => {
    if (!date) return "No due date";
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete.mutate();
  };

  return (
    <div 
      className={cn(
        "task-card rounded-lg shadow-sm border border-neutral-200 p-4 slide-in cursor-pointer",
        task.completed ? "bg-neutral-50 completed-task" : "bg-white",
        toggleComplete.isPending && "opacity-70"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "task-checkbox h-5 w-5 p-0 rounded-full border-2",
              task.completed 
                ? "border-success-600 bg-success-600" 
                : "border-primary-600",
              "flex items-center justify-center hover:bg-primary-50"
            )}
            disabled={toggleComplete.isPending}
            onClick={handleCheckboxClick}
          >
            {task.completed && <Check className="h-3 w-3 text-white" />}
          </Button>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "text-base font-medium",
              task.completed ? "text-neutral-500 line-through" : "text-neutral-800"
            )}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-1">
              {category && (
                <Badge 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color 
                  }}
                >
                  {category.name}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-600">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className={cn(
              "mt-1 text-sm line-clamp-2",
              task.completed ? "text-neutral-500 line-through" : "text-neutral-600"
            )}>
              {task.description}
            </p>
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <div className={cn(
              "flex items-center text-sm",
              task.completed ? "text-neutral-400" : "text-neutral-500"
            )}>
              <Clock className="mr-1 h-3.5 w-3.5" />
              <span>{task.dueDate ? formatDueDate(new Date(task.dueDate)) : "No due date"}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 bg-rose-100 text-rose-700">
                <AvatarFallback className="text-xs font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
