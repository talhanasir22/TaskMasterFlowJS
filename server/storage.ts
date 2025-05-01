import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  tasks, type Task, type InsertTask,
  taskActivities, type TaskActivity, type InsertTaskActivity
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task Activity methods
  getTaskActivities(taskId: number): Promise<TaskActivity[]>;
  createTaskActivity(activity: InsertTaskActivity): Promise<TaskActivity>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private tasks: Map<number, Task>;
  private taskActivities: Map<number, TaskActivity>;
  private userId: number;
  private categoryId: number;
  private taskId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tasks = new Map();
    this.taskActivities = new Map();
    this.userId = 1;
    this.categoryId = 1;
    this.taskId = 1;
    this.activityId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }
  
  // Initialize with some default data for demo purposes
  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: this.userId++,
      username: "johndoe",
      password: "password123" // In a real app, this would be hashed
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Create default categories
    const categories: Omit<Category, "id">[] = [
      { name: "Work", color: "#4F46E5", userId: defaultUser.id },
      { name: "Personal", color: "#16A34A", userId: defaultUser.id },
      { name: "Errands", color: "#F59E0B", userId: defaultUser.id },
      { name: "Health", color: "#EF4444", userId: defaultUser.id }
    ];
    
    const createdCategories = categories.map(cat => {
      const category: Category = { ...cat, id: this.categoryId++ };
      this.categories.set(category.id, category);
      return category;
    });
    
    // Create default tasks
    const defaultTasks: Omit<Task, "id">[] = [
      {
        title: "Finalize project proposal",
        description: "Complete the final revisions to the project proposal document and prepare it for client review.",
        completed: false,
        dueDate: new Date(),
        priority: "high",
        categoryId: createdCategories[0].id,
        userId: defaultUser.id,
        createdAt: new Date()
      },
      {
        title: "Schedule team meeting",
        description: "Send out calendar invites for the weekly team sync meeting.",
        completed: true,
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        priority: "medium",
        categoryId: createdCategories[0].id,
        userId: defaultUser.id,
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        title: "Grocery shopping",
        description: "Buy milk, eggs, bread, vegetables, and fruits from the supermarket.",
        completed: false,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priority: "medium",
        categoryId: createdCategories[2].id,
        userId: defaultUser.id,
        createdAt: new Date(Date.now() - 43200000) // 12 hours ago
      }
    ];
    
    defaultTasks.forEach(task => {
      const newTask: Task = { ...task, id: this.taskId++ };
      this.tasks.set(newTask.id, newTask);
      
      // Add creation activity
      const activity: TaskActivity = {
        id: this.activityId++,
        taskId: newTask.id,
        userId: defaultUser.id,
        action: "created this task",
        timestamp: newTask.createdAt
      };
      this.taskActivities.set(activity.id, activity);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date();
    const newTask: Task = { ...task, id, createdAt: now };
    this.tasks.set(id, newTask);
    
    // Create task creation activity
    await this.createTaskActivity({
      taskId: id,
      userId: task.userId,
      action: "created this task"
    });
    
    return newTask;
  }
  
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    
    // Create task update activity
    if (task.completed !== undefined && task.completed !== existingTask.completed) {
      await this.createTaskActivity({
        taskId: id,
        userId: existingTask.userId,
        action: task.completed ? "marked this task as completed" : "marked this task as active"
      });
    } else if (Object.keys(task).length > 0) {
      await this.createTaskActivity({
        taskId: id,
        userId: existingTask.userId,
        action: "updated this task"
      });
    }
    
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    // Delete associated activities first
    Array.from(this.taskActivities.values())
      .filter(activity => activity.taskId === id)
      .forEach(activity => this.taskActivities.delete(activity.id));
    
    return this.tasks.delete(id);
  }
  
  // Task Activity methods
  async getTaskActivities(taskId: number): Promise<TaskActivity[]> {
    return Array.from(this.taskActivities.values())
      .filter(activity => activity.taskId === taskId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createTaskActivity(activity: InsertTaskActivity): Promise<TaskActivity> {
    const id = this.activityId++;
    const now = new Date();
    const newActivity: TaskActivity = { ...activity, id, timestamp: now };
    this.taskActivities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
