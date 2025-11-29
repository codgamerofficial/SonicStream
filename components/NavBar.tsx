import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Library, Sparkles, Search } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { usePlayer } from '../context/PlayerContext';

const Navbar: React.FC = () => {
  const { theme } = usePlayer();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, you might pass the query via URL params
      // Since Explore has local state for query, we can just navigate there
      // A better way for this app structure is to use Context or URL params, 
      // but to keep it simple we navigate to explore. 
      // *Note: Explore page won't auto-search unless we modify it to read URL params.
      // For this simplified version, let's just go to explore.*
      navigate('/explore');
    }
  };

  const getIcon = (name: string) => {
    switch(name) {
      case 'Home': return <Home size={24} />;
      case 'Explore': return <Compass size={24} />;
      case 'Library': return <Library size={24} />;
      case 'AI DJ': return <Sparkles size={24} />;
      default: return <Home size={24} />;
    }
  };

  const getThemeClass = (isActive: boolean) => {
      const colors: Record<string, string> = {
          violet: 'text-violet-500',
          cyan: 'text-cyan-400',
          rose: 'text-rose-400',
          amber: 'text-amber-400',
          emerald: 'text-emerald-400',
      };
      return isActive ? `${colors[theme]} -translate-y-2` : 'text-zinc-500';
  };

  const getDotClass = (isActive: boolean) => {
      const colors: Record<string, string> = {
          violet: 'bg-violet-500',
          cyan: 'bg-cyan-400',
          rose: 'bg-rose-500',
          amber: 'bg-amber-500',
          emerald: 'bg-emerald-500',
      };
      return isActive ? `opacity-100 ${colors[theme]}` : 'opacity-0';
  }

  const getDesktopActiveClass = (isActive: boolean) => {
      const activeColors: Record<string, string> = {
          violet: 'bg-violet-600 shadow-violet-900/30',
          cyan: 'bg-cyan-600 shadow-cyan-900/30',
          rose: 'bg-rose-600 shadow-rose-900/30',
          amber: 'bg-amber-600 shadow-amber-900/30',
          emerald: 'bg-emerald-600 shadow-emerald-900/30',
      };
      return isActive 
        ? `${activeColors[theme]} text-white shadow-xl` 
        : 'text-zinc-400 hover:text-white hover:bg-white/5';
  };
  
  const getLogoGradient = () => {
       const grads: Record<string, string> = {
          violet: 'from-violet-600 to-indigo-600',
          cyan: 'from-cyan-500 to-blue-500',
          rose: 'from-rose-500 to-pink-600',
          amber: 'from-amber-500 to-orange-600',
          emerald: 'from-emerald-500 to-teal-600',
      };
      return grads[theme];
  }

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-start pt-4 z-40">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${getThemeClass(isActive)}`
            }
          >
            {({ isActive }) => (
              <>
                {getIcon(item.name)}
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0'}`}>{item.name}</span>
                {/* Active Dot */}
                <span className={`w-1 h-1 rounded-full mt-1 transition-opacity duration-300 ${getDotClass(isActive)}`} />
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-zinc-950 border-r border-white/5 p-6 z-40">
        <div className="flex items-center gap-3 mb-8 px-2">
            <div className={`w-10 h-10 bg-gradient-to-br ${getLogoGradient()} rounded-xl flex items-center justify-center shadow-lg shadow-black/20`}>
                <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">SonicStream</h1>
        </div>
        
        {/* Quick Search */}
        <div className="relative mb-8 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-white transition" size={16} />
            <input 
                type="text" 
                placeholder="Quick Search..."
                onFocus={() => navigate('/explore')}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition shadow-inner"
            />
        </div>
        
        <nav className="space-y-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${getDesktopActiveClass(isActive)}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`group-hover:scale-110 transition-transform duration-300 ${isActive ? 'text-white' : ''}`}>
                      {getIcon(item.name)}
                  </span>
                  <span className="font-medium tracking-wide text-sm">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
             <h3 className="text-sm font-bold text-white mb-1 relative z-10">Go Premium</h3>
             <p className="text-xs text-zinc-300 mb-4 relative z-10 leading-relaxed">High-quality audio, no ads & exclusive content.</p>
             <button className="w-full py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors relative z-10 shadow-lg">
                 Upgrade Now
             </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;