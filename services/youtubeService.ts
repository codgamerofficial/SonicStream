import { YOUTUBE_API_KEY, MOCK_TRENDING, MOCK_CHILL } from '../constants';
import { Song } from '../types';
import { searchPublicSongs } from './dbService';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to provide relevant mock data if API fails
const getMockFallback = (query: string): Song[] => {
    const q = query.toLowerCase();
    if (q.includes('chill') || q.includes('lofi')) return MOCK_CHILL;
    return MOCK_TRENDING;
};

export const searchMusic = async (query: string): Promise<Song[]> => {
  if (!query) return [];
  
  try {
    // 1. Parallel Search: DB + YouTube
    const [dbResults, youtubeResponse] = await Promise.allSettled([
        searchPublicSongs(query),
        fetch(`${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=15&key=${YOUTUBE_API_KEY}`)
    ]);

    let finalResults: Song[] = [];

    // Process DB Results
    if (dbResults.status === 'fulfilled') {
        finalResults = [...dbResults.value];
    }

    // Process YouTube Results
    if (youtubeResponse.status === 'fulfilled' && youtubeResponse.value.ok) {
        const data = await youtubeResponse.value.json();
        if (data.items) {
            const ytSongs = data.items.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                channelTitle: item.snippet.channelTitle,
            }));
            
            // Deduplicate based on ID (prefer DB result if duplicate exists, or just append)
            const existingIds = new Set(finalResults.map(s => s.id));
            const uniqueYtSongs = ytSongs.filter((s: Song) => !existingIds.has(s.id));
            
            finalResults = [...finalResults, ...uniqueYtSongs];
        }
    } else {
         console.warn(`YouTube API Error. Using Mock Data Fallback.`);
         const mock = getMockFallback(query);
         finalResults = [...finalResults, ...mock];
    }

    return finalResults;

  } catch (error) {
    console.error("Failed to fetch music (Network Error), using fallback:", error);
    return getMockFallback(query);
  }
};

export const getPopularMusic = async (): Promise<Song[]> => {
    const result = await searchMusic("Global Top 50 Music");
    return result.length > 0 ? result : MOCK_TRENDING;
};