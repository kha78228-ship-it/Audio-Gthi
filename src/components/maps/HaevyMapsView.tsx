import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Heart, 
  Users, 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  UserPlus, 
  Layers, 
  Crosshair, 
  Battery, 
  BatteryCharging, 
  Clock, 
  Navigation, 
  Phone, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Search,
  CheckCircle2,
  Share2,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { MapMember, SafeZone } from '../../types';
import { DEFAULT_MEMBERS, DEFAULT_SAFE_ZONES } from '../../data/defaultMapsData';
import { HaevyLeafletMap } from './HaevyLeafletMap';
import { HaevyMapMemberDetailModal } from './HaevyMapMemberDetailModal';
import { AddMapMemberModal } from './AddMapMemberModal';
import { SafeZonesModal } from './SafeZonesModal';
import { calculateDistanceKm, formatDistance } from '../../utils/mapsUtils';

export const HaevyMapsView: React.FC = () => {
  // User Location State (Default: Central Saigon, updated via Geolocation)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 10.7769,
    lng: 106.7009
  });
  const [locationError, setLocationError] = useState<string | null>(null);
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

  // UI States
  const [filterCategory, setFilterCategory] = useState<'all' | 'couple' | 'family' | 'friend'>('all');
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [selectedMember, setSelectedMember] = useState<MapMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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
        (err) => {
          // Fallback to default Saigon center gracefully
          setLocationError('Không thể lấy tọa độ GPS thực tế. Đang dùng tọa độ mẫu TP.HCM.');
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

  // Handle Heart Ping animation
  const handleSendHeart = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, heartbeatsSent: (m.heartbeatsSent || 0) + 1 }
          : m
      )
    );

    // Spawn floating heart particles
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
    // Play subtle audio chirp if Web Audio is supported
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

  const handleTriggerSOS = () => {
    const alertMsg = '🚨 BÁO ĐỘNG KHẨN CẤP SOS: Đã phát thông báo vị trí chính xác của bạn đến tất cả người thân & bạn đời!';
    setSosAlertNotice(alertMsg);
    setTimeout(() => {
      setSosAlertNotice(null);
    }, 6000);
  };

  const handleAddMember = (newMember: MapMember) => {
    setMembers((prev) => [newMember, ...prev]);
    setSelectedMember(newMember);
  };

  const handleAddSafeZone = (newZone: SafeZone) => {
    setSafeZones((prev) => [...prev, newZone]);
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

      {/* SOS Alert Banner */}
      {sosAlertNotice && (
        <div className="absolute top-2 inset-x-4 md:inset-x-20 z-50 p-3 rounded-2xl bg-red-600/95 text-white font-bold text-xs md:text-sm text-center shadow-2xl border border-red-400 flex items-center justify-center gap-2 animate-bounce">
          <AlertTriangle size={18} className="text-yellow-300" />
          <span>{sosAlertNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS BAR                                                   */}
      {/* ========================================================================= */}
      <div className="h-14 px-3 md:px-5 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
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
                Live GPS
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-zinc-400 truncate">
              Bản đồ định vị thời gian thực kết nối Bạn đời & Gia đình thân yêu
            </p>
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Layer Selector */}
          <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5">
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
      {/* MAIN SPLIT VIEW (SIDEBAR MEMBERS + INTERACTIVE LEAFLET MAP)                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        
        {/* ======================== */}
        {/* LEFT / MOBILE SHEET LIST */}
        {/* ======================== */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950 flex flex-col shrink-0 z-10 max-h-[35vh] md:max-h-full">
          {/* User Self-Status Bar */}
          <div className="p-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-extrabold text-xs">
                  BẠN
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-900" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <span>Vị Trí Của Bạn</span>
                  <span className="text-[10px] text-emerald-400 font-medium">● Đang trực tuyến</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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
              <span>Bạn Đời ({coupleMembers.length})</span>
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
              Bạn Bè
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

                      {/* Small role symbol */}
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

                  {/* Heart button for quick love ping */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isLover ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendHeart(member.id);
                        }}
                        className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 hover:text-rose-200 border border-rose-500/40 flex items-center justify-center transition-all cursor-pointer active:scale-125"
                        title="Bắn tim yêu thương"
                      >
                        <Heart size={15} className="fill-rose-400" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRingPing(member.id);
                        }}
                        className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                        title="Rung chuông tìm kiếm"
                      >
                        <ChevronRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================== */}
        {/* RIGHT / MAIN MAP CANVAS  */}
        {/* ======================== */}
        <div className="flex-1 relative h-full">
          <HaevyLeafletMap
            userLocation={userLocation}
            members={members}
            selectedMemberId={selectedMember?.id || null}
            onSelectMember={(m) => setSelectedMember(m)}
            safeZones={safeZones}
            mapStyle={mapStyle}
            isLiveTracking={isSharingLocation}
            filterCategory={filterCategory}
          />

          {/* Floating Map Re-center Floating Action Button */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRecenterUser}
              className="w-10 h-10 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
              title="Về vị trí của tôi"
            >
              <Crosshair size={18} className={isLocating ? 'animate-spin text-emerald-400' : ''} />
            </button>

            {/* Mobile Layer Toggle */}
            <button
              type="button"
              onClick={() => {
                setMapStyle((prev) => (prev === 'dark' ? 'satellite' : prev === 'satellite' ? 'street' : 'dark'));
              }}
              className="sm:hidden w-10 h-10 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer"
              title="Đổi lớp bản đồ"
            >
              <Layers size={18} />
            </button>
          </div>

          {/* Floating Selected Member Detail Drawer / Card */}
          <HaevyMapMemberDetailModal
            member={selectedMember}
            userLocation={userLocation}
            safeZones={safeZones}
            onClose={() => setSelectedMember(null)}
            onSendHeart={handleSendHeart}
            onRingPing={handleRingPing}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: ADD MEMBER & SAFE ZONES                                           */}
      {/* ========================================================================= */}
      <AddMapMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
        userLocation={userLocation}
      />

      <SafeZonesModal
        isOpen={isZonesModalOpen}
        onClose={() => setIsZonesModalOpen(false)}
        safeZones={safeZones}
        onAddSafeZone={handleAddSafeZone}
        userLocation={userLocation}
      />
    </div>
  );
};
