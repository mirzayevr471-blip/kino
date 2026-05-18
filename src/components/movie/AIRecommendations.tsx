import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { MovieCard } from './MovieCard';
import { useAuth } from '../../context/AuthContext';

export const AIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecs = async () => {
      // Check cache first
      const cached = sessionStorage.getItem(`ai_recs_${user?.uid || 'guest'}`);
      if (cached) {
        setRecommendations(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userPreferences: "Epic sci-fi, mind-bending thrillers, space exploration",
            history: ["Interstellar", "Inception"]
          })
        });
        
        const data = await res.json();
        const titles = data.recommendations || [];
        
        const mapped = titles.slice(0, 4).map((item: any, i: number) => ({
          id: `ai-${i}-${Date.now()}`,
          title: item.title,
          thumbnail: `https://picsum.photos/seed/ai${i}${Date.now()}/400/600`,
          genre: [data.fallback ? 'Tavsiya' : 'AI Pick'],
          rating: 9.0,
          year: 2024,
          reason: item.reason
        }));

        setRecommendations(mapped);
        sessionStorage.setItem(`ai_recs_${user?.uid || 'guest'}`, JSON.stringify(mapped));
      } catch (err) {
        console.error("Failed to fetch AI recs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [user]);

  if (loading) return (
    <div className="py-12 flex items-center justify-center gap-3 text-zinc-500">
      <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      <span className="font-medium">AI siz uchun filmlar tanlamoqda...</span>
    </div>
  );

  return (
    <section className="py-12 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Sparkles className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">AI Smart Tavsiyalar</h2>
            <p className="text-sm text-zinc-500">Sizning qiziqishlaringiz asosida tanlangan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 container mx-auto">
        {recommendations.map((mov, i) => (
          <motion.div 
            key={mov.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-3"
          >
            <MovieCard movie={mov} />
            <p className="text-[10px] text-zinc-500 italic leading-tight px-1">
              "{mov.reason}"
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
