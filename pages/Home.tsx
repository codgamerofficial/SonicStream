import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getPopularMusic, searchMusic } from '../services/youtubeService';
import { getHomeRecommendations } from '../services/geminiService';
import { getPublicSongs } from '../services/dbService';
import { Song } from '../types';
import { Play, TrendingUp, Radio, Headphones, Star, ArrowRight, Zap, Smile, CloudRain, Flame, Moon, Coffee, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
    { name: 'Happy', icon: Smile, color: 'bg-yellow-500' },
    { name: 'Sad', icon: CloudRain, color: 'bg-blue-500' },
    { name: 'Energetic', icon: Flame, color: 'bg-red-500' },
    { name: 'Chill', icon: Coffee, color: 'bg-emerald-500' },
    { name: 'Romantic', icon: Heart, color: 'bg-pink-500' },
    { name: 'Sleep', icon: Moon, color: 'bg-indigo-500' },
];

const Home: React.FC = () => {
  const { playSong } = usePlayer();
  const [trending, setTrending] = useState<Song[]>([]);
  const [chill, setChill] = useState<Song[]>([]);
  const [aiRecs, setAiRecs] = useState<Song[]>([]);
  const [customDbSongs, setCustomDbSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Mood State
  const [selectedMood, setSelectedMood] = useState<string>('Happy');
  const [moodSongs, setMoodSongs] = useState<Song[]>([]);
  const [moodLoading, setMoodLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [popSongs, chillSongs, aiSuggestions, dbSongs] = await Promise.all([
                getPopularMusic(),
                searchMusic("lofi hip hop chill beats"),
                getHomeRecommendations(),
                getPublicSongs()
            ]);
            
            setTrending(popSongs || []);
            setChill(chillSongs || []);
            setCustomDbSongs(dbSongs || []);

            if (aiSuggestions && aiSuggestions.length > 0) {
                const hydratedRecs = await Promise.all(
                    aiSuggestions.map(async (s) => {
                        const res = await searchMusic(`${s.songName} ${s.artist} audio`);
                        return res[0];
                    })
                );
                setAiRecs(hydratedRecs.filter(Boolean));
            }

        } catch (e) {
            console.error("Error fetching home data", e);
        }
        setLoading(false);
    };
    fetchData();
  }, []);

  // Fetch Mood Songs when selection changes
  useEffect(() => {
      const fetchMood = async () => {
          setMoodLoading(true);
          const res = await searchMusic(`${selectedMood} music playlist`);
          setMoodSongs(res);
          setMoodLoading(false);
      };
      fetchMood();
  }, [selectedMood]);

  const FeaturedAd = () => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full rounded-[2.5rem] overflow-hidden mb-16 bg-[#0c0c0e] border border-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group"
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* Content Side */}
        <div className="w-full lg:w-1/2 p-8 md:p-14 flex flex-col justify-center z-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-transparent pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-violet-500/20 backdrop-blur-md">
                        New Release
                    </span>
                    <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-[0.95] tracking-tight">
                    Sonic<span className="text-violet-500">Pro</span>
                    <br />
                    <span className="text-3xl md:text-4xl font-light text-zinc-400">Quantum Series</span>
                </h2>
                
                <p className="text-zinc-400 mb-8 text-base leading-relaxed max-w-md">
                    Experience sound as the artist intended. Our new drivers deliver crystal clear highs and deep, resonant bass.
                </p>

                <div className="flex items-center gap-4">
                    <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2 group/btn">
                        Buy Now $299 <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>

        {/* Image Side */}
        <div className="w-full lg:w-1/2 min-h-[350px] lg:min-h-[500px] relative overflow-hidden bg-zinc-900">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/40 via-zinc-900/20 to-zinc-900"></div>
             <motion.img 
                src="https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=2670&auto=format&fit=crop" 
                alt="Headphones" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-lighten opacity-90"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.7 }}
             />
        </div>
      </div>
    </motion.div>
  );

  const Section = ({ title, icon: Icon, songs, color = "text-violet-500", horizontal = true }: { title: string, icon: any, songs: Song[], color?: string, horizontal?: boolean }) => (
    <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 bg-zinc-900 rounded-xl ${color} shadow-lg border border-white/5`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{title}</h3>
            </div>
            <button className="text-xs text-zinc-500 hover:text-white transition uppercase font-bold tracking-wider flex items-center gap-1">
                View All <ArrowRight size={12} />
            </button>
        </div>
        
        <div className={`flex ${horizontal ? 'overflow-x-auto pb-8 snap-x' : 'flex-wrap'} gap-6 no-scrollbar px-2`}>
            {loading ? (
                Array(5).fill(0).map((_, i) => (
                    <div key={i} className="min-w-[200px] h-[260px] bg-zinc-900/50 rounded-3xl animate-pulse border border-white/5" />
                ))
            ) : (
                songs.map((song) => (
                    <motion.div 
                        key={song.id}
                        whileHover={{ y: -8 }}
                        className="min-w-[180px] w-[180px] md:min-w-[200px] md:w-[200px] snap-start cursor-pointer group"
                        onClick={() => playSong(song)}
                    >
                        <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 shadow-xl bg-zinc-800">
                            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-0 group-hover:scale-100 transition duration-300 ease-out">
                                    <Play size={24} fill="white" className="ml-1 text-white" />
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold truncate text-white text-base mb-1 px-1">{song.title}</h4>
                        <p className="text-xs text-zinc-400 truncate font-medium px-1 group-hover:text-violet-400 transition">{song.artist}</p>
                    </motion.div>
                ))
            )}
        </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 pb-32 md:pl-72 max-w-[1800px] mx-auto overflow-hidden">
      <FeaturedAd />
      
      {/* Mood Discovery Section */}
      <div className="mb-16">
          <h3 className="text-2xl font-bold tracking-tight text-white mb-6">Discover Every Mood</h3>
          
          {/* Mood Pills */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-8">
              {MOODS.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMood(m.name)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 transition-all ${selectedMood === m.name ? 'bg-white text-black scale-105' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                  >
                      <div className={`w-2 h-2 rounded-full ${m.color}`}></div>
                      <span className="font-bold text-sm">{m.name}</span>
                  </button>
              ))}
          </div>

          {/* Mood Songs */}
          <AnimatePresence mode="wait">
              <motion.div 
                key={selectedMood}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[250px]"
              >
                  {moodLoading ? (
                       <div className="flex gap-6 overflow-hidden">
                           {[1,2,3,4].map(i => <div key={i} className="min-w-[200px] h-[200px] bg-zinc-900 rounded-3xl animate-pulse" />)}
                       </div>
                  ) : (
                      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
                          {moodSongs.map((song) => (
                            <motion.div 
                                key={song.id}
                                whileHover={{ scale: 1.05 }}
                                className="min-w-[200px] w-[200px] cursor-pointer"
                                onClick={() => playSong(song)}
                            >
                                <img src={song.thumbnail} className="w-full aspect-square object-cover rounded-2xl mb-3 shadow-lg" alt="" />
                                <h4 className="font-bold text-white text-sm truncate">{song.title}</h4>
                                <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                            </motion.div>
                          ))}
                      </div>
                  )}
              </motion.div>
          </AnimatePresence>
      </div>

      {customDbSongs.length > 0 && (
          <Section title="Community Uploads" icon={Radio} songs={customDbSongs} color="text-pink-500" />
      )}
      
      {aiRecs.length > 0 && (
          <Section title="Recommended For You" icon={Zap} songs={aiRecs} color="text-amber-400" />
      )}
      
      <Section title="Trending Now" icon={TrendingUp} songs={trending} />
      <Section title="Chill & Focus" icon={Headphones} songs={chill} color="text-emerald-400" />
      
      <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center">
         <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 opacity-50 grayscale hover:grayscale-0 transition duration-500">
             <Radio size={24} className="text-white" />
         </div>
         <p className="text-zinc-600 text-sm">© 2025 SonicStream AI</p>
      </div>
    </div>
  );
};

export default Home;