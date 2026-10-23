import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Battery, 
  BatteryCharging, 
  Navigation, 
  Phone, 
  Bell, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Activity, 
  Car, 
  Footprints, 
  Bike,
  Sparkles,
  Share2,
  Compass,
  Coffee,
  Send,
  Route as RouteIcon
} from 'lucide-react';
import { MapMember, SafeZone } from '../../types';
import { calculateDistanceKm, formatDistance, estimateTravelTime } from '../../utils/mapsUtils';
import { ComputedRouteSummary } from './HaevyGoogleMap';

interface HaevyMapMemberDetailModalProps {
  member: MapMember | null;
  userLocation: { lat: number; lng: number };
  safeZones: SafeZone[];
  onClose: () => void;
  onSendHeart: (memberId: string) => void;
  onRingPing: (memberId: string) => void;
  onStartLiveRoute?: (mode: 'DRIVING' | 'TWO_WHEELER' | 'WALKING') => void;
  onOpenStreetView?: (target: { lat: number; lng: number; title: string }) => void;
  onOpenMeetupFinder?: () => void;
  onSendQuickMessage?: (memberId: string, text: string) => void;
  computedRouteSummary?: ComputedRouteSummary | null;
}

const QUICK_LOVE_NOTES = [
  'Đang trên đường qua đón nè 🛵💨',
  'Nhớ giữ ấm và lái xe cẩn thận nhé 💖',
  'Mình hẹn nhau ở quán cà phê giữa đường nha ☕',
  'Khi nào tới nơi nhớ nhắn báo bình an nhé ✅',
  'Pin sắp yếu rồi, nhớ cắm sạc nha 🔋'
];

export const HaevyMapMemberDetailModal: React.FC<HaevyMapMemberDetailModalProps> = ({
  member,
  userLocation,
  safeZones,
  onClose,
  onSendHeart,
  onRingPing,
  onStartLiveRoute,
  onOpenStreetView,
  onOpenMeetupFinder,
  onSendQuickMessage,
  computedRouteSummary
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'message' | 'history'>('overview');
  const [heartCount, setHeartCount] = useState(member?.heartbeatsSent || 0);
  const [heartAnim, setHeartAnim] = useState(false);
  const [ringNotice, setRingNotice] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');

  if (!member) return null;

  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    member.latitude,
    member.longitude
  );
  const travelTimes = estimateTravelTime(distanceKm);

  const isLover = member.role === 'lover' || member.role === 'spouse';
  const isFamily = member.category === 'family';

  // Check if member is in safe zone
  const currentSafeZone = safeZones.find((z) => z.id === member.currentSafeZoneId);

  const handleHeartClick = () => {
    setHeartCount((prev) => prev + 1);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 1000);
    onSendHeart(member.id);
  };

  const handleRingClick = () => {
    setRingNotice(`Đã phát tín hiệu chuông định vị tới máy của ${member.name}!`);
    setTimeout(() => setRingNotice(null), 3000);
    onRingPing(member.id);
  };

  const handleSendNote = (text: string) => {
    if (!text.trim()) return;
    onSendQuickMessage?.(member.id, text.trim());
    setRingNotice(`💬 Đã gửi lời nhắn tới ${member.name}: "${text.trim()}"`);
    setCustomNote('');
    setTimeout(() => setRingNotice(null), 3500);
  };

  return (
    <div className="fixed inset-x-4 bottom-20 md:bottom-6 md:right-6 md:left-auto md:w-[400px] z-30 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header Accent Bar */}
      <div 
        className={`h-1.5 w-full ${
          isLover 
            ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400' 
            : isFamily 
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600'
            : 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500'
        }`} 
      />

      <div className="p-4">
        {/* Top bar with close button & category badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isLover 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : isFamily 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            }`}>
              {isLover ? '💖 Người Yêu / Bạn Đời' : isFamily ? '🏡 Gia Đình Thân Yêu' : '🚀 Bạn Bè Thân Thiết'}
            </span>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock size={10} />
              {member.lastUpdated}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Member Profile Main Block */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-full border-2 overflow-hidden shadow-lg ${
              isLover ? 'border-rose-400 shadow-rose-500/30' : isFamily ? 'border-amber-400 shadow-amber-500/20' : 'border-sky-400'
            }`}>
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            </div>

            {/* Battery tag on avatar */}
            <div className={`absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-700 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 text-[9px] font-bold shadow ${
              member.battery < 20 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {member.isCharging ? <BatteryCharging size={10} className="text-emerald-400" /> : <Battery size={10} />}
              <span>{member.battery}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100 truncate">{member.name}</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{member.relationshipLabel}</p>
            
            {/* Safe Zone or Activity status */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {currentSafeZone ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck size={11} />
                  {currentSafeZone.name}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                  <Activity size={10} className="text-amber-400" />
                  {member.activity === 'driving' ? `Đang di chuyển (${member.speedKmh} km/h)` : member.activity === 'walking' ? 'Đang đi bộ' : 'Đang ở vị trí cố định'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Bubble */}
        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-3 text-xs text-zinc-200 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-zinc-400 mb-0.5 font-medium">Trạng thái trực tiếp:</div>
            <div className="italic text-zinc-200">"{member.statusText}"</div>
          </div>
          {onOpenStreetView && (
            <button
              type="button"
              onClick={() =>
                onOpenStreetView({
                  lat: member.latitude,
                  lng: member.longitude,
                  title: `${member.name} (${member.relationshipLabel})`
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              title="Xem góc nhìn đường phố 360° nơi người thân đang đứng"
            >
              <Compass size={13} />
              <span>Xem 360°</span>
            </button>
          )}
        </div>

        {/* Distance & Transport Estimation Grid (Clickable to trigger Google Routes API) */}
        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60 mb-3 text-center">
          <div className="flex flex-col items-center justify-center p-1">
            <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
              <MapPin size={10} className="text-emerald-400" />
              <span>Khoảng cách</span>
            </div>
            <div className="text-xs font-extrabold text-zinc-100">
              {computedRouteSummary
                ? `${(computedRouteSummary.distanceMeters / 1000).toFixed(1)} km`
                : formatDistance(distanceKm)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartLiveRoute?.('TWO_WHEELER')}
            className="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-zinc-800/80 border-x border-zinc-800 transition-colors cursor-pointer"
            title="Vẽ lộ trình xe máy trên Google Maps"
          >
            <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
              <Bike size={10} className="text-sky-400" />
              <span>Xe máy (Chỉ đường)</span>
            </div>
            <div className="text-xs font-bold text-sky-300">~{travelTimes.motorcycleMin} phút</div>
          </button>

          <button
            type="button"
            onClick={() => onStartLiveRoute?.('DRIVING')}
            className="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Vẽ lộ trình ô tô trên Google Maps"
          >
            <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
              <Car size={10} className="text-amber-400" />
              <span>Ô tô (Chỉ đường)</span>
            </div>
            <div className="text-xs font-bold text-amber-300">~{travelTimes.drivingMin} phút</div>
          </button>
        </div>

        {/* Ring / Message Notification Toast */}
        {ringNotice && (
          <div className="mb-3 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs text-center font-medium">
            {ringNotice}
          </div>
        )}

        {/* Tab switcher: Overview vs Quick Note vs History */}
        <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tương Tác
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'message' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Nhắn Yêu Thương
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lộ Trình Hôm Nay
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-2">
            {/* Primary Couple Heart Ping Button */}
            {isLover ? (
              <button
                type="button"
                onClick={handleHeartClick}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer group active:scale-98"
              >
                <Heart size={16} className={`text-rose-200 fill-white transition-transform ${heartAnim ? 'scale-150 animate-ping' : 'group-hover:scale-115'}`} />
                <span>Gửi Nhịp Tim Yêu Thương ({heartCount})</span>
                <Sparkles size={12} className="text-amber-200" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleHeartClick}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-zinc-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Heart size={15} className="fill-zinc-950" />
                <span>Gửi Lời Hỏi Thăm Quan Tâm ({heartCount})</span>
              </button>
            )}

            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => onStartLiveRoute?.('TWO_WHEELER')}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RouteIcon size={14} className="text-emerald-400" />
                <span>Dẫn Đường</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenMeetupFinder?.()}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/40 text-zinc-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Coffee size={14} className="text-rose-400" />
                <span>Điểm Hẹn</span>
              </button>

              <button
                type="button"
                onClick={handleRingClick}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-500/40 text-zinc-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Bell size={14} className="text-sky-400" />
                <span>Rung Máy</span>
              </button>

              {member.phone ? (
                <a
                  href={`tel:${member.phone.replace(/\s+/g, '')}`}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-green-500/40 text-zinc-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Phone size={14} className="text-green-400" />
                  <span>Gọi Điện</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendNote('Mình đang chia sẻ vị trí trực tiếp với bạn nhé!')}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Share2 size={14} className="text-purple-400" />
                  <span>Chia Sẻ</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'message' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LOVE_NOTES.map((note, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendNote(note)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  {note}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendNote(customNote)}
                placeholder={`Nhắn nhanh tới ${member.name}...`}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSendNote(customNote)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send size={13} />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          /* History Breadcrumbs */
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {member.routeHistory && member.routeHistory.length > 0 ? (
              member.routeHistory.map((step, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 text-xs p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-zinc-200">{step.address || 'Điểm dừng'}</div>
                      <div className="text-[10px] text-zinc-400">{step.time}</div>
                    </div>
                  </div>
                  {onOpenStreetView && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenStreetView({
                          lat: step.lat,
                          lng: step.lng,
                          title: step.address || 'Điểm dừng'
                        })
                      }
                      className="text-[10px] text-sky-400 hover:underline shrink-0 cursor-pointer"
                    >
                      360°
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-zinc-400">
                Chưa có dữ liệu lịch trình mới hôm nay.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
