import { GoogleGenAI, Type } from "@google/genai";

// Strictly use process.env.API_KEY as per coding guidelines
// The user must provide the key via the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (mood: string, genre: string): Promise<{songName: string, artist: string, reason: string}[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a playlist of 5 popular songs for a mood: "${mood}" and genre: "${genre}". 
    Return the result in JSON format with songName, artist, and a short 5-word reason why it fits.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              songName: { type: Type.STRING },
              artist: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["songName", "artist", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return [];
  }
};

export const getHomeRecommendations = async (): Promise<{songName: string, artist: string}[]> => {
  try {
    const model = 'gemini-2.5-flash';
    // Ask for current hits or evergreen classics
    const prompt = `List 6 trending or classic hit songs that are perfect for a general music app homepage. 
    Return JSON with songName and artist.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        songName: { type: Type.STRING },
                        artist: { type: Type.STRING }
                    },
                    required: ["songName", "artist"]
                }
            }
        }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
      console.error("Gemini AI Home Rec Error:", error);
      return [];
  }
}

export const chatWithDJ = async (message: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model,
            contents: message,
            config: {
                systemInstruction: "You are Sonic, a cool, energetic radio DJ for a music streaming app. Keep answers short, punchy, and music-focused.",
            }
        });
        return response.text || "Sorry, I'm having trouble tuning in right now!";
    } catch (e) {
        console.error(e);
        return "Static on the line... try again?";
    }
}

export const getLyrics = async (title: string, artist: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `Provide the lyrics for the song "${title}" by "${artist}". 
        Format them nicely with stanzas separated by newlines. 
        If the song is instrumental or lyrics are unavailable, say "Lyrics not available for this track."
        Do not include any intro text like "Here are the lyrics", just the lyrics themselves.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text || "Lyrics not available.";
    } catch (e) {
        console.error("Lyrics fetch error:", e);
        return "Could not load lyrics.";
    }
}