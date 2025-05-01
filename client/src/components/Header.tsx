import { Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

type HeaderProps = {
  onMobileMenuToggle: () => void;
};

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Rows3 className="text-primary text-2xl" />
        <h1 className="text-xl font-semibold text-neutral-800">TaskMasterFlow</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-neutral-500 hover:text-neutral-700"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 text-sm font-medium text-neutral-700 hover:text-neutral-900">
              <Avatar className="h-8 w-8 bg-primary-600 text-white">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">John Doe</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
