import { motion } from 'motion/react';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
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
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative flex-none w-40 md:w-52 flex flex-col gap-3 cursor-pointer"
      onClick={() => onOpenModal(movie)}
      dir="rtl"
    >
      <div className="relative aspect-[2/3] rounded-xl bg-zinc-800 overflow-hidden border border-white/5">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
            <motion.div 
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                className="bg-red-600 p-3 rounded-full shadow-lg"
            >
                <Play size={24} fill="white" className="text-white ml-0.5" />
            </motion.div>
        </div>
      </div>

      <div className="px-1">
        <h3 className="text-sm font-bold truncate text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">
          {movie.title}
        </h3>
        <p className="text-[10px] text-zinc-500 mt-1">
          {movie.year} • {movie.genres[0]}
        </p>
      </div>
    </motion.div>
  );
}
