import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar';
import Player from './components/Player';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import AIDJ from './pages/AIDJ';
import { PlayerProvider } from './context/PlayerContext';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <PlayerProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!showSplash && (
        <Router>
          <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-500/30">
            <Navbar />
            
            <main className="pb-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/library" element={<Library />} />
                <Route path="/ai-dj" element={<AIDJ />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Player />
          </div>
        </Router>
      )}
    </PlayerProvider>
  );
};

export default App;