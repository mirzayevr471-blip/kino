import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Star, Share2, Download, ThumbsUp, Loader2, ListVideo, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { db } from '../lib/firebase';
import { doc, getDoc, onSnapshot, query, collection, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MOCK_MOVIES } from '../constants';
import { canAccess } from '../lib/utils';

export const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = React.useState<any>(null);
  const [userSubscription, setUserSubscription] = React.useState<string>('free');
  const [loading, setLoading] = React.useState(true);
  const [translatedData, setTranslatedData] = React.useState<any>(null);
  const [translating, setTranslating] = React.useState(false);
  const [episodes, setEpisodes] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;
    const fetchUserSub = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setUserSubscription(snap.data().subscription || 'free');
      }
    };
    fetchUserSub();
  }, [user]);

  React.useEffect(() => {
    if (!id || !movie) return;
    
    // Always fetch episodes, some movies might have parts (Part 1, Part 2 etc)
    const q = query(collection(db, 'movies', id, 'episodes'), orderBy('seasonNumber', 'asc'), orderBy('episodeNumber', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setEpisodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [id, movie]);

  React.useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'movies', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMovie(docSnap.data());
        } else {
          const mock = MOCK_MOVIES.find(m => m.id === id);
          if (mock) setMovie(mock);
        }
      } catch (err) {
        console.error("Firestore connection error, using fallback:", err);
        const mock = MOCK_MOVIES.find(m => m.id === id);
        if (mock) setMovie(mock);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const hasAccess = React.useMemo(() => canAccess(movie?.accessTier, userSubscription), [movie, userSubscription]);

  React.useEffect(() => {
    if (!movie || !user) return;

    const translateContent = async () => {
      try {
        // Check user preference
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const lang = userDoc.data()?.language || 'uz';
        
        if (lang === 'uz') {
          setTranslatedData(null);
          return;
        }

        setTranslating(true);
        const textToTranslate = `${movie.title} |SEPARATOR| ${movie.description}`;
        
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToTranslate, targetLang: lang })
        });
        
        const data = await res.json();
        if (data.translatedText) {
          const [title, desc] = data.translatedText.split('|SEPARATOR|');
          setTranslatedData({ 
            title: title?.trim() || movie.title, 
            description: desc?.trim() || movie.description 
          });
        }
      } catch (err) {
        console.error("Translation failed:", err);
      } finally {
        setTranslating(false);
      }
    };

    translateContent();
  }, [movie, user]);

  if (loading) return <div className="pt-32 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-red-600" /></div>;
  if (!movie) return <div className="pt-32 text-center text-white">Kino topilmadi</div>;

  const displayTitle = translatedData?.title || movie.title;
  const displayDesc = translatedData?.description || movie.description;

  return (
    <div className="relative min-h-screen pt-20">
      {/* Background Banner */}
      <div className="fixed inset-0 z-0">
        <img src={movie.banner || movie.thumbnail} alt={displayTitle} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {movie.genre?.map((g: string) => (
                  <Badge key={g} variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/10">
                    {g}
                  </Badge>
                ))}
                <span className="text-zinc-400 font-medium">• {movie.year} • {movie.duration || '2h 15m'}</span>
                {translating && <span className="text-[10px] text-zinc-500 animate-pulse">Tarjima qilinmoqda...</span>}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold">{displayTitle}</h1>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold">{movie.rating}</span>
                  <span className="text-zinc-500 text-sm">KinoHub.uz</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-cyan-500" />
                  <span className="text-zinc-300 font-medium">98% mos keldi</span>
                </div>
              </div>
            </div>

            <p className="text-xl text-zinc-300 leading-relaxed max-w-3xl">
              {displayDesc}
            </p>

            <div className="flex flex-wrap gap-4">
              {hasAccess ? (
                <Link to={episodes.length > 0 ? `/watch/${id}?ep=${episodes[0].id}` : `/watch/${id}`}>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white gap-2 px-8 py-7 rounded-xl text-xl font-bold">
                    <Play className="w-6 h-6 fill-current" />
                    {episodes.length > 0 ? 'Birinchi qism' : 'Tomosha qilish'}
                  </Button>
                </Link>
              ) : (
                <Link to="/plans">
                  <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 px-8 py-7 rounded-xl text-xl font-bold">
                    <Zap className="w-6 h-6 fill-current" />
                    Obunani yangilash
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="secondary" className="glass gap-2 px-8 py-7 rounded-xl text-xl font-bold hover:bg-white/20">
                <Plus className="w-6 h-6" />
                Saqlab qo'yish
              </Button>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="w-14 h-14 rounded-full border-zinc-700 hover:bg-white/10">
                  <Download className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="outline" className="w-14 h-14 rounded-full border-zinc-700 hover:bg-white/10">
                  <Share2 className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="pt-12">
              <Tabs defaultValue={episodes.length > 0 ? 'episodes' : 'related'} className="w-full">
                <TabsList className="bg-transparent border-b border-zinc-800 w-full justify-start rounded-none h-12 p-0 gap-8">
                  {episodes.length > 0 && (
                    <TabsTrigger value="episodes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent text-lg px-0">Qismlar</TabsTrigger>
                  )}
                  <TabsTrigger value="related" className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent text-lg px-0">O'xshash videolar</TabsTrigger>
                  <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent text-lg px-0">Tafsilotlar</TabsTrigger>
                </TabsList>

                {episodes.length > 0 && (
                  <TabsContent value="episodes" className="pt-6">
                    <div className="space-y-3">
                      {episodes.map(ep => (
                        <Link key={ep.id} to={`/watch/${id}?ep=${ep.id}`}>
                           <div className="flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800 group transition-all border border-zinc-800/50 rounded-xl">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                   <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                   <p className="font-bold text-white">S{ep.seasonNumber} E{ep.episodeNumber}: {ep.title}</p>
                                   <p className="text-xs text-zinc-500">{ep.duration || '24:00'}</p>
                                </div>
                              </div>
                              <ListVideo className="w-5 h-5 text-zinc-600" />
                           </div>
                        </Link>
                      ))}
                      {episodes.length === 0 && (
                        <div className="py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-center">
                           <p className="text-zinc-500">Hozircha qismlar yuklanmagan</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="related" className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="details" className="pt-6 space-y-4 text-zinc-300">
                  <div><span className="text-zinc-500">Rejissyor:</span> {movie.director || 'Noma\'lum'}</div>
                  <div><span className="text-zinc-500">Aktyorlar:</span> {movie.cast?.join(', ') || 'Noma\'lum'}</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
