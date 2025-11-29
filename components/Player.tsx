import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { 
    Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, 
    Volume2, Sparkles, Heart, Volume1, VolumeX, Mic2, 
    Palette, Zap, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Visualizer from './Visualizer';
import { getLyrics } from '../services/geminiService';
import { ThemeColor } from '../types';

const Player: React.FC = () => {
  const { 
    currentSong, isPlaying, togglePlay, nextSong, prevSong, 
    progress, isFullScreen, setFullScreen, duration, seekTo,
    volume, setVolume, bassBoost, toggleBassBoost,
    theme, setTheme, toggleFavorite, favorites
  } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string>('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // Fetch lyrics when song changes if lyrics mode is on
  useEffect(() => {
    if (showLyrics && currentSong) {
        fetchLyrics();
    } else {
        setLyrics('');
    }
  }, [currentSong, showLyrics]);

  const fetchLyrics = async () => {
      if (!currentSong) return;
      setLoadingLyrics(true);
      const text = await getLyrics(currentSong.title, currentSong.artist);
      setLyrics(text);
      setLoadingLyrics(false);
  };

  if (!currentSong) return null;

  const isLiked = favorites.some(s => s.id === currentSong.id);

  // Helper for Theme Colors
  const getThemeColor = (type: 'text' | 'bg' | 'glow') => {
      const colors = {
          violet: { text: 'text-violet-500', bg: 'bg-violet-600', glow: 'shadow-[0_0_30px_rgba(124,58,237,0.4)]' },
          cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]' },
          rose: { text: 'text-rose-400', bg: 'bg-rose-500', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]' },
          amber: { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]' },
          emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]' },
      };
      return colors[theme][type];
  };

  const themeHexCodes = {
      violet: '#8b5cf6',
      cyan: '#06b6d4',
      rose: '#f43f5e',
      amber: '#f59e0b',
      emerald: '#10b981',
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
     seekTo(parseFloat(e.target.value));
  };

  // Gesture Handlers
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Swipe Down to Dismiss
      if (info.offset.y > 100 || info.velocity.y > 500) {
          setFullScreen(false);
      }
  };

  const handleArtDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Swipe Right -> Prev Song
      if (info.offset.x > 50) {
          prevSong();
      } 
      // Swipe Left -> Next Song
      else if (info.offset.x < -50) {
          nextSong();
      }
  };

  return (
    <>
      {/* Mini Player */}
      {!isFullScreen && (
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 h-20 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center px-4 md:px-8 justify-between"
        >
          {/* Info */}
          <div className="flex items-center gap-4 w-1/3 cursor-pointer" onClick={() => setFullScreen(true)}>
            <img 
                src={currentSong.thumbnail} 
                alt="thumb" 
                className={`w-12 h-12 rounded-lg object-cover shadow-lg ${isPlaying ? 'animate-pulse-slow' : ''}`} 
            />
            <div className="overflow-hidden">
              <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
              <p className="text-zinc-400 text-xs truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center w-1/3">
             <div className="flex items-center gap-4 md:gap-6">
                <button onClick={prevSong} className="text-zinc-400 hover:text-white transition"><SkipBack size={20} /></button>
                <button 
                    onClick={togglePlay} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg ${isPlaying ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                >
                    {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="white" className="ml-0.5" />}
                </button>
                <button onClick={nextSong} className="text-zinc-400 hover:text-white transition"><SkipForward size={20} /></button>
             </div>
             {/* Mini Progress */}
             <div className="w-full max-w-md mt-2 flex items-center gap-2 text-[10px] text-zinc-500 hidden md:flex">
                <span>{formatTime(progress * duration)}</span>
                <input 
                    type="range" 
                    min={0} max={0.9999} step="any" value={progress} onChange={handleSeek}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" 
                />
                <span>{formatTime(duration)}</span>
             </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 w-1/3 relative">
            <button onClick={() => toggleFavorite(currentSong)} className={`${isLiked ? getThemeColor('text') : 'text-zinc-400'} hover:scale-110 transition`}>
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </button>
            
            {/* Volume Control */}
            <div className="relative group flex items-center">
                <button className="text-zinc-400 group-hover:text-white p-2 transition-colors">
                    {volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
                </button>
                {/* Volume Slider Popup */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-10 h-32 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl z-50 origin-bottom scale-95 group-hover:scale-100">
                    <input 
                        type="range" min={0} max={1} step={0.01} value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer -rotate-90"
                        style={{ accentColor: themeHexCodes[theme] }}
                    />
                </div>
            </div>

            <button onClick={() => setFullScreen(true)} className="text-zinc-400 hover:text-white">
                <Maximize2 size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Full Screen Player */}
      <AnimatePresence>
        {isFullScreen && (
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.2 }} // Allow pulling down
                onDragEnd={handleDragEnd}
                className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col overflow-hidden touch-none"
            >
                {/* Background Blur */}
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[100px]" />
                    <div className="absolute inset-0 bg-zinc-950/60"></div>
                </div>

                {/* Header / Grab Handle */}
                <div className="relative z-10 flex items-center justify-between p-6 md:p-8">
                    <button onClick={() => setFullScreen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 backdrop-blur-md">
                        <ChevronDown size={24} className="text-white" />
                    </button>
                    
                    {/* Visual Grab Handle for Mobile */}
                    <div className="absolute left-1/2 top-4 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full md:hidden"></div>
                    
                    <div className="flex gap-2 bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/5">
                        <button 
                            onClick={() => setShowLyrics(false)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${!showLyrics ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Visuals
                        </button>
                        <button 
                            onClick={() => setShowLyrics(true)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${showLyrics ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <Mic2 size={12} /> Lyrics
                        </button>
                    </div>

                    <div className="relative group">
                         <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 backdrop-blur-md">
                            <Palette size={24} className={getThemeColor('text')} />
                         </button>
                         {/* Theme Popup */}
                         <div className="absolute right-0 top-full mt-2 p-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl flex gap-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                             {(['violet', 'cyan', 'rose', 'amber', 'emerald'] as ThemeColor[]).map(c => (
                                 <button 
                                    key={c}
                                    onClick={() => setTheme(c)}
                                    className={`w-6 h-6 rounded-full border-2 ${theme === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'} transition`}
                                    style={{ backgroundColor: c === 'violet' ? '#8b5cf6' : c === 'cyan' ? '#06b6d4' : c === 'rose' ? '#f43f5e' : c === 'amber' ? '#f59e0b' : '#10b981' }}
                                 />
                             ))}
                         </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8 md:gap-16 w-full max-w-7xl mx-auto">
                    
                    {/* Left Side: Art / Visualizer / Lyrics */}
                    {/* Added Horizontal Drag Gesture for Seeking/Skipping */}
                    <div className="w-full max-w-md lg:max-w-lg aspect-square relative group">
                         <AnimatePresence mode="wait">
                            {showLyrics ? (
                                <motion.div 
                                    key="lyrics"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full h-full bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 overflow-y-auto no-scrollbar mask-image-gradient"
                                    onPointerDown={(e) => e.stopPropagation()} // Allow scrolling lyrics without closing player
                                >
                                    {loadingLyrics ? (
                                        <div className="h-full flex items-center justify-center text-zinc-400 animate-pulse">
                                            Generating Lyrics...
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-6">
                                            <h3 className="text-2xl font-bold text-white mb-8">{currentSong.title}</h3>
                                            <div className="text-lg md:text-xl leading-relaxed text-zinc-300 font-medium whitespace-pre-wrap">
                                                {lyrics}
                                            </div>
                                            <p className="text-sm text-zinc-500 mt-8">Lyrics powered by Gemini AI</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="art"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={handleArtDragEnd}
                                    whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                                    className="relative w-full h-full cursor-grab active:cursor-grabbing touch-none"
                                >
                                    <img 
                                        src={currentSong.thumbnail} 
                                        alt="Full Art" 
                                        className={`w-full h-full object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative transition-transform duration-100 ${bassBoost && isPlaying ? 'animate-bump' : ''}`} 
                                        draggable={false}
                                    />
                                    {/* Visualizer Overlay */}
                                    <div className="absolute bottom-4 left-4 right-4 h-24 opacity-90 z-20 pointer-events-none">
                                        <Visualizer isPlaying={isPlaying} color={themeHexCodes[theme]} />
                                    </div>
                                    {/* Bass Glow */}
                                    {bassBoost && (
                                         <div className={`absolute inset-0 z-0 rounded-3xl blur-3xl opacity-50 ${getThemeColor('bg')} animate-pulse pointer-events-none`}></div>
                                    )}
                                    {/* Gesture Hint */}
                                    <div className="absolute inset-0 z-30 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="p-2 bg-black/20 backdrop-blur-sm rounded-full"><SkipBack size={24} className="text-white/50" /></div>
                                        <div className="p-2 bg-black/20 backdrop-blur-sm rounded-full"><SkipForward size={24} className="text-white/50" /></div>
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>

                    {/* Right Side: Controls */}
                    <div className="w-full max-w-md flex flex-col justify-center" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="mb-8 text-center md:text-left">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight truncate pr-4">{currentSong.title}</h2>
                                <button onClick={() => toggleFavorite(currentSong)} className="p-2 rounded-full hover:bg-white/10 transition">
                                     <Heart size={28} fill={isLiked ? "currentColor" : "none"} className={isLiked ? getThemeColor('text') : "text-white"} />
                                </button>
                            </div>
                            <p className={`text-xl font-medium ${getThemeColor('text')}`}>{currentSong.artist}</p>
                        </div>

                        {/* Scrubber */}
                        <div className="mb-8 group/scrubber">
                            <input 
                                type="range" min={0} max={0.9999} step="any" value={progress} onChange={handleSeek}
                                className={`w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:scale-y-110 transition-all`} 
                            />
                            <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                                <span>{formatTime(progress * duration)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Buttons */}
                        <div className="flex items-center justify-between px-2 mb-10">
                             <button className="text-zinc-500 hover:text-white transition hover:scale-110"><SkipBack size={36} onClick={prevSong} /></button>
                             <button 
                                onClick={togglePlay} 
                                className={`w-20 h-20 rounded-full ${getThemeColor('bg')} flex items-center justify-center ${getThemeColor('glow')} hover:scale-105 transition-transform`}
                             >
                                 {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                             </button>
                             <button className="text-zinc-500 hover:text-white transition hover:scale-110"><SkipForward size={36} onClick={nextSong} /></button>
                        </div>

                        {/* Extra Features */}
                        <div className="flex items-center justify-center gap-6">
                            {/* Bass Boost Toggle */}
                            <button 
                                onClick={toggleBassBoost}
                                className={`flex flex-col items-center gap-2 transition duration-300 ${bassBoost ? 'text-white' : 'text-zinc-600'}`}
                            >
                                <div className={`p-3 rounded-2xl ${bassBoost ? 'bg-white/20' : 'bg-transparent border border-zinc-800'}`}>
                                    <Zap size={20} fill={bassBoost ? "currentColor" : "none"} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Bass Boost</span>
                            </button>

                             {/* Volume */}
                             <div className="relative group flex flex-col items-center gap-2">
                                <div className="p-3 rounded-2xl bg-transparent border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-600 transition cursor-pointer">
                                     {volume === 0 ? <VolumeX size={20} /> : <Volume1 size={20} />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400">Vol {Math.round(volume * 100)}%</span>
                                
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-12 h-40 bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl translate-y-2 group-hover:translate-y-0 z-50">
                                    <input 
                                        type="range" min={0} max={1} step={0.01} value={volume} 
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="w-28 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer -rotate-90"
                                        style={{ accentColor: themeHexCodes[theme] }}
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Player;