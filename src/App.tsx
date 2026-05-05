/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieModal from './components/MovieModal';
import Footer from './components/Footer';
import { MOVIES } from './constants';
import { Movie } from './types';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const trendingMovies = MOVIES.filter(m => m.isTrending);
  const actionMovies = MOVIES.filter(m => m.genres.includes('ئاکشن'));
  const dramaMovies = MOVIES.filter(m => m.genres.includes('دراما'));
  const sciFiMovies = MOVIES.filter(m => m.genres.includes('زانستی'));

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        {/* Featured Hero */}
        <Hero movie={MOVIES[0]} onOpenModal={handleOpenModal} />

        {/* Rows */}
        <div className="flex-1 space-y-2 pb-24">
          <MovieRow 
            title="بەناوبانگترینەکان" 
            movies={trendingMovies} 
            onOpenModal={handleOpenModal} 
          />
          <MovieRow 
            title="فیلمە ئاکشنەکان" 
            movies={actionMovies} 
            onOpenModal={handleOpenModal} 
          />
          <MovieRow 
            title="زانستی و جیاواز" 
            movies={sciFiMovies} 
            onOpenModal={handleOpenModal} 
          />
          <MovieRow 
            title="دراما و کۆمەڵایەتی" 
            movies={dramaMovies} 
            onOpenModal={handleOpenModal} 
          />
        </div>
      </main>

      <Footer />

      {/* Modal View */}
      <MovieModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}

