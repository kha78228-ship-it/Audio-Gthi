import React, { useState } from 'react';
import { X, ShieldCheck, Plus, MapPin, Home, Briefcase, GraduationCap, Cross, Check } from 'lucide-react';
import { SafeZone, SafeZoneType } from '../../types';

interface SafeZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  safeZones: SafeZone[];
  onAddSafeZone: (zone: SafeZone) => void;
  userLocation: { lat: number; lng: number };
}

export const SafeZonesModal: React.FC<SafeZonesModalProps> = ({
  isOpen,
  onClose,
  safeZones,
  onAddSafeZone,
  userLocation
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<SafeZoneType>('home');
  const [radius, setRadius] = useState(250);
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let color = '#10b981'; // emerald
    if (type === 'work') color = '#3b82f6'; // blue
    if (type === 'school') color = '#f59e0b'; // amber
    if (type === 'hospital') color = '#ef4444'; // red

    const newZone: SafeZone = {
      id: `zone-${Date.now()}`,
      name: name.trim(),
      type,
      icon: type === 'home' ? 'Home' : type === 'work' ? 'Briefcase' : 'GraduationCap',
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      radiusMeters: radius,
      address: address.trim() || 'Vị trí hiện tại của bạn',
      color
    };

    onAddSafeZone(newZone);
    setIsAdding(false);
    setName('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Vùng An Toàn & Hàng Rào Địa Lý (Geofencing)</h3>
              <p className="text-[11px] text-zinc-400">Nhận thông báo tự động khi người thân đến hoặc rời đi</p>
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

        <div className="p-4 max-h-[75vh] overflow-y-auto">
          {!isAdding ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-300">Danh Sách Vùng Thiết Lập ({safeZones.length})</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Tạo Vùng Mới</span>
                </button>
              </div>

              {safeZones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 flex items-start gap-3 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.type === 'home' && <Home size={18} />}
                    {zone.type === 'work' && <Briefcase size={18} />}
                    {zone.type === 'school' && <GraduationCap size={18} />}
                    {zone.type === 'hospital' && <Cross size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100">{zone.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-semibold">
                        Bán kính {zone.radiusMeters}m
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 truncate">{zone.address}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Tên Vùng An Toàn:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nhà bà ngoại, Lớp học thêm..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Loại Địa Điểm:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'home', label: 'Nhà riêng', icon: Home },
                    { id: 'work', label: 'Công ty', icon: Briefcase },
                    { id: 'school', label: 'Trường học', icon: GraduationCap },
                    { id: 'hospital', label: 'Y tế', icon: Cross }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as SafeZoneType)}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                        type === item.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <item.icon size={16} />
                      <span className="text-[10px] font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
                  <span>Bán Kính Quanh Vị Trí:</span>
                  <span className="text-emerald-400 font-bold">{radius} mét</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={800}
                  step={50}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Địa Chỉ Mô Tả:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: 123 Nguyễn Thị Minh Khai, Quận 1"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
                >
                  Xác Nhận Lưu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
