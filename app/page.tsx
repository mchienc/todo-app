"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Check, Clock, Headphones, Zap, Calendar as CalendarIcon, Flag } from "lucide-react";
import useSound from "use-sound";
import confetti from "canvas-confetti";

import { Todo, Habit, Tab, TimerMode, CATEGORIES, Category, Priority, PRIORITIES } from "./types";
import VibeTimer from "./components/VibeTimer";
import VibeInput from "./components/VibeInput";
import VibeCalendar from "./components/VibeCalendar";

const LOFI_STREAM_URL = "https://streams.fluxfm.de/lofi/mp3-128/streams.fluxfm.de/"; 
const SOUND_POP = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; 
const SOUND_SUCCESS = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3";
const TABS: Tab[] = ["Tasks", "Habits"]; // Định nghĩa Tab ra ngoài cho sạch code

// Hàm helper tính ngày
const generateWeekDates = (pivotDate: Date) => {
  const dates = [];
  const start = new Date(pivotDate);
  start.setDate(pivotDate.getDate() - 3); // Lùi 3 ngày để ngày chọn nằm giữa

  for(let i=0; i<7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
  }
  return dates;
};

export default function VibeOS() {
  const [activeTab, setActiveTab] = useState<Tab>("Tasks");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  
  // Calendar States
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  // FIX LỖI 1: Dùng useMemo thay vì useEffect để tính ngày trong tuần
  // Tự động tính lại weekDates mỗi khi selectedDate thay đổi
  const weekDates = useMemo(() => {
     return generateWeekDates(new Date(selectedDate));
  }, [selectedDate]);

  // System
  const [isClient, setIsClient] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Timer
  const [showTimer, setShowTimer] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("Focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTask, setTimerTask] = useState<string | null>(null);

  const isInitiating = useRef(true);
  const [playPop] = useSound(SOUND_POP, { volume: 0.5 });
  const [playSuccess] = useSound(SOUND_SUCCESS, { volume: 0.5 });

  // Load Data
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTodos = localStorage.getItem("vibe-os-todos-v4");
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      const savedHabits = localStorage.getItem("vibe-os-habits-v4");
      if (savedHabits) {
        const parsedHabits: Habit[] = JSON.parse(savedHabits);
        const todayStr = new Date().toISOString().split('T')[0];
        const updatedHabits = parsedHabits.map(h => {
            if (h.lastCompleted !== todayStr) return { ...h, completedToday: false };
            return h;
        });
        setHabits(updatedHabits);
      }
      setIsClient(true);
      isInitiating.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save Data
  useEffect(() => {
    if (isInitiating.current) return;
    localStorage.setItem("vibe-os-todos-v4", JSON.stringify(todos));
    localStorage.setItem("vibe-os-habits-v4", JSON.stringify(habits));
  }, [todos, habits]);

  // Music & Timer Logic
  useEffect(() => {
    if (audioRef.current) musicPlaying ? audioRef.current.play().catch(() => setMusicPlaying(false)) : audioRef.current.pause();
  }, [musicPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval); setIsTimerRunning(false); playSuccess(); setMusicPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, playSuccess]);

  // Actions
  const handleAdd = (text: string, category: Category, emoji: string, priority: Priority) => {
    playPop();
    if (activeTab === "Tasks") {
      setTodos([{ id: Date.now(), text, completed: false, category, emoji, priority, dueDate: selectedDate }, ...todos]);
    } else {
      setHabits([{ id: Date.now(), text, streak: 0, emoji, lastCompleted: null, completedToday: false }, ...habits]);
    }
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
                playSuccess(); confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
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

  const filteredTodos = todos.filter(t => t.dueDate === selectedDate);
  const progress = filteredTodos.length > 0 ? Math.round((filteredTodos.filter(t => t.completed).length / filteredTodos.length) * 100) : 0;
  
  const formatDateTitle = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (!isClient) return <div className="min-h-screen bg-black flex items-center justify-center text-neutral-600 animate-pulse">Booting Vibe OS v4...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      <audio ref={audioRef} src={LOFI_STREAM_URL} preload="none" />
      
      <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] transition-all duration-[3000ms] ${musicPlaying ? "scale-110 opacity-50" : "scale-100 opacity-20"}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] transition-all duration-[3000ms] ${musicPlaying ? "scale-110 opacity-50" : "scale-100 opacity-20"}`} />

      <VibeTimer show={showTimer} onClose={() => setShowTimer(false)} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isRunning={isTimerRunning} setIsRunning={setIsTimerRunning} mode={timerMode} setMode={setTimerMode} taskName={timerTask} musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying} />
      
      <VibeCalendar show={showCalendar} onClose={() => setShowCalendar(false)} selectedDate={selectedDate} onSelectDate={setSelectedDate} todos={todos} />

      <div className="w-full max-w-xl z-10">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">Vibe OS <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-full">Pro</span></h1>
            <div className="flex items-center gap-3">
                 <button onClick={() => setMusicPlaying(!musicPlaying)} className={`p-2.5 rounded-full transition-all ${musicPlaying ? "bg-purple-500 text-white animate-pulse" : "bg-neutral-800 text-neutral-500"}`}><Headphones size={18} /></button>
                 <button onClick={() => setShowTimer(true)} className="p-2.5 rounded-full bg-neutral-800 text-neutral-500 hover:text-white transition-all"><Clock size={18} /></button>
                 {activeTab === "Tasks" && (
                    <div className="relative w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowCalendar(true)}>
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-neutral-800" />
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className={`transition-all duration-1000 ${progress === 100 ? "text-green-400" : "text-purple-500"}`} strokeDasharray={100} strokeDashoffset={100 - (100 * progress) / 100} strokeLinecap="round"/>
                        </svg>
                        <span className="absolute text-[9px] font-bold">{progress}%</span>
                    </div>
                 )}
            </div>
        </div>

        {/* WEEK STRIP */}
        {activeTab === "Tasks" && (
            <div className="mb-2">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-sm text-neutral-400 font-medium">{formatDateTitle(selectedDate)}</h3>
                    <button onClick={() => setShowCalendar(true)} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"><CalendarIcon size={12}/> Open Calendar</button>
                </div>
                <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar pb-4">
                    {weekDates.map((date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = selectedDate === dateStr;
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        return (
                            <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                                className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all border shrink-0 ${isSelected ? "bg-white text-black border-white shadow-lg scale-105" : "bg-neutral-900/40 border-neutral-800 text-neutral-500 hover:bg-neutral-800"}`}>
                                <span className="text-[10px] font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className={`text-lg font-bold ${isSelected ? "text-black" : isToday ? "text-purple-400" : "text-white"}`}>{date.getDate()}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        )}

        {/* FIX LỖI 2: TAB MAPPING CLEAN HƠN */}
        <div className="flex bg-neutral-900/50 p-1 rounded-xl mb-6 border border-neutral-800">
            {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tab ? "bg-neutral-800 text-white shadow" : "text-neutral-500 hover:text-neutral-300"}`}>{tab}</button>
            ))}
        </div>

        <VibeInput onAdd={handleAdd} activeTab={activeTab} selectedDateStr={selectedDate} />

        <div className="space-y-3 pb-32">
            <AnimatePresence mode="popLayout">
                {activeTab === "Tasks" ? (
                    filteredTodos.length > 0 ? filteredTodos.map((todo) => (
                        <motion.div key={todo.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${todo.completed ? "bg-neutral-900/20 border-transparent opacity-50" : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"}`}>
                            <div className="flex items-center gap-4 flex-1">
                                <button onClick={() => toggleTodo(todo.id)} className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${todo.completed ? "bg-purple-500 border-purple-500" : "border-neutral-600 hover:border-purple-400 text-transparent"}`}>
                                    <Check size={14} strokeWidth={4} color="white"/>
                                </button>
                                <div>
                                    <p className={`text-base font-medium flex items-center gap-2 ${todo.completed ? "line-through text-neutral-500" : "text-white"}`}><span>{todo.emoji}</span> {todo.text}</p>
                                    <div className="flex gap-2 mt-1 items-center">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded bg-opacity-10 ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'bg-')} ${CATEGORIES.find(c => c.name === todo.category)?.color.replace('bg-', 'text-')}`}>{todo.category}</span>
                                        <span className={`text-[10px] flex items-center gap-1 ${PRIORITIES.find(p => p.name === todo.priority)?.color}`}>
                                            <Flag size={10} fill="currentColor"/> {todo.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!todo.completed && <button onClick={() => { setTimerTask(todo.text); setShowTimer(true); }} className="p-2 text-neutral-500 hover:text-purple-400"><Zap size={18} /></button>}
                                <button onClick={() => deleteItem(todo.id)} className="p-2 text-neutral-500 hover:text-red-400"><Trash2 size={18} /></button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-12 opacity-50"><p className="text-neutral-400 text-sm">Trống trơn. Tận hưởng ngày nghỉ!</p></div>
                    )
                ) : (
                    habits.length > 0 ? habits.map((habit) => (
                        <motion.div key={habit.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${habit.completedToday ? "bg-green-500/10 border-green-500/30" : "bg-neutral-900/60 border-neutral-800"}`}>
                            <div className="flex items-center gap-4">
                                <button onClick={() => toggleHabit(habit.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${habit.completedToday ? "bg-green-500 text-white" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}>
                                    {habit.completedToday ? <Check size={24} strokeWidth={3} /> : <span className="text-xl">{habit.emoji}</span>}
                                </button>
                                <div>
                                    <p className={`text-lg font-medium ${habit.completedToday ? "text-green-400" : "text-white"}`}>{habit.text}</p>
                                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1"><Zap size={10} fill="currentColor"/> {habit.streak} day streak</p>
                                </div>
                            </div>
                            <button onClick={() => deleteItem(habit.id)} className="p-2 text-neutral-500 hover:text-red-400"><Trash2 size={18} /></button>
                        </motion.div>
                    )) : (
                        <div className="text-center py-12 opacity-50"><p className="text-neutral-400">Tạo thói quen mới đi nào.</p></div>
                    )
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}