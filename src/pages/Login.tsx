import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Logo } from '../components/layout/Logo';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';

const loginSchema = z.object({
  email: z.string().email('Email manzili noto‘g‘ri'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak'),
  name: z.string().optional(),
});

type FormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(data.email, data.password);
      } else {
        if (!data.name) {
          setError('Iltimos, ismingizni kiriting');
          setLoading(false);
          return;
        }
        await signUpWithEmail(data.email, data.password, data.name);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setError('Foydalanuvchi topilmadi');
      else if (err.code === 'auth/wrong-password') setError('Parol noto‘g‘ri');
      else if (err.code === 'auth/email-already-in-use') setError('Bu email allaqachon ro‘yxatdan o‘tgan');
      else setError('Xatolik yuz berdi. Qaytadan urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setError('Parolni tiklashda xatolik yuz berdi');
    } finally {
      setResetLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617] p-4">
      {/* Orqa fon bezaklari */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-dark border-white/5 bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Logo iconSize="w-16 h-16" textSize="text-3xl" subtextSize="text-xs" />
              </motion.div>
            </div>
            <CardDescription className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">
              {isLogin ? 'Xush kelibsiz! Tizimga kiring' : 'KinoHub.uz olamiga qo‘shiling'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs font-semibold ml-1">Ismingiz</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        {...register('name')}
                        type="text"
                        placeholder="Ismingizni kiriting"
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white placeholder:text-slate-600 focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-semibold ml-1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="example@mail.com"
                      className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white placeholder:text-slate-600 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-[10px] ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-slate-300 text-xs font-semibold">Parol</Label>
                    {isLogin && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button type="button" className="text-cyan-500 text-[10px] font-bold hover:underline">
                            Parolni unutdingizmi?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#020617] border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle>Parolni tiklash</DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Emailingizni kiriting va biz sizga parolni tiklash havolasini yuboramiz.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Email manzili</Label>
                              <Input 
                                placeholder="example@mail.com" 
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                            {resetSent && (
                              <p className="text-green-400 text-xs font-medium text-center">
                                Parolni tiklash havolasi yuborildi! Emailingizni tekshiring.
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleResetPassword}
                              disabled={resetLoading || resetSent}
                              className="bg-cyan-500 hover:bg-cyan-600 text-white"
                            >
                              {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yuborish'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      {...register('password')}
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white placeholder:text-slate-600 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  {errors.password && <p className="text-red-400 text-[10px] ml-1">{errors.password.message}</p>}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-xs text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                <Button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isLogin ? 'Kirish' : 'Ro‘yxatdan o‘tish'
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#020617] px-4 text-slate-500">Yoki</span>
              </div>
            </div>

            <Button 
              type="button"
              onClick={onGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-black hover:bg-cyan-50 h-12 rounded-xl text-sm font-bold transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-3"
            >
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" className="w-5 h-5" />
              Google orqali kirish
            </Button>

            <div className="text-center">
              <p className="text-slate-500 text-xs font-medium">
                {isLogin ? 'Hisobingiz yo‘qmi?' : 'Hisobingiz bormi?'} {' '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-cyan-500 font-bold hover:underline"
                >
                  {isLogin ? 'Ro‘yxatdan o‘tish' : 'Kirish'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
