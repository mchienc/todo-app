"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, Sparkles, Tag, Clock, X, Play, Pause, RotateCcw } from "lucide-react";

// --- TYPES ---
type Category = "Code" | "Design" | "Life";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
}

// --- CONSTANTS ---
const CATEGORIES: { name: Category; color: string }[] = [
  { name: "Code", color: "bg-blue-500" },
  { name: "Design", color: "bg-pink-500" },
  { name: "Life", color: "bg-green-500" },
];

export default function VibeTodo() {
  // --- STATES ---
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Life");
  const [isClient, setIsClient] = useState(false);
  const [focusMode, setFocusMode] = useState<{ active: boolean; task: string | null }>({ active: false, task: null });
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const isInitiating = useRef(true);

  // --- LOGIC: INITIALIZATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("vibe-data-pro"); // Đổi key mới cho bản Pro
      if (saved) {
        try {
          setTodos(JSON.parse(saved));
        } catch (e) { console.error(e); }
      }
      setIsClient(true);
      isInitiating.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // --- LOGIC: SAVE DATA ---
  useEffect(() => {
    if (isInitiating.current) return;
    localStorage.setItem("vibe-data-pro", JSON.stringify(todos));
  }, [todos]);

  // --- LOGIC: TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false); // Dừng timer khi về 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- ACTIONS ---
  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const newTodo: Todo = { 
      id: Date.now(), 
      text: input, 
      completed: false,
      category: selectedCategory 
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const startFocus = (taskText: string) => {
    setFocusMode({ active: true, task: taskText });
    setTimeLeft(25 * 60);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = todos.length > 0 
    ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) 
    : 0;

  if (!isClient) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-600">Loading Vibe...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />

      {/* --- FOCUS MODE OVERLAY --- */}
      <AnimatePresence>
        {focusMode.active && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="bg-neutral-900/80 border border-neutral-800 p-8 rounded-3xl shadow-2xl text-center w-full max-w-sm relative">
              <button 
                onClick={() => { setFocusMode({ active: false, task: null }); setIsTimerRunning(false); }}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="mb-6">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium uppercase tracking-wider">Focus Mode</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-8 text-white/90 line-clamp-2">{focusMode.task}</h2>
              
              <div className="text-7xl font-mono font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                {formatTime(timeLeft)}
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isTimerRunning ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1"/>}
                </button>
                <button 
                  onClick={() => { setTimeLeft(25*60); setIsTimerRunning(false); }}
                  className="w-14 h-14 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md z-10">
        {/* HEADER & PROGRESS */}
        <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex gap-2 items-center">
                Daily Flow <Sparkles size={20} className="text-purple-400" />
              </h1>
              <p className="text-neutral-500 text-sm mt-1">Keep the momentum going.</p>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-16 h-16 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-800" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                    className="text-purple-500 transition-all duration-1000 ease-out" 
                    strokeDasharray={175} 
                    strokeDashoffset={175 - (175 * progress) / 100} 
                    strokeLinecap="round"
                 />
               </svg>
               <span className="absolute text-xs font-bold">{progress}%</span>
            </div>
        </div>

        {/* INPUT AREA */}
        <motion.div layout className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-2 rounded-2xl mb-6 shadow-xl">
          <form onSubmit={addTodo} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's next?"
              className="flex-1 bg-transparent border-none text-white px-4 focus:outline-none placeholder:text-neutral-600"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>
          
          {/* Category Selector */}
          <div className="flex gap-2 px-4 pb-2 mt-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.name 
                    ? `${cat.color} text-white font-medium` 
                    : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat.name ? "bg-white" : cat.color}`} />
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* TODO LIST */}
        <div className="space-y-3 pb-20">
          <AnimatePresence initial={false} mode="popLayout">
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`
                  group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                  ${todo.completed 
                    ? "bg-neutral-900/30 border-transparent opacity-50" 
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 shadow-sm"
                  }
                `}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0
                      ${todo.completed 
                        ? "bg-purple-500 border-purple-500 text-white" 
                        : "border-neutral-600 hover:border-purple-400 text-transparent"
                      }
                    `}
                  >
                    <Check size={12} strokeWidth={4} />
                  </button>
                  
                  <div className="flex flex-col overflow-hidden">
                     <span className={`text-base truncate transition-all ${todo.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}>
                        {todo.text}
                     </span>
                     <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md bg-opacity-20 ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'bg-')} ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'text-')}`}>
                            {todo.category}
                        </span>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!todo.completed && (
                    <button 
                        onClick={() => startFocus(todo.text)}
                        title="Start Focus Timer"
                        className="p-2 text-neutral-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                    >
                        <Clock size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todos.length === 0 && (
            <div className="text-center py-10">
                <div className="inline-block p-4 rounded-full bg-neutral-900/50 mb-4 text-neutral-600">
                    <Sparkles size={24} />
                </div>
                <p className="text-neutral-500 text-sm">Sẵn sàng để "Design your day" chưa?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}