import { Movie } from '../types';
import MovieCard from './MovieCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useState } from 'react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onOpenModal: (movie: Movie) => void;
}

export default function MovieRow({ title, movies, onOpenModal }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      setShowLeft(scrollTo > 0);
    }
  };

  return (
    <div className="py-2" dir="rtl">
      <div className="flex items-center justify-between px-6 md:px-16 mb-4">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600 rounded-full"></span>
          {title}
        </h2>
        <a href="#" className="text-xs text-zinc-500 hover:text-red-500 transition-colors uppercase font-bold tracking-wider">هەمووی ببینە</a>
      </div>
      
      <div className="group relative">
        <button 
          onClick={() => scroll('left')}
          className={`absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden`}
        >
          <ChevronRight size={32} />
        </button>

        <div 
          ref={rowRef}
          className="flex items-center gap-6 overflow-x-auto overflow-y-visible px-6 md:px-16 scrollbar-hide pb-4 pt-2"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onOpenModal={onOpenModal} />
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={32} />
        </button>
      </div>
    </div>
  );
}
