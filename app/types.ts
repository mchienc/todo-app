// app/types.ts
export type Category = "Code" | "Design" | "Life";
export type Priority = "High" | "Medium" | "Low";
export type Tab = "Tasks" | "Habits";
export type TimerMode = "Focus" | "Short Break" | "Long Break";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
  emoji: string;
  dueDate: string;
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