import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListCheck, Clock, Plus, CircleHelp, User } from "lucide-react";

type MobileNavigationProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onNewTaskClick: () => void;
};

export function MobileNavigation({ 
  activeFilter, 
  onFilterChange, 
  onNewTaskClick
}: MobileNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center py-2 md:hidden z-10">
      <Button
        variant="ghost"
        className={cn(
          "flex flex-col items-center justify-center p-2 h-auto",
          activeFilter === "all" ? "text-primary" : "text-neutral-500"
        )}
        onClick={() => onFilterChange("all")}
      >
        <ListCheck className="h-5 w-5" />
        <span className="text-xs mt-1">All Tasks</span>
      </Button>
      
      <Button
        variant="ghost"
        className={cn(
          "flex flex-col items-center justify-center p-2 h-auto",
          activeFilter === "active" ? "text-primary" : "text-neutral-500"
        )}
        onClick={() => onFilterChange("active")}
      >
        <Clock className="h-5 w-5" />
        <span className="text-xs mt-1">Active</span>
      </Button>
      
      <Button
        className="flex flex-col items-center justify-center p-2 rounded-full bg-primary text-white h-14 w-14 -mt-5"
        onClick={onNewTaskClick}
      >
        <Plus className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        className={cn(
          "flex flex-col items-center justify-center p-2 h-auto",
          activeFilter === "completed" ? "text-primary" : "text-neutral-500"
        )}
        onClick={() => onFilterChange("completed")}
      >
        <CircleHelp className="h-5 w-5" />
        <span className="text-xs mt-1">Completed</span>
      </Button>
      
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center p-2 h-auto text-neutral-500"
        asChild
      >
        <Link href="/profile">
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </Button>
    </div>
  );
}
