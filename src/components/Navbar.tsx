import { Search, Bell, User, Menu, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-10 h-20 flex items-center justify-between ${
        isScrolled ? 'bg-[#080808]/90 border-b border-white/10 backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
      dir="rtl"
    >
      <div className="flex items-center gap-12">
        <motion.h1 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black tracking-tighter bg-gradient-to-l from-red-600 to-red-400 bg-clip-text text-transparent cursor-pointer"
        >
          ZANIME
        </motion.h1>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#" className="text-white border-b-2 border-red-600 pb-1">سەرەتا</a>
          <a href="#" className="hover:text-white transition-colors">فیلمەکان</a>
          <a href="#" className="hover:text-white transition-colors">زنجیرەکان</a>
          <a href="#" className="hover:text-white transition-colors">ئەنیمێ</a>
          <a href="#" className="hover:text-white transition-colors">نوێترینەکان</a>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-zinc-900 border border-white/10 rounded-full px-4 py-2 w-64 group focus-within:ring-1 focus-within:ring-red-600/50 transition-all">
          <Search size={16} className="text-zinc-500 ml-2" />
          <input 
            type="text" 
            placeholder="بگەڕێ بۆ فیلم..." 
            className="bg-transparent border-none outline-none text-xs w-full text-right text-white placeholder:text-zinc-600"
          />
        </div>
        
        <button className="text-zinc-400 hover:text-white transition-colors relative md:hidden">
          <Search size={22} />
        </button>

        <button className="text-zinc-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-black"></span>
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-indigo-600 flex items-center justify-center text-xs font-bold border border-white/10 cursor-pointer overflow-hidden">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <button className="md:hidden text-zinc-400">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
