import React, { useState } from 'react';
import { Search, Play, Heart, Plus } from 'lucide-react';
import { searchMusic } from '../services/youtubeService';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { motion } from 'framer-motion';

const GENRES = [
  { name: 'Pop', color: 'from-pink-500 to-rose-500' },
  { name: 'Hip-Hop', color: 'from-orange-500 to-amber-500' },
  { name: 'Rock', color: 'from-red-600 to-red-800' },
  { name: 'Electronic', color: 'from-cyan-500 to-blue-500' },
  { name: 'Chill', color: 'from-emerald-500 to-teal-500' },
  { name: 'R&B', color: 'from-violet-500 to-purple-500' },
  { name: 'Workout', color: 'from-yellow-400 to-orange-500' },
  { name: 'Focus', color: 'from-indigo-400 to-blue-600' },
];

const Explore: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { playSong, toggleFavorite, favorites, addToQueue } = usePlayer();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    const songs = await searchMusic(query);
    setResults(songs);
    setLoading(false);
  };

  const handleGenreClick = (genre: string) => {
      setQuery(`${genre} music`);
      // Trigger search manually since state update is async
      setLoading(true);
      setSearched(true);
      searchMusic(`${genre} music`).then(songs => {
          setResults(songs);
          setLoading(false);
      });
  };

  return (
    <div className="p-6 md:p-10 pb-32 md:pl-72 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-6">Explore</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, artists, or genres..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition shadow-xl"
          />
        </form>
      </div>

      {/* Content */}
      {!searched && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-xl font-bold text-white mb-6">Browse by Genre</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GENRES.map((g) => (
                  <motion.div 
                    key={g.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenreClick(g.name)}
                    className={`h-32 rounded-2xl bg-gradient-to-br ${g.color} relative overflow-hidden cursor-pointer group shadow-lg`}
                  >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                      <span className="absolute bottom-4 left-4 text-xl font-bold text-white tracking-wide">{g.name}</span>
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition"></div>
                  </motion.div>
              ))}
           </div>
        </div>
      )}

      {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
             {[...Array(9)].map((_, i) => (
                 <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse border border-white/5"></div>
             ))}
          </div>
      )}

      {searched && !loading && (
          <div className="space-y-4 mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Results</h2>
              {results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                      {results.map((song, i) => {
                          const isLiked = favorites.some(f => f.id === song.id);
                          return (
                            <motion.div 
                                key={song.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition"
                            >
                                <div className="flex items-center gap-4 flex-1" onClick={() => playSong(song)}>
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer">
                                        <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <Play size={16} fill="white" className="text-white" />
                                        </div>
                                    </div>
                                    <div className="cursor-pointer">
                                        <h3 className="font-bold text-white truncate max-w-[200px] md:max-w-md">{song.title}</h3>
                                        <p className="text-sm text-zinc-400">{song.artist}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => toggleFavorite(song)}
                                        className={`p-2 rounded-full hover:bg-white/10 ${isLiked ? 'text-violet-500' : 'text-zinc-400'}`}
                                    >
                                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                    <button 
                                        onClick={() => addToQueue(song)}
                                        title="Add to Queue"
                                        className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </motion.div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="text-center py-20 text-zinc-500">
                      No results found. Try a different term.
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Explore;