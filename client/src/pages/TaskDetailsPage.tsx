import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Header } from "@/components/Header";
import { TaskDetail } from "@/components/TaskDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TaskDetailsPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/tasks/:id");
  const taskId = match ? parseInt(params.id) : null;
  
  // Fetch task data
  const {
    data: task,
    isLoading,
    error
  } = useQuery<Task>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId,
  });
  
  // Navigate back if task doesn't exist
  useEffect(() => {
    if (!isLoading && !task && taskId) {
      setLocation("/");
    }
  }, [isLoading, task, taskId, setLocation]);
  
  const handleBack = () => {
    setLocation("/");
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header onMobileMenuToggle={() => {}} />
        <div className="flex-1 bg-neutral-50 p-4">
          <div className="max-w-lg mx-auto mt-4">
            <Button variant="outline" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to tasks
            </Button>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-neutral-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <Header onMobileMenuToggle={() => {}} />
        <div className="flex-1 bg-neutral-50 p-4">
          <div className="max-w-lg mx-auto mt-4">
            <Button variant="outline" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to tasks
            </Button>
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-center">
              <h2 className="text-lg font-medium text-red-700 mb-2">Error loading task</h2>
              <p className="text-neutral-600 mb-4">{(error as Error).message}</p>
              <Button onClick={handleBack}>Return to task list</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col">
      <Header onMobileMenuToggle={() => {}} />
      <div className="flex-1 bg-neutral-50 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tasks
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            {taskId && (
              <TaskDetail
                taskId={taskId}
                onClose={handleBack}
                onTaskUpdated={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
