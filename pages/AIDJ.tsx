import React, { useState } from 'react';
import { getAIRecommendations, chatWithDJ } from '../services/geminiService';
import { searchMusic } from '../services/youtubeService';
import { usePlayer } from '../context/PlayerContext';
import { Sparkles, MessageSquare, Music, Send, Play } from 'lucide-react';

const AIDJ: React.FC = () => {
  const { playSong } = usePlayer();
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'chat'>('generate');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood || !genre) return;
    
    setLoading(true);
    setRecommendations([]);
    
    // 1. Get List from Gemini
    const recs = await getAIRecommendations(mood, genre);
    
    // 2. Fetch real YouTube Metadata for each
    const enrichedRecs = await Promise.all(recs.map(async (rec) => {
        const searchRes = await searchMusic(`${rec.songName} ${rec.artist} audio`);
        return {
            ...rec,
            youtubeData: searchRes[0] || null
        };
    }));

    setRecommendations(enrichedRecs.filter(r => r.youtubeData));
    setLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      setLoading(true);
      const res = await chatWithDJ(chatInput);
      setChatResponse(res);
      setLoading(false);
      setChatInput('');
  };

  return (
    <div className="p-6 md:p-10 pb-24 md:pl-72 max-w-5xl mx-auto min-h-screen">
       <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-900/20">
                <Sparkles size={28} className="text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">Sonic AI DJ</h1>
                <p className="text-zinc-400">Your personal intelligent music curator</p>
            </div>
       </div>

       {/* Tabs */}
       <div className="flex gap-4 mb-8 border-b border-zinc-800">
           <button 
                onClick={() => setActiveTab('generate')}
                className={`pb-4 px-4 font-medium transition ${activeTab === 'generate' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-zinc-500 hover:text-white'}`}
           >
               Playlist Generator
           </button>
           <button 
                onClick={() => setActiveTab('chat')}
                className={`pb-4 px-4 font-medium transition ${activeTab === 'chat' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-zinc-500 hover:text-white'}`}
           >
               Chat with DJ
           </button>
       </div>

       {activeTab === 'generate' && (
           <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 h-fit">
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">How are you feeling?</label>
                            <input 
                                type="text" 
                                value={mood} 
                                onChange={(e) => setMood(e.target.value)}
                                placeholder="e.g., Energetic, Melancholy, Focused..." 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Preferred Genre?</label>
                            <input 
                                type="text" 
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                placeholder="e.g., House, 90s Rock, Jazz..." 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 transition"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-violet-900/20 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Sparkles size={18} />}
                            Generate Vibe
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {recommendations.length > 0 ? (
                        recommendations.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => playSong(item.youtubeData)}
                                className="flex items-center gap-4 p-3 bg-zinc-900/30 hover:bg-zinc-800 rounded-xl cursor-pointer border border-white/5 transition group"
                            >
                                <img src={item.youtubeData.thumbnail} alt="th" className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-white group-hover:text-violet-400 transition">{item.songName}</h4>
                                    <p className="text-xs text-zinc-400">{item.artist}</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 italic">"{item.reason}"</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-violet-600 transition">
                                    <Play size={14} fill="currentColor" className="text-white ml-0.5" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-10">
                            <Music size={48} className="mb-4 opacity-20" />
                            <p>Enter your mood to get started</p>
                        </div>
                    )}
                </div>
           </div>
       )}

       {activeTab === 'chat' && (
           <div className="max-w-2xl mx-auto">
               <div className="bg-zinc-900 rounded-2xl p-6 min-h-[300px] border border-white/5 flex flex-col justify-between">
                    <div className="space-y-4 mb-4">
                        <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                                 <Sparkles size={14} className="text-white" />
                             </div>
                             <div className="bg-zinc-800 p-3 rounded-r-xl rounded-bl-xl text-sm text-zinc-200">
                                 Hey! I'm Sonic, your AI DJ. Need a fun fact about a band or a quick music joke?
                             </div>
                        </div>
                        {chatResponse && (
                             <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                                    <Sparkles size={14} className="text-white" />
                                </div>
                                <div className="bg-zinc-800 p-3 rounded-r-xl rounded-bl-xl text-sm text-zinc-200 animate-in fade-in slide-in-from-bottom-2">
                                    {chatResponse}
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleChat} className="relative">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-violet-500"
                            placeholder="Ask me anything about music..."
                        />
                        <button type="submit" disabled={loading} className="absolute right-2 top-2 p-1.5 bg-violet-600 rounded-lg text-white hover:bg-violet-500 transition disabled:opacity-50">
                            <Send size={16} />
                        </button>
                    </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default AIDJ;