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
import { VipTopupView } from './components/VipTopupView';
import { UserProfileView } from './components/UserProfileView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { BottomTaskbar } from './components/BottomTaskbar';
import { AuthModal } from './components/AuthModal';
import { AuthorStudioModal } from './components/AuthorStudioModal';
import { AuthorGiftShopModal } from './components/AuthorGiftShopModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { MessagesFriendsView } from './components/MessagesFriendsView';
import { CoupleRomanceView } from './components/CoupleRomanceView';
import { FinanceView } from './components/FinanceView';
import { HaevyGamesView, HaevyGamesSubTab } from './components/HaevyGamesView';
import { HaevyStudioView } from './components/HaevyStudioView';
import { AuthorChannelView } from './components/AuthorChannelView';
import { PublishAudioModal } from './components/PublishAudioModal';
import { QuickChatModal } from './components/QuickChatModal';
import { SystemAnnouncementBanner } from './components/SystemAnnouncementBanner';
import { HaevyEcosystemDrawer } from './components/HaevyEcosystemDrawer';
import { NotificationsModal } from './components/NotificationsModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { INITIAL_TRACKS } from './data';
import { Track, ActiveTab, EcosystemMode } from './types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Moon, CheckCircle2, Sparkles } from 'lucide-react';
import { webAudioEqualizer } from './lib/webAudioEqualizer';

function MainApp() {
  const { user, isAdmin, isAuthorVerified, isAnonymousAccount, addAudioPoints, incrementListenTime } = useAuth();
  const [currentMode, setCurrentMode] = useState<EcosystemMode>('audio');
  const [isModesDrawerOpen, setIsModesDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [allTracks, setAllTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerDismissed, setIsPlayerDismissed] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [messageSubTab, setMessageSubTab] = useState<'chat' | 'feed' | 'friends'>('chat');
  const [coupleSubTab, setCoupleSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [financeSubTab, setFinanceSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [adminSubTab, setAdminSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6'>('page1');
  const [gamesSubTab, setGamesSubTab] = useState<HaevyGamesSubTab>('home');
  const [studioSubTab, setStudioSubTab] = useState<'page1' | 'page2' | 'page3'>('page1');
  const [vipSubTab, setVipSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4'>('page1');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup' | 'anonymous'>('signin');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [anonStudioWarning, setAnonStudioWarning] = useState<string | null>(null);

  // Sync fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
      // If direct fullscreen fails (e.g. iOS safari iframe constraint), open guide modal
      setIsInstallPwaOpen(true);
    }
  };

  // Author Channel & Story Series States
  const [viewingAuthor, setViewingAuthor] = useState<{ uid?: string; stageName?: string } | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishSeriesPrefill, setPublishSeriesPrefill] = useState<{
    seriesId: string;
    seriesTitle: string;
    nextEpisodeNumber: number;
    genre: string;
  } | null>(null);

  // Sleep Timer States
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);
  const [sleepToast, setSleepToast] = useState<string | null>(null);

  // Quick Chat State
  const [quickChatTarget, setQuickChatTarget] = useState<{
    uid: string;
    displayName: string;
    accountId?: string;
    photoURL?: string;
    isVip?: boolean;
    isAuthorVerified?: boolean;
    authorStageName?: string;
  } | null>(null);

  const handleOpenQuickChat = (target: {
    uid: string;
    displayName: string;
    accountId?: string;
    photoURL?: string;
    isVip?: boolean;
    isAuthorVerified?: boolean;
    authorStageName?: string;
  }) => {
    setQuickChatTarget(target);
  };

  const handleOpenAuth = (tab: 'signin' | 'signup' | 'anonymous' = 'signin') => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerSecondsLeft(null);
      setSleepToast('Đã tắt hẹn giờ.');
      setTimeout(() => setSleepToast(null), 3000);
    } else if (minutes === -1) {
      setSleepTimerSecondsLeft(null);
      setSleepToast('Đã bật hẹn giờ: Dừng phát sau khi hết bài hiện tại.');
      setTimeout(() => setSleepToast(null), 3500);
    } else {
      const totalSec = minutes * 60;
      setSleepTimerSecondsLeft(totalSec);
      setSleepToast(`Đã bật hẹn giờ: Dừng phát nhạc sau ${minutes} phút.`);
      setTimeout(() => setSleepToast(null), 3500);
    }
  };

  const handleAddSleepTimerMinutes = (extraMinutes: number) => {
    setSleepTimerSecondsLeft((prev) => {
      const newSec = (prev || 0) + extraMinutes * 60;
      setSleepTimerMinutes(Math.ceil(newSec / 60));
      setSleepToast(`Đã cộng thêm ${extraMinutes} phút vào hẹn giờ tắt.`);
      setTimeout(() => setSleepToast(null), 3000);
      return newSec;
    });
  };

  const handleOpenGiftShop = (author?: {
    uid: string;
    stageName: string;
    trackTitle?: string;
    trackId?: string;
  }) => {
    setGiftShopTargetAuthor(author);
    setIsGiftShopOpen(true);
  };

  // Unified Studio Audio Modal State (TTS, Publish, eKYC, My Tracks)
  const [isStudioAudioOpen, setIsStudioAudioOpen] = useState(false);
  const [studioInitialTab, setStudioInitialTab] = useState<'tts' | 'publish' | 'ekyc' | 'my-tracks'>('tts');

  const handleOpenStudioAudio = (tab: 'tts' | 'publish' | 'ekyc' | 'my-tracks' = 'tts') => {
    if (!user) {
      handleOpenAuth('signin');
      return;
    }
    if (isAnonymousAccount || (user as any).isAnonymous) {
      setAnonStudioWarning('Tài khoản Ẩn Danh không có quyền truy cập Studio Tác Giả & AI Voice để đảm bảo bản quyền và xác minh danh tính. Bạn vui lòng đăng ký hoặc đăng nhập tài khoản chính thức để mở toàn bộ tính năng Studio!');
      return;
    }
    setCurrentMode('studio');
    setActiveTab('studio');
    if (tab === 'ekyc') {
      setStudioSubTab('page1');
    } else if (tab === 'tts' || tab === 'publish') {
      setStudioSubTab('page2');
    } else if (tab === 'my-tracks') {
      setStudioSubTab('page3');
    }
  };

  const handleOpenPublishAudio = (prefilledSeries?: { seriesId: string; seriesTitle: string; nextEpisodeNumber: number; genre: string }) => {
    if (!user) {
      handleOpenAuth('signin');
      return;
    }
    if (isAnonymousAccount || (user as any).isAnonymous) {
      setAnonStudioWarning('Tài khoản Ẩn Danh không có quyền truy cập Studio Tác Giả & AI Voice để đảm bảo bản quyền và xác minh danh tính. Bạn vui lòng đăng ký hoặc đăng nhập tài khoản chính thức để mở toàn bộ tính năng Studio!');
      return;
    }
    setPublishSeriesPrefill(prefilledSeries || null);
    setIsPublishModalOpen(true);
  };

  const handleOpenAuthorStudio = () => handleOpenStudioAudio('my-tracks');
  const handleOpenAuthorVerification = () => handleOpenStudioAudio('ekyc');
  const handleOpenTextToAudio = () => handleOpenStudioAudio('tts');

  const handleViewAuthorChannel = (authorUid?: string, authorStageName?: string) => {
    setViewingAuthor({
      uid: authorUid,
      stageName: authorStageName
    });
  };

  const handleSelectMode = (mode: EcosystemMode, initialTab?: ActiveTab) => {
    setCurrentMode(mode);
    if (initialTab) {
      setActiveTab(initialTab);
    } else {
      switch (mode) {
        case 'audio':
          setActiveTab('home');
          break;
        case 'messages':
          setActiveTab('messages');
          break;
        case 'couple':
          setActiveTab('couple');
          break;
        case 'finance':
          setActiveTab('finance');
          break;
        case 'admin':
          setActiveTab('admin');
          break;
        case 'studio':
          setActiveTab('studio');
          break;
        case 'games':
          setActiveTab('games');
          setGamesSubTab('home');
          break;
      }
    }
  };

  const [isGiftShopOpen, setIsGiftShopOpen] = useState(false);
  const [giftShopTargetAuthor, setGiftShopTargetAuthor] = useState<{
    uid: string;
    stageName: string;
    trackTitle?: string;
    trackId?: string;
  } | undefined>(undefined);

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
        const hiddenTracks: string[] = JSON.parse(localStorage.getItem('admin_hidden_tracks') || '[]');
        const customMap = new Map<string, Partial<Track>>();
        const extraCustomTracks: Track[] = [];

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const rawId = docSnap.id;
          const isInitial = INITIAL_TRACKS.some(t => t.id === rawId);

          if (isInitial) {
            customMap.set(rawId, {
              isVipOnly: data.isVipOnly !== undefined ? Boolean(data.isVipOnly) : undefined,
              bitrate: data.bitrate,
              title: data.title,
              artist: data.artist,
              genre: data.genre,
              url: data.url,
              coverUrl: data.coverUrl,
              description: data.description,
            });
          } else {
            extraCustomTracks.push({
              id: rawId.startsWith('custom-') ? rawId : `custom-${rawId}`,
              title: data.title || 'Untitled Track',
              artist: data.artist || 'Unknown Artist',
              genre: data.genre || 'Khác',
              url: data.url,
              coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
              durationSec: data.durationSec || 210,
              plays: data.plays || 1,
              isVipOnly: Boolean(data.isVipOnly),
              bitrate: data.bitrate || (data.isVipOnly ? 'Lossless 24-bit/96kHz (Đặc quyền VIP)' : '320kbps Hi-Fi'),
              addedBy: data.addedBy,
              addedByName: data.addedByName,
              createdAt: data.createdAt,
              stageName: data.stageName,
              isAuthorVerified: data.isAuthorVerified,
              description: data.description,
              isSeries: Boolean(data.isSeries),
              seriesId: data.seriesId,
              seriesTitle: data.seriesTitle,
              episodeNumber: data.episodeNumber !== undefined ? Number(data.episodeNumber) : undefined,
              episodeTitle: data.episodeTitle,
              totalEpisodes: data.totalEpisodes !== undefined ? Number(data.totalEpisodes) : undefined,
              storylineSummary: data.storylineSummary,
              nextTrackId: data.nextTrackId,
            });
          }
        });

        // Apply overrides to initial tracks
        const mergedInitial = INITIAL_TRACKS.map(baseTrack => {
          if (customMap.has(baseTrack.id)) {
            const override = customMap.get(baseTrack.id)!;
            return {
              ...baseTrack,
              ...override,
              id: baseTrack.id,
            };
          }
          return baseTrack;
        });

        const allMerged = [...mergedInitial, ...extraCustomTracks].filter(
          t => !hiddenTracks.includes(t.id) && !hiddenTracks.includes(t.id.replace('custom-', ''))
        );

        setAllTracks(allMerged);
      },
      (err) => {
        console.error('Error fetching custom tracks:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sleep Timer countdown effect
  useEffect(() => {
    if (!isPlaying || sleepTimerSecondsLeft === null || sleepTimerSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSleepTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Time is up! Stop playback
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          setSleepToast('💤 Đã tự động dừng phát nhạc theo hẹn giờ tắt ngủ.');
          setTimeout(() => setSleepToast(null), 5000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, sleepTimerSecondsLeft]);

  // Audio Playback effect
  useEffect(() => {
    if (audioRef.current) {
      webAudioEqualizer.init(audioRef.current);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      webAudioEqualizer.resume();
      if (audioRef.current) {
        webAudioEqualizer.init(audioRef.current);
      }
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
    setIsPlayerDismissed(false);
    const idx = allTracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    } else {
      setAllTracks((prev) => [track, ...prev]);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setIsPlayerDismissed(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlayNext = () => {
    if (allTracks.length === 0) return;

    // Check if current track belongs to a storyline series with next episode
    if (currentTrack?.isSeries && currentTrack.episodeNumber !== undefined) {
      const nextEpNum = currentTrack.episodeNumber + 1;
      const nextEpisodeIdx = allTracks.findIndex(
        (t) => (
          (currentTrack.seriesId && t.seriesId === currentTrack.seriesId) ||
          (currentTrack.seriesTitle && t.seriesTitle && t.seriesTitle.trim().toLowerCase() === currentTrack.seriesTitle.trim().toLowerCase())
        ) && t.episodeNumber === nextEpNum
      );
      if (nextEpisodeIdx !== -1) {
        setCurrentTrackIndex(nextEpisodeIdx);
        setIsPlaying(true);
        return;
      }
    }

    // Default cyclic next
    setCurrentTrackIndex((prev) => (prev + 1) % allTracks.length);
    setIsPlaying(true);
  };

  const handlePlayPrev = () => {
    if (allTracks.length === 0) return;

    // Check if current track belongs to a storyline series with previous episode
    if (currentTrack?.isSeries && currentTrack.episodeNumber !== undefined && currentTrack.episodeNumber > 1) {
      const prevEpNum = currentTrack.episodeNumber - 1;
      const prevEpisodeIdx = allTracks.findIndex(
        (t) => (
          (currentTrack.seriesId && t.seriesId === currentTrack.seriesId) ||
          (currentTrack.seriesTitle && t.seriesTitle && t.seriesTitle.trim().toLowerCase() === currentTrack.seriesTitle.trim().toLowerCase())
        ) && t.episodeNumber === prevEpNum
      );
      if (prevEpisodeIdx !== -1) {
        setCurrentTrackIndex(prevEpisodeIdx);
        setIsPlaying(true);
        return;
      }
    }

    // Default cyclic previous
    setCurrentTrackIndex((prev) => (prev - 1 + allTracks.length) % allTracks.length);
    setIsPlaying(true);
  };

  const handleAudioEnded = () => {
    if (sleepTimerMinutes === -1) {
      // Stop after current track finished
      setIsPlaying(false);
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
      setSleepToast('💤 Đã dừng phát sau khi hết bài hát theo hẹn giờ.');
      setTimeout(() => setSleepToast(null), 5000);
    } else {
      handlePlayNext();
    }
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-zinc-100 flex flex-col justify-start p-3 sm:p-6 md:p-8 font-sans selection:bg-zinc-800">
      {/* Top Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onOpenEcosystemDrawer={() => setIsModesDrawerOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => handleOpenAuth('signin')}
        onOpenAnonPass={() => handleOpenAuth('anonymous')}
        onOpenStudioAudio={handleOpenStudioAudio}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
      />

      {/* Global System Announcement Banner */}
      <SystemAnnouncementBanner />

      {/* Main Tab Content */}
      <main className={`flex-1 flex flex-col justify-start w-full max-w-full ${activeTab === 'profile' ? 'pb-8 sm:pb-12' : 'pb-36 sm:pb-40'}`}>
        {/* If user is specifically viewing an author's channel */}
        {viewingAuthor ? (
          <AuthorChannelView
            authorUid={viewingAuthor.uid}
            authorStageName={viewingAuthor.stageName}
            allTracks={allTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onTogglePlay={handleTogglePlay}
            onClose={() => setViewingAuthor(null)}
            onOpenGiftShop={handleOpenGiftShop}
            onOpenPublishAudio={handleOpenPublishAudio}
            onOpenAuth={() => handleOpenAuth('signin')}
            onOpenVipHub={() => setActiveTab('topup')}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                tracks={allTracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onTogglePlay={handleTogglePlay}
                onSelectTab={setActiveTab}
                onFilterGenre={(genre) => setSelectedGenre(genre)}
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenPublishAudio={handleOpenPublishAudio}
                onViewAuthorChannel={handleViewAuthorChannel}
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
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenVipHub={() => setActiveTab('topup')}
                onOpenPublishAudio={handleOpenPublishAudio}
                onOpenAuthorStudio={handleOpenAuthorStudio}
                onViewAuthorChannel={handleViewAuthorChannel}
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
                onTogglePlay={handleTogglePlay}
                onPlayNext={handlePlayNext}
                onPlayPrev={handlePlayPrev}
                onSeek={handleSeek}
                onVolumeChange={setVolume}
                onToggleMute={() => setIsMuted(!isMuted)}
                onSelectTrack={handlePlayTrack}
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenVipHub={() => setActiveTab('topup')}
                onOpenGiftShop={handleOpenGiftShop}
                onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
                sleepTimerSecondsLeft={sleepTimerSecondsLeft}
                sleepTimerActive={sleepTimerMinutes !== null}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesFriendsView
                tracks={allTracks}
                currentTrack={currentTrack}
                onPlayTrack={handlePlayTrack}
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenGiftShop={handleOpenGiftShop}
                activeSubTab={messageSubTab}
                onSelectSubTab={setMessageSubTab}
              />
            )}

            {activeTab === 'community' && (
              <CommunityView
                tracks={allTracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onOpenAuth={() => handleOpenAuth('signin')}
              />
            )}

            {activeTab === 'couple' && (
              <CoupleRomanceView
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenGiftShop={handleOpenGiftShop}
                allTracks={allTracks}
                tracks={allTracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                activePage={coupleSubTab}
                onSelectPage={setCoupleSubTab}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceView
                currentUserId={user?.uid || 'user_guest'}
                isVip={user?.isVip ?? true}
                onUpgradeVip={() => setActiveTab('topup')}
                activePage={financeSubTab}
                onSelectPage={setFinanceSubTab}
              />
            )}

            {(activeTab === 'vip' || activeTab === 'topup') && (
              <VipTopupView
                onOpenAuth={() => handleOpenAuth('signin')}
                onGoToProfile={() => setActiveTab('profile')}
                allTracks={allTracks}
                currentTrack={currentTrack}
                onOpenGiftShopModal={handleOpenGiftShop}
                activePage={vipSubTab}
                onSelectPage={setVipSubTab}
              />
            )}

            {activeTab === 'profile' && (
              <UserProfileView
                onOpenAuth={() => handleOpenAuth('signin')}
                onGoToTopup={() => setActiveTab('topup')}
                onGoToHome={() => setActiveTab('home')}
                onSelectTab={setActiveTab}
                onOpenAuthorStudio={handleOpenAuthorStudio}
                onOpenAuthorVerification={handleOpenAuthorVerification}
                onOpenPublishAudio={handleOpenPublishAudio}
                onOpenGiftShop={() => handleOpenGiftShop()}
                onOpenAdmin={() => {
                  setCurrentMode('admin');
                  setActiveTab('admin');
                }}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboardView
                onBackToHome={() => {
                  setCurrentMode('audio');
                  setActiveTab('home');
                }}
                onOpenAuth={() => handleOpenAuth('signin')}
                adminSubTab={adminSubTab}
                onSelectAdminSubTab={setAdminSubTab}
                allTracks={allTracks}
                onPlayTrack={handlePlayTrack}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
              />
            )}

            {activeTab === 'games' && (
              <HaevyGamesView
                activeSubTab={gamesSubTab}
                onSelectSubTab={setGamesSubTab}
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenVipHub={() => setActiveTab('topup')}
              />
            )}

            {activeTab === 'studio' && (
              <HaevyStudioView
                activeSubTab={studioSubTab}
                onSelectSubTab={setStudioSubTab}
                onOpenAuth={() => handleOpenAuth('signin')}
                onPlayTrack={(track) => {
                  const idx = allTracks.findIndex(t => t.id === track.id);
                  if (idx !== -1) {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  } else {
                    setAllTracks(prev => [track, ...prev]);
                    setCurrentTrackIndex(0);
                    setIsPlaying(true);
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom Taskbar with Mini Player and Navigation Tabs (Hidden when full-screen Ecosystem Drawer is open or when on Profile View) */}
      {!isModesDrawerOpen && activeTab !== 'profile' && (
        <BottomTaskbar
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          onOpenModesSlider={() => setIsModesDrawerOpen(true)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          messageSubTab={messageSubTab}
          onSelectMessageSubTab={setMessageSubTab}
          coupleSubTab={coupleSubTab}
          onSelectCoupleSubTab={setCoupleSubTab}
          financeSubTab={financeSubTab}
          onSelectFinanceSubTab={setFinanceSubTab}
          adminSubTab={adminSubTab}
          onSelectAdminSubTab={setAdminSubTab}
          gamesSubTab={gamesSubTab}
          onSelectGamesSubTab={setGamesSubTab}
          studioSubTab={studioSubTab}
          onSelectStudioSubTab={setStudioSubTab}
          vipSubTab={vipSubTab}
          onSelectVipSubTab={setVipSubTab}
          currentTrack={isPlayerDismissed ? null : currentTrack}
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
          onOpenAuth={() => handleOpenAuth('signin')}
          onCloseTrack={handleClosePlayer}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          sleepTimerSecondsLeft={sleepTimerSecondsLeft}
          sleepTimerActive={sleepTimerMinutes !== null}
        />
      )}

      {/* Global Horizontal Mode Carousel Drawer triggered from Bottom Dock */}
      <HaevyEcosystemDrawer
        isOpen={isModesDrawerOpen}
        onClose={() => setIsModesDrawerOpen(false)}
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenStudioAudio={handleOpenStudioAudio}
        onOpenAuth={() => handleOpenAuth('signin')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
      />

      {/* Global Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectTab={setActiveTab}
        onSelectMode={handleSelectMode}
        onOpenChatWithUser={(partnerUid) => {
          setIsNotificationsOpen(false);
          handleSelectMode('messages', 'messages');
        }}
      />

      {/* Install PWA Fullscreen Modal */}
      <InstallPwaModal
        isOpen={isInstallPwaOpen}
        onClose={() => setIsInstallPwaOpen(false)}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Sleep Timer Toast Banner */}
      {sleepToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200 animate-in fade-in slide-in-from-top-3">
          <Moon size={16} className="text-amber-400 fill-amber-400/40 shrink-0 animate-pulse" />
          <span className="font-semibold">{sleepToast}</span>
        </div>
      )}

      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        activeDuration={sleepTimerMinutes}
        secondsLeft={sleepTimerSecondsLeft}
        onSetTimer={handleSetSleepTimer}
        onAddMinutes={handleAddSleepTimerMinutes}
        currentTrackTitle={currentTrack?.title}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)} 
      />

      {/* Unified Author & Audio Studio Modal (TTS, Publishing, eKYC & My Tracks) */}
      <AuthorStudioModal
        isOpen={isStudioAudioOpen}
        initialTab={studioInitialTab}
        onClose={() => setIsStudioAudioOpen(false)}
        onSelectTrack={handlePlayTrack}
      />

      {/* Author Gift Shop Modal */}
      <AuthorGiftShopModal
        isOpen={isGiftShopOpen}
        onClose={() => setIsGiftShopOpen(false)}
        onOpenAuth={() => handleOpenAuth('signin')}
        onGoToTopup={() => {
          setIsGiftShopOpen(false);
          setActiveTab('topup');
        }}
        preselectedAuthor={giftShopTargetAuthor}
        allTracks={allTracks}
        currentTrack={currentTrack}
      />

      {/* Quick Direct Chat Modal */}
      <QuickChatModal
        isOpen={!!quickChatTarget}
        onClose={() => setQuickChatTarget(null)}
        targetUser={quickChatTarget}
        tracks={allTracks}
        onPlayTrack={handlePlayTrack}
        onOpenGiftShop={handleOpenGiftShop}
        onGoToFullChat={(recipientUid) => {
          setQuickChatTarget(null);
          setActiveTab('messages');
        }}
      />

      {/* Publish Audio & Series Storylines Modal */}
      <PublishAudioModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setPublishSeriesPrefill(null);
        }}
        prefilledSeries={publishSeriesPrefill}
      />

      {/* Anonymous Account Studio Restriction Warning Modal */}
      {anonStudioWarning && (
        <div 
          id="anon-studio-warning-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setAnonStudioWarning(null)}
        >
          <div 
            id="anon-studio-warning-dialog"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tính Năng Dành Cho Tài Khoản Chính Thức</h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                {anonStudioWarning}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAnonStudioWarning(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnonStudioWarning(null);
                  handleOpenAuth('signup');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md"
              >
                Tạo tài khoản ngay
              </button>
            </div>
          </div>
        </div>
      )}
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
