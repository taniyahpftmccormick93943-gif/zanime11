import { motion } from 'motion/react';
import { Play, Eye, Crown } from 'lucide-react';
import { Movie } from '../types';

export interface MovieCardProps {
  movie: Movie;
  onOpenModal: (movie: Movie) => void;
  key?: string | number;
}

export default function MovieCard({ movie, onOpenModal }: MovieCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.95 }}
      className="group relative flex-none w-32 sm:w-40 md:w-52 flex flex-col gap-2 md:gap-3 cursor-pointer"
      onClick={() => onOpenModal(movie)}
      dir="rtl"
    >
      <div className="relative aspect-[2/3] rounded-2xl md:rounded-3xl bg-zinc-800 overflow-hidden border border-white/10 active:border-[#facc15]/50 transition-colors shadow-2xl">
        <img 
          src={movie.posterUrl} 
          alt={movie.originalTitle}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Pro Badge */}
        {movie.isPro && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 p-1 md:p-1.5 bg-gradient-to-r from-[#facc15] to-[#ca8a04] text-black rounded-lg shadow-xl">
             <Crown size={12} fill="black" className="md:size-4" />
          </div>
        )}

        {/* HD Badge */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 px-2 py-0.5 md:px-3 md:py-1 bg-[#facc15] text-black font-black text-[8px] md:text-[10px] rounded-md shadow-lg font-sans">
          HD
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
            <motion.div 
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                className="bg-[#facc15] p-2 md:p-4 rounded-full shadow-lg"
            >
                <Play size={20} fill="black" className="text-black ml-0.5 md:size-8" />
            </motion.div>
        </div>
      </div>

      <div className="px-1 text-center">
        <h3 className="text-[11px] sm:text-xs md:text-sm font-black truncate text-white group-hover:text-[#facc15] transition-colors uppercase tracking-tight italic">
          {movie.originalTitle}
        </h3>
        <p className="text-[9px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 font-bold">
          {movie.year} • {movie.genres[0]}
        </p>
      </div>
    </motion.div>
  );
}
