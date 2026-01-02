// app/types.ts

export type Category = "Code" | "Design" | "Life";
export type Priority = "High" | "Medium" | "Low";
export type Tab = "Tasks" | "Habits";
export type TimerMode = "Focus" | "Short Break" | "Long Break";
// 1. Định nghĩa Theme
export type ThemeType = "Nebula" | "Sunset" | "Forest" | "Ocean" | "Midnight";

export interface Theme {
  name: ThemeType;
  bg: string;        // Màu nền chính (nút, thanh)
  text: string;      // Màu chữ chính
  glow: string;      // Màu phát sáng (blob)
  border: string;    // Màu viền
  accent: string;    // Màu nhấn mạnh
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
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

export const PRIORITIES: { name: Priority; color: string }[] = [
  { name: "High", color: "text-red-400" },
  { name: "Medium", color: "text-yellow-400" },
  { name: "Low", color: "text-blue-400" },
];

// 2. Danh sách các bộ màu (Themes)
export const THEMES: Theme[] = [
  { 
    name: "Nebula", 
    bg: "bg-purple-600", 
    text: "text-purple-400", 
    glow: "bg-purple-600/20", 
    border: "border-purple-500/30",
    accent: "text-purple-300"
  },
  { 
    name: "Sunset", 
    bg: "bg-orange-500", 
    text: "text-orange-400", 
    glow: "bg-orange-500/20", 
    border: "border-orange-500/30",
    accent: "text-orange-200"
  },
  { 
    name: "Forest", 
    bg: "bg-emerald-600", 
    text: "text-emerald-400", 
    glow: "bg-emerald-600/20", 
    border: "border-emerald-500/30",
    accent: "text-emerald-200"
  },
  { 
    name: "Ocean", 
    bg: "bg-blue-600", 
    text: "text-blue-400", 
    glow: "bg-blue-600/20", 
    border: "border-blue-500/30",
    accent: "text-cyan-200"
  },
  { 
    name: "Midnight", 
    bg: "bg-neutral-100", 
    text: "text-neutral-200", 
    glow: "bg-white/5", 
    border: "border-white/20",
    accent: "text-white"
  },
];