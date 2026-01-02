"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Check, Clock, X, 
  Play, Pause, RotateCcw, Calendar, 
  Headphones, Repeat, Zap, Moon, Coffee,
  Sparkles, Music
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

const TIMER_MODES: { mode: TimerMode; minutes: number; icon: any }[] = [
  { mode: "Focus", minutes: 25, icon: Zap },
  { mode: "Short Break", minutes: 5, icon: Coffee },
  { mode: "Long Break", minutes: 15, icon: Moon },
];

// Nguồn nhạc xịn hơn (FluxFM Lofi)
const LOFI_STREAM_URL = "https://streams.fluxfm.de/lofi/mp3-128/streams.fluxfm.de/"; 
const SOUND_POP = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; 
const SOUND_SUCCESS = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3";

export default function VibeOS() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState<Tab>("Tasks");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Life");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  // Music & Timer
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("Focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTask, setTimerTask] = useState<string | null>(null);

  const isInitiating = useRef(true);
  const [playPop] = useSound(SOUND_POP, { volume: 0.5 });
  const [playSuccess] = useSound(SOUND_SUCCESS, { volume: 0.5 });

  // Tính toán % tiến độ
  const progress = todos.length > 0 
    ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) 
    : 0;

  // --- INITIALIZATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTodos = localStorage.getItem("vibe-os-todos-v2");
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      const savedHabits = localStorage.getItem("vibe-os-habits-v2");
      if (savedHabits) {
        const parsedHabits: Habit[] = JSON.parse(savedHabits);
        const today = new Date().toISOString().split('T')[0];
        const updatedHabits = parsedHabits.map(h => {
            if (h.lastCompleted !== today) return { ...h, completedToday: false };
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
    localStorage.setItem("vibe-os-todos-v2", JSON.stringify(todos));
    localStorage.setItem("vibe-os-habits-v2", JSON.stringify(habits));
  }, [todos, habits]);

  // --- MUSIC & EFFECTS ---
  useEffect(() => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.play().catch(e => {
            console.log("Audio Error:", e);
            setMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicPlaying]);

  // Tự động bắn pháo giấy khi hoàn thành 100% Task
  useEffect(() => {
    if (!isInitiating.current && todos.length > 0 && progress === 100) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        playSuccess();
    }
  }, [progress, todos.length, playSuccess]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
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

  // --- HELPER FUNCTIONS ---
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    playPop();
    if (activeTab === "Tasks") {
        setTodos([{ id: Date.now(), text: input, completed: false, category: selectedCategory, priority: selectedPriority, dueDate: dueDate }, ...todos]);
    } else {
        setHabits([{ id: Date.now(), text: input, streak: 0, lastCompleted: null, completedToday: false }, ...habits]);
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
            } 
            return { ...h, completedToday: false, streak: Math.max(0, h.streak - 1), lastCompleted: null };
        }
        return h;
    }));
  };

  const deleteItem = (id: number) => {
    if (activeTab === "Tasks") setTodos(prev => prev.filter(t => t.id !== id));
    else setHabits(prev => prev.filter(h => h.id !== id));
  };

  const changeTimerMode = (mode: TimerMode) => {
      setTimerMode(mode);
      const min = TIMER_MODES.find(m => m.mode === mode)?.minutes || 25;
      setTimeLeft(min * 60);
      setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isClient) return <div className="min-h-screen bg-black flex items-center justify-center text-neutral-600 animate-pulse">Loading Vibe OS...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      <audio ref={audioRef} src={LOFI_STREAM_URL} preload="none" />

      {/* --- BACKGROUND BLOBS (PULSING WITH MUSIC) --- */}
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] transition-all duration-[2000ms] ease-in-out ${musicPlaying ? "scale-110 opacity-60" : "scale-100 opacity-30"}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] transition-all duration-[2000ms] ease-in-out ${musicPlaying ? "scale-125 opacity-60" : "scale-100 opacity-30"}`} />

      {/* --- POMODORO MODAL --- */}
      <AnimatePresence>
        {showTimer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden">
                {/* Visual Background for Timer */}
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 transition-opacity duration-1000 ${isTimerRunning ? "opacity-100" : "opacity-0"}`} />
                
                <button onClick={() => setShowTimer(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white z-10"><X size={24} /></button>
                
                <div className="flex justify-center gap-2 mb-8 relative z-10">
                    {TIMER_MODES.map((m) => (
                        <button key={m.mode} onClick={() => changeTimerMode(m.mode)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${timerMode === m.mode ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25" : "bg-neutral-800 text-neutral-400"}`}
                        >
                            {m.mode}
                        </button>
                    ))}
                </div>

                <div className="text-center mb-8 relative z-10">
                    <div className="text-8xl font-mono font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 drop-shadow-2xl">
                        {formatTime(timeLeft)}
                    </div>
                    {timerTask && <p className="text-neutral-400 mt-2 text-sm line-clamp-1 flex items-center justify-center gap-2"><Zap size={14}/> {timerTask}</p>}
                </div>

                <div className="flex justify-center gap-6 items-center relative z-10">
                    <button onClick={() => { const min = TIMER_MODES.find(m => m.mode === timerMode)?.minutes || 25; setTimeLeft(min * 60); setIsTimerRunning(false); }} className="p-4 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all"><RotateCcw size={20} /></button>
                    <button onClick={() => { setIsTimerRunning(!isTimerRunning); if(!musicPlaying && !isTimerRunning) setMusicPlaying(true); }} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                        {isTimerRunning ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1"/>}
                    </button>
                    <button onClick={() => setMusicPlaying(!musicPlaying)} className={`p-4 rounded-full transition-all ${musicPlaying ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}>
                        <Music size={20} />
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN UI --- */}
      <div className="w-full max-w-xl z-10">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 flex items-center gap-2">
                    Vibe OS <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/5 tracking-wider">v2.0</span>
                </h1>
                <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
                    {musicPlaying ? <span className="flex items-center gap-1 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/> Now Playing: Lofi Radio</span> : "Design your flow."}
                </p>
            </div>

            <div className="flex items-center gap-4">
                 {/* Music Toggle */}
                 <button onClick={() => setMusicPlaying(!musicPlaying)} className={`p-3 rounded-full transition-all ${musicPlaying ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40 animate-pulse" : "bg-neutral-800 text-neutral-500 hover:text-white"}`}>
                    <Headphones size={20} />
                 </button>
                 
                 {/* Timer Toggle */}
                 <button onClick={() => setShowTimer(true)} className="p-3 rounded-full bg-neutral-800 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-all">
                    <Clock size={20} />
                 </button>

                 {/* PROGRESS RING (HỒI SINH) */}
                 <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-800" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            className={`transition-all duration-1000 ease-out ${progress === 100 ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "text-purple-500"}`}
                            strokeDasharray={126} 
                            strokeDashoffset={126 - (126 * progress) / 100} 
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-bold">{progress}%</span>
                 </div>
            </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex p-1 bg-neutral-900/60 backdrop-blur-md rounded-2xl mb-6 border border-neutral-800">
            {(["Tasks", "Habits"] as Tab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === tab ? "bg-neutral-800 text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300"}`}
                >
                    {tab === "Tasks" ? "Tasks Flow" : "Daily Habits"}
                </button>
            ))}
        </div>

        {/* INPUT BOX */}
        <motion.div layout className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-5 rounded-3xl mb-8 shadow-2xl">
          <form onSubmit={addTodo} className="flex gap-3 mb-4">
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === "Tasks" ? "Hôm nay cần làm gì nhỉ..." : "Thói quen mới (VD: Uống nước)..."}
              className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-neutral-600"
            />
            <button type="submit" className="bg-white text-black hover:bg-purple-200 px-5 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95"><Plus size={26} /></button>
          </form>
          
          {activeTab === "Tasks" && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-neutral-950/50 rounded-xl p-1 border border-neutral-800">
                    {CATEGORIES.map(cat => (
                        <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                            className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1.5 ${selectedCategory === cat.name ? cat.color + " text-white shadow-md" : "text-neutral-500 hover:text-white"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat.name ? "bg-white" : cat.color}`} />
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-neutral-950/50 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer group">
                    <Calendar size={14} className="group-hover:text-purple-400 transition-colors"/>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent border-none outline-none text-neutral-300 w-24 cursor-pointer opacity-80" />
                </div>
              </div>
          )}
        </motion.div>

        {/* TASK / HABIT LIST */}
        <div className="space-y-3 pb-32">
          <AnimatePresence mode="popLayout">
            {activeTab === "Tasks" ? (
                todos.length > 0 ? todos.map((todo) => (
                  <motion.div
                    key={todo.id} layout initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${todo.completed ? "bg-neutral-900/30 border-transparent opacity-50" : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80 hover:shadow-xl hover:-translate-y-1"}`}
                  >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <button onClick={() => toggleTodo(todo.id)} className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${todo.completed ? "bg-purple-500 border-purple-500 scale-100" : "border-neutral-600 hover:border-purple-400 text-transparent hover:scale-110"}`}>
                        <Check size={14} strokeWidth={4} color="white" />
                      </button>
                      <div className="min-w-0">
                          <p className={`text-base truncate transition-all ${todo.completed ? "line-through text-neutral-500" : "text-neutral-200 font-medium"}`}>{todo.text}</p>
                          <div className="flex gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md bg-opacity-10 font-medium ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'bg-')} ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'text-')}`}>{todo.category}</span>
                              {todo.dueDate && <span className="text-[10px] text-neutral-500 flex items-center gap-1"><Calendar size={10}/> {todo.dueDate}</span>}
                          </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                         {!todo.completed && <button onClick={() => { setTimerTask(todo.text); setShowTimer(true); }} className="p-2 text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg"><Zap size={18} /></button>}
                         <button onClick={() => deleteItem(todo.id)} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                )) : (
                    <div className="text-center py-16 opacity-60">
                        <Sparkles size={40} className="mx-auto text-purple-400 mb-4 animate-pulse" />
                        <p className="text-neutral-400">All caught up! Time to chill.</p>
                    </div>
                )
            ) : (
                habits.length > 0 ? habits.map((habit) => (
                    <motion.div
                      key={habit.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${habit.completedToday ? "bg-green-500/10 border-green-500/30" : "bg-neutral-900/60 border-neutral-800"}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleHabit(habit.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${habit.completedToday ? "bg-green-500 text-white scale-105" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700 hover:text-white"}`}>
                          {habit.completedToday ? <Check size={24} strokeWidth={3} /> : <Repeat size={24} />}
                        </button>
                        <div>
                            <p className={`text-lg font-medium transition-colors ${habit.completedToday ? "text-green-400" : "text-neutral-200"}`}>{habit.text}</p>
                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${habit.completedToday ? "bg-green-500/20 text-green-300" : "bg-neutral-800 text-neutral-400"}`}>
                                    <Zap size={10} fill="currentColor"/> {habit.streak} day streak
                                </span>
                            </p>
                        </div>
                      </div>
                      <button onClick={() => deleteItem(habit.id)} className="p-2 text-neutral-600 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                    </motion.div>
                )) : (
                    <div className="text-center py-16 opacity-60">
                        <Repeat size={40} className="mx-auto text-blue-400 mb-4" />
                        <p className="text-neutral-400">Build a new habit today.</p>
                    </div>
                )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}