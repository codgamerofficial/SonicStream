
// Note: In a production app, never expose keys in client-side code like this unless they are restricted.
// We are using the keys provided by the user request.

export const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY || "AIzaSyD1AR1VLA8C8X2CC4_Zl5AQ0XKtJZObQ74";

// Fallback for demo purposes if process.env.API_KEY is missing, though the AI Service strictly uses process.env
export const GEMINI_API_KEY_FALLBACK = "AIzaSyDJ86i5ZI0u3jDXUpUjnnSCD04Y1C5aYi4";

export const APP_NAME = "SonicStream AI";

export const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: 'Home' },
  { name: 'Explore', path: '/explore', icon: 'Compass' },
  { name: 'Library', path: '/library', icon: 'Library' },
  { name: 'AI DJ', path: '/ai-dj', icon: 'Sparkles' },
];

export const MOCK_TRENDING = [
  {
    id: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi ft. Daddy Yankee",
    thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    channelTitle: "LuisFonsiVEVO"
  },
  {
    id: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg",
    channelTitle: "Ed Sheeran"
  },
  {
    id: "OPf0YbXqDm0",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    thumbnail: "https://img.youtube.com/vi/OPf0YbXqDm0/maxresdefault.jpg",
    channelTitle: "MarkRonsonVEVO"
  },
  {
    id: "09R8_2nJtjg",
    title: "Sugar",
    artist: "Maroon 5",
    thumbnail: "https://img.youtube.com/vi/09R8_2nJtjg/maxresdefault.jpg",
    channelTitle: "Maroon5VEVO"
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
    channelTitle: "Queen Official"
  }
];

export const MOCK_CHILL = [
  {
    id: "jfKfPfyJRdk",
    title: "lofi hip hop radio - beats to relax/study to",
    artist: "Lofi Girl",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
    channelTitle: "Lofi Girl"
  },
  {
    id: "5qap5aO4i9A",
    title: "lofi hip hop radio - beats to sleep/chill to",
    artist: "Lofi Girl",
    thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg",
    channelTitle: "Lofi Girl"
  },
  {
    id: "DWcJFNfaw9c",
    title: "Synthwave Radio - Beats to Chill/Game to",
    artist: "Lofi Girl",
    thumbnail: "https://img.youtube.com/vi/DWcJFNfaw9c/maxresdefault.jpg",
    channelTitle: "Lofi Girl"
  },
  {
    id: "MCkTebktHVc",
    title: "Lofi Hip Hop Mix",
    artist: "ChilledCow",
    thumbnail: "https://img.youtube.com/vi/MCkTebktHVc/maxresdefault.jpg",
    channelTitle: "ChilledCow"
  }
];
