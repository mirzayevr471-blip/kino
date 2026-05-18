import React from 'react';
import { motion } from 'motion/react';
import { Star, Play, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  genre: string[];
  rating: number;
  year: number;
}

export const MovieCard = ({ movie }: { movie: Movie; key?: any }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}`);
  };

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentWatchlist = userSnap.data()?.watchlist || [];
      
      if (!currentWatchlist.includes(movie.id)) {
        await updateDoc(userRef, {
          watchlist: [...currentWatchlist, movie.id],
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

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleCardClick}
      className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-slate-800 border border-white/5"
    >
      <img
        src={movie.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400'}
        alt={movie.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
        }}
      />
      
      {/* Translucent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-cyan-500 text-white border-none shadow-lg shadow-cyan-500/20">
            <Star className="w-3 h-3 fill-current mr-1" />
            {movie.rating}
          </Badge>
          <Badge variant="outline" className="text-white border-white/20 bg-white/5 backdrop-blur-sm">
            {movie.year}
          </Badge>
        </div>
        <h3 className="font-bold text-white leading-tight mb-2 group-hover:text-cyan-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
          <button 
            onClick={handlePlayClick}
            className="p-2 bg-white text-black rounded-full hover:bg-cyan-400 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
          <button 
            onClick={handleAddToWatchlist}
            className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
