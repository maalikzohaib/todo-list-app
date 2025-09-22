import { type User, type InsertUser, type Task, type InsertTask, users, tasks } from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

// Initialize database connection if available
const connectionString = process.env.DATABASE_URL;
const db = (() => {
  if (!connectionString) return undefined as unknown as ReturnType<typeof drizzle>;
  const client = neon(connectionString);
  return drizzle(client);
})();

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values({
      ...insertTask,
      priority: insertTask.priority || "medium",
      status: insertTask.status || "pending"
    }).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set({
        ...updates,
        updatedAt: sql`now()`
      })
      .where(eq(tasks.id, id))
      .returning();
    
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }
}

class MemoryStorage implements IStorage {
  private memoryUsers: User[] = [];
  private memoryTasks: Task[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.memoryUsers.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.memoryUsers.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      username: user.username,
      password: user.password,
    } as User;
    this.memoryUsers.push(newUser);
    return newUser;
  }

  async getAllTasks(): Promise<Task[]> {
    return [...this.memoryTasks].sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.memoryTasks.find(t => t.id === id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const now = new Date();
    const newTask: Task = {
      id: randomUUID(),
      title: insertTask.title,
      status: insertTask.status ?? "pending",
      priority: insertTask.priority ?? "medium",
      dueDate: insertTask.dueDate ?? null as any,
      createdAt: now as any,
      updatedAt: now as any,
    } as Task;
    this.memoryTasks.push(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const idx = this.memoryTasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    const existing = this.memoryTasks[idx];
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date() as any,
    } as Task;
    this.memoryTasks[idx] = updated;
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const before = this.memoryTasks.length;
    this.memoryTasks = this.memoryTasks.filter(t => t.id !== id);
    return this.memoryTasks.length < before;
  }
}

export const storage: IStorage = connectionString ? new DatabaseStorage() : new MemoryStorage();
