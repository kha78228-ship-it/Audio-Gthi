import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Heart, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  UserPlus, 
  Layers, 
  Crosshair, 
  Battery, 
  Navigation, 
  Sparkles, 
  Activity, 
  Search,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Coffee,
  Car,
  Compass,
  Bell
} from 'lucide-react';
import { MapMember, SafeZone } from '../../types';
import { DEFAULT_MEMBERS, DEFAULT_SAFE_ZONES } from '../../data/defaultMapsData';
import { calculateDistanceKm, formatDistance } from '../../utils/mapsUtils';
import type { DiscoveredMeetupPlace, ComputedRouteSummary } from './HaevyGoogleMap';

// Lazy load Google Maps & Fallback Leaflet engine & map modals
const HaevyGoogleMap = React.lazy(() => import('./HaevyGoogleMap').then(m => ({ default: m.HaevyGoogleMap })));
const HaevyLeafletMap = React.lazy(() => import('./HaevyLeafletMap').then(m => ({ default: m.HaevyLeafletMap })));
const HaevyMapMemberDetailModal = React.lazy(() => import('./HaevyMapMemberDetailModal').then(m => ({ default: m.HaevyMapMemberDetailModal })));
const AddMapMemberModal = React.lazy(() => import('./AddMapMemberModal').then(m => ({ default: m.AddMapMemberModal })));
const SafeZonesModal = React.lazy(() => import('./SafeZonesModal').then(m => ({ default: m.SafeZonesModal })));

export interface SafetyFeedEvent {
  id: string;
  time: string;
  text: string;
  type: 'love' | 'safezone' | 'battery' | 'checkin';
}

export interface HaevyMapsViewProps {
  activeCategoryControlled?: 'all' | 'couple' | 'family' | 'zones';
  onCategoryChange?: (category: 'all' | 'couple' | 'family' | 'zones') => void;
  onBackToPortal?: () => void;
}

export const HaevyMapsView: React.FC<HaevyMapsViewProps> = ({
  activeCategoryControlled,
  onCategoryChange,
  onBackToPortal
}) => {
  const rawGoogleMapsApiKey = (
    ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || ''
  ).trim();
  const isValidGoogleMapsKey = /^AIza[0-9A-Za-z\-_]{30,45}$/.test(rawGoogleMapsApiKey);
  const [gmpAuthFailed, setGmpAuthFailed] = useState(false);
  const canUseGoogleMaps = isValidGoogleMapsKey && !gmpAuthFailed;
  const googleMapsApiKey = canUseGoogleMaps ? rawGoogleMapsApiKey : '';

  // User Location State (Default: Central Saigon, updated via Geolocation)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.7009
  });
  const [userStatusNote, setUserStatusNote] = useState<string>('Đang làm việc & trực tuyến an toàn ✨');
  const [isLocating, setIsLocating] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(true);

  // Members & Safe Zones State
  const [members, setMembers] = useState<MapMember[]>(() => {
    const saved = localStorage.getItem('haevy_maps_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_MEMBERS;
  });

  const [safeZones, setSafeZones] = useState<SafeZone[]>(() => {
    const saved = localStorage.getItem('haevy_maps_safe_zones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SAFE_ZONES;
  });

  // UI & Google Maps Platform Feature States
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>(
    isValidGoogleMapsKey ? 'google' : 'leaflet'
  );

  useEffect(() => {
    const handleGmpError = () => {
      setGmpAuthFailed(true);
      setMapEngine('leaflet');
    };
    window.addEventListener('haevy-gmp-auth-error', handleGmpError);
    return () => window.removeEventListener('haevy-gmp-auth-error', handleGmpError);
  }, []);
  const [filterCategory, setFilterCategory] = useState<'all' | 'couple' | 'family' | 'friend'>('all');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<MapMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced Google Maps Features State
  const [activeRouteTravelMode, setActiveRouteTravelMode] = useState<'DRIVING' | 'TWO_WHEELER' | 'WALKING' | null>(null);
  const [computedRouteSummary, setComputedRouteSummary] = useState<ComputedRouteSummary | null>(null);
  const [streetViewTarget, setStreetViewTarget] = useState<{ lat: number; lng: number; title: string } | null>(null);
  const [isMeetupFinderOpen, setIsMeetupFinderOpen] = useState<boolean>(false);
  const [selectedMeetupSpot, setSelectedMeetupSpot] = useState<DiscoveredMeetupPlace | null>(null);

  // Live Family & Couple Activity Feed
  const [safetyFeed, setSafetyFeed] = useState<SafetyFeedEvent[]>([
    {
      id: 'ev-1',
      time: 'Vừa xong',
      text: '💖 Bảo Ngọc (Người yêu) đang ở Quận 1 • Pin 88%',
      type: 'love'
    },
    {
      id: 'ev-2',
      time: '5 phút trước',
      text: '🛡️ Mẹ Yêu đã vào Vùng An Toàn: Tổ Ấm Gia Đình',
      type: 'safezone'
    },
    {
      id: 'ev-3',
      time: '12 phút trước',
      text: '🚗 Bố đang di chuyển trên đường Điện Biên Phủ (35 km/h)',
      type: 'checkin'
    }
  ]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isZonesModalOpen, setIsZonesModalOpen] = useState(false);
  const [sosAlertNotice, setSosAlertNotice] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('haevy_maps_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('haevy_maps_safe_zones', JSON.stringify(safeZones));
  }, [safeZones]);

  // Synchronize category or open Safe Zones modal from external navigation
  useEffect(() => {
    if (!activeCategoryControlled) return;
    if (activeCategoryControlled === 'zones') {
      setIsZonesModalOpen(true);
    } else if (activeCategoryControlled === 'all' || activeCategoryControlled === 'couple' || activeCategoryControlled === 'family') {
      setFilterCategory(activeCategoryControlled);
    }
  }, [activeCategoryControlled]);

  // Request actual browser GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Periodic subtle simulated movement for moving members (driving/walking)
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.activity === 'driving' || m.activity === 'walking') {
            const deltaLat = (Math.random() - 0.5) * 0.0004;
            const deltaLng = (Math.random() - 0.5) * 0.0004;
            return {
              ...m,
              latitude: Number((m.latitude + deltaLat).toFixed(5)),
              longitude: Number((m.longitude + deltaLng).toFixed(5)),
              lastUpdated: 'Vừa xong'
            };
          }
          return m;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const pushFeedEvent = (text: string, type: SafetyFeedEvent['type']) => {
    setSafetyFeed((prev) => [
      { id: `ev-${Date.now()}`, time: 'Vừa xong', text, type },
      ...prev.slice(0, 9)
    ]);
  };

  // Handle Heart Ping animation
  const handleSendHeart = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, heartbeatsSent: (m.heartbeatsSent || 0) + 1 }
          : m
      )
    );

    if (target) {
      pushFeedEvent(`💖 Bạn vừa gửi nhịp tim yêu thương tới ${target.name}`, 'love');
    }

    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts([]);
    }, 1800);
  };

  const handleRingPing = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (target) {
      pushFeedEvent(`🔔 Đã phát chuông định vị tới thiết bị của ${target.name}`, 'checkin');
    }
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  const handleSendQuickMessage = (memberId: string, text: string) => {
    const target = members.find((m) => m.id === memberId);
    if (target) {
      pushFeedEvent(`💬 Nhắn tới ${target.name}: "${text}"`, 'love');
    }
  };

  const handleBroadcastSafeCheckIn = () => {
    const msg = '✅ Bạn vừa phát tín hiệu "Mình Đang An Toàn" kèm tọa độ GPS cho cả gia đình & người yêu!';
    setUserStatusNote('Vừa báo bình an tại vị trí hiện tại ✅');
    pushFeedEvent(msg, 'safezone');
    setSosAlertNotice(msg);
    setTimeout(() => setSosAlertNotice(null), 4500);
  };

  const handleTriggerSOS = () => {
    const alertMsg = '🚨 BÁO ĐỘNG KHẨN CẤP SOS: Đã phát thông báo vị trí chính xác của bạn đến tất cả người thân & bạn đời!';
    pushFeedEvent(alertMsg, 'battery');
    setSosAlertNotice(alertMsg);
    setTimeout(() => {
      setSosAlertNotice(null);
    }, 6000);
  };

  const handleAddMember = (newMember: MapMember) => {
    setMembers((prev) => [newMember, ...prev]);
    setSelectedMember(newMember);
    pushFeedEvent(`🎉 Đã kết nối định vị thời gian thực với ${newMember.name} (${newMember.relationshipLabel})`, 'checkin');
  };

  const handleAddSafeZone = (newZone: SafeZone) => {
    setSafeZones((prev) => [...prev, newZone]);
    pushFeedEvent(`🛡️ Đã thiết lập vùng an toàn mới: ${newZone.name} (${newZone.radiusMeters}m)`, 'safezone');
  };

  const handleRecenterUser = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
          setSelectedMember(null);
          setActiveRouteTravelMode(null);
        },
        () => {
          setIsLocating(false);
        }
      );
    }
  };

  // Filtered members list for sidebar
  const filteredMembers = members.filter((m) => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.relationshipLabel.toLowerCase().includes(q) ||
        m.statusText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const coupleMembers = members.filter((m) => m.category === 'couple');
  const familyMembers = members.filter((m) => m.category === 'family');
  const friendMembers = members.filter((m) => m.category === 'friend');

  return (
    <div className="relative w-full h-[calc(100vh-68px)] md:h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Floating Hearts Particles */}
      {floatingHearts.map((h) => (
        <div
          key={h.id}
          className="fixed pointer-events-none z-50 text-2xl animate-bounce"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
        >
          💖
        </div>
      ))}

      {/* SOS / Check-in Banner */}
      {sosAlertNotice && (
        <div className="absolute top-2 inset-x-4 md:inset-x-20 z-50 p-3 rounded-2xl bg-emerald-600/95 text-white font-bold text-xs md:text-sm text-center shadow-2xl border border-emerald-400 flex items-center justify-center gap-2 animate-bounce">
          <Sparkles size={18} className="text-yellow-300" />
          <span>{sosAlertNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS BAR                                                   */}
      {/* ========================================================================= */}
      <div className="h-14 px-3 md:px-5 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between gap-2 shrink-0 z-20 overflow-x-auto">
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <MapPin size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight truncate">
                Haevy Maps
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Google Maps Live
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-zinc-400 truncate">
              Định vị Người Yêu, Gia Đình & Bạn Bè • Dẫn đường & Điểm hẹn thông minh
            </p>
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Layer Selector */}
          <div className="hidden lg:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setMapStyle('dark')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'dark' ? 'bg-zinc-800 text-amber-300 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Đêm Tối
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-zinc-800 text-sky-300 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Vệ Tinh
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('street')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapStyle === 'street' ? 'bg-zinc-800 text-emerald-300 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Đường Phố
            </button>
          </div>

          {/* Live Traffic Layer Toggle */}
          {mapEngine === 'google' && (
            <button
              type="button"
              onClick={() => setShowTrafficLayer(!showTrafficLayer)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showTrafficLayer
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Bật/Tắt lớp mật độ giao thông trực tiếp trên Google Maps"
            >
              <Car size={14} />
              <span className="hidden xl:inline">Giao Thông</span>
            </button>
          )}

          {/* Smart Meetup Spot Finder Trigger */}
          <button
            type="button"
            onClick={() => setIsMeetupFinderOpen(!isMeetupFinderOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMeetupFinderOpen
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-rose-300'
            }`}
            title="Tìm quán cà phê / nhà hàng / điểm hẹn ở chính giữa bạn và người thương"
          >
            <Coffee size={14} className="text-rose-400" />
            <span className="hidden md:inline">Điểm Hẹn Giữa 2 Người</span>
          </button>

          {/* Safe Check-in Broadcast */}
          <button
            type="button"
            onClick={handleBroadcastSafeCheckIn}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Báo bình an một chạm tới gia đình và người yêu"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="hidden lg:inline">Báo Bình An</span>
          </button>

          {/* Safe Zones Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsZonesModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Quản lý Vùng an toàn"
          >
            <ShieldCheck size={15} className="text-emerald-400" />
            <span className="hidden md:inline">Vùng An Toàn</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              {safeZones.length}
            </span>
          </button>

          {/* Add Member Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus size={15} />
            <span className="hidden sm:inline">Thêm Người Thân</span>
          </button>

          {/* SOS Emergency Button */}
          <button
            type="button"
            onClick={handleTriggerSOS}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 flex items-center gap-1 transition-all cursor-pointer animate-pulse active:scale-95"
            title="Phát tín hiệu khẩn cấp SOS tới tất cả người thân"
          >
            <AlertTriangle size={14} />
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN SPLIT VIEW (SIDEBAR MEMBERS + INTERACTIVE GOOGLE MAP)                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        
        {/* ======================== */}
        {/* LEFT / MOBILE SHEET LIST */}
        {/* ======================== */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950 flex flex-col shrink-0 z-10 max-h-[38vh] md:max-h-full">
          {/* User Self-Status Bar */}
          <div className="p-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-extrabold text-xs">
                  BẠN
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-900" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <span>Vị Trí Của Bạn</span>
                  <span className="text-[10px] text-emerald-400 font-medium">● Trực tuyến</span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {userStatusNote}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRecenterUser}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Định vị lại vị trí của bạn"
              >
                <Crosshair size={14} className={isLocating ? 'animate-spin text-emerald-400' : ''} />
              </button>

              <button
                type="button"
                onClick={() => setIsSharingLocation(!isSharingLocation)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isSharingLocation ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                }`}
                title={isSharingLocation ? 'Đang bật chia sẻ vị trí' : 'Đã ẩn vị trí'}
              >
                {isSharingLocation ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          </div>

          {/* Search Member Input */}
          <div className="px-2.5 pt-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm người yêu, bố mẹ, bạn bè..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="p-2 border-b border-zinc-800/80 flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất Cả ({members.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('couple')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                filterCategory === 'couple'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              <Heart size={12} className="text-rose-400 fill-rose-400" />
              <span>Người Yêu ({coupleMembers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('family')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                filterCategory === 'family'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              <Users size={12} className="text-amber-400" />
              <span>Gia Đình ({familyMembers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory('friend')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterCategory === 'friend'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-zinc-400 hover:text-sky-300'
              }`}
            >
              Bạn Bè ({friendMembers.length})
            </button>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2 space-y-1">
            {filteredMembers.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              const isLover = member.role === 'lover' || member.role === 'spouse';
              const isFamily = member.category === 'family';
              const distKm = calculateDistanceKm(
                userLocation.lat,
                userLocation.lng,
                member.latitude,
                member.longitude
              );

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? isLover
                        ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30'
                        : 'bg-zinc-900 border-zinc-700 shadow-md'
                      : 'bg-zinc-950/80 border-transparent hover:bg-zinc-900/60 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full border-2 overflow-hidden ${
                        isLover ? 'border-rose-400 shadow-sm shadow-rose-500/40' : isFamily ? 'border-amber-400' : 'border-sky-400'
                      }`}>
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>

                      {isLover && (
                        <div className="absolute -top-1 -right-1 text-xs animate-bounce">
                          💖
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-100 truncate">{member.name}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                          isLover ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {member.relationshipLabel}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {member.statusText}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span className="text-emerald-400 font-bold">
                          📍 {formatDistance(distKm)}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400 flex items-center gap-0.5">
                          <Battery size={10} className={member.battery < 20 ? 'text-red-400' : 'text-zinc-400'} />
                          {member.battery}%
                        </span>
                        {member.activity === 'driving' && (
                          <span className="text-amber-400 font-medium">🚗 {member.speedKmh} km/h</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick action buttons on card */}
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                        setActiveRouteTravelMode('TWO_WHEELER');
                      }}
                      className="w-7 h-7 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Chỉ đường trực tiếp tới người này"
                    >
                      <Navigation size={12} />
                    </button>

                    {isLover ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendHeart(member.id);
                        }}
                        className="w-7 h-7 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 hover:text-rose-200 border border-rose-500/40 flex items-center justify-center transition-all cursor-pointer active:scale-125"
                        title="Bắn tim yêu thương"
                      >
                        <Heart size={13} className="fill-rose-400" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRingPing(member.id);
                        }}
                        className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                        title="Rung chuông tìm kiếm"
                      >
                        <Bell size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Family & Relationship Activity Feed (Desktop bottom panel) */}
          <div className="hidden md:block p-2.5 border-t border-zinc-800/80 bg-zinc-900/40 max-h-36 overflow-y-auto">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Activity size={11} className="text-emerald-400" />
                <span>Nhật Ký Bình An Trực Tiếp</span>
              </span>
              {googleMapsApiKey && (
                <button
                  type="button"
                  onClick={() => setMapEngine(mapEngine === 'google' ? 'leaflet' : 'google')}
                  className="text-[9px] text-zinc-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  {mapEngine === 'google' ? 'Đang dùng Google Maps' : 'Chuyển sang Google Maps'}
                </button>
              )}
            </div>
            <div className="space-y-1">
              {safetyFeed.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="text-[10px] px-2 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800/70 text-zinc-300 flex items-center justify-between gap-2"
                >
                  <span className="truncate">{ev.text}</span>
                  <span className="text-[9px] text-zinc-500 shrink-0">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================== */}
        {/* RIGHT / MAIN MAP CANVAS  */}
        {/* ======================== */}
        <div className="flex-1 relative h-full">
          <React.Suspense fallback={
            <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                  <MapPin size={26} className="animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Đang nạp Google Maps Haevy</h4>
                <p className="text-xs text-zinc-400 mb-3">Kết nối vệ tinh GPS thời gian thực cho Gia đình & Người thương...</p>
                <div className="w-36 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-emerald-400 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          }>
            {mapEngine === 'google' && canUseGoogleMaps ? (
              <HaevyGoogleMap
                apiKey={googleMapsApiKey}
                userLocation={userLocation}
                members={members}
                selectedMemberId={selectedMember?.id || null}
                onSelectMember={(m) => setSelectedMember(m)}
                safeZones={safeZones}
                mapStyle={mapStyle}
                isLiveTracking={isSharingLocation}
                filterCategory={filterCategory}
                showTrafficLayer={showTrafficLayer}
                activeRouteTravelMode={activeRouteTravelMode}
                onChangeRouteTravelMode={setActiveRouteTravelMode}
                streetViewTarget={streetViewTarget}
                onCloseStreetView={() => setStreetViewTarget(null)}
                onOpenStreetView={(target) => setStreetViewTarget(target)}
                isMeetupFinderOpen={isMeetupFinderOpen}
                onCloseMeetupFinder={() => setIsMeetupFinderOpen(false)}
                selectedMeetupSpot={selectedMeetupSpot}
                onSelectMeetupSpot={setSelectedMeetupSpot}
                onRouteSummaryChange={setComputedRouteSummary}
              />
            ) : (
              <HaevyLeafletMap
                userLocation={userLocation}
                members={members}
                selectedMemberId={selectedMember?.id || null}
                onSelectMember={(m) => setSelectedMember(m)}
                safeZones={safeZones}
                mapStyle={mapStyle}
                isLiveTracking={isSharingLocation}
                filterCategory={filterCategory}
                activeRouteTravelMode={activeRouteTravelMode}
                onChangeRouteTravelMode={setActiveRouteTravelMode}
                streetViewTarget={streetViewTarget}
                onCloseStreetView={() => setStreetViewTarget(null)}
                onOpenStreetView={(target) => setStreetViewTarget(target)}
                isMeetupFinderOpen={isMeetupFinderOpen}
                onCloseMeetupFinder={() => setIsMeetupFinderOpen(false)}
                selectedMeetupSpot={selectedMeetupSpot}
                onSelectMeetupSpot={setSelectedMeetupSpot}
                onRouteSummaryChange={setComputedRouteSummary}
              />
            )}
          </React.Suspense>

          {/* Floating Map Right Quick Action Buttons */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRecenterUser}
              className="w-10 h-10 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
              title="Về vị trí của tôi"
            >
              <Crosshair size={18} className={isLocating ? 'animate-spin text-emerald-400' : ''} />
            </button>

            <button
              type="button"
              onClick={() => {
                setMapStyle((prev) => (prev === 'dark' ? 'satellite' : prev === 'satellite' ? 'street' : 'dark'));
              }}
              className="w-10 h-10 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
              title="Đổi chế độ bản đồ (Đêm / Vệ tinh / Đường phố)"
            >
              <Layers size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                setStreetViewTarget({
                  lat: selectedMember ? selectedMember.latitude : userLocation.lat,
                  lng: selectedMember ? selectedMember.longitude : userLocation.lng,
                  title: selectedMember ? selectedMember.name : 'Vị trí của bạn'
                })
              }
              className="w-10 h-10 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-sky-400 hover:text-sky-300 shadow-xl flex items-center justify-center transition-all cursor-pointer"
              title="Xem đường phố 360° (Street View)"
            >
              <Compass size={18} />
            </button>
          </div>

          {/* Floating Selected Member Detail Drawer / Card */}
          {selectedMember && (
            <React.Suspense fallback={null}>
              <HaevyMapMemberDetailModal
                member={selectedMember}
                userLocation={userLocation}
                safeZones={safeZones}
                onClose={() => setSelectedMember(null)}
                onSendHeart={handleSendHeart}
                onRingPing={handleRingPing}
                onStartLiveRoute={(mode) => setActiveRouteTravelMode(mode)}
                onOpenStreetView={(target) => setStreetViewTarget(target)}
                onOpenMeetupFinder={() => setIsMeetupFinderOpen(true)}
                onSendQuickMessage={handleSendQuickMessage}
                computedRouteSummary={computedRouteSummary}
              />
            </React.Suspense>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: ADD MEMBER & SAFE ZONES (Loaded lazily on demand)                 */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <React.Suspense fallback={null}>
          <AddMapMemberModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddMember={handleAddMember}
            userLocation={userLocation}
          />
        </React.Suspense>
      )}

      {isZonesModalOpen && (
        <React.Suspense fallback={null}>
          <SafeZonesModal
            isOpen={isZonesModalOpen}
            onClose={() => setIsZonesModalOpen(false)}
            safeZones={safeZones}
            onAddSafeZone={handleAddSafeZone}
            userLocation={userLocation}
          />
        </React.Suspense>
      )}
    </div>
  );
};
