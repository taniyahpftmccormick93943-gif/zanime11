import { Play, Info, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
  onOpenModal: (movie: Movie) => void;
}

export default function Hero({ movie, onOpenModal }: HeroProps) {
  return (
    <div className="relative h-[65vh] md:h-[75vh] w-full overflow-hidden" dir="rtl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={movie.backdropUrl} 
          alt={movie.title}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/60 to-black z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-20" />
      </div>

      {/* Content */}
      <div className="relative z-30 h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest text-white">تایبەت</span>
            <span className="text-zinc-400 text-sm">{movie.year} • {movie.duration}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight text-white mb-2">
            {movie.title}
            <span className="block text-xl md:text-2xl font-light text-zinc-500 mt-2 italic">
              {movie.originalTitle}
            </span>
          </h1>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="font-bold">{movie.rating}</span>
            </div>
            <span className="text-zinc-300">{movie.genres.join(' • ')}</span>
          </div>

          <p className="max-w-xl text-zinc-400 leading-relaxed text-base">
            {movie.description}
          </p>

          <div className="flex items-center gap-4 mt-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg"
            >
              <Play size={20} fill="currentColor" />
              ئێستا ببینە
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenModal(movie)}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-all"
            >
              <Info size={20} />
              زیاتر بزانە
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
