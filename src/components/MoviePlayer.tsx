import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Star, Eye, BookOpen, Crown, Lock } from 'lucide-react';
import { Movie } from '../types';
import { MOVIES } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MoviePlayerProps {
  movie: Movie;
  onClose: () => void;
}

export default function MoviePlayer({ movie, onClose }: MoviePlayerProps) {
  const [views, setViews] = useState<number | null>(null);
  const [similarViews, setSimilarViews] = useState<Record<string, number>>({});
  const { isPro, user } = useAuth();

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Handle YouTube
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  useEffect(() => {
    if (movie.isPro && !isPro) return;

    const recordWatchHistory = async () => {
      if (!user) return;
      try {
        await addDoc(collection(db, 'watch_history'), {
          userId: user.uid,
          movieId: movie.id,
          movieTitle: movie.title,
          originalTitle: movie.originalTitle,
          posterUrl: movie.posterUrl,
          watchedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error recording watch history:", error);
      }
    };

    const fetchOrIncrementViews = async () => {
      const storageKey = `viewed_${movie.id}`;
      const hasViewedInSession = sessionStorage.getItem(storageKey);

      try {
        if (!hasViewedInSession) {
          // Increment views and mark as viewed in session
          const response = await fetch(`/api/views/${movie.id}/increment`, { method: 'POST' });
          const data = await response.json();
          if (data.views !== undefined) {
            setViews(data.views);
            sessionStorage.setItem(storageKey, 'true');
          }
        } else {
          // Just fetch the current view count
          const response = await fetch(`/api/views/${movie.id}`);
          const data = await response.json();
          if (data.views !== undefined) {
            setViews(data.views);
          }
        }
      } catch (error) {
        console.error("Error handling views:", error);
      }
    };

    const fetchSimilarViews = async () => {
      const similarMovies = MOVIES.filter(m => m.id !== movie.id).slice(0, 6);
      const ids = similarMovies.map(m => m.id).join(',');
      try {
        const response = await fetch(`/api/bulk-views?ids=${ids}`);
        const data = await response.json();
        setSimilarViews(data);
      } catch (error) {
        console.error("Error fetching similar views:", error);
      }
    };

    fetchOrIncrementViews();
    fetchSimilarViews();
    recordWatchHistory();
  }, [movie.id, user?.uid]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center overflow-y-auto custom-scrollbar"
      dir="rtl"
    >
      {movie.isPro && !isPro ? (
        <div className="fixed inset-0 z-[210] bg-zinc-950 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
           <div className="w-24 h-24 bg-[#facc15]/10 rounded-full flex items-center justify-center mb-8 border border-[#facc15]/20 animate-pulse">
              <Lock size={48} className="text-[#facc15]" />
           </div>
           <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">ئەم فیلمە تەنها بۆ ئەندامانی <span className="text-[#facc15]">PRO</span> یە</h2>
           <p className="text-zinc-500 font-bold mb-10 max-w-md text-lg">بۆ بینینی ئەم فیلمە و چەندین فیلمی ناوازەی تر، تکایە هەژمارەکەت نوێ بکەرەوە بۆ پڕۆ</p>
           <button 
            onClick={onClose}
            className="px-12 py-5 bg-zinc-800 text-white font-black rounded-[2rem] hover:bg-zinc-700 transition-all border border-white/10"
           >
             گەڕانەوە
           </button>
        </div>
      ) : (
        <>
          {/* Background Atmosphere */}
          <div className="fixed inset-0 z-0">
            <img 
              src={movie.backdropUrl} 
              className="w-full h-full object-cover opacity-20 blur-[100px]" 
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 w-full max-w-6xl px-6 py-12 md:py-20 flex flex-col items-center">
            {/* Back Button */}
            <button 
              onClick={onClose}
              className="self-start flex items-center gap-3 text-zinc-400 hover:text-white transition-colors mb-10 group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#facc15] group-hover:text-black transition-all">
                <ArrowRight size={20} />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">گەڕانەوە بۆ دواوە</span>
            </button>

            {/* Player UI */}
            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 bg-zinc-900 group">
              {movie.videoUrl ? (
                <iframe 
                  src={getEmbedUrl(movie.videoUrl)} 
                  className="w-full h-full border-0" 
                  allowFullScreen 
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <>
                  <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-1 p-1 opacity-40">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="bg-zinc-800 rounded shadow-inner" />
                    ))}
                  </div>
                  <img 
                    src={movie.backdropUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                      className="w-28 h-28 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 flex items-center justify-center text-[#facc15] shadow-2xl"
                    >
                      <Play size={56} fill="currentColor" />
                    </motion.div>
                  </div>
                </>
              )}

          {/* Player Info Overlays */}
          <div className="absolute top-8 left-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#56d4ff] flex items-center gap-3 drop-shadow-xl">
              {movie.originalTitle} {movie.year}
            </h2>
            {views !== null && (
              <div className="flex items-center gap-2 text-zinc-400 mt-2 font-bold text-sm">
                <Eye size={14} />
                <span>{views.toLocaleString()} بینین</span>
              </div>
            )}
          </div>

          {/* Controls Bar Placeholder */}
          <div className="absolute bottom-0 inset-x-0 h-1 rounded-full bg-[#facc15]/30 mx-8 mb-8" />
        </div>

        {/* Brief/Summary Section */}
        <section className="w-full mt-12">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative group hover:border-[#facc15]/20 transition-all">
            <div className="flex items-center gap-3 mb-4 text-[#facc15]">
              <BookOpen size={18} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">کورتی</h3>
            </div>
            <p className="text-zinc-300 text-lg leading-loose font-medium">
              {movie.description}
            </p>
          </div>
        </section>

        {/* Similar Movies Section */}
        <section className="w-full mt-16 pb-20">
          <div className="flex items-center gap-3 mb-10">
            <span className="w-1.5 h-8 bg-orange-600 rounded-full" />
            <h3 className="text-2xl font-black text-white">فیلمی هاوشێوە</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {MOVIES.filter(m => m.id !== movie.id).slice(0, 6).map((m) => (
              <div key={m.id} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-3 bg-zinc-900">
                  <img 
                    src={m.posterUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#facc15] text-black font-black text-[9px] rounded shadow-lg flex items-center gap-1">
                    <Star size={8} fill="black" />
                    {m.rating}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                        <Play size={16} fill="white" />
                     </div>
                  </div>
                </div>
                <h4 className="text-white font-bold text-xs truncate mb-1 text-center">{m.title}</h4>
                <div className="flex items-center justify-center gap-3 text-[9px] text-zinc-500 font-black uppercase italic">
                   <span>{m.year}</span>
                   <div className="flex items-center gap-1">
                      <Eye size={10} />
                      <span>{similarViews[m.id]?.toLocaleString() || '0'}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )}
</motion.div>
);
}
