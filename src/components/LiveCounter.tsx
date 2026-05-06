import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, doc, setDoc, onSnapshot, query, where, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LiveCounterProps {
  movieId?: string;
  className?: string;
}

export default function LiveCounter({ movieId, className = "" }: LiveCounterProps) {
  const [count, setCount] = useState<number>(1);
  const [sessionId] = useState(() => {
    const storedId = sessionStorage.getItem('zanime_session_id');
    if (storedId) return storedId;
    const newId = Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('zanime_session_id', newId);
    return newId;
  });

  useEffect(() => {
    const presenceDocRef = doc(db, 'active_viewers', sessionId);
    
    const updatePresence = async () => {
      try {
        await setDoc(presenceDocRef, {
          movieId: movieId || 'global',
          lastSeen: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error updating presence:', err);
      }
    };

    // Initial update
    updatePresence();

    // Heartbeat every 30 seconds
    const interval = setInterval(updatePresence, 30000);

    // Cleanup presence on unmount
    const cleanup = async () => {
      try {
        await deleteDoc(presenceDocRef);
      } catch (err) {
        console.warn('Error cleaning up presence:', err);
      }
    };

    // Real-time listener for the count
    // To avoid needing a composite index in production (movieId + lastSeen range),
    // we listen to the collection and filter active ones in the client.
    const unsubscribe = onSnapshot(collection(db, 'active_viewers'), (snapshot) => {
      const targetMovie = movieId || 'global';
      const twoMinutesAgo = Date.now() - 120000;
      
      const activeDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        // Handle serverTimestamp which might be null locally before sync
        const lastSeen = data.lastSeen ? (typeof data.lastSeen.toMillis === 'function' ? data.lastSeen.toMillis() : Date.now()) : 0;
        return data.movieId === targetMovie && lastSeen >= twoMinutesAgo;
      });
      
      setCount(activeDocs.length || 1);
    }, (err) => {
      console.warn('Error listening to live count:', err);
    });

    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(interval);
      unsubscribe();
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [sessionId, movieId]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1 bg-[#facc15]/10 border border-[#facc15]/20 rounded-lg backdrop-blur-md ${className}`}
      dir="rtl"
    >
      <div className="relative">
        <Users size={16} className="text-[#facc15]" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
      </div>
      <div className="flex items-center gap-1.5 font-black text-xs">
        <span className="text-[#facc15]">{(typeof count === 'number' ? count : 0).toLocaleString()}</span>
        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">سەیرکەر</span>
      </div>
    </motion.div>
  );
}
