import React from 'react';
import { Play } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: string;
  textSize?: string;
  subtextSize?: string;
}

export const Logo = ({ 
  className = "", 
  iconSize = "w-10 h-10", 
  textSize = "text-xl", 
  subtextSize = "text-[10px]" 
}: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${iconSize} flex items-center justify-center group shrink-0`}>
        {/* Neon Glow Effect */}
        <div className="absolute inset-0 bg-orange-600 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Main Icon Container */}
        <div className="relative w-full h-full bg-zinc-950 border-2 border-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
           {/* Inner scanline/gradient effect */}
           <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 via-transparent to-blue-500/20 pointer-events-none" />
           
           {/* Play Icon */}
           <Play className="w-[50%] h-[50%] text-orange-500 fill-current drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] relative left-[1px]" />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <div className={`${textSize} font-display font-black tracking-tight uppercase flex items-baseline whitespace-nowrap`}>
          <span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">KINO</span>
          <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] ml-1">HUB</span>
        </div>
        <span className={`${subtextSize} text-zinc-400 font-bold self-end tracking-[0.25em] relative top-[-1px]`}>.UZ</span>
      </div>
    </div>
  );
};
