"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Todo } from "../types";

interface Props {
  show: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  todos: Todo[]; // Truyền todo vào để hiển thị dấu chấm
}

export default function VibeCalendar({ show, onClose, selectedDate, onSelectDate, todos }: Props) {
  // State để điều khiển tháng/năm đang xem
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    onSelectDate(dateStr);
    onClose();
  };

  // Helper: Kiểm tra ngày đó có việc không
  const hasTask = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return todos.some(t => t.dueDate === dateStr && !t.completed);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl w-full max-w-sm relative shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={24} /></button>
            
            {/* Header Tháng/Năm */}
            <div className="flex items-center justify-between mb-6 px-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-neutral-800 rounded-full"><ChevronLeft size={20}/></button>
                <h2 className="text-xl font-bold text-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-neutral-800 rounded-full"><ChevronRight size={20}/></button>
            </div>

            {/* Lưới Lịch */}
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-xs font-medium text-neutral-500">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {/* Ô trống đầu tháng */}
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {/* Các ngày trong tháng */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                    const hasDot = hasTask(day);

                    return (
                        <button 
                            key={day} 
                            onClick={() => handleDayClick(day)}
                            className={`
                                h-10 w-10 rounded-full flex flex-col items-center justify-center text-sm relative transition-all
                                ${isSelected ? "bg-purple-500 text-white font-bold shadow-lg" : "hover:bg-neutral-800 text-neutral-300"}
                                ${isToday && !isSelected ? "border border-purple-500 text-purple-400" : ""}
                            `}
                        >
                            {day}
                            {hasDot && !isSelected && <div className="w-1 h-1 rounded-full bg-red-400 absolute bottom-1.5" />}
                        </button>
                    );
                })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}