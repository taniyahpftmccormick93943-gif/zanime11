import { Search, Bell, User, Menu, LogOut, LayoutDashboard, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { signInWithGoogle, logout } from '../lib/firebase';

interface NavbarProps {
  onOpenDashboard: () => void;
  onOpenProModal: () => void;
  onOpenProfile: () => void;
}

export default function Navbar({ onOpenDashboard, onOpenProModal, onOpenProfile }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, loading, isAdmin, isPro } = useAuth();

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
          className="text-3xl font-black tracking-tighter bg-gradient-to-l from-[#facc15] to-orange-400 bg-clip-text text-transparent cursor-pointer"
        >
          ZANIME TV
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

        {user && !isPro && (
          <button 
            onClick={onOpenProModal}
            className="hidden lg:flex items-center gap-2 px-6 py-2 bg-red-600 text-white text-xs font-black rounded-full hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-600/20"
          >
            بەدەستهێنانی <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">PRO</span>
          </button>
        )}

        {!loading && (
          <div className="relative">
            {user ? (
              <div 
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 cursor-pointer overflow-hidden group relative"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                {isPro && (
                  <div className="absolute inset-0 border-2 border-[#facc15] rounded-full pointer-events-none" />
                )}
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-black rounded-full hover:bg-zinc-200 transition-colors"
                dir="rtl"
              >
                چوونە ژوورەوە
              </button>
            )}

            <AnimatePresence>
              {showUserMenu && user && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-white text-xs font-bold truncate">{user.displayName}</p>
                      <p className="text-zinc-500 text-[10px] truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <button 
                        onClick={() => {
                          onOpenDashboard();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-4 py-2 text-[#facc15] hover:bg-white/5 rounded-xl transition-all text-xs font-black"
                      >
                        داشبۆردی ئادمین
                        <LayoutDashboard size={14} />
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        onOpenProfile();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-bold"
                    >
                      مێژووی بینین
                      <History size={14} />
                    </button>

                    <button 
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-bold"
                    >
                      دەچوونە دەرەوە
                      <LogOut size={14} />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
        <button className="md:hidden text-zinc-400">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
