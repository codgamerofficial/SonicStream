export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  channelTitle?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

export enum PlayerState {
  PLAYING,
  PAUSED,
  BUFFERING,
  IDLE
}

export type ThemeColor = 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald';

export interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  favorites: Song[];
  playlists: Playlist[];
  isPlaying: boolean;
  isFullScreen: boolean;
  volume: number;
  progress: number;
  duration: number;
  bassBoost: boolean;
  theme: ThemeColor;
  
  playSong: (song: Song) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  addToQueue: (song: Song) => void;
  toggleFavorite: (song: Song) => void;
  
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;

  setFullScreen: (isFull: boolean) => void;
  setVolume: (val: number) => void;
  seekTo: (val: number) => void;
  toggleBassBoost: () => void;
  setTheme: (color: ThemeColor) => void;
}

export interface User {
  name: string;
  avatar: string;
}