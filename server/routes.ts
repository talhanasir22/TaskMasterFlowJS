import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertCategorySchema, 
  insertTaskActivitySchema,
  TaskFilter
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the authenticated session
      const userId = 1; // Using default user ID for demo
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  app.get("/api/tasks/filter", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the authenticated session
      const userId = 1; // Using default user ID for demo
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  app.get("/api/tasks/filter/:filter", async (req: Request, res: Response) => {
    try {
      const filter = req.params.filter as TaskFilter;
      // In a real app, we would get the user ID from the authenticated session
      const userId = 1; // Using default user ID for demo
      
      const allTasks = await storage.getTasks(userId);
      let filteredTasks = allTasks;
      
      if (filter === TaskFilter.ACTIVE) {
        filteredTasks = allTasks.filter(task => !task.completed);
      } else if (filter === TaskFilter.COMPLETED) {
        filteredTasks = allTasks.filter(task => task.completed);
      }
      
      res.json(filteredTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filtered tasks" });
    }
  });
  
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertTaskSchema.parse(req.body);
      
      // Create task
      const newTask = await storage.createTask(validatedData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if task exists
      const existingTask = await storage.getTaskById(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Validate request body (partial validation)
      const validatedData = insertTaskSchema.partial().parse(req.body);
      
      // Update task
      const updatedTask = await storage.updateTask(id, validatedData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if task exists
      const existingTask = await storage.getTaskById(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Delete task
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Task Activities routes
  app.get("/api/tasks/:id/activities", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if task exists
      const existingTask = await storage.getTaskById(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const activities = await storage.getTaskActivities(id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task activities" });
    }
  });
  
  app.post("/api/tasks/:id/activities", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if task exists
      const existingTask = await storage.getTaskById(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Validate request body
      const validatedData = insertTaskActivitySchema.parse({
        ...req.body,
        taskId: id
      });
      
      // Create task activity
      const newActivity = await storage.createTaskActivity(validatedData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create task activity" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the authenticated session
      const userId = 1; // Using default user ID for demo
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertCategorySchema.parse(req.body);
      
      // Create category
      const newCategory = await storage.createCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.patch("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if category exists
      const existingCategory = await storage.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Validate request body (partial validation)
      const validatedData = insertCategorySchema.partial().parse(req.body);
      
      // Update category
      const updatedCategory = await storage.updateCategory(id, validatedData);
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if category exists
      const existingCategory = await storage.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Delete category
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
