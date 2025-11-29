import React from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { theme } = usePlayer();

  const getGradient = () => {
      const grads: Record<string, string> = {
          violet: 'from-violet-600 to-indigo-600',
          cyan: 'from-cyan-500 to-blue-500',
          rose: 'from-rose-500 to-pink-600',
          amber: 'from-amber-500 to-orange-600',
          emerald: 'from-emerald-500 to-teal-600',
      };
      return grads[theme] || grads['violet'];
  };

  const getGlowColor = () => {
       const colors: Record<string, string> = {
          violet: 'bg-violet-600/20',
          cyan: 'bg-cyan-500/20',
          rose: 'bg-rose-500/20',
          amber: 'bg-amber-500/20',
          emerald: 'bg-emerald-500/20',
      };
      return colors[theme] || colors['violet'];
  }
  
  const getTextGradient = () => {
      const grads: Record<string, string> = {
          violet: 'from-violet-400 to-fuchsia-400',
          cyan: 'from-cyan-400 to-blue-400',
          rose: 'from-rose-400 to-pink-400',
          amber: 'from-amber-400 to-orange-400',
          emerald: 'from-emerald-400 to-teal-400',
      };
      return grads[theme] || grads['violet'];
  }

  const getProgressColor = () => {
       const colors: Record<string, string> = {
          violet: 'bg-violet-500',
          cyan: 'bg-cyan-500',
          rose: 'bg-rose-500',
          amber: 'bg-amber-500',
          emerald: 'bg-emerald-500',
      };
      return colors[theme] || colors['violet'];
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3.5, duration: 1, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0">
         <motion.div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${getGlowColor()} rounded-full blur-[120px]`}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="relative w-24 h-24 mb-8"
        >
            <div className={`absolute inset-0 bg-gradient-to-tr ${getGradient()} rounded-3xl rotate-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]`}></div>
            <div className="absolute inset-0 bg-black/20 rounded-3xl backdrop-blur-sm flex items-center justify-center border border-white/10">
                 <Music2 size={48} className="text-white drop-shadow-md" />
            </div>
            
            {/* Orbits */}
            <motion.div 
                className="absolute inset-0 -m-2 border border-white/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="absolute inset-0 -m-6 border border-white/5 rounded-full border-dashed"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
        </motion.div>

        {/* Text Reveal */}
        <div className="text-center">
            <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                Sonic<span className={`text-transparent bg-clip-text bg-gradient-to-r ${getTextGradient()}`}>Stream</span>
            </motion.h1>
            <motion.p 
                className="text-zinc-500 text-sm uppercase tracking-[0.3em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
            >
                Redefining Sound
            </motion.p>
        </div>
      </div>
      
      {/* Progress Line */}
      <div className="absolute bottom-20 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
             className={`h-full ${getProgressColor()}`}
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ duration: 3, ease: "easeInOut" }}
          />
      </div>
    </motion.div>
  );
};

export default SplashScreen;