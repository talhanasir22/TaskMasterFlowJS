import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, TaskFilter, Category } from "@shared/schema";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TaskList } from "@/components/TaskList";
import { TaskDetail } from "@/components/TaskDetail";
import { NewTaskModal } from "@/components/NewTaskModal";
import { MobileNavigation } from "@/components/MobileNavigation";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string>(TaskFilter.ALL);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Calculate task counts
  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
    ...categories.reduce((acc, category) => {
      acc[category.id] = tasks.filter(task => task.categoryId === category.id).length;
      return acc;
    }, {} as Record<number, number>)
  };
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  
  const handleTaskSelect = (task: Task) => {
    setSelectedTaskId(task.id);
  };
  
  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };
  
  const toggleNewTaskModal = () => {
    setIsNewTaskModalOpen(!isNewTaskModalOpen);
  };
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onMobileMenuToggle={toggleMobileSidebar} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar 
          activeFilter={activeFilter}
          taskCounts={taskCounts}
          onFilterChange={handleFilterChange}
          onNewCategoryClick={() => {}}
        />
        
        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar 
              activeFilter={activeFilter}
              taskCounts={taskCounts}
              onFilterChange={(filter) => {
                handleFilterChange(filter);
                setIsMobileSidebarOpen(false);
              }}
              onNewCategoryClick={() => {}}
            />
          </SheetContent>
        </Sheet>
        
        {/* Main Task List */}
        <TaskList 
          activeFilter={activeFilter}
          onTaskSelect={handleTaskSelect}
          onAddTask={toggleNewTaskModal}
        />
        
        {/* Task Detail Panel */}
        <TaskDetail 
          taskId={selectedTaskId}
          onClose={handleCloseTaskDetail}
        />
        
        {/* New Task Modal */}
        <NewTaskModal 
          isOpen={isNewTaskModalOpen}
          onClose={toggleNewTaskModal}
        />
        
        {/* Mobile Navigation */}
        <MobileNavigation 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onNewTaskClick={toggleNewTaskModal}
        />
      </div>
    </div>
  );
}
