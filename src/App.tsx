/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AudioLibraryView } from './components/AudioLibraryView';
import { AudioPlayer } from './components/AudioPlayer';
import { CommunityView } from './components/CommunityView';
import { VipPointsHubView } from './components/VipPointsHubView';
import { VipTopupView } from './components/VipTopupView';
import { BottomTaskbar } from './components/BottomTaskbar';
import { AuthModal } from './components/AuthModal';
import { INITIAL_TRACKS } from './data';
import { Track, ActiveTab } from './types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';

function MainApp() {
  const { user, addAudioPoints, incrementListenTime, isVip } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [allTracks, setAllTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = allTracks[currentTrackIndex] || allTracks[0];

  // Periodic listen rewards: Every 60 seconds while playing, award +5 Audio Points and increment listen time!
  useEffect(() => {
    if (!isPlaying || !user) return;

    const interval = setInterval(() => {
      // Award listen points & increment listen minutes
      addAudioPoints(5, 'Thưởng nghe nhạc trực tuyến', 'listen');
      incrementListenTime(1);
    }, 60000);

    return () => clearInterval(interval);
  }, [isPlaying, user]);

  // Subscribe to community uploaded tracks from Firestore
  useEffect(() => {
    const tracksQuery = query(
      collection(db, 'customTracks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      tracksQuery,
      (snapshot) => {
        const customList: Track[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: `custom-${docSnap.id}`,
            title: data.title || 'Untitled Track',
            artist: data.artist || 'Unknown Artist',
            genre: data.genre || 'Khác',
            url: data.url,
            coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
            durationSec: data.durationSec || 210,
            plays: data.plays || 1,
            isVipOnly: data.isVipOnly || false,
            bitrate: data.isVipOnly ? '320kbps Hi-Fi' : '128kbps',
            addedBy: data.addedBy,
            addedByName: data.addedByName,
            createdAt: data.createdAt,
          };
        });

        // Merge INITIAL_TRACKS with Firestore custom tracks without duplicates
        setAllTracks([...INITIAL_TRACKS, ...customList]);
      },
      (err) => {
        console.error('Error fetching custom tracks:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Audio Playback effect
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayTrack = (track: Track) => {
    const idx = allTracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    } else {
      // Dynamic track
      setAllTracks((prev) => [track, ...prev]);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlayNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % allTracks.length);
    setIsPlaying(true);
  };

  const handlePlayPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + allTracks.length) % allTracks.length);
    setIsPlaying(true);
  };

  const handleSeek = (time: number) => {
    setProgress(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-start p-4 sm:p-6 md:p-8 font-sans selection:bg-zinc-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        filterFavorites={filterFavorites}
        onToggleFilterFavorites={() => setFilterFavorites(!filterFavorites)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col justify-start">
        {activeTab === 'home' && (
          <HomeView
            tracks={allTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            onSelectTab={setActiveTab}
            onFilterGenre={(genre) => setSelectedGenre(genre)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'library' && (
          <AudioLibraryView
            tracks={allTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenVipHub={() => setActiveTab('vip')}
          />
        )}

        {activeTab === 'player' && (
          <AudioPlayer
            playlist={allTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            filterFavorites={filterFavorites}
            onTogglePlay={handleTogglePlay}
            onPlayNext={handlePlayNext}
            onPlayPrev={handlePlayPrev}
            onSeek={handleSeek}
            onVolumeChange={setVolume}
            onToggleMute={() => setIsMuted(!isMuted)}
            onSelectTrack={handlePlayTrack}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenVipHub={() => setActiveTab('vip')}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            tracks={allTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'vip' && (
          <VipPointsHubView
            onOpenAuth={() => setIsAuthOpen(true)}
            onGoToTopup={() => setActiveTab('topup')}
          />
        )}

        {activeTab === 'topup' && (
          <VipTopupView
            onOpenAuth={() => setIsAuthOpen(true)}
            onGoToVipSettings={() => setActiveTab('vip')}
          />
        )}
      </main>

      {/* Persistent Bottom Taskbar (Thanh tác vụ bên dưới) with Mini Player and Navigation Tabs */}
      <BottomTaskbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        onTogglePlay={handleTogglePlay}
        onPlayNext={handlePlayNext}
        onPlayPrev={handlePlayPrev}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted(!isMuted)}
        onOpenFullPlayer={() => setActiveTab('player')}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handlePlayNext}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
