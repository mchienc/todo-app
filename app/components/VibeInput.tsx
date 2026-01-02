"use client";
import { useState } from "react";
import { Plus, Flag } from "lucide-react";
import { Category, CATEGORIES, Tab, Priority, PRIORITIES } from "../types";

const EMOJI_LIST = ["⚡", "🔥", "💻", "🎨", "📚", "🏃", "💧", "🎵", "🍔", "💤", "🛒", "✈️"];

interface Props {
  onAdd: (text: string, category: Category, emoji: string, priority: Priority) => void;
  activeTab: Tab;
  selectedDateStr: string;
}

export default function VibeInput({ onAdd, activeTab, selectedDateStr }: Props) {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Life");
  const [selectedEmoji, setSelectedEmoji] = useState("⚡");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Medium");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAdd(input, selectedCategory, selectedEmoji, selectedPriority);
    setInput("");
    setShowEmojiPicker(false);
    setSelectedPriority("Medium"); // Reset priority
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-4 rounded-3xl mb-6 relative z-20 shadow-xl">
      <form onSubmit={handleSubmit} className="flex gap-3 mb-3">
        <div className="relative">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-xl hover:bg-neutral-700 transition-colors">
            {selectedEmoji}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-14 left-0 bg-neutral-800 border border-neutral-700 p-2 rounded-xl grid grid-cols-4 gap-1 shadow-xl w-48 z-50">
              {EMOJI_LIST.map(emoji => (
                <button type="button" key={emoji} onClick={() => { setSelectedEmoji(emoji); setShowEmojiPicker(false); }} className="p-2 hover:bg-neutral-700 rounded-lg text-lg transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <input 
          type="text" value={input} onChange={(e) => setInput(e.target.value)} 
          placeholder={activeTab === "Tasks" ? "Thêm việc mới..." : "Thêm thói quen mới..."}
          className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-neutral-600"
        />
        <button type="submit" className="bg-white text-black w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"><Plus size={24} /></button>
      </form>
      
      {activeTab === "Tasks" && (
        <div className="flex items-center justify-between">
          {/* Category Selector */}
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.name} type="button" onClick={() => setSelectedCategory(cat.name)} className={`text-[10px] px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${selectedCategory === cat.name ? cat.color + " text-white" : "bg-neutral-950 text-neutral-500 hover:text-white"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat.name ? "bg-white" : cat.color}`} /> {cat.name}
              </button>
            ))}
          </div>

          {/* Priority Selector */}
          <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg">
             {PRIORITIES.map(p => (
                 <button 
                    key={p.name} 
                    type="button" 
                    onClick={() => setSelectedPriority(p.name)}
                    className={`p-1.5 rounded-md transition-all ${selectedPriority === p.name ? "bg-neutral-800 text-white" : "text-neutral-600 hover:text-neutral-400"}`}
                    title={p.name}
                 >
                    <Flag size={14} className={p.color} fill={selectedPriority === p.name ? "currentColor" : "none"}/>
                 </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}