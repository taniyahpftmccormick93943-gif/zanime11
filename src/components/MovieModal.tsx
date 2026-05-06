import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Plus, Star, Share2, Eye, Flame, Crown, Lock } from 'lucide-react';
import { Movie } from '../types';
import { useEffect, useState } from 'react';
import LiveCounter from './LiveCounter';
import { useAuth } from '../lib/AuthContext';
import { MOVIES } from '../constants';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onWatch: (movie: Movie) => void;
  onOpenPro: () => void;
}

export default function MovieModal({ movie, isOpen, onClose, onWatch, onOpenPro }: MovieModalProps) {
  const [views, setViews] = useState<number | null>(null);
  const { isPro } = useAuth();

  useEffect(() => {
    if (isOpen && movie) {
      document.body.style.overflow = 'hidden';
      fetch(`/api/views/${movie.id}`)
        .then(res => res.json())
        .then(data => setViews(data.views))
        .catch(() => setViews(0));
    } else {
      document.body.style.overflow = 'auto';
      setViews(null);
    }
  }, [isOpen, movie]);

  const handleWatchClick = async () => {
    if (!movie) return;
    if (movie.isPro && !isPro) {
      onOpenPro();
      return;
    }
    onWatch(movie);
    try {
      const res = await fetch(`/api/views/${movie.id}/increment`, { method: 'POST' });
      const data = await res.json();
      setViews(data.views);
    } catch (err) {
      console.error('Failed to increment view');
    }
  };

  const [activeFilter, setActiveFilter] = useState('هەفتە');

  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-6xl bg-zinc-950/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col max-h-[92vh]"
          >
            {/* Scrollable Container */}
            <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
              {/* Hero Section */}
              <div className="relative flex flex-col md:flex-row min-h-[600px]">
                {/* Background Blur Image */}
                <div className="absolute inset-0 z-0 opacity-10">
                  <img src={movie.backdropUrl} className="w-full h-full object-cover blur-3xl" referrerPolicy="no-referrer" />
                </div>

                <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 z-[110] p-2 bg-white/5 hover:bg-red-600 text-white rounded-full transition-all duration-300 border border-white/10"
                >
                  <X size={24} />
                </button>

                {/* Poster Section */}
                <div className="relative z-10 w-full md:w-[35%] p-8 md:p-14 flex flex-col items-center">
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group"
                  >
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {movie.isPro && (
                      <div className="absolute top-6 left-6 px-4 py-2 bg-gradient-to-r from-[#facc15] to-[#ca8a04] text-black font-black text-xs rounded-xl shadow-2xl flex items-center gap-2">
                        <Crown size={14} fill="black" />
                        PRO ONLY
                      </div>
                    )}
                    <div className="absolute top-6 right-6 px-3 py-1 bg-[#facc15] text-black font-black text-xs rounded-lg shadow-xl">HD</div>
                  </motion.div>
                  
                  <div className="mt-8 flex gap-4 w-full">
                    <button 
                      onClick={handleWatchClick}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${movie.isPro && !isPro ? 'bg-orange-600 text-white' : 'bg-white text-black hover:bg-[#facc15]'}`}
                    >
                      {movie.isPro && !isPro ? (
                        <>
                          <Lock size={20} />
                          بینینی بە PRO
                        </>
                      ) : (
                        <>
                          <Play size={22} fill="currentColor" />
                          بینینی ئۆنلاین
                        </>
                      )}
                    </button>
                    <button className="p-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 active:scale-95 transition-all border border-white/10">
                      <Plus size={24} />
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="relative z-10 w-full md:w-[65%] p-8 md:p-14 flex flex-col justify-center text-right">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#facc15] mb-6">
                      <span className="bg-[#facc15]/10 px-4 py-1.5 rounded-full border border-[#facc15]/20">زانیم ستۆدیۆ</span>
                      <span>{movie.year}</span>
                      <span className="text-white opacity-20">•</span>
                      <span>{movie.duration}</span>
                    </div>

                    <h2 className="text-5xl md:text-8xl font-black text-[#facc15] leading-tight drop-shadow-2xl uppercase tracking-tighter mb-10 italic">
                      {movie.originalTitle}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 mb-10 text-sm text-zinc-400">
                      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black rounded-lg">
                        <Star size={16} fill="currentColor" />
                        {movie.rating}
                      </div>
                      <div className="px-3 py-1 border border-red-600/50 text-red-600 text-xs rounded-lg uppercase font-black bg-red-600/5">18+</div>
                      <LiveCounter movieId={movie.id} />
                      {typeof views === 'number' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-xs">
                          <Eye size={14} className="text-zinc-500" />
                          <span>{views.toLocaleString()} بینین</span>
                        </div>
                      )}
                    </div>

                    <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-medium mb-12 max-w-2xl bg-white/5 p-6 rounded-3xl border border-white/5">
                      {movie.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {movie.genres.map(genre => (
                        <span key={genre} className="px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-2xl text-xs font-black text-white hover:border-[#facc15] hover:bg-white/5 transition-all cursor-pointer">
                          {genre}
                        </span>
                      ))}
                      <button className="p-3 bg-zinc-900 border border-white/5 rounded-2xl text-white hover:bg-white/10 transition-all">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Sections from Image */}
              <div className="p-8 md:p-14 space-y-16">
                {/* Similar Movies */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="w-1.5 h-8 bg-orange-600 rounded-full" />
                    <h3 className="text-2xl font-black text-white">فیلمی هاوشێوە</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                    {MOVIES.filter(m => m.id !== movie.id).slice(0, 6).map((m) => (
                      <div key={m.id} className="group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-3">
                          <img src={m.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#facc15] text-black font-black text-[9px] rounded-md shadow-lg flex items-center gap-1">
                            <Star size={8} fill="black" />
                            {m.rating}
                          </div>
                        </div>
                        <h4 className="text-white font-bold text-xs truncate mb-1">{m.title}</h4>
                        <p className="text-zinc-500 text-[10px] uppercase font-black italic">{m.originalTitle} ({m.year})</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Most Viewed */}
                <section>
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-8 bg-orange-600 rounded-full" />
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-white">زۆرترین بینراو</h3>
                        <Flame size={24} className="text-orange-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                      {['ساڵ', 'مانگ', 'هەفتە'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                            activeFilter === filter 
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-950/20' 
                              : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {MOVIES.slice(0, 4).map((m, i) => (
                      <div key={m.id} className="group cursor-pointer relative">
                        <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-white/5 mb-4 shadow-2xl">
                          <img src={m.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <span className="text-white font-black text-sm">{(39072 - i * 5000).toLocaleString()}</span>
                            <Eye size={14} className="text-orange-500" />
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-white font-black text-sm mb-1">{m.originalTitle} ({m.year})</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
