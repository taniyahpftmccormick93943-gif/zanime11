import { Movie } from '../types';
import MovieCard from './MovieCard';
import { motion } from 'motion/react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onOpenModal: (movie: Movie) => void;
}

export default function MovieRow({ title, movies, onOpenModal }: MovieRowProps) {
  return (
    <div className="py-4 sm:py-6 md:py-8" dir="rtl">
      <div className="flex items-center justify-between px-4 sm:px-8 md:px-16 mb-4 md:mb-6">
        <motion.h2 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3"
        >
          <span className="w-1 h-5 sm:h-6 md:h-7 bg-red-600 rounded-full"></span>
          {title}
        </motion.h2>
        <motion.a 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          href="#" 
          className="text-[10px] sm:text-xs text-zinc-500 hover:text-red-500 transition-colors uppercase font-bold tracking-wider"
        >
          هەمووی ببینە
        </motion.a>
      </div>
      
      <div className="group relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 sm:gap-5 md:gap-6 overflow-x-auto overflow-y-visible px-4 sm:px-8 md:px-16 scrollbar-hide pb-6 pt-2 snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start">
              <MovieCard movie={movie} onOpenModal={onOpenModal} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
