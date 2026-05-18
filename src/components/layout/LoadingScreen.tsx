import React from 'react';
import { motion } from 'motion/react';
import { Clapperboard } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }}
        className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/40"
      >
        <Clapperboard className="w-12 h-12 text-white" />
      </motion.div>
      
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-display font-bold tracking-tighter text-white">CINEVERSE</h2>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-red-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
