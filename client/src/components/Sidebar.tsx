import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ListCheck, Clock, CircleHelp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Category } from "@shared/schema";

type SidebarProps = {
  activeFilter: string;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
  onFilterChange: (filter: string) => void;
  onNewCategoryClick: () => void;
};

export function Sidebar({ 
  activeFilter, 
  taskCounts, 
  onFilterChange,
  onNewCategoryClick
}: SidebarProps) {
  const [, setLocation] = useLocation();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const handleFilterClick = (filter: string) => {
    onFilterChange(filter);
    setLocation('/');
  };
  
  const filterItems = [
    { id: 'all', label: 'All Tasks', icon: <ListCheck className="h-4 w-4 mr-3" />, count: taskCounts.all },
    { id: 'active', label: 'Active', icon: <Clock className="h-4 w-4 mr-3" />, count: taskCounts.active },
    { id: 'completed', label: 'Completed', icon: <CircleHelp className="h-4 w-4 mr-3" />, count: taskCounts.completed },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 overflow-y-auto">
      <div className="p-4">
        <div className="mt-6">
          <h2 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Filters
          </h2>
          <div className="mt-2 space-y-1">
            {filterItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md w-full",
                  activeFilter === item.id
                    ? "text-primary-600 bg-primary-50"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
                onClick={() => handleFilterClick(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                <Badge 
                  variant={activeFilter === item.id ? "default" : "secondary"}
                  className={cn(
                    "ml-auto text-xs", 
                    activeFilter === item.id 
                      ? "bg-primary-100 text-primary-700" 
                      : "bg-neutral-100 text-neutral-700"
                  )}
                >
                  {item.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center justify-between px-3">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Categories
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-primary-600 hover:text-primary-700"
              onClick={onNewCategoryClick}
            >
              <Plus className="h-3 w-3 mr-1" /> New
            </Button>
          </div>
          
          <div className="mt-2 space-y-1">
            {categories.map(category => {
              const categoryTasks = taskCounts[category.id] || 0;
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  className="flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md w-full text-neutral-700 hover:bg-neutral-100"
                >
                  <span 
                    className="w-2 h-2 rounded-full mr-3" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                  <span className="ml-auto text-xs text-neutral-500">{categoryTasks}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
