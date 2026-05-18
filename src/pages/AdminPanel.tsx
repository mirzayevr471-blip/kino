import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Film, Users, TrendingUp, 
  PlusCircle, BarChart3, Settings, ShieldAlert,
  Loader2, Trash2, Edit2, CheckCircle2, AlertCircle,
  Search, ShieldCheck, UserCog, Activity, Clock, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  serverTimestamp, query, orderBy, limit, updateDoc 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format } from 'date-fns';

const CHART_DATA = [
  { name: 'Du', views: 4000, value: 2400 },
  { name: 'Se', views: 3000, value: 1398 },
  { name: 'Cho', views: 2000, value: 9800 },
  { name: 'Pa', views: 2780, value: 3908 },
  { name: 'Ju', views: 1890, value: 4800 },
  { name: 'Sha', views: 2390, value: 3800 },
  { name: 'Ya', views: 3490, value: 4300 },
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const AdminPanel = () => {
  const { user, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    siteName: 'KinoHub.uz',
    siteDescription: 'Eng so‘nggi kinolar va seriallar platformasi'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
  const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
    const errObj = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: { userId: user?.uid, role }
    };
    console.error('Firestore Error:', JSON.stringify(errObj));
    setErrorMsg(errObj.error);
    return errObj;
  };
  const [stats, setStats] = useState({
    content: 0,
    users: 0,
    revenue: '$12,500', growth: '+15.2%'
  });

  const [selectedMovieForEpisodes, setSelectedMovieForEpisodes] = useState<any | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodeFormData, setEpisodeFormData] = useState({
    title: '',
    episodeNumber: 1,
    seasonNumber: 1,
    videoUrl: '',
    thumbnail: '',
    description: '',
    duration: ''
  });
  const [addingEpisode, setAddingEpisode] = useState(false);

  const fetchEpisodes = async (movieId: string) => {
    try {
      const q = query(collection(db, 'movies', movieId, 'episodes'), orderBy('seasonNumber', 'asc'), orderBy('episodeNumber', 'asc'));
      const snap = await getDocs(q);
      setEpisodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `movies/${movieId}/episodes`);
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieForEpisodes) return;
    setAddingEpisode(true);
    try {
      await addDoc(collection(db, 'movies', selectedMovieForEpisodes.id, 'episodes'), {
        ...episodeFormData,
        createdAt: serverTimestamp()
      });
      setEpisodeFormData({
        title: '',
        episodeNumber: episodeFormData.episodeNumber + 1,
        seasonNumber: episodeFormData.seasonNumber,
        videoUrl: '',
        thumbnail: '',
        description: '',
        duration: ''
      });
      fetchEpisodes(selectedMovieForEpisodes.id);
      alert('Qism muvaffaqiyatli qo‘shildi!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `movies/${selectedMovieForEpisodes.id}/episodes`);
    } finally {
      setAddingEpisode(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!selectedMovieForEpisodes || !confirm('Qismni o‘chirmoqchimisiz?')) return;
    try {
      await deleteDoc(doc(db, 'movies', selectedMovieForEpisodes.id, 'episodes', episodeId));
      fetchEpisodes(selectedMovieForEpisodes.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `movies/${selectedMovieForEpisodes.id}/episodes/${episodeId}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    banner: '',
    videoUrl: '',
    category: 'movie',
    accessTier: 'free',
    year: new Date().getFullYear(),
    rating: 0,
    genres: ''
  });
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const handleEditMovie = (movie: any) => {
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      thumbnail: movie.thumbnail || '',
      banner: movie.banner || '',
      videoUrl: movie.videoUrl || '',
      category: movie.category || 'movie',
      accessTier: movie.accessTier || 'free',
      year: movie.year || new Date().getFullYear(),
      rating: movie.rating || 0,
      genres: movie.genre ? movie.genre.join(', ') : ''
    });
    setEditingCardId(movie.id);
  };

  const isSuper = role === 'super';
  const isEditor = role === 'editor';
  const isAdmin = isSuper || isEditor;
  const isPlatformOwner = user?.email === 'mirzayevr471@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchMovies();
      if (isSuper) {
        fetchUsers();
        fetchSettings();
      }
      if (isPlatformOwner) fetchPlans();
    }
  }, [isAdmin, isSuper]);

  // Update stats whenever lists change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      content: movies.length,
      users: usersList.length
    }));
  }, [movies, usersList]);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDocs(query(collection(db, 'settings'), limit(1)));
      if (!docSnap.empty) {
        const data = docSnap.docs[0].data();
        setGlobalSettings({
          maintenanceMode: data.maintenanceMode || false,
          siteName: data.siteName || 'KinoHub.uz',
          siteDescription: data.siteDescription || 'Eng so‘nggi kinolar va seriallar platformasi'
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'settings');
    }
  };

  const handleUpdateSettings = async () => {
    if (!isSuper) return;
    setSavingSettings(true);
    try {
      // Find current setting doc or create new one
      const q = query(collection(db, 'settings'), limit(1));
      const querySnapshot = await getDocs(q);
      
      const payload = {
        ...globalSettings,
        updatedAt: serverTimestamp()
      };

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'settings'), payload);
      } else {
        await updateDoc(doc(db, 'settings', querySnapshot.docs[0].id), payload);
      }
      alert('Sozlamalar saqlandi');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchMovies = async () => {
    try {
      setErrorMsg(null);
      const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const moviesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovies(moviesList);
      setStats(prev => ({ ...prev, content: querySnapshot.size }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'movies');
    }
  };

  const fetchUsers = async () => {
    if (!isSuper) return;
    try {
      setErrorMsg(null);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(list);
      setStats(prev => ({ ...prev, users: querySnapshot.size }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  };

  const fetchPlans = async () => {
    try {
      const q = query(collection(db, 'plans'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlansList(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'plans');
    }
  };

  const updatePlanPrice = async (planId: string, newPrice: string) => {
    if (!isPlatformOwner) return;
    try {
      await updateDoc(doc(db, 'plans', planId), {
        price: newPrice,
        updatedAt: serverTimestamp()
      });
      fetchPlans();
      alert('Narx o‘zgartirildi');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `plans/${planId}`);
    }
  };

  const handleSubmitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        genre: formData.genres.split(',').map(g => g.trim()),
        updatedAt: serverTimestamp(),
      };

      if (editingCardId) {
        await updateDoc(doc(db, 'movies', editingCardId), payload);
        alert('Kontent muvaffaqiyatli yangilandi!');
      } else {
        await addDoc(collection(db, 'movies'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        alert('Kontent muvaffaqiyatli yuklandi!');
      }
      
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        banner: '',
        videoUrl: '',
        category: 'movie',
        year: new Date().getFullYear(),
        rating: 0,
        genres: ''
      });
      setEditingCardId(null);
      
      fetchMovies();
    } catch (err) {
      handleFirestoreError(err, editingCardId ? OperationType.UPDATE : OperationType.WRITE, editingCardId ? `movies/${editingCardId}` : 'movies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Haqiqatan ham ushbu kontentni o‘chirmoqchimisiz?')) return;
    
    try {
      await deleteDoc(doc(db, 'movies', id));
      fetchMovies();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `movies/${id}`);
    }
  };

  const handlePromote = async (userId: string, newRole: string) => {
    if (!isSuper) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      fetchUsers();
      alert(`Foydalanuvchi roli ${newRole} etib o‘zgartirildi`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-white mb-2">Kirish taqiqlangan</h1>
        <p className="text-zinc-500 max-w-md">
          Ushbu sahifa faqat adminlar uchun mo‘ljallangan. Iltimos, asosiy sahifaga qayting.
        </p>
        <Button onClick={() => (window.location.href = '/')} className="mt-6 bg-white text-black hover:bg-zinc-200">
          Asosiy sahifaga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 container mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 gap-6 border-b border-zinc-900 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-14 h-14 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-display font-bold tracking-tight">Admin <span className="text-zinc-500">Panel</span></h1>
              {isPlatformOwner && (
                 <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0 h-5 text-[10px] font-bold tracking-widest uppercase">
                   Owner
                 </Badge>
              )}
            </div>
            <p className="text-zinc-500 font-medium">
              {isPlatformOwner ? 'To‘liq platforma nazorati tizimi' : isSuper ? 'Boshqaruv markazi (Super Admin)' : 'Kontent boshqaruvi (Editor)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white">{user?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{role}</p>
           </div>
           <div className="w-10 h-10 rounded-full border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950 transition-transform hover:scale-110 cursor-pointer overflow-hidden shadow-xl shadow-black/50">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-200">{errorMsg}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setErrorMsg(null)}
                className="text-red-500 hover:bg-red-500/10"
              >
                Yopish
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row gap-8 items-start">
        <TabsList className="bg-zinc-950 border border-zinc-900 p-1 rounded-xl w-full lg:w-64 flex flex-row lg:flex-col h-auto lg:sticky lg:top-24">
          <TabsTrigger value="dashboard" className="rounded-lg gap-2 justify-start w-full px-4 h-11 data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
            <LayoutDashboard className="w-4 h-4" /> Monitoring
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-lg gap-2 justify-start w-full px-4 h-11 data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
            <Film className="w-4 h-4" /> Kontent
          </TabsTrigger>
          {isSuper && (
            <TabsTrigger value="users" className="rounded-lg gap-2 justify-start w-full px-4 h-11 data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
              <Users className="w-4 h-4" /> Foydalanuvchilar
            </TabsTrigger>
          )}
          {isSuper && (
            <TabsTrigger value="settings" className="rounded-lg gap-2 justify-start w-full px-4 h-11 data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
              <Settings className="w-4 h-4" /> Sozlamalar
            </TabsTrigger>
          )}
          {isPlatformOwner && (
            <TabsTrigger value="plans" className="rounded-lg gap-2 justify-start w-full px-4 h-11 data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
              <Zap className="w-4 h-4" /> Obunalar
            </TabsTrigger>
          )}
          {selectedMovieForEpisodes && (
            <TabsTrigger value="episodes" className="rounded-lg gap-2 justify-start w-full px-4 h-11 data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
              <Clock className="w-4 h-4" /> Qismlar b-vi
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 w-full space-y-8 min-w-0">
          <TabsContent value="episodes" className="m-0 outline-none">
            {selectedMovieForEpisodes && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMovieForEpisodes.title}</h2>
                    <p className="text-zinc-500 text-sm">Qismlarni boshqarish</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedMovieForEpisodes(null)} className="border-zinc-800">Orqaga</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 bg-zinc-950 border-zinc-900">
                    <CardHeader>
                      <CardTitle className="text-lg">Mavjud qismlar ({episodes.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-zinc-900">
                        {episodes.map(ep => (
                          <div key={ep.id} className="flex items-center justify-between p-4 bg-zinc-900/10">
                            <div>
                              <p className="text-sm font-bold text-white">S{ep.seasonNumber} E{ep.episodeNumber}: {ep.title}</p>
                              <p className="text-xs text-zinc-500">{ep.duration} • {ep.videoUrl.substring(0, 30)}...</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEpisode(ep.id)} className="text-zinc-500 hover:text-red-500">
                               <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {episodes.length === 0 && <div className="p-10 text-center text-zinc-500">Hozircha qismlar yo‘q</div>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950 border-zinc-900">
                    <CardHeader>
                      <CardTitle className="text-lg">Yangi qism qo‘shish</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddEpisode} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">Fasl №</Label>
                             <Input type="number" value={episodeFormData.seasonNumber} onChange={e => setEpisodeFormData({...episodeFormData, seasonNumber: parseInt(e.target.value)})} className="bg-zinc-900 border-zinc-800" />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Qism №</Label>
                             <Input type="number" value={episodeFormData.episodeNumber} onChange={e => setEpisodeFormData({...episodeFormData, episodeNumber: parseInt(e.target.value)})} className="bg-zinc-900 border-zinc-800" />
                           </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Sarlavha</Label>
                          <Input value={episodeFormData.title} onChange={e => setEpisodeFormData({...episodeFormData, title: e.target.value})} placeholder="Masalan: Boshlanish" className="bg-zinc-900 border-zinc-800" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Video URL</Label>
                          <Input value={episodeFormData.videoUrl} onChange={e => setEpisodeFormData({...episodeFormData, videoUrl: e.target.value})} placeholder="https://..." className="bg-zinc-900 border-zinc-800" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Davomiyligi (masalan: 24:00)</Label>
                          <Input value={episodeFormData.duration} onChange={e => setEpisodeFormData({...episodeFormData, duration: e.target.value})} placeholder="24:00" className="bg-zinc-900 border-zinc-800" />
                        </div>
                        <Button disabled={addingEpisode} className="w-full bg-cyan-600 hover:bg-cyan-700">
                           {addingEpisode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Qo‘shish'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6 m-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Jami kontent', value: stats.content, icon: Film, color: 'text-blue-500', bg: 'bg-blue-500/10', growth: '+12%' },
              { label: 'Faol foydalanuvchilar', value: stats.users, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10', growth: '+5%' },
              { label: 'Oylik daromad', value: stats.revenue, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10', growth: '+18%' },
              { label: 'O‘sish', value: stats.growth, icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-500/10', growth: '+24%' },
            ].map((stat, i) => (
              <Card key={i} className="bg-zinc-950 border-zinc-900 group hover:border-zinc-700 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1 bg-green-500/5 px-2 py-1 rounded-full border border-green-500/10">
                      <TrendingUp className="w-3 h-3" /> {stat.growth}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-zinc-950 border-zinc-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Platforma Trafigi</CardTitle>
                    <CardDescription className="text-zinc-500">Video ko‘rishlar statistikasi</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-xs">7 kun</Button>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-xs text-zinc-400">30 kun</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#ef4444' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        name="Ko'rishlar"
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorViews)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Oxirgi harakatlar</CardTitle>
                <CardDescription className="text-zinc-500">Platformadagi so‘nggi o‘zgarishlar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { user: 'Katta Admin', action: 'Yangi kino yukladi', time: '2 daqiqa oldin', icon: PlusCircle, color: 'text-blue-400' },
                    { user: 'Editor 1', action: 'Profilini yangiladi', time: '15 daqiqa oldin', icon: UserCog, color: 'text-purple-400' },
                    { user: 'Siz', action: 'Rolni o‘zgartirdingiz', time: '1 soat oldin', icon: ShieldCheck, color: 'text-green-400' },
                    { user: 'Editor 2', action: 'Kontentni o‘chirdi', time: '3 soat oldin', icon: Trash2, color: 'text-red-400' },
                    { user: 'Tizim', action: 'Avtomatik zaxira', time: '5 soat oldin', icon: Activity, color: 'text-zinc-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`p-2 rounded-lg bg-zinc-900 ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.user}</p>
                        <p className="text-xs text-zinc-400">{item.action}</p>
                        <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 bg-transparent border-zinc-800 text-zinc-400 hover:text-white">
                  Hammasini ko‘rish
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="m-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-zinc-950 border-zinc-900 overflow-hidden h-fit">
              <CardHeader className="border-b border-zinc-900 bg-zinc-900/20 px-6 py-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-bold">Kontent ro‘yxati</CardTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <Input 
                        placeholder="Qidirish..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 text-sm bg-zinc-950 border-zinc-900 w-full sm:w-40 focus:sm:w-64 transition-all"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchMovies} className="text-zinc-400 border-zinc-800 h-9">
                      Yangilash
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-900">
                  {filteredMovies.length > 0 ? (
                    filteredMovies.map((movie) => (
                      <div
                        key={movie.id}
                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0">
                            {movie.thumbnail ? (
                              <img
                                src={movie.thumbnail}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-4 h-4 text-zinc-700" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm line-clamp-1">{movie.title}</h4>
                            <p className="text-xs text-zinc-500 capitalize">
                              {movie.category} • {movie.year} • {movie.rating} ⭐
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedMovieForEpisodes(movie);
                              fetchEpisodes(movie.id);
                              setActiveTab('episodes');
                            }}
                            className="text-cyan-500 hover:text-cyan-400 text-xs gap-1"
                          >
                            <PlusCircle className="w-3 h-3" /> Qismlar
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditMovie(movie)} className="text-zinc-500 hover:text-cyan-500">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(movie.id)}
                            className="text-zinc-500 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-zinc-500">Hozircha hech narsa yo‘q</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900 h-fit sticky top-24">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">{editingCardId ? 'Tahrirlash' : 'Yangi yuklash'}</CardTitle>
                {editingCardId && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingCardId(null);
                    setFormData({
                      title: '', description: '', thumbnail: '', banner: '', videoUrl: '',
                      category: 'movie', year: new Date().getFullYear(), rating: 0, genres: ''
                    });
                  }} className="text-xs">Bekor qilish</Button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitContent} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Sarlavha</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masalan: Interstellar"
                      className="bg-zinc-900 border-zinc-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs">Kategoriya</Label>
                       <select
                         value={formData.category}
                         onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                         className="w-full bg-zinc-900 border-zinc-800 rounded-md h-10 px-3 text-sm"
                       >
                         <option value="movie">Kino</option>
                         <option value="series">Serial</option>
                         <option value="anime">Anime</option>
                         <option value="drama">Drama</option>
                         <option value="cartoons">Multfilm</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Access Tier</Label>
                      <select
                        value={formData.accessTier}
                        onChange={(e) => setFormData({ ...formData, accessTier: e.target.value })}
                        className="w-full bg-zinc-900 border-zinc-800 rounded-md h-10 px-3 text-sm"
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Chiqish yili</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="bg-zinc-900 border-zinc-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Reyting (0-10)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="bg-zinc-900 border-zinc-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Janrlar (vergul bilan)</Label>
                      <Input
                        value={formData.genres}
                        onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                        placeholder="Sci-Fi, Drama"
                        className="bg-zinc-900 border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Thumbnail URL</Label>
                      <Input
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="Poster rasmi"
                        className="bg-zinc-900 border-zinc-800"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Banner URL</Label>
                      <Input
                        value={formData.banner}
                        onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                        placeholder="Keng rasm"
                        className="bg-zinc-900 border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Video URL</Label>
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://..."
                      className="bg-zinc-900 border-zinc-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Tavsif</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-zinc-900 border-zinc-800 rounded-md p-3 text-sm min-h-[80px]"
                      placeholder="Film haqida qisqacha..."
                    />
                  </div>

                  <Button disabled={loading} className={`w-full font-bold ${editingCardId ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingCardId ? 'Yangilash' : 'Yuklash')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isSuper && (
          <TabsContent value="users" className="m-0 space-y-6 outline-none">
            <Card className="bg-zinc-950 border-zinc-900 overflow-hidden">
              <CardHeader className="border-b border-zinc-900 bg-zinc-900/20 px-6 py-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold">Foydalanuvchilar</CardTitle>
                    <CardDescription className="text-zinc-500">Tizimdagi barcha foydalanuvchilar nazorati</CardDescription>
                  </div>
                  <div className="relative w-full xl:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="Email orqali qidirish..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-zinc-950 border-zinc-900 pl-10 h-11 text-sm rounded-xl focus:ring-red-500/20"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-900/10">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Foydalanuvchi</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Email</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Rol</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800">
                                {u.photoURL ? (
                                  <img 
                                    src={u.photoURL} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-zinc-500">
                                    {u.displayName ? u.displayName[0] : (u.email ? u.email[0].toUpperCase() : '?')}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium capitalize">{u.displayName || 'Ismsiz'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-zinc-400">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                u.role === 'super'
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  : u.role === 'editor'
                                  ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {u.role === 'super'
                                ? 'Katta Admin'
                                : u.role === 'editor'
                                ? 'Kichik Admin'
                                : 'Foydalanuvchi'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.email !== 'mirzayevr471@gmail.com' && (
                                <>
                                  <Button
                                    onClick={() => handlePromote(u.id, u.role === 'editor' ? 'user' : 'editor')}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-[10px] gap-1 bg-zinc-900 border-zinc-800"
                                  >
                                    <UserCog className="w-3 h-3" />
                                    {u.role === 'editor' ? 'User qilish' : 'Editor qilish'}
                                  </Button>
                                  <Button
                                    onClick={() => handlePromote(u.id, u.role === 'super' ? 'user' : 'super')}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-[10px] gap-1 bg-zinc-900 border-zinc-800 text-red-400 hover:text-red-300"
                                  >
                                    <ShieldCheck className="w-3 h-3" />
                                    {u.role === 'super' ? 'User qilish' : 'Super qilish'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="settings" className="m-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Platforma Sozlamalari</CardTitle>
                <CardDescription>Video platformaning asosiy sozlamalari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Sayt nomi</Label>
                  <Input 
                    value={globalSettings.siteName} 
                    onChange={(e) => setGlobalSettings({...globalSettings, siteName: e.target.value})}
                    className="bg-zinc-900 border-zinc-800" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sayt tavsifi</Label>
                  <textarea 
                    className="w-full bg-zinc-900 border-zinc-800 rounded-md p-3 text-sm min-h-[80px]"
                    value={globalSettings.siteDescription}
                    onChange={(e) => setGlobalSettings({...globalSettings, siteDescription: e.target.value})}
                  />
                </div>
                <div 
                  className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 cursor-pointer"
                  onClick={() => setGlobalSettings({...globalSettings, maintenanceMode: !globalSettings.maintenanceMode})}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">Texnik ishlar rejimi</p>
                    <p className="text-xs text-zinc-500">Saytda ta‘mirlash ishlarini yoqish</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${globalSettings.maintenanceMode ? 'bg-red-600' : 'bg-zinc-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${globalSettings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
                <Button 
                  disabled={savingSettings}
                  onClick={handleUpdateSettings}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Saqlash'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Xavfsizlik</CardTitle>
                <CardDescription>Kirish va xavfsizlik nazorati</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Email xabarnomalari</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-4 h-4 border border-zinc-700 rounded bg-zinc-900 group-hover:border-red-500 transition-colors" />
                      <span className="text-sm text-zinc-400">Yangi foydalanuvchi qo‘shilganda</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-4 h-4 border border-red-500 rounded bg-red-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-zinc-200">Xatoliklar yuz berganda</span>
                    </label>
                  </div>
                </div>
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <h4 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4" /> Muhim ogohlantirish
                  </h4>
                  <p className="text-xs text-red-500/70 leading-relaxed">
                    Siz Super Admin huquqiga egasiz. Boshqa foydalanuvchilarga rol berganda ehtiyot bo‘ling.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => logout()}
                  className="w-full border-zinc-800 text-zinc-400 hover:border-red-500 hover:text-red-500 transition-all"
                >
                  Tizimdan chiqish
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isPlatformOwner && (
          <TabsContent value="plans" className="m-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plansList.map((plan) => (
                <Card key={plan.id} className="bg-zinc-950 border-zinc-900 hover:border-red-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                       <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                       {plan.isPopular && <span className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">OMMABOP</span>}
                    </div>
                    <CardDescription>Ushbu obuna narxini boshqaring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Oylik narx (Masalan: $9.99)</Label>
                      <div className="flex gap-2">
                        <Input 
                          defaultValue={plan.price}
                          onBlur={(e) => {
                            if (e.target.value !== plan.price) {
                              updatePlanPrice(plan.id, e.target.value);
                            }
                          }}
                          className="bg-zinc-900 border-zinc-800 font-mono text-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-xs uppercase text-zinc-500 font-bold">Imkoniyatlar</Label>
                      <div className="space-y-2">
                        {plan.features?.map((f: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-zinc-400">
                             <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                             {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {plansList.length === 0 && (
                <Card className="col-span-full bg-zinc-950 border-zinc-900 p-12 text-center">
                   <Zap className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                   <h3 className="text-white font-bold mb-2">Hozircha obunalar yo‘q</h3>
                   <p className="text-zinc-500 mb-6">Database-da obunalar ro‘yxati mavjud emas.</p>
                   <Button 
                    onClick={async () => {
                      const initialPlans = [
                        { name: 'Bepul', price: '$0', features: ["Standart sifat (480p)", "Reklamalar bilan", "1 ta qurilmada ko‘rish"], isPopular: false, order: 0 },
                        { name: 'Standart', price: '$9.99', features: ["Yuqori sifat (1080p)", "Reklamasiz", "2 ta qurilmada ko‘rish", "Yuklab olish imkoniyati"], isPopular: true, order: 1 },
                        { name: 'Premium', price: '$14.99', features: ["Ultra yuqori sifat (4K + HDR)", "Reklamasiz", "4 ta qurilmada ko‘rish", "Oflayn ko‘rish", "Eksklyuziv kontent"], isPopular: false, order: 2 }
                      ];
                      for (const p of initialPlans) {
                        await addDoc(collection(db, 'plans'), { ...p, createdAt: serverTimestamp() });
                      }
                      fetchPlans();
                    }}
                    className="bg-red-600 hover:bg-red-700"
                   >
                     Namuna obunalarni qo‘shish
                   </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
        </div>
      </Tabs>
    </div>
  );
};
