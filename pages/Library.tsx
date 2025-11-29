import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Music, Play, Trash2, Plus, ListPlus, X, UploadCloud, Globe, FileAudio, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song, Playlist } from '../types';
import { addSongToPublicDb, uploadFileToStorage } from '../services/dbService';

const SongRow: React.FC<{ song: Song, playlistId?: string }> = ({ song, playlistId }) => {
    const { playSong, addToQueue, removeFromPlaylist, toggleFavorite } = usePlayer();
    
    return (
      <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition">
          <div className="flex items-center gap-4 flex-1 overflow-hidden" onClick={() => playSong(song)}>
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-zinc-800 flex items-center justify-center">
                  <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop';
                  }} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play size={16} fill="white" className="text-white" />
                  </div>
              </div>
              <div className="cursor-pointer truncate">
                  <h3 className="font-bold text-white truncate">{song.title}</h3>
                  <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
              </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={() => addToQueue(song)}
                  title="Add to Queue"
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                  <ListPlus size={18} />
              </button>

              {playlistId ? (
                   <button 
                      onClick={() => removeFromPlaylist(playlistId, song.id)}
                      className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-red-400"
                      title="Remove from playlist"
                   >
                      <Trash2 size={18} />
                   </button>
              ) : (
                  <button 
                      onClick={() => toggleFavorite(song)}
                      className="p-2 rounded-full hover:bg-white/10 text-violet-500"
                  >
                      <Heart size={18} fill="currentColor" />
                  </button>
              )}
          </div>
      </div>
    );
};

const Library: React.FC = () => {
  const { 
    favorites, playlists, 
    createPlaylist, deletePlaylist
  } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'liked' | 'playlists'>('liked');
  
  // Create Playlist State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  // Public Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'youtube' | 'file'>('youtube');
  
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleCreatePlaylist = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPlaylistName.trim()) {
          createPlaylist(newPlaylistName);
          setNewPlaylistName('');
          setShowCreateModal(false);
      }
  };

  const handlePublicUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsUploading(true);
      try {
          let songId = '';
          let thumbnail = '';

          if (uploadType === 'youtube') {
              // Extract Video ID
              try {
                const urlObj = new URL(uploadUrl);
                if (urlObj.hostname.includes('youtube.com')) {
                    songId = urlObj.searchParams.get('v') || '';
                } else if (urlObj.hostname.includes('youtu.be')) {
                    songId = urlObj.pathname.slice(1);
                }
              } catch(e) {
                  // fallback if invalid URL string
              }

              if (!songId) {
                  alert("Invalid YouTube URL. Please use a full link (e.g., https://youtube.com/watch?v=...)");
                  setIsUploading(false);
                  return;
              }
              thumbnail = `https://img.youtube.com/vi/${songId}/maxresdefault.jpg`;
          } else {
              // Handle File Upload
              if (!uploadFile) {
                  alert("Please select a file.");
                  setIsUploading(false);
                  return;
              }
              const publicUrl = await uploadFileToStorage(uploadFile);
              songId = publicUrl; // The ID is the full URL for files
              thumbnail = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop';
          }

          const newSong: Song = {
              id: songId,
              title: uploadTitle,
              artist: uploadArtist,
              thumbnail: thumbnail,
              channelTitle: uploadArtist
          };

          await addSongToPublicDb(newSong);
          alert("Song added successfully! (It may appear in 'Community Uploads' on Home)");
          setShowUploadModal(false);
          setUploadUrl('');
          setUploadFile(null);
          setUploadTitle('');
          setUploadArtist('');
      } catch (err: any) {
          console.error(err);
          alert(`Failed to upload: ${err.message || "Unknown error occurred"}`);
      }
      setIsUploading(false);
  };

  return (
    <div className="p-6 md:p-10 pb-32 md:pl-72 max-w-7xl mx-auto min-h-screen">
       <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Library</h1>
                <p className="text-zinc-400 text-sm">Your collection & Admin</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition border border-white/5"
                >
                    <UploadCloud size={16} /> Upload Music
                </button>
                {activeTab === 'playlists' && !selectedPlaylist && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                    >
                        <Plus size={16} /> New Playlist
                    </button>
                )}
            </div>
       </div>

       {/* Tabs */}
       {!selectedPlaylist && (
           <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl w-fit mb-8 border border-white/5">
                <button 
                    onClick={() => setActiveTab('liked')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'liked' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Liked Songs
                </button>
                <button 
                    onClick={() => setActiveTab('playlists')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'playlists' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Playlists
                </button>
           </div>
       )}

       {/* Liked Songs View */}
       {activeTab === 'liked' && (
           <div className="space-y-2">
               {favorites.length > 0 ? (
                   favorites.map(song => <SongRow key={song.id} song={song} />)
               ) : (
                   <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
                       <Heart size={48} className="mx-auto text-zinc-700 mb-4" />
                       <h3 className="text-lg font-bold text-white">No liked songs yet</h3>
                       <p className="text-zinc-500 text-sm mt-2">Tap the heart icon on any song to add it here.</p>
                   </div>
               )}
           </div>
       )}

       {/* Playlists View */}
       {activeTab === 'playlists' && (
           <>
              {selectedPlaylist ? (
                  // Single Playlist View
                  <div className="animate-in fade-in slide-in-from-right-4">
                      <button 
                        onClick={() => setSelectedPlaylist(null)}
                        className="mb-6 text-sm text-zinc-400 hover:text-white transition flex items-center gap-1"
                      >
                          ← Back to Playlists
                      </button>
                      <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-6">
                               <div className="w-32 h-32 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                   <Music size={48} className="text-white/50" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedPlaylist.name}</h2>
                                    <p className="text-zinc-400 text-sm">{selectedPlaylist.songs.length} songs</p>
                                </div>
                           </div>
                           <button 
                                onClick={() => {
                                    deletePlaylist(selectedPlaylist.id);
                                    setSelectedPlaylist(null);
                                }}
                                className="p-3 rounded-full hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition"
                                title="Delete Playlist"
                           >
                               <Trash2 size={20} />
                           </button>
                      </div>

                      <div className="space-y-2">
                           {playlists.find(p => p.id === selectedPlaylist.id)?.songs.map(song => (
                               <SongRow key={song.id} song={song} playlistId={selectedPlaylist.id} />
                           ))}
                           {selectedPlaylist.songs.length === 0 && (
                               <div className="text-center py-10 text-zinc-500 text-sm">
                                   This playlist is empty. Add songs from Explore.
                               </div>
                           )}
                      </div>
                  </div>
              ) : (
                  // Grid of Playlists
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {playlists.map(playlist => (
                          <motion.div 
                             key={playlist.id}
                             whileHover={{ y: -5 }}
                             onClick={() => setSelectedPlaylist(playlist)}
                             className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-zinc-800 transition group"
                          >
                              <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                  {playlist.songs.length > 0 ? (
                                      <img src={playlist.songs[0].thumbnail} alt="cover" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                                  ) : (
                                      <Music size={32} className="text-zinc-700" />
                                  )}
                              </div>
                              <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                              <p className="text-xs text-zinc-500 mt-1">{playlist.songs.length} songs</p>
                          </motion.div>
                      ))}
                  </div>
              )}
           </>
       )}

       {/* Create Playlist Modal */}
       <AnimatePresence>
           {showCreateModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                   <motion.div 
                       initial={{ scale: 0.9, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0.9, opacity: 0 }}
                       className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
                   >
                       <div className="flex justify-between items-center mb-6">
                           <h3 className="text-xl font-bold text-white">Create Playlist</h3>
                           <button onClick={() => setShowCreateModal(false)}><X size={20} className="text-zinc-500 hover:text-white" /></button>
                       </div>
                       <form onSubmit={handleCreatePlaylist}>
                           <input 
                               type="text"
                               autoFocus
                               value={newPlaylistName}
                               onChange={(e) => setNewPlaylistName(e.target.value)}
                               placeholder="My Awesome Mix"
                               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 mb-6"
                           />
                           <button 
                               type="submit"
                               className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition"
                           >
                               Create
                           </button>
                       </form>
                   </motion.div>
               </div>
           )}
       </AnimatePresence>

       {/* Upload Public Song Modal */}
       <AnimatePresence>
           {showUploadModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                   <motion.div 
                       initial={{ scale: 0.9, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0.9, opacity: 0 }}
                       className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
                   >
                       <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-2">
                               <Globe size={20} className="text-violet-400" />
                               <h3 className="text-xl font-bold text-white">Public Database</h3>
                           </div>
                           <button onClick={() => setShowUploadModal(false)}><X size={20} className="text-zinc-500 hover:text-white" /></button>
                       </div>
                       
                       {/* Upload Type Tabs */}
                       <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg mb-6 border border-zinc-800">
                           <button 
                            onClick={() => setUploadType('youtube')}
                            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${uploadType === 'youtube' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                           >
                               <Link size={14} /> YouTube Link
                           </button>
                           <button 
                            onClick={() => setUploadType('file')}
                            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${uploadType === 'file' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                           >
                               <FileAudio size={14} /> Upload File
                           </button>
                       </div>

                       <form onSubmit={handlePublicUpload} className="space-y-4">
                           <div>
                               <label className="text-xs text-zinc-400 font-bold ml-1">Title</label>
                               <input 
                                   type="text"
                                   required
                                   value={uploadTitle}
                                   onChange={(e) => setUploadTitle(e.target.value)}
                                   placeholder="Song Title"
                                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500"
                               />
                           </div>
                           <div>
                               <label className="text-xs text-zinc-400 font-bold ml-1">Artist</label>
                               <input 
                                   type="text"
                                   required
                                   value={uploadArtist}
                                   onChange={(e) => setUploadArtist(e.target.value)}
                                   placeholder="Artist Name"
                                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500"
                               />
                           </div>

                           {uploadType === 'youtube' ? (
                               <div>
                                    <label className="text-xs text-zinc-400 font-bold ml-1">YouTube Link</label>
                                    <input 
                                        type="url"
                                        required
                                        value={uploadUrl}
                                        onChange={(e) => setUploadUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500"
                                    />
                               </div>
                           ) : (
                               <div>
                                    <label className="text-xs text-zinc-400 font-bold ml-1">Audio File (MP3, WAV)</label>
                                    <input 
                                        type="file"
                                        accept="audio/*"
                                        required
                                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500"
                                    />
                               </div>
                           )}

                           <button 
                               type="submit"
                               disabled={isUploading}
                               className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-xl transition mt-2 disabled:opacity-50"
                           >
                               {isUploading ? 'Uploading...' : 'Add to Public DB'}
                           </button>
                       </form>
                   </motion.div>
               </div>
           )}
       </AnimatePresence>
    </div>
  );
};

export default Library;