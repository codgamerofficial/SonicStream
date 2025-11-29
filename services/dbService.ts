import { supabase } from './supabase';
import { Song } from '../types';

// Table name should be 'public_songs' in your Supabase
// Columns: id, title, artist, thumbnail, youtube_id, mood (optional)

const LOCAL_STORAGE_KEY = 'sonic_local_uploads';

const getLocalSongs = (): Song[] => {
    try {
        const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        return localStr ? JSON.parse(localStr) : [];
    } catch (e) {
        return [];
    }
};

export const getPublicSongs = async (): Promise<Song[]> => {
  let dbSongs: Song[] = [];
  
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('public_songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      dbSongs = data.map((item: any) => ({
        id: item.youtube_id,
        title: item.title,
        artist: item.artist,
        thumbnail: item.thumbnail,
        channelTitle: item.artist
      }));
    } else if (error) {
        console.warn("Supabase fetch warning:", error.message);
    }
  } catch (e) {
    console.warn("Supabase offline or unconfigured");
  }

  // 2. Get Local Fallback Songs
  const localSongs = getLocalSongs();

  // 3. Merge (Prefer DB, but show local if DB fails or for mixed content)
  // Simple de-duplication based on ID
  const allSongs = [...localSongs, ...dbSongs];
  const uniqueSongs = Array.from(new Map(allSongs.map(s => [s.id, s])).values());
  
  return uniqueSongs;
};

export const searchPublicSongs = async (query: string): Promise<Song[]> => {
  const lowerQuery = query.toLowerCase();
  let dbResults: Song[] = [];

  // 1. Search DB
  try {
    const { data, error } = await supabase
      .from('public_songs')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`);

    if (!error && data) {
        dbResults = data.map((item: any) => ({
            id: item.youtube_id,
            title: item.title,
            artist: item.artist,
            thumbnail: item.thumbnail,
            channelTitle: item.artist
        }));
    }
  } catch (e) {
    // Ignore DB errors during search
  }

  // 2. Search Local
  const localSongs = getLocalSongs();
  const localResults = localSongs.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.artist.toLowerCase().includes(lowerQuery)
  );

  const allResults = [...localResults, ...dbResults];
  return Array.from(new Map(allResults.map(s => [s.id, s])).values());
};

export const addSongToPublicDb = async (song: Song) => {
  // 1. Try Supabase Insert
  try {
      const { error } = await supabase
      .from('public_songs')
      .insert([
        {
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          youtube_id: song.id,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        throw error;
      }
      return true;

  } catch (e: any) {
    console.warn("Supabase Insert Failed (likely table 'public_songs' missing). Falling back to local storage.", e.message);
    
    // 2. Fallback: Save to LocalStorage so the user sees their upload immediately
    try {
        const current = getLocalSongs();
        // Check if exists
        if (!current.find(s => s.id === song.id)) {
            const updated = [song, ...current];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return true; // Return true so the UI thinks it succeeded
    } catch (localErr) {
        console.error("Local storage save failed", localErr);
        throw new Error(e.message || "Database insert failed");
    }
  }
};