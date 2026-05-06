import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { 
  signInWithGoogle as googleSignIn,
  createUserWithEmailAndPassword as registerWithEmail,
  signInWithEmailAndPassword as loginWithEmail,
  updateProfile as updateAccountProfile,
  auth
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await loginWithEmail(auth, email, password);
      } else {
        const userCredential = await registerWithEmail(auth, email, password);
        await updateAccountProfile(userCredential.user, {
          displayName: name
        });
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('ئەم ئیمەیڵە پێشتر بەکارهێنراوە');
      } else if (err.code === 'auth/invalid-credential') {
        setError('ئیمەیڵەکە یان وشەی تێپەڕ هەڵەیە');
      } else if (err.code === 'auth/weak-password') {
        setError('وشەی تێپەڕ زۆر لاوازە (لانی کەم ٦ پیت)');
      } else {
        setError('هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەرەوە');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignIn();
      onClose();
    } catch (err: any) {
      console.error("Google auth error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('تکایە ڕێگە بە پۆپ-ئەپ (Pop-up) بدە لە برۆسەرەکەتدا');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('پڕۆسەکە هەڵوەشایەوە');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('ئەم دومەینە ڕێگەی پێنەدراوە لە فایەربەیس. تکایە پاشکۆی Authorized Domains زیاد بکە لە فایەربەیس کۆنسۆڵ.');
      } else {
        setError(`هەڵەیەک لە چوونە ژوورەوەی گووگڵ ڕوویدا: ${err.message || err.code || ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            dir="rtl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-10 pt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2 italic tracking-tight">
                  {isLogin ? 'بەخێربێیتەوە بۆ' : 'دروستکردنی' } <span className="text-[#facc15]">ZANIME</span>
                </h2>
                <p className="text-zinc-500 text-sm font-bold lowercase tracking-wider">
                  {isLogin ? 'تکایە بڕۆژە نێو هەژمارەکەت' : 'هەژمارێکی نوێ بۆ خۆت دروست بکە'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-4">ناوی تەواو</label>
                    <div className="relative">
                      <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="فەرەیدوون جەبار"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm font-medium focus:border-[#facc15]/50 focus:bg-white/10 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-4">ئیمەیڵ (Email)</label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm font-medium focus:border-[#facc15]/50 focus:bg-white/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-4">وشەی تێپەڕ (Password)</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-sm font-medium focus:border-[#facc15]/50 focus:bg-white/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#facc15] text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#facc15]/10 mt-4 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'چوونە ژوورەوە' : 'دروستکردنی هەژمار'}</span>
                      <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-zinc-600">
                  <span className="bg-zinc-950 px-4">یان</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Chrome size={14} className="text-black" />
                </div>
                <span>لەڕێگەی گووگڵەوە</span>
              </button>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-zinc-500 hover:text-white transition-colors text-xs font-bold"
                >
                  {isLogin ? 'ئەگەر هەژمارت نییە؟ ' : 'ئەگەر پێشتر هەژمارت دروست کردووە؟ '}
                  <span className="text-[#facc15]">{isLogin ? 'هەژمار دروست بکە' : 'چوونە ژوورەوە'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
