import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, CreditCard, LogOut, Edit2, Play, Heart, Clock, Loader2, AlertCircle, Check, Shield, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export const Profile = () => {
  const { user, logout, role } = useAuth();
  const [userData, setUserData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      setUserData(doc.data());
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        subscription: 'free',
        updatedAt: new Date().toISOString()
      });
      setCancelModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdateLanguage = async (val: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        language: val,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePlan = async (plan: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        subscription: plan,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="pt-32 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-red-600" /></div>;

  return (
    <div className="pt-24 px-4 container mx-auto pb-12 bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 pb-12 border-b border-white/5">
          <div className="relative group">
            <Avatar className="w-40 h-40 border-4 border-white/5 shadow-2xl glass-dark">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-4xl font-bold text-white">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-2 right-2 p-2 bg-white text-black rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-50 shadow-xl">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <h1 className="text-4xl font-display font-bold text-white">{user?.displayName || 'Foydalanuvchi'}</h1>
              <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Crown className="w-3 h-3" />
                {userData?.subscription || 'Free'} A'zo
              </div>
              {role === 'editor' && (
                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Editor
                </div>
              )}
            </div>
            <p className="text-slate-500 font-medium">{user?.email}</p>
          </div>

          <div className="flex gap-3">
            {(role === 'super' || role === 'editor' || user?.email === 'mirzayevr471@gmail.com') && (
              <Button 
                onClick={() => (window.location.href = '/admin')} 
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 shadow-lg shadow-red-600/20"
              >
                <Shield className="w-4 h-4" /> Admin Panel
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/5 text-white hover:bg-white/10 rounded-xl gap-2">
                  <Settings className="w-4 h-4" /> Sozlamalar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#020617] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Profil sozlamalari</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tilni tanlang (Auto-translate uchun)</Label>
                    <Select value={userData?.language || 'uz'} onValueChange={handleUpdateLanguage}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Tilni tanlang" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#020617] border-white/10 text-white">
                        <SelectItem value="uz">O'zbekcha</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl gap-2">
              <LogOut className="w-4 h-4" /> Chiqish
            </Button>
          </div>
        </div>

        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl inline-flex w-auto mb-8">
            <TabsTrigger value="watchlist" className="rounded-xl px-8 data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 flex gap-2">
              <Heart className="w-4 h-4" /> Tanlanganlar
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:text-black flex gap-2">
              <Clock className="w-4 h-4" /> Tarix
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:text-black flex gap-2">
              <CreditCard className="w-4 h-4" /> To'lovlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist">
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[2/3] bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center group cursor-pointer hover:border-cyan-500/50 transition-all hover:scale-[1.02]">
                    <Play className="w-12 h-12 text-slate-800 group-hover:text-cyan-500 transition-colors" />
                  </div>
                ))}
             </div>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-white/5 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white">Joriy Reja</CardTitle>
                    <CardDescription>Sizning obuna tafsilotlaringiz</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="flex justify-between items-center">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-bold text-white capitalize">{userData?.subscription || 'Free'} Reja</h3>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            {userData?.subscription === 'free' ? 'Cheklangan imkoniyatlar' : 'Keyingi to‘lov: 12-Avgust, 2026'}
                          </p>
                       </div>
                       <div className="text-3xl font-bold text-gradient">
                          {userData?.subscription === 'premium' ? '$14.99' : userData?.subscription === 'basic' ? '$9.99' : '$0'}
                          <span className="text-sm font-medium text-slate-500">/oy</span>
                       </div>
                    </div>
                    
                    {userData?.subscription !== 'free' && (
                      <div className="space-y-4">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/50 w-3/4" />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold tracking-widest">
                           <span className="text-cyan-400">18 KUN QOLDI</span>
                           <span className="text-slate-500">22 / 30 KUN</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      {userData?.subscription !== 'free' ? (
                        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 h-14 border-red-500/20 text-red-400 hover:bg-red-500/5 rounded-2xl font-bold">
                              Obunani bekor qilish
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#020617] border-white/10 text-white">
                            <DialogHeader>
                              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                              </div>
                              <DialogTitle className="text-center">Obunani bekor qilasizmi?</DialogTitle>
                              <DialogDescription className="text-center text-slate-400">
                                Premium imkoniyatlardan foydalanishni to'xtatasiz. Barcha yuklab olingan videolar va 4K sifatiga kirish yopiladi.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                              <Button variant="ghost" onClick={() => setCancelModalOpen(false)} className="flex-1 text-slate-400 hover:text-white rounded-xl h-12">
                                Qolish
                              </Button>
                              <Button 
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold"
                              >
                                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ha, bekor qilish'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button className="flex-1 h-14 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/20">
                          Premiumga o'tish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Selector */}
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-white">Rejani o'zgartirish</h3>
                   <div className="space-y-4">
                      {['free', 'basic', 'premium'].map((plan) => (
                        <div 
                          key={plan}
                          onClick={() => handleUpdatePlan(plan)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            userData?.subscription === plan 
                              ? 'bg-cyan-500/10 border-cyan-500/50' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                               <p className="text-white font-bold capitalize">{plan}</p>
                               <p className="text-slate-500 text-xs">
                                 {plan === 'premium' ? '$14.99/oy' : plan === 'basic' ? '$9.99/oy' : '$0/oy'}
                               </p>
                            </div>
                            {userData?.subscription === plan && (
                              <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
