"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, Sparkles } from "lucide-react";

// Định nghĩa kiểu dữ liệu
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function VibeTodo() {
  // --- KHAI BÁO STATE ---
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [isClient, setIsClient] = useState(false);
  const isFirstRender = useRef(true);

  // --- LOGIC LOAD & SAVE ---
  
  // 1. Chỉ chạy 1 lần khi mở app để load dữ liệu
  useEffect(() => {
    setIsClient(true); // Đánh dấu đã load xong client
    const saved = localStorage.getItem("vibe-data-v1");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi dữ liệu cũ:", e);
      }
    }
  }, []);

  // 2. Tự động lưu khi todos thay đổi (trừ lần đầu tiên)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem("vibe-data-v1", JSON.stringify(todos));
  }, [todos]);

  // --- CÁC HÀM XỬ LÝ ---
  
  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const newTodo = { id: Date.now(), text: input, completed: false };
    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Nếu chưa load client xong thì không hiện gì để tránh lỗi giao diện
  if (!isClient) return null;

  // --- GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center gap-2">
            Daily Flow <Sparkles size={24} className="text-yellow-200" />
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">Focus on what matters.</p>
        </motion.div>

        {/* Input Form */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={addTodo} 
          className="relative mb-8 group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Việc cần làm..."
            className="w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl py-4 pl-6 pr-14 text-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-neutral-600 shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-2 bg-neutral-800 hover:bg-purple-600 rounded-xl transition-colors duration-300 text-neutral-400 hover:text-white"
          >
            <Plus size={24} />
          </button>
        </motion.form>

        {/* Danh sách Todo */}
        <div className="space-y-3">
          <AnimatePresence initial={false} mode="popLayout">
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`
                  group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                  ${todo.completed 
                    ? "bg-neutral-900/30 border-transparent opacity-60" 
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80 shadow-lg"
                  }
                `}
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer select-none" 
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div className={`
                      w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300
                      ${todo.completed 
                        ? "bg-purple-500 border-purple-500 text-white" 
                        : "border-neutral-600 text-transparent hover:border-purple-400"
                      }
                    `}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className={`text-lg transition-all duration-300 ${todo.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}>
                    {todo.text}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                  }}
                  className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-600 py-10"
            >
              <p>Mọi thứ sạch sẽ, tận hưởng đi...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}