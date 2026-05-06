import { LayoutDashboard, Users, Film, Eye, Settings, LogOut, ChevronRight, Search, ShieldCheck, ShieldAlert, CheckCircle2, Trash2, Edit3, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { MOVIES as STATIC_MOVIES } from '../constants';
import { Movie } from '../types';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, updateDoc, doc, query, orderBy, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AdminDashboardProps {
  onClose: () => void;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isPro: boolean;
  isAdmin: boolean;
  isBanned?: boolean;
  proType?: string;
  proExpiry?: string;
  photoURL: string;
}

const PRO_PLANS = [
  { id: '1day', label: 'یەک ڕۆژی', days: 1 },
  { id: '1month', label: 'یەک مانگی', days: 30 },
  { id: '3months', label: '٣ مانگی', days: 90 },
  { id: '6months', label: '٦ مانگی', days: 180 },
  { id: '1year', label: 'یەک ساڵی', days: 365 },
];

const GENRES_LIST = [
  'ئاکشن', 'ترسناک', 'ئەنیمەیشن', 'کۆمیدی', 'دراما', 'خەیاڵی', 'مێژووی'
];

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('سەرەتا');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const path = 'users';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserProfile;
        if (!(data as any).isDeleted) {
          fetchedUsers.push(data);
        }
      });
      setUsers(fetchedUsers);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    const path = 'movies';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      let fetchedMovies: Movie[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMovies.push(doc.data() as Movie);
      });
      
      if (fetchedMovies.length === 0) {
        // Fallback to static movies and sync to firestore for the first time
        fetchedMovies = STATIC_MOVIES;
        for (const movie of STATIC_MOVIES) {
          await setDoc(doc(db, 'movies', movie.id), movie);
        }
      }
      setMovies(fetchedMovies);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'بەکارهێنەران') {
      fetchUsers();
    } else if (activeTab === 'فیلمەکان') {
      const q = query(collection(db, 'movies'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let fetchedMovies: Movie[] = [];
        snapshot.forEach((doc) => {
          fetchedMovies.push(doc.data() as Movie);
        });
        
        if (fetchedMovies.length === 0 && !loading) {
          // Fallback to static movies and sync to firestore for the first time
          setMovies(STATIC_MOVIES);
          STATIC_MOVIES.forEach(async (movie) => {
             await setDoc(doc(db, 'movies', movie.id), movie);
          });
        } else {
          setMovies(fetchedMovies);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'movies');
      });

      return () => unsubscribe();
    }
  }, [activeTab]);

  const togglePro = async (userId: string, currentStatus: boolean, planId: string = 'none') => {
    const path = `users/${userId}`;
    try {
      let expiryDate = null;
      if (planId !== 'none') {
        const plan = PRO_PLANS.find(p => p.id === planId);
        if (plan) {
          const date = new Date();
          date.setDate(date.getDate() + plan.days);
          expiryDate = date.toISOString();
        }
      }

      await updateDoc(doc(db, 'users', userId), {
        isPro: planId !== 'none',
        proType: planId,
        proExpiry: expiryDate,
        updatedAt: new Date().toISOString()
      });

      setUsers(users.map(u => u.uid === userId ? { 
        ...u, 
        isPro: planId !== 'none',
        proType: planId,
        proExpiry: expiryDate || undefined
      } : u));
      setShowPlanSelector(false);
      setSelectedUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBanned: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      setUsers(users.map(u => u.uid === userId ? { ...u, isBanned: !currentStatus } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('ئایا دڵنیایت لە سڕینەوەی ئەم هەژمارە؟')) return;
    
    // In a real app we'd call a cloud function, here we just mark it or delete from firestore
    const path = `users/${userId}`;
    try {
      // For safety, we usually don't delete immediately or use a specialized API
      // But for this request, we'll try to delete the doc
      // await deleteDoc(doc(db, 'users', userId));
      // Better to mark as deleted for demo
      await updateDoc(doc(db, 'users', userId), {
        isDeleted: true,
        updatedAt: new Date().toISOString()
      });
      setUsers(users.filter(u => u.uid !== userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const deleteMovie = async (movieId: string) => {
    if (!window.confirm('ئایا دڵنیایت لە سڕینەوەی ئەم فیلمە؟')) return;
    const path = `movies/${movieId}`;
    try {
      await deleteDoc(doc(db, 'movies', movieId));
      setMovies(movies.filter(m => m.id !== movieId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveMovie = async (movie: Movie) => {
    const path = `movies/${movie.id}`;
    try {
      await setDoc(doc(db, 'movies', movie.id), movie);
      if (movies.find(m => m.id === movie.id)) {
        setMovies(movies.map(m => m.id === movie.id ? movie : m));
      } else {
        setMovies([...movies, movie]);
      }
      setEditingMovie(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'backdrop') => {
    const file = e.target.files?.[0];
    if (!file || !editingMovie) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'poster') {
        setEditingMovie({ ...editingMovie, posterUrl: base64 });
      } else {
        setEditingMovie({ ...editingMovie, backdropUrl: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleGenre = (genre: string) => {
    if (!editingMovie) return;
    const currentGenres = editingMovie.genres || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    setEditingMovie({ ...editingMovie, genres: newGenres });
  };

  const menuItems = [
    { name: 'سەرەتا', icon: LayoutDashboard },
    { name: 'فیلمەکان', icon: Film },
    { name: 'بەکارهێنەران', icon: Users },
    { name: 'ئامارەکان', icon: Eye },
    { name: 'ڕێکخستن', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-l border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#facc15] rounded-xl flex items-center justify-center">
            <LayoutDashboard size={24} className="text-black" />
          </div>
          <span className="text-xl font-black text-white">داشبۆرد</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-white/5 text-[#facc15] font-black' : 'text-zinc-500 hover:text-white hover:bg-white/5 font-bold'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.name}</span>
              </div>
              <ChevronRight size={14} className={activeTab === item.name ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full flex items-center gap-3 p-3 text-red-500 font-bold hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span>گەڕانەوە بۆ سایت</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">بەخێربێیتەوە، ئادمین</h1>
            <p className="text-zinc-500 font-medium">لێرە دەتوانیت سەرپەرشتی هەموو سایتەکە بکەیت.</p>
          </div>
          <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-white/5">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              alt="Admin" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="text-white font-bold text-sm">{user?.displayName}</p>
              <p className="text-[#facc15] text-[10px] font-black uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
        </header>

        {activeTab === 'فیلمەکان' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-zinc-900 p-6 rounded-3xl border border-white/5">
              <h3 className="text-xl font-black text-white">بەڕێوەبردنی فیلمەکان</h3>
              <button 
                onClick={() => setEditingMovie({ id: Date.now().toString(), title: '', originalTitle: '', description: '', category: 'فیلم', posterUrl: '', backdropUrl: '', year: new Date().getFullYear(), rating: 0, duration: '', genres: [] })}
                className="flex items-center gap-2 px-6 py-3 bg-[#facc15] text-black font-black text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={18} />
                زیادکردنی فیلم
              </button>
            </div>

            <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-right">
                   <thead>
                     <tr className="text-zinc-500 text-xs font-black uppercase tracking-wider border-b border-white/5">
                       <th className="px-6 py-4">فیلم</th>
                       <th className="px-6 py-4">جۆر</th>
                       <th className="px-6 py-4">ساڵ</th>
                       <th className="px-6 py-4">کردارەکان</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center text-zinc-500 font-bold">بوەستە... باردەکرێت</td>
                        </tr>
                     ) : movies.map((m) => (
                       <tr key={m.id} className="hover:bg-white/5 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={m.posterUrl} className="w-10 h-14 rounded-lg object-cover bg-zinc-800" />
                              <div>
                                <p className="text-white font-bold">{m.title}</p>
                                <p className="text-zinc-500 text-xs">{m.originalTitle}</p>
                              </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-lg border border-white/5 uppercase">{m.category}</span>
                         </td>
                         <td className="px-6 py-4 text-zinc-400 font-bold">{m.year}</td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingMovie(m)}
                                className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => deleteMovie(m.id)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Movie Editor Modal */}
            <AnimatePresence>
              {editingMovie && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
                  >
                    <h3 className="text-2xl font-black text-white mb-6">دەستکاریکردنی زانیارییەکان</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       <div className="space-y-4">
                          <div>
                            <label className="block text-zinc-500 text-xs font-black mb-2 uppercase">ناوی فیلم</label>
                            <input value={editingMovie.originalTitle} onChange={e => setEditingMovie({...editingMovie, originalTitle: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white" />
                          </div>
                          <div>
                            <label className="block text-zinc-500 text-xs font-black mb-2 uppercase">ساڵ</label>
                            <input type="number" value={editingMovie.year} onChange={e => setEditingMovie({...editingMovie, year: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white" />
                          </div>
                          <div>
                            <label className="block text-zinc-500 text-xs font-black mb-2 uppercase">لینکی ڤیدیۆ</label>
                            <input value={editingMovie.videoUrl || ''} onChange={e => setEditingMovie({...editingMovie, videoUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-700" placeholder="https://..." />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex bg-[#facc15]/5 border border-[#facc15]/20 p-4 rounded-2xl items-center justify-between">
                            <div>
                              <p className="text-[#facc15] font-black text-sm">فیلمی PRO</p>
                              <p className="text-[10px] text-zinc-500 font-bold">تەنها بەکارهێنەرانی PRO دەتوانن بیبینن</p>
                            </div>
                            <button 
                              onClick={() => setEditingMovie({...editingMovie, isPro: !editingMovie.isPro})}
                              className={`w-12 h-6 rounded-full transition-all relative ${editingMovie.isPro ? 'bg-[#facc15]' : 'bg-zinc-800'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${editingMovie.isPro ? 'right-1 bg-black' : 'left-1 bg-zinc-600'}`} />
                            </button>
                          </div>

                          <div>
                            <label className="block text-zinc-500 text-xs font-black mb-2 uppercase">جۆری پۆلێنکردن</label>
                            <select value={editingMovie.category} onChange={e => setEditingMovie({...editingMovie, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white">
                              <option>فیلم</option>
                              <option>زنجیرە</option>
                              <option>ئەنیمی</option>
                            </select>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       <div>
                          <label className="block text-zinc-500 text-xs font-black mb-3 uppercase">وینەی پۆستەر (Poster)</label>
                          <div className="space-y-3">
                            <input 
                              type="text" 
                              placeholder="لێرە لینک دابنێ یان لە خوارەوە ئەپلۆدی بکە..." 
                              value={editingMovie.posterUrl} 
                              onChange={e => setEditingMovie({...editingMovie, posterUrl: e.target.value})} 
                              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-xs"
                            />
                            <div className="relative group aspect-[2/3] w-full bg-black/50 border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3">
                               {editingMovie.posterUrl ? (
                                 <>
                                   <img src={editingMovie.posterUrl} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                      <button onClick={() => setEditingMovie({...editingMovie, posterUrl: ''})} className="p-3 bg-red-600 text-white rounded-full"><Trash2 size={20} /></button>
                                   </div>
                                 </>
                               ) : (
                                 <>
                                   <Plus size={32} className="text-zinc-700" />
                                   <p className="text-zinc-600 font-bold text-xs">ئەپلۆدکردنی وێنە</p>
                                   <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'poster')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 </>
                               )}
                            </div>
                          </div>
                       </div>
                       <div>
                          <label className="block text-zinc-500 text-xs font-black mb-3 uppercase">وێنەی بانەر (Banner)</label>
                          <div className="space-y-3">
                            <input 
                              type="text" 
                              placeholder="لێرە لینک دابنێ یان لە خوارەوە ئەپلۆدی بکە..." 
                              value={editingMovie.backdropUrl} 
                              onChange={e => setEditingMovie({...editingMovie, backdropUrl: e.target.value})} 
                              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white text-xs"
                            />
                            <div className="relative group aspect-video w-full bg-black/50 border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3">
                               {editingMovie.backdropUrl ? (
                                 <>
                                   <img src={editingMovie.backdropUrl} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                      <button onClick={() => setEditingMovie({...editingMovie, backdropUrl: ''})} className="p-3 bg-red-600 text-white rounded-full"><Trash2 size={20} /></button>
                                   </div>
                                 </>
                               ) : (
                                 <>
                                   <Plus size={32} className="text-zinc-700" />
                                   <p className="text-zinc-600 font-bold text-xs">ئەپلۆدکردنی وێنە</p>
                                   <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'backdrop')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 </>
                               )}
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="mb-8">
                       <label className="block text-zinc-500 text-xs font-black mb-4 uppercase">ژانەرەکان (Genres)</label>
                       <div className="flex flex-wrap gap-2">
                          {GENRES_LIST.map(genre => (
                            <button
                              key={genre}
                              onClick={() => toggleGenre(genre)}
                              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border ${editingMovie.genres?.includes(genre) ? 'bg-[#facc15] text-black border-[#facc15]' : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/20'}`}
                            >
                              {genre}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                      <label className="block text-zinc-500 text-xs font-black mb-2 uppercase">کورتە</label>
                      <textarea rows={4} value={editingMovie.description} onChange={e => setEditingMovie({...editingMovie, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white mb-8" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => saveMovie(editingMovie)}
                        className="flex-1 py-4 bg-[#facc15] text-black font-black rounded-2xl hover:bg-[#facc15]/90 transition-all"
                      >
                        پاشکەوتکردن
                      </button>
                      <button 
                        onClick={() => setEditingMovie(null)}
                        className="flex-1 py-4 bg-zinc-800 text-zinc-400 font-black rounded-2xl hover:bg-zinc-700 transition-all"
                      >
                        داخستن
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'بەکارهێنەران' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-zinc-900 p-6 rounded-3xl border border-white/5">
               <div className="relative w-full md:w-96">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="بگەڕێ بۆ بەکارهێنەر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-[#facc15] transition-all"
                  />
               </div>
               <button 
                onClick={fetchUsers}
                className="px-6 py-3 bg-[#facc15] text-black font-black text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
               >
                 نوێکردنەوە
               </button>
            </div>

            <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-right">
                   <thead>
                     <tr className="text-zinc-500 text-xs font-black uppercase tracking-wider border-b border-white/5">
                       <th className="px-6 py-4">بەکارهێنەر</th>
                       <th className="px-6 py-4">ئیمەیڵ</th>
                       <th className="px-6 py-4">پلە</th>
                       <th className="px-6 py-4">بارودۆخی PRO</th>
                       <th className="px-6 py-4">کردارەکان</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-bold">بوەستە... باردەکرێت</td>
                        </tr>
                     ) : filteredUsers.map((u) => (
                       <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-10 h-10 rounded-full bg-zinc-800" />
                             <span className="text-white font-bold">{u.displayName || 'بێ ناو'}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-zinc-400 font-medium">{u.email}</td>
                         <td className="px-6 py-4">
                            {u.isAdmin ? (
                              <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20">ADMIN</span>
                            ) : (
                              <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-lg border border-white/5">USER</span>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {u.isPro ? (
                                <>
                                  <div className="flex items-center gap-2 text-green-500">
                                    <CheckCircle2 size={16} />
                                    <span className="font-bold text-sm text-[#facc15]">PRO ACTIVE</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-bold">پلان: {PRO_PLANS.find(p => p.id === u.proType)?.label || 'دیاری نەکراو'}</span>
                                  {u.proExpiry && (
                                    <span className="text-[10px] text-zinc-500 font-bold">بەسەرچوون: {new Date(u.proExpiry).toLocaleDateString('ku-IQ')}</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-zinc-600 font-bold text-sm">NORMAL</span>
                              )}
                              {u.isBanned && (
                                <div className="flex items-center gap-1 text-red-500 mt-1">
                                  <ShieldAlert size={14} />
                                  <span className="text-[10px] font-black uppercase">BANNED</span>
                                </div>
                              )}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  if (u.isPro) {
                                    togglePro(u.uid, true, 'none');
                                  } else {
                                    setSelectedUser(u);
                                    setShowPlanSelector(true);
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${u.isPro ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[#facc15]/10 text-[#facc15] hover:bg-[#facc15] hover:text-black'}`}
                              >
                                {u.isPro ? 'لابردنی PRO' : 'ئەکتیڤکردنی PRO'}
                              </button>
                              
                              <button 
                                onClick={() => toggleBan(u.uid, !!u.isBanned)}
                                className={`p-2 rounded-lg transition-all ${u.isBanned ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white'}`}
                                title={u.isBanned ? 'لابردنی باند' : 'باند کردن'}
                              >
                                <ShieldAlert size={16} />
                              </button>
                              
                              <button 
                                onClick={() => deleteUser(u.uid)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                title="سڕینەوەی هەژمار"
                              >
                                <LogOut size={16} className="rotate-180" />
                              </button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Plan Selector Modal */}
            {showPlanSelector && selectedUser && (
              <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-2xl font-black text-white mb-2">هەڵبژاردنی پلان</h3>
                  <p className="text-zinc-500 font-bold mb-6 italic">بۆ بەکارهێنەر: {selectedUser.displayName}</p>
                  
                  <div className="grid grid-cols-1 gap-3 mb-8">
                    {PRO_PLANS.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => togglePro(selectedUser.uid, false, plan.id)}
                        className="p-4 bg-black/40 border border-white/5 rounded-2xl text-white font-bold hover:border-[#facc15] hover:bg-[#facc15]/5 transition-all text-right flex items-center justify-between group"
                      >
                        <span>{plan.label}</span>
                        <ChevronRight size={18} className="text-zinc-500 group-hover:text-[#facc15] group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowPlanSelector(false);
                      setSelectedUser(null);
                    }}
                    className="w-full py-4 bg-zinc-800 text-zinc-400 font-black rounded-2xl hover:bg-zinc-700 transition-all"
                  >
                    پاشگەزبوونەوە
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Star({ size, fill, className }: { size: number, fill: string, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
