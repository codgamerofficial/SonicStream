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
        id: item.youtube_id, // This stores either the YT ID or the File URL
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

export const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'songs' bucket
        const { error: uploadError } = await supabase.storage
            .from('songs')
            .upload(filePath, file);

        if (uploadError) {
            // Check specifically for Bucket Not Found
            if (uploadError.message.includes("Bucket not found")) {
                 console.warn("Supabase Storage 'songs' bucket is missing.");
                 console.warn("Please run: insert into storage.buckets (id, name, public) values ('songs', 'songs', true);");
            }
            throw uploadError;
        }

        // Get Public URL
        const { data } = supabase.storage
            .from('songs')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error: any) {
        console.error("Storage Upload Error, using local fallback:", error.message);
        // Fallback: Create a local Blob URL so the user can still play the song in this session
        // Note: This URL is temporary and valid only for the current browser session
        return URL.createObjectURL(file);
    }
};

export const addSongToPublicDb = async (song: Song) => {
  // If the ID is a blob URL, we MUST skip Supabase DB insert because it's local-only
  if (song.id.startsWith('blob:')) {
      console.warn("Song is local-only (Blob URL). Saving to Local Storage instead of Public DB.");
      try {
        const current = getLocalSongs();
        if (!current.find(s => s.id === song.id)) {
            const updated = [song, ...current];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        return true;
      } catch (localErr) {
        throw new Error("Failed to save local song.");
      }
  }

  // 1. Try Supabase Insert
  try {
      const { error } = await supabase
      .from('public_songs')
      .insert([
        {
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          youtube_id: song.id, // Stores URL or ID
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