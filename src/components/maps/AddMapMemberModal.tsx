import React, { useState } from 'react';
import { X, UserPlus, Heart, Users, Sparkles, MapPin, Phone, Shield } from 'lucide-react';
import { MapMember, MapMemberRole, MapMemberCategory } from '../../types';

interface AddMapMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: MapMember) => void;
  userLocation: { lat: number; lng: number };
}

const AVATAR_PRESETS = [
  { label: 'Nữ trẻ trung', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Nam thanh lịch', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Phụ nữ trung niên', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { label: 'Nam trẻ trung', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Bé gái', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { label: 'Người cao tuổi', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
];

export const AddMapMemberModal: React.FC<AddMapMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  userLocation
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<MapMemberRole>('lover');
  const [phone, setPhone] = useState('');
  const [statusText, setStatusText] = useState('Đang chia sẻ vị trí cùng người thân');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let category: MapMemberCategory = 'family';
    let relLabel = 'Thành viên gia đình';

    if (role === 'lover') {
      category = 'couple';
      relLabel = 'Người yêu 💖';
    } else if (role === 'spouse') {
      category = 'couple';
      relLabel = 'Vợ / Chồng / Bạn đời 💍';
    } else if (role === 'family_parent') {
      category = 'family';
      relLabel = 'Bố / Mẹ 🌸';
    } else if (role === 'family_child') {
      category = 'family';
      relLabel = 'Con cái 🎒';
    } else if (role === 'family_sibling') {
      category = 'family';
      relLabel = 'Anh / Chị / Em 👫';
    } else if (role === 'family_grandparent') {
      category = 'family';
      relLabel = 'Ông / Bà 👴👵';
    } else {
      category = 'friend';
      relLabel = 'Bạn thân 🚀';
    }

    // Offset slightly from user location (~500m to 1.5km)
    const offsetLat = (Math.random() - 0.5) * 0.02;
    const offsetLng = (Math.random() - 0.5) * 0.02;

    const newMember: MapMember = {
      id: `member-${Date.now()}`,
      name: name.trim(),
      role,
      category,
      relationshipLabel: relLabel,
      avatar: selectedAvatar,
      latitude: userLocation.lat + offsetLat,
      longitude: userLocation.lng + offsetLng,
      battery: Math.floor(Math.random() * 40) + 60,
      isCharging: Math.random() > 0.6,
      statusText: statusText.trim() || 'Đang hoạt động trực tuyến',
      activity: 'still',
      speedKmh: 0,
      lastUpdated: 'Vừa xong',
      isSharingLiveLocation: true,
      phone: phone.trim() || undefined,
      heartbeatsSent: 0
    };

    onAddMember(newMember);
    onClose();
    setName('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Thêm Thành Viên Vào Haevy Maps</h3>
              <p className="text-[11px] text-zinc-400">Kết nối vị trí bạn đời, người yêu hoặc người nhà</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Relationship Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Mối Quan Hệ / Vai Trò:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('lover')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  role === 'lover'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-sm'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Heart size={16} className={role === 'lover' ? 'text-rose-400 fill-rose-400' : 'text-zinc-400'} />
                <div>
                  <div className="text-xs font-bold">Người Yêu 💖</div>
                  <div className="text-[10px] opacity-75">Tình nhân, bạn gái/trai</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('spouse')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  role === 'spouse'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-sm'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-base">💍</span>
                <div>
                  <div className="text-xs font-bold">Vợ / Chồng / Bạn Đời</div>
                  <div className="text-[10px] opacity-75">Gắn kết trọn đời</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('family_parent')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  role === 'family_parent'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users size={16} className={role === 'family_parent' ? 'text-amber-400' : 'text-zinc-400'} />
                <div>
                  <div className="text-xs font-bold">Bố / Mẹ 🌸</div>
                  <div className="text-[10px] opacity-75">Đấng sinh thành</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('family_child')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  role === 'family_child'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-base">🎒</span>
                <div>
                  <div className="text-xs font-bold">Con Cái / Bé Nhỏ</div>
                  <div className="text-[10px] opacity-75">Bảo vệ an toàn</div>
                </div>
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Tên Thành Viên / Biệt Danh:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bé Thảo, Mẹ Yêu, Bố Hùng..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Số Điện Thoại (Tùy chọn):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0988 123 456"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Trạng Thái Ban Đầu:
            </label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="VD: Đang ở nhà, Đang đi làm..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Avatar Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Chọn Ảnh Đại Diện:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(p.url)}
                  className={`w-11 h-11 rounded-full border-2 overflow-hidden shrink-0 transition-transform cursor-pointer ${
                    selectedAvatar === p.url ? 'border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30' : 'border-zinc-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <UserPlus size={16} />
              <span>Thêm Vào Bản Đồ Trực Tiếp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
