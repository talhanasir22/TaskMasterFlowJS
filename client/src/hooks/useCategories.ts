import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Category, InsertCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all categories
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Create category
  const createCategory = useMutation({
    mutationFn: async (category: InsertCategory) => {
      return apiRequest("POST", "/api/categories", category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category created",
        description: "New category has been added.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating category",
        description: error.message,
      });
    },
  });
  
  // Update category
  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertCategory> }) => {
      return apiRequest("PATCH", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating category",
        description: error.message,
      });
    },
  });
  
  // Delete category
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/categories/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been permanently removed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting category",
        description: error.message,
      });
    },
  });
  
  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
