import React, { useEffect, useState } from 'react';
import { Check, Zap, Tv, Crown, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const INITIAL_PLANS = [
  {
    name: "Bepul",
    price: "$0",
    features: ["Standart sifat (480p)", "Reklamalar bilan", "1 ta qurilmada ko‘rish"],
    icon: Tv,
    color: "zinc"
  },
  {
    name: "Standart",
    price: "$9.99",
    features: ["Yuqori sifat (1080p)", "Reklamasiz", "2 ta qurilmada ko‘rish", "Yuklab olish imkoniyati"],
    icon: Zap,
    color: "red",
    popular: true
  },
  {
    name: "Premium",
    price: "$14.99",
    features: ["Ultra yuqori sifat (4K + HDR)", "Reklamasiz", "4 ta qurilmada ko‘rish", "Oflayn ko‘rish", "Eksklyuziv kontent"],
    icon: Crown,
    color: "purple"
  }
];

export const Subscription = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const q = query(collection(db, 'plans'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setPlans(INITIAL_PLANS);
        } else {
          const fetchedPlans = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Map icons based on name
            let Icon = Tv;
            if (data.name === 'Standard' || data.name === 'Standart') Icon = Zap;
            if (data.name === 'Premium') Icon = Crown;
            
            return {
              ...data,
              id: doc.id,
              icon: Icon,
              popular: data.isPopular
            };
          });
          setPlans(fetchedPlans);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setPlans(INITIAL_PLANS);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 container mx-auto pb-20 bg-[#020617]">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 mb-4">
          <Crown className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Premium A'zolik</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
          O'zingizga mos <span className="text-gradient">Tajribani</span> tanlang
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          KinoHub.uz Premium bilan 4K oqimli uzatish, oflayn ko'rish va eksklyuziv loyihalardan bahramand bo'ling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id || `plan-${i}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-3xl border transition-all duration-300 ${
              plan.popular 
                ? 'bg-gradient-to-b from-indigo-900/40 to-cyan-900/40 border-cyan-500/30 ring-1 ring-cyan-500/30 shadow-2xl shadow-cyan-500/20' 
                : 'bg-white/5 border-white/5 backdrop-blur-sm'
            } flex flex-col group`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                Eng ommabop
              </div>
            )}

            <div className="mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                plan.popular ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-white/10'
              }`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-500 text-sm font-medium">/oy</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map(feat => (
                <div key={feat} className="flex items-center gap-3 text-slate-300">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                    <Check className={`w-3 h-3 ${plan.popular ? 'text-cyan-400' : 'text-slate-500'}`} />
                  </div>
                  <span className="text-sm font-medium">{feat}</span>
                </div>
              ))}
            </div>

            <Button className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${
              plan.popular 
                ? 'bg-white text-black hover:bg-cyan-50 shadow-xl shadow-white/5' 
                : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
            }`}>
              {plan.price === '$0' ? 'Bepul boshlash' : `${plan.name} rejasini tanlash`}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 text-center text-slate-600 text-xs font-medium uppercase tracking-widest">
        <p>Istagan vaqtingizda profilingiz orqali obunani o'zgartirishingiz yoki bekor qilishingiz mumkin.</p>
      </div>
    </div>
  );
};
