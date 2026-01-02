// app/types.ts

export type Category = "Code" | "Design" | "Life";
// 1. Thêm Priority Type
export type Priority = "High" | "Medium" | "Low"; 
export type Tab = "Tasks" | "Habits";
export type TimerMode = "Focus" | "Short Break" | "Long Break";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority; // 2. Thêm vào interface
  emoji: string;
  dueDate: string; // YYYY-MM-DD
}

export interface Habit {
  id: number;
  text: string;
  emoji: string;
  streak: number;
  lastCompleted: string | null;
  completedToday: boolean;
}

export const CATEGORIES: { name: Category; color: string }[] = [
  { name: "Code", color: "bg-blue-500" },
  { name: "Design", color: "bg-pink-500" },
  { name: "Life", color: "bg-green-500" },
];

// 3. Định nghĩa màu sắc cho Priority
export const PRIORITIES: { name: Priority; color: string; bg: string }[] = [
  { name: "High", color: "text-red-400", bg: "bg-red-500" },
  { name: "Medium", color: "text-yellow-400", bg: "bg-yellow-500" },
  { name: "Low", color: "text-blue-400", bg: "bg-blue-500" },
];