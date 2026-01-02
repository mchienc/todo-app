"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Target, Calendar, Flame } from "lucide-react";
import { Todo, Habit, Theme } from "../types";

interface Props {
  show: boolean;
  onClose: () => void;
  todos: Todo[];
  habits: Habit[];
  theme: Theme;
}

export default function VibeStats({ show, onClose, todos, habits, theme }: Props) {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const bestStreak = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0);
  const totalHabitsDone = habits.filter(h => h.completedToday).length;

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`bg-neutral-900 border ${theme.border} p-8 rounded-3xl w-full max-w-md relative shadow-2xl`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={24} /></button>
            
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme.text}`}>
              <Trophy size={28} /> Dashboard
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Card 1 */}
                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-700">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1"><Target size={16}/> Completion</div>
                    <div className="text-3xl font-bold text-white">{completionRate}%</div>
                    <div className="text-xs text-neutral-500">{completedTasks} / {totalTasks} tasks</div>
                </div>
                {/* Card 2 */}
                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-700">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1"><Flame size={16}/> Best Streak</div>
                    <div className="text-3xl font-bold text-white">{bestStreak} <span className="text-sm font-normal text-neutral-500">days</span></div>
                    <div className="text-xs text-neutral-500">Keep burning!</div>
                </div>
            </div>

            {/* Daily Summary */}
            <div className="bg-neutral-800/30 p-4 rounded-2xl border border-neutral-800">
                <h3 className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2"><Calendar size={16}/> Today's Focus</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Habits Done</span>
                        <span className="text-white font-bold">{totalHabitsDone} / {habits.length}</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${theme.bg}`} style={{ width: `${habits.length > 0 ? (totalHabitsDone/habits.length)*100 : 0}%` }} />
                    </div>
                </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}