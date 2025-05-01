import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, TaskActivity, Category, TaskPriority } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type TaskDetailProps = {
  taskId: number | null;
  onClose: () => void;
  onTaskUpdated?: () => void;
};

export function TaskDetail({ taskId, onClose, onTaskUpdated }: TaskDetailProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch task data
  const {
    data: task,
    isLoading: isLoadingTask
  } = useQuery<Task>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId,
  });

  // Fetch task activities
  const {
    data: activities = [],
    isLoading: isLoadingActivities
  } = useQuery<TaskActivity[]>({
    queryKey: [`/api/tasks/${taskId}/activities`],
    enabled: !!taskId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Reset edited task when task changes
  useEffect(() => {
    if (task) {
      setEditedTask({});
      setHasChanges(false);
    }
  }, [task]);

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async () => {
      if (!taskId || Object.keys(editedTask).length === 0) return null;
      return apiRequest("PATCH", `/api/tasks/${taskId}`, editedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
      });
      setHasChanges(false);
      if (onTaskUpdated) onTaskUpdated();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message,
      });
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async () => {
      if (!taskId) return null;
      return apiRequest("DELETE", `/api/tasks/${taskId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: "Task deleted",
        description: "The task has been permanently removed.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message,
      });
    },
  });

  // Toggle task completion
  const toggleComplete = useMutation({
    mutationFn: async () => {
      if (!task) return null;
      return apiRequest("PATCH", `/api/tasks/${taskId}`, {
        completed: !task.completed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: task?.completed ? "Task marked as active" : "Task completed",
        description: task?.title,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message,
      });
    },
  });

  const handleInputChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    updateTask.mutate();
  };

  const handleToggleComplete = () => {
    toggleComplete.mutate();
  };

  // Format date string from input to Date object
  const formatDateForTask = (dateStr: string, timeStr?: string) => {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      date.setHours(hours, minutes);
    }
    
    return date;
  };

  // Format date to input string
  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  };

  // Format time to input string
  const formatTimeForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'HH:mm');
  };

  // Handle date and time changes together
  const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
    const currentDate = editedTask.dueDate || task?.dueDate;
    let newDate: Date | null = null;
    
    if (field === 'date') {
      newDate = formatDateForTask(
        value, 
        currentDate ? formatTimeForInput(new Date(currentDate)) : undefined
      );
    } else {
      const dateStr = currentDate ? formatDateForInput(new Date(currentDate)) : new Date().toISOString().split('T')[0];
      newDate = formatDateForTask(dateStr, value);
    }

    handleInputChange('dueDate', newDate);
  };

  if (!taskId) {
    return (
      <aside className="hidden lg:block w-96 bg-white border-l border-neutral-200 overflow-hidden">
        <div className="h-full flex flex-col justify-center items-center p-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Task Selected</h2>
          <p className="text-neutral-600">Select a task from the list to view or edit its details</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-96 bg-white border-l border-neutral-200 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">Task Details</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {isLoadingTask ? (
          <div className="p-4 flex-1">
            <div className="space-y-5">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 rounded-full mr-3" />
                <Skeleton className="h-8 w-full" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>
                
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
                
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-5 w-5 p-0 rounded-full border-2 ${task?.completed ? 'border-success-600 bg-success-600' : 'border-primary-600'} flex items-center justify-center hover:bg-primary-50 mr-3`}
                    onClick={handleToggleComplete}
                    disabled={toggleComplete.isPending}
                  >
                    {task?.completed && <Check className="h-3 w-3 text-white" />}
                  </Button>
                  
                  <Input 
                    className="w-full text-lg font-medium border-0 p-0 focus-visible:ring-0 bg-transparent"
                    value={editedTask.title !== undefined ? editedTask.title : task?.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </Label>
                    <Textarea 
                      className="w-full rounded-md border-neutral-300 shadow-sm focus-visible:ring-primary focus-visible:border-primary text-sm min-h-[100px]"
                      value={editedTask.description !== undefined ? editedTask.description : task?.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <Label className="block text-sm font-medium text-neutral-700 mb-1">
                        Due Date
                      </Label>
                      <Input 
                        type="date"
                        className="w-full rounded-md border-neutral-300 shadow-sm focus-visible:ring-primary focus-visible:border-primary text-sm"
                        value={editedTask.dueDate !== undefined 
                          ? formatDateForInput(new Date(editedTask.dueDate)) 
                          : task?.dueDate 
                            ? formatDateForInput(new Date(task.dueDate)) 
                            : ''
                        }
                        onChange={(e) => handleDateTimeChange('date', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Label className="block text-sm font-medium text-neutral-700 mb-1">
                        Due Time
                      </Label>
                      <Input 
                        type="time"
                        className="w-full rounded-md border-neutral-300 shadow-sm focus-visible:ring-primary focus-visible:border-primary text-sm"
                        value={editedTask.dueDate !== undefined 
                          ? formatTimeForInput(new Date(editedTask.dueDate))
                          : task?.dueDate
                            ? formatTimeForInput(new Date(task.dueDate))
                            : ''
                        }
                        onChange={(e) => handleDateTimeChange('time', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-neutral-700 mb-1">
                      Category
                    </Label>
                    <Select
                      value={String(editedTask.categoryId !== undefined ? editedTask.categoryId : task?.categoryId || '')}
                      onValueChange={(value) => handleInputChange('categoryId', value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No category</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            <div className="flex items-center">
                              <span 
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-neutral-700 mb-1">
                      Priority
                    </Label>
                    <div className="flex space-x-2">
                      {Object.values(TaskPriority).map(priority => (
                        <Button
                          key={priority}
                          type="button"
                          variant="outline"
                          className={`flex-1 py-2 text-sm font-medium ${
                            (editedTask.priority !== undefined ? editedTask.priority : task?.priority) === priority
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                          }`}
                          onClick={() => handleInputChange('priority', priority)}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {!isLoadingActivities && activities.length > 0 && (
                    <div className="pt-4 border-t border-neutral-200">
                      <h3 className="text-sm font-medium text-neutral-700 mb-2">Activity</h3>
                      <div className="space-y-3">
                        {activities.map(activity => (
                          <div key={activity.id} className="flex space-x-3">
                            <Avatar className="h-8 w-8 bg-primary-100 text-primary-700">
                              <AvatarFallback className="text-xs font-medium">JD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm text-neutral-700">
                                <span className="font-medium">John Doe</span> {activity.action}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {format(new Date(activity.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-neutral-200 flex items-center justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this task. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteTask.mutate()}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md shadow-sm hover:bg-primary-600"
                onClick={handleSaveChanges}
                disabled={!hasChanges || updateTask.isPending}
              >
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
