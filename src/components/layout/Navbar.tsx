import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Bell, User, Menu, X, Globe, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { Logo } from './Logo';
import { useNotifications } from '../../context/NotificationContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'uz', name: 'O\'zbek' },
  { code: 'ru', name: 'Русский' }
];

interface NavbarProps {
  siteName?: string;
}

export const Navbar = ({ siteName = 'KinoHub.uz' }: NavbarProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { unreadCount, clearUnread } = useNotifications();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Split siteName into two parts for the logo effect
  const firstPart = siteName.substring(0, Math.ceil(siteName.length / 2));
  const secondPart = siteName.substring(Math.ceil(siteName.length / 2));

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.movies'), path: '/movies' },
    { name: t('nav.series'), path: '/series' },
    { name: t('nav.anime'), path: '/anime' },
    { name: t('nav.drama'), path: '/drama' },
    { name: t('nav.cartoons'), path: '/cartoons' },
    { name: t('nav.all'), path: '/all' },
  ];

  const isAdmin = role === 'super' || role === 'editor';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/">
            <Logo />
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-cyan-500 ${
                  location.pathname === link.path ? 'text-cyan-500 underline underline-offset-8 decoration-2' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/subscription" className="text-sm font-medium text-cyan-500 hover:text-cyan-400">
               Premium
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-red-500 hover:text-red-400 border border-red-500/20 px-2 py-1 rounded-lg bg-red-500/5">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('nav.search')} 
              onClick={() => navigate('/search')}
              className="bg-transparent border-none outline-none text-xs w-32 placeholder-slate-400 cursor-pointer"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950/90 backdrop-blur-xl border-white/10 text-white">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            className="text-gray-300 hover:text-white transition-colors relative"
            onClick={clearUnread}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {user ? (
            <Link to="/profile">
              <div className="h-10 w-10 rounded-full border border-cyan-500/30 overflow-hidden bg-slate-800 flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-500" />
              </div>
            </Link>
          ) : (
            <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 rounded-xl px-6 font-bold shadow-lg shadow-cyan-500/20">
              Kirish
            </Button>
          )}

          <button 
            className="lg:hidden text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-t border-zinc-900 py-6 px-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-300 hover:text-cyan-500"
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-red-500"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
