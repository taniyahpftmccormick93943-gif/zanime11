import { Play, Info, Star, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
  onOpenModal: (movie: Movie) => void;
}

export default function Hero({ movie, onOpenModal }: HeroProps) {
  return (
    <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden" dir="rtl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={movie.backdropUrl} 
          alt={movie.originalTitle}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-20" />
      </div>

      {/* Content */}
      <div className="relative z-30 h-full flex flex-col justify-center px-4 sm:px-8 md:px-16 max-w-5xl gap-4 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-3 md:gap-5"
        >
          <div className="flex items-center gap-3 md:gap-4">
            {movie.isPro && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#facc15] to-[#ca8a04] px-4 py-1.5 rounded-full shadow-lg">
                <Crown size={14} fill="black" className="text-black" />
                <span className="text-black text-[10px] md:text-xs font-black uppercase">PRO ONLY</span>
              </div>
            )}
            <span className="bg-white/10 backdrop-blur-md text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest text-white border border-white/10">تایبەت</span>
            <span className="text-zinc-400 text-xs md:text-sm font-bold">{movie.year} • {movie.duration}</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black max-w-4xl leading-[0.9] text-white italic drop-shadow-2xl uppercase tracking-tighter">
            <span className="text-[#facc15]">{movie.originalTitle.split(' ')[0]}</span>
            {movie.originalTitle.includes(' ') && movie.originalTitle.substring(movie.originalTitle.indexOf(' '))}
          </h1>

          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={14} fill="currentColor" className="md:size-4" />
              <span className="font-bold">{movie.rating}</span>
            </div>
            <span className="text-zinc-300 truncate">{movie.genres.join(' • ')}</span>
          </div>

          <p className="max-w-xl text-zinc-400 leading-relaxed text-sm md:text-base line-clamp-3 md:line-clamp-none">
            {movie.description}
          </p>

          <div className="flex flex-row items-center gap-3 md:gap-4 mt-2 md:mt-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg shrink-0"
            >
              <Play size={18} fill="currentColor" className="md:size-5" />
              ئێستا ببینە
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenModal(movie)}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-white/20 transition-all shrink-0"
            >
              <Info size={18} className="md:size-5" />
              زیاتر بزانە
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
