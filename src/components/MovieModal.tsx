import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Plus, ThumbsUp, Star, Calendar, Clock } from 'lucide-react';
import { Movie } from '../types';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[#080808] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-3 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg backdrop-blur-md"
            >
              <X size={24} />
            </button>

            <div className="relative h-72 md:h-[450px] w-full">
              <img 
                src={movie.backdropUrl} 
                alt={movie.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
              
              <div className="absolute bottom-10 right-10 left-10 flex flex-col gap-6">
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                  {movie.title}
                </h2>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-10 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all shadow-xl">
                    <Play size={20} fill="currentColor" />
                    دەستپێکردن
                  </button>
                  <button className="p-3 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-colors">
                    <Plus size={24} />
                  </button>
                  <button className="p-3 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-colors">
                    <ThumbsUp size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-10 grid md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-8">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-green-500 font-bold tracking-tight">
                    ٩٨٪ گونجاوە
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Calendar size={16} />
                    {movie.year}
                  </div>
                  <div className="px-2 py-0.5 border border-zinc-700 text-[10px] text-zinc-400 rounded uppercase font-bold tracking-widest">
                    18+
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Clock size={16} />
                    {movie.duration}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star size={16} fill="currentColor" />
                    {movie.rating}
                  </div>
                </div>

                <p className="text-xl text-zinc-300 leading-relaxed font-light">
                  {movie.description}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">ژانەرەکان</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.genres.map(genre => (
                      <span key={genre} className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-xs text-white hover:border-red-600 transition-colors cursor-pointer">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">ناونیشانی بیانی</span>
                  <p className="text-zinc-300 text-sm mt-3 italic font-medium">{movie.originalTitle}</p>
                </div>
              </div>
            </div>
            
            {/* Recommendations dummy row */}
            <div className="px-8 pb-8">
              <h4 className="text-xl font-bold text-white mb-4">کارە هاوشێوەکان</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
