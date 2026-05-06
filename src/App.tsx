/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieModal from './components/MovieModal';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import MoviePlayer from './components/MoviePlayer';
import ProModal from './components/ProModal';
import ProfileModal from './components/ProfileModal';
import { MOVIES as STATIC_MOVIES } from './constants';
import { Movie } from './types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>(STATIC_MOVIES);

  useEffect(() => {
    const q = query(collection(db, 'movies'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedMovies: Movie[] = [];
        snapshot.forEach((doc) => {
          fetchedMovies.push(doc.data() as Movie);
        });
        setMovies(fetchedMovies);
      }
    }, (error) => {
      console.error("Error fetching movies real-time:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handlePlayMovieById = (movieId: string) => {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      setPlayingMovie(movie);
      setShowProfile(false);
    }
  };

  const handleWatchMovie = (movie: Movie) => {
    setIsModalOpen(false);
    setPlayingMovie(movie);
  };

  const animeMovies = movies.filter(m => m.category === 'ئەنیمی');
  const seriesMovies = movies.filter(m => m.category === 'زنجیرە');

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <Navbar 
        onOpenDashboard={() => setShowDashboard(true)} 
        onOpenProModal={() => setShowProModal(true)}
        onOpenProfile={() => setShowProfile(true)}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Featured Hero */}
        {movies.length > 0 && <Hero movie={movies[0]} onOpenModal={handleOpenModal} />}

        {/* Rows */}
        <div className="flex-1 space-y-2 pb-24">
          <MovieRow 
            title="ئەنیمەیشن" 
            movies={animeMovies} 
            onOpenModal={handleOpenModal} 
          />
          <MovieRow 
            title="زنجیرەکان" 
            movies={seriesMovies} 
            onOpenModal={handleOpenModal} 
          />
        </div>
      </main>

      <Footer />

      {/* Admin Dashboard Overlay */}
      {showDashboard && (
        <AdminDashboard onClose={() => setShowDashboard(false)} />
      )}

      {/* Pro Modal Overlay */}
      <ProModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
      />

      {/* Profile Modal Overlay */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onPlayMovie={handlePlayMovieById}
      />

      {/* Movie Player View */}
      {playingMovie && (
        <MoviePlayer 
          movie={playingMovie} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}

      {/* Modal View */}
      <MovieModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onWatch={handleWatchMovie}
        onOpenPro={() => setShowProModal(true)}
      />
    </div>
  );
}

