import { type User, type InsertUser, type Task, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  loadTasksFromFile(): Promise<void>;
  saveTasksToFile(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private tasksFilePath: string;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.tasksFilePath = path.resolve(process.cwd(), "tasks.json");
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      ...insertTask, 
      id,
      status: insertTask.status || "pending"
    };
    this.tasks.set(id, task);
    await this.saveTasksToFile();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask: Task = { ...existingTask, ...updates };
    this.tasks.set(id, updatedTask);
    await this.saveTasksToFile();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      await this.saveTasksToFile();
    }
    return deleted;
  }

  async loadTasksFromFile(): Promise<void> {
    try {
      const data = await fs.readFile(this.tasksFilePath, "utf-8");
      const tasksArray: Task[] = JSON.parse(data);
      this.tasks.clear();
      tasksArray.forEach(task => {
        this.tasks.set(task.id, task);
      });
    } catch (error) {
      // File doesn't exist or is invalid, start with empty tasks
      this.tasks.clear();
    }
  }

  async saveTasksToFile(): Promise<void> {
    try {
      const tasksArray = Array.from(this.tasks.values());
      await fs.writeFile(this.tasksFilePath, JSON.stringify(tasksArray, null, 2));
    } catch (error) {
      console.error("Failed to save tasks to file:", error);
    }
  }
}

export const storage = new MemStorage();

// Load tasks from file on startup
storage.loadTasksFromFile().catch(console.error);
