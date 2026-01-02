"use client";
import { motion, AnimatePresence } from "framer-motion";
// 1. Thêm LucideIcon vào dòng import này
import { X, Play, Pause, RotateCcw, Music, Zap, Coffee, Moon, LucideIcon } from "lucide-react";
import { TimerMode } from "../types";

// 2. Thay "any" bằng "LucideIcon"
const TIMER_MODES: { mode: TimerMode; minutes: number; icon: LucideIcon }[] = [
  { mode: "Focus", minutes: 25, icon: Zap },
  { mode: "Short Break", minutes: 5, icon: Coffee },
  { mode: "Long Break", minutes: 15, icon: Moon },
];

interface Props {
  show: boolean;
  onClose: () => void;
  timeLeft: number;
  setTimeLeft: (t: number) => void;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  mode: TimerMode;
  setMode: (m: TimerMode) => void;
  taskName: string | null;
  musicPlaying: boolean;
  setMusicPlaying: (v: boolean) => void;
}

export default function VibeTimer({ 
  show, onClose, timeLeft, setTimeLeft, isRunning, setIsRunning, 
  mode, setMode, taskName, musicPlaying, setMusicPlaying 
}: Props) {
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    const minutes = TIMER_MODES.find(m => m.mode === newMode)?.minutes || 25;
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    const minutes = TIMER_MODES.find(m => m.mode === mode)?.minutes || 25;
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl w-full max-w-sm relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={24} /></button>
            
            <div className="flex justify-center gap-2 mb-8">
              {TIMER_MODES.map((m) => {
                // Lấy icon ra thành biến riêng để render
                const Icon = m.icon;
                return (
                  <button key={m.mode} onClick={() => handleModeChange(m.mode)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${mode === m.mode ? "bg-purple-500 text-white" : "bg-neutral-800 text-neutral-400"}`}>
                    <Icon size={12} /> {m.mode}
                  </button>
                );
              })}
            </div>

            <div className="text-center mb-8">
              <div className="text-8xl font-mono font-bold tracking-tighter text-white">{formatTime(timeLeft)}</div>
              {taskName && <p className="text-neutral-400 mt-2 text-sm flex items-center justify-center gap-2"><Zap size={14}/> {taskName}</p>}
            </div>

            <div className="flex justify-center gap-6 items-center">
              <button onClick={handleReset} className="p-4 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"><RotateCcw size={20} /></button>
              <button onClick={() => setIsRunning(!isRunning)} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all">
                {isRunning ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1"/>}
              </button>
              <button onClick={() => setMusicPlaying(!musicPlaying)} className={`p-4 rounded-full transition-all ${musicPlaying ? "bg-purple-500 text-white" : "bg-neutral-800 text-neutral-400"}`}><Music size={20} /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}