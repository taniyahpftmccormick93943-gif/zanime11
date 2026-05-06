import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShieldCheck, Zap, Crown, Flame, Star, Send } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProModal({ isOpen, onClose }: ProModalProps) {
  const { user } = useAuth();
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number>(2); // Default to 3-month plan

  const benefits = [
    { text: "ئەزموونی بێ ریکلام بە یەکجاری", icon: ShieldCheck },
    { text: "گەیشتن بە تەواوی فیلم و زنجیرەکان", icon: Crown },
    { text: "بینین بە بەرزترین کوالیتی (4K)", icon: Zap },
    { text: "پشتگیری تەکنیکی تایبەت", icon: Flame }
  ];

  const plans = [
    { title: "پلانی ڕۆژانە", price: "2,000", period: "بۆ ماوەی ٢٤ کاتژمێر", color: "from-blue-600 to-cyan-500", popular: false },
    { title: "پلانی مانگانە", price: "5,000", period: "بۆ ماوەی ٣٠ ڕۆژ", color: "from-purple-600 to-indigo-500", popular: false },
    { title: "پلانی ٣ مانگ", price: "15,000", period: "بۆ ماوەی ٩٠ ڕۆژ", color: "from-orange-600 to-pink-500", popular: true },
    { title: "پلانی ساڵانە", price: "30,000", period: "بۆ ماوەی ٣٦٥ ڕۆژ", color: "from-yellow-600 to-red-500", popular: false }
  ];

  const handleSubscribe = () => {
    const plan = plans[selectedPlanIdx];
    const message = `سڵاو، دەمەوێت بەشداری بکەم لە پلانی PRO\n\nبەکارهێنەر: ${user?.displayName || 'بێ ناو'}\nئیمەیڵ: ${user?.email || 'نەزانراو'}\nپلان: ${plan.title}\nنرخ: ${plan.price} IQD`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/mov_hd_0?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Overlay with radial gradient atmosphere */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          >
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
          </motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-4xl bg-[#09090b] rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row"
            dir="rtl"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-8 left-8 z-50 p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X size={24} />
            </button>

            {/* Left Side: Info & Benefits */}
            <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <div className="flex items-center gap-3 mb-6 bg-red-600/10 border border-red-600/20 w-fit px-4 py-2 rounded-2xl">
                   <ShieldCheck className="text-red-600" size={24} />
                   <span className="text-red-500 font-black text-sm tracking-widest uppercase">MYFILM PRO</span>
                </div>
                <h2 className="text-5xl font-black text-white leading-tight mb-4">
                  بەشداری <span className="text-red-600">PRO</span> بکە
                </h2>
                <p className="text-zinc-500 text-lg font-bold">
                  باشترین ئەزموونی بینینی فیلم و زنجیرەکان لێرەیە. زیاتر لە جاران چێژ وەربگرە.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                {benefits.map((benefit, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center gap-5 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon size={22} className="group-hover:animate-pulse" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight group-hover:text-red-500 transition-colors">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Side: Plans Grid */}
            <div className="flex-[1.2] bg-white/[0.02] p-8 md:p-12 border-r border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((plan, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    onClick={() => setSelectedPlanIdx(idx)}
                    className={`relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden group ${
                      selectedPlanIdx === idx ? 'bg-zinc-900 border-red-600 shadow-[0_20px_40px_rgba(220,38,38,0.2)]' : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] text-center">
                        پێشنیارکراو
                      </div>
                    )}
                    
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                       {idx === 0 && <Star size={20} fill="white" />}
                       {idx === 1 && <Flame size={20} fill="white" />}
                       {idx === 2 && <Crown size={20} fill="white" />}
                       {idx === 3 && <ShieldCheck size={20} fill="white" />}
                    </div>

                    <h4 className="text-white font-black text-xl mb-1">{plan.title}</h4>
                    <p className="text-zinc-500 text-xs font-bold mb-6 italic">{plan.period}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-zinc-500 text-xs font-black uppercase">IQD</span>
                      </div>
                      {selectedPlanIdx === idx && (
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                          <Check size={14} className="text-white" strokeWidth={4} />
                        </div>
                      )}
                    </div>

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 space-y-6">
                <p className="text-[10px] text-zinc-600 text-center leading-relaxed font-bold">
                  بە بەکارهێنانی خزمەتگوزارییەکانی ئێمە، تۆ ڕەزامەندی لەسەر مەرج و یاساکانی بەکارهێنان دەدەیت. ئابوونەی دەستبەجێ دوای کڕین چالاک دەبێت.
                </p>
                <button 
                  onClick={handleSubscribe}
                  className="w-full py-5 bg-red-600 text-white font-black text-sm rounded-3xl hover:bg-red-700 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                   ناردنی نامە بۆ تێلیگرام
                   <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

