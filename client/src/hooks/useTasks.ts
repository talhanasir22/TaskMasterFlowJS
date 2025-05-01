import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, InsertTask, TaskFilter } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTasks(filter: string = TaskFilter.ALL) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all tasks
  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks/filter', filter],
  });
  
  // Create task
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
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: error.message,
      });
    },
  });
  
  // Update task
  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertTask> }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${variables.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
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
  
  // Delete task
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/tasks/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: "Task deleted",
        description: "The task has been permanently removed.",
      });
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
  const toggleTaskCompletion = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${variables.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/filter'] });
      toast({
        title: variables.completed ? "Task completed" : "Task marked as active",
        description: "Task status updated successfully.",
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
  
  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };
}
