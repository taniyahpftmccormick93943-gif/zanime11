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
    // Note: Counting in logic for real-time vibe
    // For many users, this query might be expensive. 
    // In a real app, you'd use a cloud function to aggregate counts.
    // For this context, we'll listen to the collection.
    const twoMinutesAgo = new Timestamp(Math.floor(Date.now() / 1000) - 120, 0);
    const q = query(
      collection(db, 'active_viewers'), 
      where('movieId', '==', movieId || 'global'),
      where('lastSeen', '>=', twoMinutesAgo)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Filter out stale docs (Firestore doesn't have a built-in TTL for snapshots based on sliding window easily without cloud functions)
      // But firestore query is already filtering by 'lastSeen'.
      setCount(snapshot.size || 1);
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
