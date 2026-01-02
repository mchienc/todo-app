"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Check, Clock, X, 
  Play, Pause, RotateCcw, Calendar, 
  Headphones, Repeat, Zap, Moon, Coffee 
} from "lucide-react";
import useSound from "use-sound";
import confetti from "canvas-confetti";

// --- TYPES ---
type Category = "Code" | "Design" | "Life";
type Priority = "High" | "Medium" | "Low";
type Tab = "Tasks" | "Habits";
type TimerMode = "Focus" | "Short Break" | "Long Break";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string;
}

interface Habit {
  id: number;
  text: string;
  streak: number;
  lastCompleted: string | null;
  completedToday: boolean;
}

// --- CONSTANTS ---
const CATEGORIES: { name: Category; color: string }[] = [
  { name: "Code", color: "bg-blue-500" },
  { name: "Design", color: "bg-pink-500" },
  { name: "Life", color: "bg-green-500" },
];

// 1. FIX LỖI TYPE: Thêm dấu [] vào cuối để báo đây là mảng
const TIMER_MODES: { mode: TimerMode; minutes: number; icon: any }[] = [
  { mode: "Focus", minutes: 25, icon: Zap },
  { mode: "Short Break", minutes: 5, icon: Coffee },
  { mode: "Long Break", minutes: 15, icon: Moon },
];

const LOFI_STREAM_URL = "https://stream.zeno.fm/0r0xa792kwzuv"; 
const SOUND_POP = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; 
const SOUND_SUCCESS = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3";

export default function VibeOS() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState<Tab>("Tasks");
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Life");
  const [selectedPriority] = useState<Priority>("Medium"); // Giữ lại để mở rộng sau này
  const [dueDate, setDueDate] = useState("");

  const [isClient, setIsClient] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Timer States
  const [showTimer, setShowTimer] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("Focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTask, setTimerTask] = useState<string | null>(null);

  const isInitiating = useRef(true);
  const [playPop] = useSound(SOUND_POP, { volume: 0.5 });
  const [playSuccess] = useSound(SOUND_SUCCESS, { volume: 0.5 });

  // --- INITIALIZATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTodos = localStorage.getItem("vibe-os-todos");
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      const savedHabits = localStorage.getItem("vibe-os-habits");
      if (savedHabits) {
        const parsedHabits: Habit[] = JSON.parse(savedHabits);
        const today = new Date().toISOString().split('T')[0];
        
        const updatedHabits = parsedHabits.map(h => {
            if (h.lastCompleted !== today) {
                return { ...h, completedToday: false };
            }
            return h;
        });
        setHabits(updatedHabits);
      }

      setIsClient(true);
      isInitiating.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // --- SAVE DATA ---
  useEffect(() => {
    if (isInitiating.current) return;
    localStorage.setItem("vibe-os-todos", JSON.stringify(todos));
    localStorage.setItem("vibe-os-habits", JSON.stringify(habits));
  }, [todos, habits]);

  // --- MUSIC LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicPlaying]);

  // 2. FIX LỖI TIMER LOOP: Kiểm tra hết giờ bên trong setInterval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Hết giờ: Dừng timer, Phát nhạc, Tắt nhạc nền
            clearInterval(interval);
            setIsTimerRunning(false);
            playSuccess();
            setMusicPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, playSuccess]);

  // --- ACTIONS ---
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    playPop();
    
    if (activeTab === "Tasks") {
        const newTodo: Todo = { 
          id: Date.now(), text: input, completed: false, 
          category: selectedCategory, priority: selectedPriority, dueDate: dueDate
        };
        setTodos([newTodo, ...todos]);
    } else {
        const newHabit: Habit = {
            id: Date.now(), text: input, streak: 0, 
            lastCompleted: null, completedToday: false
        };
        setHabits([newHabit, ...habits]);
    }
    setInput(""); setDueDate("");
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => {
        if (t.id === id && !t.completed) playSuccess();
        return t.id === id ? { ...t, completed: !t.completed } : t;
    }));
  };

  const toggleHabit = (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
        if (h.id === id) {
            if (!h.completedToday) {
                playSuccess();
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                return { ...h, completedToday: true, streak: h.streak + 1, lastCompleted: today };
            } else {
                return { ...h, completedToday: false, streak: Math.max(0, h.streak - 1), lastCompleted: null };
            }
        }
        return h;
    }));
  };

  const deleteItem = (id: number) => {
    if (activeTab === "Tasks") setTodos(prev => prev.filter(t => t.id !== id));
    else setHabits(prev => prev.filter(h => h.id !== id));
  };

  // 3. FIX LỖI FIND/MAP: Code an toàn hơn
  const changeTimerMode = (mode: TimerMode) => {
      setTimerMode(mode);
      // Dùng || 25 để tránh lỗi nếu không tìm thấy
      const min = TIMER_MODES.find(m => m.mode === mode)?.minutes || 25;
      setTimeLeft(min * 60);
      setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isClient) return <div className="min-h-screen bg-black flex items-center justify-center text-neutral-600">Booting Vibe OS...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      <audio ref={audioRef} src={LOFI_STREAM_URL} preload="none" />

      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] transition-all duration-1000 ${musicPlaying ? "animate-pulse scale-110" : ""}`} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

      {/* --- POMODORO MODAL --- */}
      <AnimatePresence>
        {showTimer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative">
                <button onClick={() => setShowTimer(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={24} /></button>
                
                {/* Timer Modes */}
                <div className="flex justify-center gap-2 mb-8">
                    {TIMER_MODES.map((m) => (
                        <button key={m.mode} onClick={() => changeTimerMode(m.mode)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${timerMode === m.mode ? "bg-purple-500 text-white" : "bg-neutral-800 text-neutral-400"}`}
                        >
                            {m.mode}
                        </button>
                    ))}
                </div>

                {/* Clock Display */}
                <div className="text-center mb-8 relative">
                    <div className="text-8xl font-mono font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                        {formatTime(timeLeft)}
                    </div>
                    {timerTask && <p className="text-neutral-400 mt-2 text-sm line-clamp-1">Current Focus: {timerTask}</p>}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6 items-center">
                    <button 
                        onClick={() => { 
                            const min = TIMER_MODES.find(m => m.mode === timerMode)?.minutes || 25;
                            setTimeLeft(min * 60); 
                            setIsTimerRunning(false); 
                        }} 
                        className="p-4 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
                    >
                        <RotateCcw size={20} />
                    </button>
                    
                    <button onClick={() => { setIsTimerRunning(!isTimerRunning); if(!musicPlaying && !isTimerRunning) setMusicPlaying(true); }} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        {isTimerRunning ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1"/>}
                    </button>
                    
                    <button onClick={() => setMusicPlaying(!musicPlaying)} className={`p-4 rounded-full bg-neutral-800 transition-colors ${musicPlaying ? "text-purple-400 bg-purple-400/10" : "text-neutral-400"}`}>
                        <Headphones size={20} />
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN UI --- */}
      <div className="w-full max-w-xl z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                Vibe OS <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-700">v1.1</span>
            </h1>
            <div className="flex items-center gap-3">
                 <button onClick={() => setMusicPlaying(!musicPlaying)} className={`p-2 rounded-full transition-all ${musicPlaying ? "bg-purple-500 text-white animate-pulse" : "bg-neutral-800 text-neutral-500"}`}>
                    <Headphones size={18} />
                 </button>
                 <button onClick={() => setShowTimer(true)} className="p-2 rounded-full bg-neutral-800 text-neutral-500 hover:text-white transition-all">
                    <Clock size={18} />
                 </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-neutral-900/80 rounded-xl mb-6 border border-neutral-800">
            {(["Tasks", "Habits"] as Tab[]).map(tab => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
                >
                    {tab === "Tasks" ? "To-do List" : "Daily Habits"}
                </button>
            ))}
        </div>

        {/* INPUT AREA */}
        <motion.div layout className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-4 rounded-2xl mb-6">
          <form onSubmit={addTodo} className="flex gap-2 mb-3">
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === "Tasks" ? "Thêm công việc mới..." : "Thêm thói quen (VD: Đọc sách)..."}
              className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-neutral-600"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-xl transition-colors"><Plus size={24} /></button>
          </form>
          
          {/* Controls (Only for Tasks) */}
          {activeTab === "Tasks" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-neutral-950/50 rounded-lg p-1 border border-neutral-800">
                    {CATEGORIES.map(cat => (
                        <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                            className={`text-[10px] px-2 py-1 rounded-md transition-all ${selectedCategory === cat.name ? cat.color + " text-white" : "text-neutral-400"}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-neutral-950/50 border border-neutral-800 px-2 py-1 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors">
                    <Calendar size={12} />
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent border-none outline-none text-neutral-300 w-20 cursor-pointer opacity-80" />
                </div>
              </div>
          )}
        </motion.div>

        {/* --- LIST VIEW --- */}
        <div className="space-y-3 pb-24">
          <AnimatePresence mode="popLayout">
            {activeTab === "Tasks" ? (
                // TASKS LIST
                todos.length > 0 ? todos.map((todo) => (
                  <motion.div
                    key={todo.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${todo.completed ? "bg-neutral-900/20 border-transparent opacity-50" : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:shadow-lg"}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${todo.completed ? "bg-purple-500 border-purple-500" : "border-neutral-600 hover:border-purple-400"}`}>
                        {todo.completed && <Check size={12} strokeWidth={4} />}
                      </button>
                      <div>
                          <p className={`text-base font-medium ${todo.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}>{todo.text}</p>
                          <div className="flex gap-2 mt-1">
                              <span className={`text-[10px] px-1.5 rounded bg-opacity-10 text-opacity-80 ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'bg-')} ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'text-')}`}>{todo.category}</span>
                              {todo.dueDate && <span className="text-[10px] text-neutral-500 flex items-center gap-1"><Calendar size={10}/> {todo.dueDate}</span>}
                          </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {!todo.completed && <button onClick={() => { setTimerTask(todo.text); setShowTimer(true); }} className="p-2 text-neutral-400 hover:text-purple-400"><Zap size={16} /></button>}
                         <button onClick={() => deleteItem(todo.id)} className="p-2 text-neutral-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </motion.div>
                )) : <div className="text-center text-neutral-600 py-10">All tasks completed! Chill time.</div>
            ) : (
                // HABITS LIST
                habits.length > 0 ? habits.map((habit) => (
                    <motion.div
                      key={habit.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${habit.completedToday ? "bg-green-500/10 border-green-500/30" : "bg-neutral-900/60 border-neutral-800"}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleHabit(habit.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${habit.completedToday ? "bg-green-500 text-white" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}>
                          {habit.completedToday ? <Check size={20} strokeWidth={3} /> : <Repeat size={20} />}
                        </button>
                        <div>
                            <p className={`text-base font-medium ${habit.completedToday ? "text-green-400" : "text-neutral-200"}`}>{habit.text}</p>
                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                <Zap size={10} className={habit.completedToday ? "text-yellow-400" : "text-neutral-600"} fill={habit.completedToday ? "currentColor" : "none"}/> 
                                Current streak: <span className="text-white font-bold">{habit.streak} days</span>
                            </p>
                        </div>
                      </div>
                      <button onClick={() => deleteItem(habit.id)} className="p-2 text-neutral-600 hover:text-red-400"><Trash2 size={16} /></button>
                    </motion.div>
                )) : <div className="text-center text-neutral-600 py-10">Start a new habit today.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}