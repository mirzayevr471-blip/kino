import React from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Play, Pause, Volume2, Maximize, SkipBack, SkipForward, 
  Settings, Subtitles, ArrowLeft, Monitor, Check, ListVideo, X
} from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MOVIES } from '../constants';

export const VideoPlayer = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get('ep');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = React.useState<any>(null);
  const [episode, setEpisode] = React.useState<any>(null);
  const [episodes, setEpisodes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showEpisodes, setShowEpisodes] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [volume, setVolume] = React.useState([80]);
  const [progress, setProgress] = React.useState([0]);
  const [quality, setQuality] = React.useState('1080p');
  const [userSubscription, setUserSubscription] = React.useState('free');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'movies', id));
        if (docSnap.exists()) {
          const movieData = docSnap.data();
          setMovie(movieData);

          const q = query(collection(db, 'movies', id, 'episodes'), orderBy('seasonNumber', 'asc'), orderBy('episodeNumber', 'asc'));
          const epSnap = await getDocs(q);
          const epsList = epSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setEpisodes(epsList);

          if (episodeId) {
            const currentEp = epsList.find(e => e.id === episodeId);
            setEpisode(currentEp || null);
          } else if (epsList.length > 0) {
            setEpisode(epsList[0]);
          }
        } else {
          const mock = MOCK_MOVIES.find(m => m.id === id);
          if (mock) setMovie(mock);
        }
      } catch (err) {
        console.error("Firestore error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id, episodeId]);

  React.useEffect(() => {
    const fetchUserSub = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUserSubscription(docSnap.data().subscription || 'free');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserSub();
  }, [user]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress([(current / total) * 100]);
    }
  };

  const handleSliderChange = (val: number[]) => {
    if (videoRef.current) {
      const total = videoRef.current.duration;
      videoRef.current.currentTime = (val[0] / 100) * total;
      setProgress(val);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const availableQualities = React.useMemo(() => {
    const base = ['480p', '720p'];
    if (userSubscription === 'basic') return [...base, '1080p'];
    if (userSubscription === 'premium') return [...base, '1080p', '4K'];
    return base;
  }, [userSubscription]);

  // Hide controls after inactivity
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const videoUrl = episode?.videoUrl || movie?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-none group overflow-hidden" style={{ cursor: showControls ? 'default' : 'none' }}>
      <AnimatePresence>
        {showEpisodes && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-zinc-950/95 border-l border-zinc-800 z-[110] p-6 cursor-default"
          >
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Qismlar</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowEpisodes(false)} className="text-zinc-500 hover:text-white">
                   <X className="w-6 h-6" />
                </Button>
             </div>
             <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-2 scrollbar-hide">
                {episodes.map(ep => (
                  <button 
                    key={ep.id}
                    onClick={() => {
                       navigate(`/watch/${id}?ep=${ep.id}`);
                       setShowEpisodes(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      episode?.id === ep.id 
                      ? 'bg-red-600/10 border-red-600/50 text-red-500' 
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">
                       Season {ep.seasonNumber} • Episode {ep.episodeNumber}
                    </p>
                    <p className="font-bold line-clamp-1">{ep.title}</p>
                  </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <div className={`absolute top-8 left-8 z-10 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/10 gap-2"
        >
          <ArrowLeft className="w-6 h-6" />
          Orqaga qaytish
        </Button>
      </div>

      {/* Video Content */}
      <div className="w-full h-full relative">
        <video 
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={movie?.banner || movie?.thumbnail || "https://picsum.photos/seed/inter/1920/1080"}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Center Play/Pause Indicator (Overlay) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 glass rounded-full flex items-center justify-center">
              <Play className="w-12 h-12 text-white fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-end p-8 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="space-y-6 max-w-6xl mx-auto w-full">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider 
              value={progress} 
              onValueChange={handleSliderChange} 
              max={100} 
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>{videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'}</span>
              <span>{videoRef.current ? formatTime(videoRef.current.duration || 0) : '0:00'}</span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10 }}
                className="text-white hover:bg-white/10"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { if(videoRef.current) videoRef.current.currentTime += 10 }}
                className="text-white hover:bg-white/10"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </Button>
              
              <div className="flex items-center gap-3 w-40 group/volume ml-4">
                <Volume2 className="w-6 h-6 text-white" />
                <Slider 
                  value={volume} 
                  onValueChange={(val) => {
                    setVolume(val);
                    if(videoRef.current) videoRef.current.volume = val[0] / 100;
                  }} 
                  max={100} 
                  step={1} 
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-lg font-bold">
                {loading ? 'Kino yuklanmoqda...' : (episode ? `S${episode.seasonNumber} E${episode.episodeNumber}: ${episode.title}` : movie?.title || 'Noma\'lum video')}
              </h2>
              <p className="text-xs text-zinc-400">
                {loading ? 'Iltimos kuting' : (movie?.title ? `${movie.title} • ${movie.year}` : 'Tomosha qiling')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {episodes.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowEpisodes(!showEpisodes)} 
                  className={`text-white hover:bg-white/10 transition-colors ${showEpisodes ? 'bg-red-600/20 text-red-500' : ''}`}
                >
                  <ListVideo className="w-6 h-6" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Subtitles className="w-6 h-6" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
                    <Settings className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] px-1 rounded font-bold uppercase">{quality}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-black/90 border-white/10 text-white w-48 p-2 mb-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 px-2 py-1 uppercase tracking-widest">Video Sifati</p>
                      {availableQualities.map(q => (
                        <button 
                          key={q}
                          onClick={() => setQuality(q)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-sm transition-colors"
                        >
                          {q}
                          {quality === q && <Check className="w-4 h-4 text-red-500" />}
                        </button>
                      ))}
                      <div className="pt-2 mt-2 border-t border-white/5 px-2">
                         <p className="text-[8px] text-zinc-500">
                           {userSubscription === 'premium' 
                             ? 'Siz eng yuqori sifatdan foydalanmoqdasiz' 
                             : `Sifatni oshirish uchun Premiumga o'ting`}
                         </p>
                      </div>
                   </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Monitor className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Maximize className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
