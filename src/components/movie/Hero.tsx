import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface HeroProps {
  movie?: any;
}

export const Hero = ({ movie }: HeroProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleWatchNow = () => {
    if (movie?.id) {
      navigate(`/watch/${movie.id}`);
    }
  };

  const handleInfo = () => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user || !displayMovie?.id) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentWatchlist = userSnap.data()?.watchlist || [];
      
      if (!currentWatchlist.includes(displayMovie.id)) {
        await updateDoc(userRef, {
          watchlist: [...currentWatchlist, displayMovie.id],
          updatedAt: new Date().toISOString()
        });
        alert('Kino tanlanganlar ro\'yxatiga qo\'shildi!');
      } else {
        alert('Bu kino allaqachon ro\'yxatingizda bor.');
      }
    } catch (err) {
      console.error("Watchlist error:", err);
    }
  };

  const displayMovie = movie || {
    title: "Astra's Journey",
    description: "In a galaxy on the brink of collapse, one pilot must find the ancient artifact that can restore balance to the universe.",
    banner: "https://picsum.photos/seed/space/1920/1080",
    rating: 4.8,
    year: 2024,
    duration: "2h 15m",
    genre: ["Sci-Fi", "Adventure"]
  };

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background with multiple gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-cyan-900/40 to-transparent" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-indigo-600/20 blur-[100px]" />
        <img 
          src={displayMovie.banner || displayMovie.thumbnail || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920'} 
          alt={displayMovie.title}
          className="w-full h-full object-cover opacity-50"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920';
          }}
        />
      </div>

      <div className="relative z-20 h-full container mx-auto px-4 flex flex-col justify-end pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white">Trenddagilar</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter leading-none">
            {displayMovie.title}
          </h1>

          <p className="text-lg text-slate-300 max-w-lg leading-relaxed line-clamp-3">
            {displayMovie.description || "Ushbu sarguzasht sizni kutilmagan dunyolarga yetaklaydi."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button 
              onClick={handleWatchNow}
              className="h-14 px-8 bg-white text-black hover:bg-zinc-100 rounded-2xl text-lg font-bold shadow-lg shadow-white/5 gap-2 group transition-all"
            >
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              Hozir ko'rish
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAddToWatchlist}
              className="h-14 px-8 bg-white/10 backdrop-blur-xl border-white/10 text-white hover:bg-white/20 rounded-2xl text-lg font-bold gap-2"
            >
              <Plus className="w-6 h-6" />
              Ro'yxatga qo'shish
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleInfo}
              className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10"
            >
              <Info className="w-6 h-6 text-white" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Indicators */}
      <div className="absolute bottom-12 right-4 md:right-12 flex gap-2 z-20">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-cyan-500 shadow-lg shadow-cyan-500/50' : 'w-2 bg-white/20'}`} />
        ))}
      </div>
    </section>
  );
};
