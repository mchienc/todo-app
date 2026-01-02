"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Check, Sparkles, Tag, Clock, X, 
  Play, Pause, RotateCcw, Calendar, AlertCircle, 
  Edit2, Save, Volume2, VolumeX 
} from "lucide-react";
import useSound from "use-sound";
import confetti from "canvas-confetti";

// --- TYPES ---
type Category = "Code" | "Design" | "Life";
type Priority = "High" | "Medium" | "Low";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
}

// --- CONSTANTS ---
const CATEGORIES: { name: Category; color: string }[] = [
  { name: "Code", color: "bg-blue-500" },
  { name: "Design", color: "bg-pink-500" },
  { name: "Life", color: "bg-green-500" },
];

const PRIORITIES: { name: Priority; color: string }[] = [
  { name: "High", color: "text-red-400 border-red-400" },
  { name: "Medium", color: "text-yellow-400 border-yellow-400" },
  { name: "Low", color: "text-blue-400 border-blue-400" },
];

// Link âm thanh online (Dùng tạm nếu bạn chưa có file trong thư mục public)
const SOUND_POP = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; 
const SOUND_SUCCESS = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3";
const SOUND_DELETE = "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3";

export default function VibeTodo() {
  // --- STATES ---
  const [todos, setTodos] = useState<Todo[]>([]);
  
  // Form States
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Life");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // System States
  const [isClient, setIsClient] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Focus Mode States
  const [focusMode, setFocusMode] = useState<{ active: boolean; task: string | null }>({ active: false, task: null });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const isInitiating = useRef(true);

  // --- SOUNDS ---
  const [playPop] = useSound(SOUND_POP, { volume: 0.5, soundEnabled });
  const [playSuccess] = useSound(SOUND_SUCCESS, { volume: 0.5, soundEnabled });
  const [playDelete] = useSound(SOUND_DELETE, { volume: 0.3, soundEnabled });

  // --- LOGIC: INIT & SAVE ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("vibe-data-ultimate");
      if (saved) {
        try { setTodos(JSON.parse(saved)); } catch (e) { console.error(e); }
      }
      setIsClient(true);
      isInitiating.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitiating.current) return;
    localStorage.setItem("vibe-data-ultimate", JSON.stringify(todos));
  }, [todos]);

  // --- LOGIC: TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, playSuccess]);

  // --- LOGIC: CONFETTI ---
  useEffect(() => {
    if (!isInitiating.current && todos.length > 0 && todos.every(t => t.completed)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#3b82f6']
      });
      playSuccess();
    }
  }, [todos, playSuccess]);

  // --- ACTIONS ---
  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    playPop();
    const newTodo: Todo = { 
      id: Date.now(), 
      text: input, 
      completed: false,
      category: selectedCategory,
      priority: selectedPriority,
      dueDate: dueDate
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
    setDueDate("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) => prev.map((t) => {
        if (t.id === id) {
            if (!t.completed) playSuccess();
            return { ...t, completed: !t.completed };
        }
        return t;
    }));
  };

  const deleteTodo = (id: number) => {
    playDelete();
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText } : t));
    setEditingId(null);
    playPop();
  };

  // --- HELPERS ---
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
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* --- FOCUS MODE OVERLAY --- */}
      <AnimatePresence>
        {focusMode.active && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl text-center w-full max-w-sm relative">
              <button 
                onClick={() => { setFocusMode({ active: false, task: null }); setIsTimerRunning(false); }}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-8 text-white/90 line-clamp-2">{focusMode.task}</h2>
              <div className="text-7xl font-mono font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                {formatTime(timeLeft)}
              </div>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isTimerRunning ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1"/>}
                </button>
                <button 
                  onClick={() => { setTimeLeft(25*60); setIsTimerRunning(false); }}
                  className="w-16 h-16 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl z-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex gap-2 items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Ultimate Flow <Sparkles size={20} className="text-yellow-200" />
              </h1>
              <p className="text-neutral-500 text-sm mt-1">Master your day, one click at a time.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-neutral-500 hover:text-white transition-colors">
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                 </button>
                {/* Circular Progress */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-800" />
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            className="text-purple-500 transition-all duration-1000 ease-out" 
                            strokeDasharray={150} 
                            strokeDashoffset={150 - (150 * progress) / 100} 
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-bold">{progress}%</span>
                </div>
            </div>
        </div>

        {/* INPUT AREA */}
        <motion.div layout className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-4 rounded-2xl mb-8 shadow-2xl">
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Thêm nhiệm vụ mới..."
              className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-neutral-600"
            />
            <button
              type="submit"
              className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20"
            >
              <Plus size={24} />
            </button>
          </form>
          
          {/* Controls: Category, Priority, Date */}
          <div className="flex flex-wrap items-center gap-3">
             {/* Categories */}
            <div className="flex bg-neutral-950/50 rounded-lg p-1 border border-neutral-800">
                {CATEGORIES.map(cat => (
                <button
                    key={cat.name}
                    type="button"
                    onClick={() => { playPop(); setSelectedCategory(cat.name); }}
                    className={`text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.name 
                        ? `${cat.color} text-white shadow-md` 
                        : "text-neutral-400 hover:text-white"
                    }`}
                >
                    {cat.name}
                </button>
                ))}
            </div>

            {/* Priority */}
            <div className="flex bg-neutral-950/50 rounded-lg p-1 border border-neutral-800">
                {PRIORITIES.map(p => (
                    <button
                        key={p.name}
                        type="button"
                        onClick={() => { playPop(); setSelectedPriority(p.name); }}
                        className={`p-1.5 rounded-md transition-all ${selectedPriority === p.name ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-white"}`}
                        title={p.name}
                    >
                        <AlertCircle size={14} className={p.color.split(' ')[0]} fill={selectedPriority === p.name ? "currentColor" : "none"} />
                    </button>
                ))}
            </div>

            {/* Date Picker */}
            <div className="relative group">
                <div className="flex items-center gap-2 bg-neutral-950/50 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer">
                    <Calendar size={14} />
                    <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-neutral-300 w-24 cursor-pointer  [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                </div>
            </div>
          </div>
        </motion.div>

        {/* TODO LIST */}
        <div className="space-y-3 pb-20">
          <AnimatePresence initial={false} mode="popLayout">
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`
                  group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                  ${todo.completed 
                    ? "bg-neutral-900/20 border-transparent opacity-50" 
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
                  }
                `}
              >
                {/* Checkbox & Content */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`
                      w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0
                      ${todo.completed 
                        ? "bg-purple-500 border-purple-500 text-white scale-100" 
                        : "border-neutral-600 hover:border-purple-400 text-transparent scale-90 hover:scale-100"
                      }
                    `}
                  >
                    <Check size={14} strokeWidth={4} />
                  </button>
                  
                  <div className="flex flex-col flex-1 gap-1">
                     {editingId === todo.id ? (
                        <form onSubmit={(e) => { e.preventDefault(); saveEdit(todo.id); }} className="flex items-center gap-2">
                            <input 
                                autoFocus
                                type="text" 
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={() => saveEdit(todo.id)}
                                className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-sm w-full outline-none focus:border-purple-500"
                            />
                        </form>
                     ) : (
                        <span 
                            onDoubleClick={() => startEditing(todo)}
                            className={`text-base font-medium transition-all cursor-pointer ${todo.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}
                        >
                            {todo.text}
                        </span>
                     )}
                     
                     {/* Tags & Meta */}
                     <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-opacity-10 border border-opacity-20 flex items-center gap-1 font-medium
                            ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'bg-')} 
                            ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'text-')}
                            ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'border-')}
                        `}>
                            {todo.category}
                        </span>

                        {todo.priority !== "Medium" && (
                            <span className={`text-[10px] flex items-center gap-1 border px-1.5 py-0.5 rounded-md ${PRIORITIES.find(p => p.name === todo.priority)?.color}`}>
                                <AlertCircle size={10} fill="currentColor" /> {todo.priority}
                            </span>
                        )}

                        {todo.dueDate && (
                             <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                                <Calendar size={10} /> {todo.dueDate}
                             </span>
                        )}
                     </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  {!todo.completed && (
                    <>
                        <button 
                            onClick={() => { playPop(); setFocusMode({ active: true, task: todo.text }); setTimeLeft(25*60); setIsTimerRunning(true); }}
                            className="p-2 text-neutral-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                            title="Focus Mode"
                        >
                            <Clock size={16} />
                        </button>
                        <button 
                            onClick={() => startEditing(todo)}
                            className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todos.length === 0 && (
            <div className="text-center py-12 opacity-50">
                <Sparkles size={32} className="mx-auto mb-3 text-purple-400" />
                <p className="text-neutral-400 text-sm">Danh sách trống trơn.</p>
                <p className="text-neutral-600 text-xs mt-1">Thêm việc gì đó ngầu ngầu đi...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}