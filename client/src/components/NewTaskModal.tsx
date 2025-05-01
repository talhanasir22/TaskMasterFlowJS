import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Category, InsertTask, TaskPriority } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

type NewTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const [newTask, setNewTask] = useState<Partial<InsertTask>>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    completed: false,
    userId: 1 // Using default user ID for demo
  });
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (task: InsertTask) => {
      return apiRequest("POST", "/api/tasks", task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: "Task created",
        description: "Your new task has been added.",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: error.message,
      });
    },
  });

  const handleInputChange = (field: keyof InsertTask, value: any) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueTime(e.target.value);
  };

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      completed: false,
      userId: 1
    });
    setDueDate("");
    setDueTime("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newTask.title?.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Task title is required.",
      });
      return;
    }
    
    // Combine date and time if provided
    let dueDateObj: Date | null = null;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      
      if (dueTime) {
        const [hours, minutes] = dueTime.split(':').map(Number);
        dueDateObj.setHours(hours, minutes);
      } else {
        // Default to end of day if no time provided
        dueDateObj.setHours(23, 59, 59);
      }
    }
    
    // Create task with due date
    createTask.mutate({
      ...newTask as InsertTask,
      dueDate: dueDateObj
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-800">Add New Task</DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-4 top-4 h-6 w-6 p-0 text-neutral-400 hover:text-neutral-600"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title" className="text-sm font-medium text-neutral-700">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="task-title"
                className="mt-1"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="task-description" className="text-sm font-medium text-neutral-700">
                Description
              </Label>
              <Textarea 
                id="task-description"
                className="mt-1 min-h-[80px]"
                placeholder="Add details about your task"
                value={newTask.description || ""}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <Label htmlFor="task-due-date" className="text-sm font-medium text-neutral-700">
                  Due Date
                </Label>
                <Input 
                  id="task-due-date"
                  type="date"
                  className="mt-1"
                  value={dueDate}
                  onChange={handleDateChange}
                />
              </div>
              
              <div className="flex-1">
                <Label htmlFor="task-due-time" className="text-sm font-medium text-neutral-700">
                  Due Time
                </Label>
                <Input 
                  id="task-due-time"
                  type="time"
                  className="mt-1"
                  value={dueTime}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="task-category" className="text-sm font-medium text-neutral-700">
                Category
              </Label>
              <Select
                value={newTask.categoryId?.toString() || ""}
                onValueChange={(value) => handleInputChange('categoryId', value ? parseInt(value) : null)}
              >
                <SelectTrigger id="task-category" className="mt-1 w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
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
              <Label className="text-sm font-medium text-neutral-700">
                Priority
              </Label>
              <div className="flex space-x-2 mt-1">
                {Object.values(TaskPriority).map(priority => (
                  <Button
                    key={priority}
                    type="button"
                    variant="outline"
                    className={`flex-1 py-2 text-sm font-medium ${
                      newTask.priority === priority
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
          </div>
          
          <DialogFooter className="mt-6 flex items-center justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              className="bg-primary text-white hover:bg-primary-600"
              disabled={createTask.isPending}
            >
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
