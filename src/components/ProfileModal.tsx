import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Play, Trash2, User, Crown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface WatchHistoryItem {
  id: string;
  movieId: string;
  movieTitle: string;
  originalTitle: string;
  posterUrl: string;
  watchedAt: any;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayMovie: (movieId: string) => void;
}

export default function ProfileModal({ isOpen, onClose, onPlayMovie }: ProfileModalProps) {
  const { user, isPro } = useAuth();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const path = 'watch_history';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', user.uid),
        orderBy('watchedAt', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const items: WatchHistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as WatchHistoryItem);
      });
      setHistory(items);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    const path = `watch_history/${id}`;
    try {
      await deleteDoc(doc(db, 'watch_history', id));
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh]"
            dir="rtl"
          >
            {/* Sidebar / Info */}
            <div className="w-full md:w-80 bg-zinc-900/50 p-8 border-l border-white/10 flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-[#facc15]/20 flex items-center justify-center mb-4 relative overflow-hidden group">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-zinc-600" />
                  )}
                  {isPro && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#facc15]/20 to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-black text-white">{user?.displayName || 'بەکارهێنەر'}</h3>
                <p className="text-zinc-500 text-xs font-bold mt-1">{user?.email}</p>
                
                {isPro && (
                  <div className="mt-4 px-4 py-1.5 bg-gradient-to-r from-[#facc15] to-[#ca8a04] text-black font-black text-[10px] rounded-full shadow-lg flex items-center gap-2">
                    <Crown size={12} fill="black" />
                    ئەندامی PRO
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-[#facc15] hover:text-black transition-all group">
                   <div className="flex items-center gap-3">
                      <Clock size={18} />
                      <span className="font-bold text-sm">مێژووی بینین</span>
                   </div>
                   <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <button 
                onClick={onClose}
                className="mt-auto py-4 bg-zinc-800 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-700 hover:text-white transition-all"
              >
                داخستن
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#facc15] rounded-full" />
                  <h2 className="text-2xl font-black text-white">مێژووی بینین</h2>
                </div>
                <span className="text-zinc-500 text-xs font-bold">{history.length} فیلم</span>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center text-zinc-500 font-bold">بوەستە... باردەکرێت</div>
              ) : history.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {history.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 hover:border-[#facc15]/30 hover:bg-[#facc15]/5 transition-all"
                    >
                      <img src={item.posterUrl} className="w-16 h-20 rounded-xl object-cover shadow-lg" />
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg group-hover:text-[#facc15] transition-colors">{item.originalTitle || item.movieTitle}</h4>
                        <p className="text-zinc-500 text-xs font-medium mt-1">
                          {new Date(item.watchedAt?.toDate()).toLocaleDateString('ku-IQ')} • {new Date(item.watchedAt?.toDate()).toLocaleTimeString('ku-IQ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-3 bg-red-500/10 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => onPlayMovie(item.movieId)}
                          className="p-3 bg-[#facc15] text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Play size={18} fill="black" />
                          <span className="hidden sm:inline">سەیرکردنەوە</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4">
                  <Clock size={48} className="opacity-20" />
                  <p className="font-bold">هیچ فیلمێکت هێشتا سەیر نەکردووە</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
