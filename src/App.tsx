import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './lib/i18n';

import { Toaster } from 'sonner';
// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { db } from './lib/firebase';
import { collection, getDocs, query, where, onSnapshot, limit } from 'firebase/firestore';
import { Settings, Wrench, AlertTriangle, Hammer } from 'lucide-react';
import { Button } from './components/ui/button';

// Components
import { Navbar } from './components/layout/Navbar';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { Hero } from './components/movie/Hero';
import { MovieSection } from './components/movie/MovieSection';
import { AIRecommendations } from './components/movie/AIRecommendations';
import { MovieCard } from './components/movie/MovieCard';

// Pages
import { Login } from './pages/Login';
import { SearchPage } from './pages/SearchPage';
import { Profile } from './pages/Profile';
import { Subscription } from './pages/Subscription';
import { AdminPanel } from './pages/AdminPanel';
import { MovieDetails } from './pages/MovieDetails';
import { VideoPlayer } from './pages/VideoPlayer';

import { MOCK_MOVIES } from './constants';

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [movies, setMovies] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'movies'));
        const moviesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        if (moviesList.length > 0) {
          setMovies(moviesList);
        } else {
          setMovies(MOCK_MOVIES);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setMovies(MOCK_MOVIES);
      }
    };
    fetchMovies();
  }, []);
  
  const featuredMovie = movies.length > 0 ? movies[0] : MOCK_MOVIES[0];
  
  return (
    <div className="pb-20">
      <Hero movie={featuredMovie} />
      <div className="space-y-12 -mt-20 relative z-10">
        <MovieSection 
          title={t('sections.trending')} 
          movies={movies} 
          viewAllPath="/all"
        />
        {user && <AIRecommendations />}
        <MovieSection 
          title={t('sections.popular_series')} 
          movies={movies.slice().reverse()} 
          viewAllPath="/series"
        />
        <MovieSection 
          title={t('sections.anime_picks')} 
          movies={movies.filter(m => m.category === 'anime').length > 0 ? movies.filter(m => m.category === 'anime') : movies.slice(2, 6)} 
          viewAllPath="/anime"
        />
      </div>
    </div>
  );
};

const CategoryPage = ({ title, category }: { title: string, category: string }) => {
  const [movies, setMovies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let q;
        if (category === 'all') {
          q = query(collection(db, 'movies'));
        } else {
          q = query(collection(db, 'movies'), where('category', '==', category));
        }
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setMovies(list.length > 0 ? list : (category === 'all' ? MOCK_MOVIES : []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="pt-24 pb-20 px-4 container mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-2">{title}</h1>
        <div className="w-20 h-1 bg-red-600 rounded-full" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map(movie => (
          <div key={movie.id} className="transition-transform hover:scale-105 duration-300">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
      
      {movies.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          Bu bo'limda hozircha kinolar yo'q.
        </div>
      )}
    </div>
  );
};

const Movies = () => <CategoryPage title="Barcha Kinolar" category="movie" />;
const Series = () => <CategoryPage title="Seriallar" category="series" />;
const Anime = () => <CategoryPage title="Anime" category="anime" />;
const Drama = () => <CategoryPage title="Dramalar" category="drama" />;
const Cartoons = () => <CategoryPage title="Multfilmlar" category="cartoons" />;
const AllAdded = () => <CategoryPage title="Barcha qo'shilganlar" category="all" />;

const MaintenanceMode = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-red-600/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl">
          <Wrench className="w-12 h-12 text-red-500 animate-bounce" />
        </div>
      </div>
      <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tighter">
        Texnik <span className="text-red-500">ta'mirlash</span> ishlari
      </h1>
      <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
        Hozirda saytda ta'mirlash ishlari olib borilmoqda. Tez orada yanada qulayroq ko'rinishda qaytamiz.
      </p>

      <div className="mt-8">
        <Button 
          onClick={() => navigate('/login')}
          variant="outline" 
          className="border-zinc-800 text-zinc-500 hover:text-white"
        >
          Admin Kirish
        </Button>
      </div>

      <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl backdrop-blur-sm max-w-sm w-full">
         <div className="flex items-center gap-3 text-zinc-500 text-sm mb-4">
            <Hammer className="w-4 h-4" />
            <p className="font-medium">Kutilayotgan o'zgarishlar:</p>
         </div>
         <ul className="text-left space-y-2">
            {[
              "Yangi video pleyer",
              "Yuqori sifatli kontentlar",
              "AI tavsiyalar tizimi",
              "Premium obunalar"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
                <div className="w-1 h-1 bg-red-500 rounded-full" />
                {item}
              </li>
            ))}
         </ul>
      </div>
      <div className="mt-12 pt-12 border-t border-zinc-900 w-full max-w-xs">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700">Platforma Nazorati</p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading, role } = useAuth();
  const [isMaintenance, setIsMaintenance] = React.useState(false);
  const [siteSettings, setSiteSettings] = React.useState({ siteName: 'KinoHub.uz' });
  const isPlatformOwner = user?.email === 'mirzayevr471@gmail.com';
  const isAdmin = role === 'super' || role === 'editor' || isPlatformOwner;

  React.useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'settings'), limit(1)), (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setIsMaintenance(data.maintenanceMode || false);
        setSiteSettings({ siteName: data.siteName || 'KinoHub.uz' });
      }
    }, (err) => {
      console.error("Settings listener failed, using defaults:", err);
    });
    return () => unsub();
  }, []);

  if (loading) return <LoadingScreen />;

  // Allow admins to bypass maintenance, or allow anyone to see the login page
  const isLoginPage = window.location.pathname === '/login';
  if (isMaintenance && !isAdmin && !isLoginPage) {
    return <MaintenanceMode />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Navbar siteName={siteSettings.siteName} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/drama" element={<Drama />} />
          <Route path="/cartoons" element={<Cartoons />} />
          <Route path="/all" element={<AllAdded />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/watch/:id" element={<VideoPlayer />} />
        </Routes>
      </main>

      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-4 mt-24">
        <div className="container mx-auto text-center text-zinc-500 text-sm">
          <p className="font-display font-medium tracking-widest uppercase mb-2">{siteSettings.siteName}</p>
          <p>&copy; 2026 {siteSettings.siteName}. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
          <Toaster richColors position="bottom-right" />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
