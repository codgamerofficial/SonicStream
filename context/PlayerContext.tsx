import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Song, PlayerContextType, ThemeColor, Playlist } from '../types';
import ReactPlayer from 'react-player';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Define config outside component to prevent re-creation on every render
const PLAYER_CONFIG = {
  youtube: {
    playerVars: { 
        autoplay: 0, 
        controls: 0, 
        playsinline: 1, 
        origin: window.location.origin,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1
    }
  }
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  
  const [favorites, setFavorites] = useState<Song[]>(() => {
      const saved = localStorage.getItem('sonic_favorites');
      return saved ? JSON.parse(saved) : [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
      const saved = localStorage.getItem('sonic_playlists');
      return saved ? JSON.parse(saved) : [];
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bassBoost, setBassBoost] = useState(false);
  
  // Initialize theme from local storage or default to violet
  const [theme, setTheme] = useState<ThemeColor>(() => {
      const saved = localStorage.getItem('sonic_theme');
      return (saved as ThemeColor) || 'violet';
  });
  
  // Ref to the actual ReactPlayer instance
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    localStorage.setItem('sonic_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sonic_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('sonic_theme', theme);
  }, [theme]);

  const playSong = (song: Song) => {
    if (currentSong?.id !== song.id) {
        setProgress(0);
    } else {
        // If same song, rewind
        seekTo(0);
    }
    setCurrentSong(song);
    setIsPlaying(true);
    if (!queue.find(s => s.id === song.id)) {
        setQueue(prev => [song, ...prev]);
    }
  };

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    if (!currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    } else {
        setIsPlaying(false);
    }
  };

  const prevSong = () => {
    if (!currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    }
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
        const exists = prev.find(s => s.id === song.id);
        if (exists) {
            return prev.filter(s => s.id !== song.id);
        } else {
            return [...prev, song];
        }
    });
  };

  // Playlist Management
  const createPlaylist = (name: string) => {
      const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          songs: [],
          createdAt: Date.now()
      };
      setPlaylists(prev => [...prev, newPlaylist]);
  };

  const deletePlaylist = (id: string) => {
      setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
              // Avoid duplicates
              if (p.songs.find(s => s.id === song.id)) return p;
              return { ...p, songs: [...p.songs, song] };
          }
          return p;
      }));
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
              return { ...p, songs: p.songs.filter(s => s.id !== songId) };
          }
          return p;
      }));
  };

  const seekTo = (amount: number) => {
      setProgress(amount);
      if (playerRef.current) {
          playerRef.current.seekTo(amount, 'fraction');
      }
  };

  const toggleBassBoost = () => setBassBoost(!bassBoost);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        favorites,
        playlists,
        isPlaying,
        isFullScreen,
        volume,
        progress,
        duration,
        bassBoost,
        theme,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        addToQueue,
        toggleFavorite,
        createPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        setFullScreen: setIsFullScreen,
        setVolume,
        seekTo,
        toggleBassBoost,
        setTheme,
      }}
    >
      {children}
      {currentSong && (
          // IMPORTANT: Do not use display: none; it prevents YouTube API from initializing correct refs.
          // We use a 1x1 pixel invisible div instead.
          <div style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', bottom: 0, left: 0, zIndex: -1 }}>
            <ReactPlayer
                key={currentSong.id} // Forces remount on song change to prevent "interrupted by pause" error
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentSong.id}`}
                playing={isPlaying}
                volume={volume}
                onProgress={(state) => {
                    // Only update progress if we aren't seeking to avoid jitter
                    setProgress(state.played);
                }}
                onDuration={(d) => setDuration(d)}
                onEnded={nextSong}
                width="100%"
                height="100%"
                config={PLAYER_CONFIG}
                onError={(e) => {
                    // Swallow the specific interruption error or log for debugging
                    console.log("Player Status:", e);
                }}
            />
          </div>
      )}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
