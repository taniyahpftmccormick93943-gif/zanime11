import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

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
    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/live/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, movieId }),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      } catch (err) {
        console.warn('Live Heartbeat failed', err);
      }
    };

    const fetchCount = async () => {
      try {
        const query = movieId ? `?movieId=${movieId}` : '';
        const res = await fetch(`/api/live/count${query}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setCount(data.count);
      } catch (err) {
        console.warn('Live Count fetch failed', err);
      }
    };

    sendHeartbeat();
    fetchCount();

    const heartbeatInterval = setInterval(sendHeartbeat, 60000);
    const countInterval = setInterval(fetchCount, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(countInterval);
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
