import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Check, 
  Lock, 
  Gift, 
  Sun, 
  Award, 
  Heart,
  Palette,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SunStudyState, SunShopItem } from '../../../services/sunStudyStorageService';

interface SunStudyShopProps {
  state: SunStudyState;
  onUpdateState: (updater: (prev: SunStudyState) => SunStudyState) => void;
  onTriggerToast?: (message: string) => void;
}

export function SunStudyShop({ state, onUpdateState, onTriggerToast }: SunStudyShopProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'avatar_frame' | 'desk_pet' | 'desk_theme' | 'title'>('all');

  const handleBuyOrEquip = (item: SunShopItem) => {
    if (item.unlocked) {
      // Toggle equip
      onUpdateState(prev => {
        let updatedDeskTheme = prev.deskTheme;
        let updatedPet = prev.activePet;
        let updatedFrame = prev.activeFrame;
        let updatedTitle = prev.activeTitle;

        if (item.category === 'desk_theme') updatedDeskTheme = item.id;
        else if (item.category === 'desk_pet') updatedPet = item.id;
        else if (item.category === 'avatar_frame') updatedFrame = item.id;
        else if (item.category === 'title') updatedTitle = item.id;

        const updatedShop = prev.shopItems.map(si => {
          if (si.category === item.category) {
            return { ...si, equipped: si.id === item.id };
          }
          return si;
        });

        return {
          ...prev,
          deskTheme: updatedDeskTheme,
          activePet: updatedPet,
          activeFrame: updatedFrame,
          activeTitle: updatedTitle,
          shopItems: updatedShop
        };
      });

      if (onTriggerToast) onTriggerToast(`Đã trang bị "${item.name}" thành công! ✨`);
      return;
    }

    // Buying with Sun Coins
    if (state.sunCoins < item.price) {
      alert(`Bạn còn thiếu ${item.price - state.sunCoins} Hạt Nắng ☀️ nữa để mở khóa vật phẩm này. Hãy chăm chỉ học bài và làm nhiệm vụ nhé!`);
      return;
    }

    onUpdateState(prev => {
      const updatedShop = prev.shopItems.map(si => {
        if (si.id === item.id) {
          return { ...si, unlocked: true, equipped: true };
        }
        if (si.category === item.category) {
          return { ...si, equipped: false };
        }
        return si;
      });

      let updatedDeskTheme = prev.deskTheme;
      let updatedPet = prev.activePet;
      let updatedFrame = prev.activeFrame;
      let updatedTitle = prev.activeTitle;

      if (item.category === 'desk_theme') updatedDeskTheme = item.id;
      else if (item.category === 'desk_pet') updatedPet = item.id;
      else if (item.category === 'avatar_frame') updatedFrame = item.id;
      else if (item.category === 'title') updatedTitle = item.id;

      return {
        ...prev,
        sunCoins: prev.sunCoins - item.price,
        deskTheme: updatedDeskTheme,
        activePet: updatedPet,
        activeFrame: updatedFrame,
        activeTitle: updatedTitle,
        shopItems: updatedShop
      };
    });

    if (onTriggerToast) onTriggerToast(`Mở khóa thành công "${item.name}"! (-${item.price} ☀️)`);
  };

  const filteredItems = state.shopItems.filter(i => {
    if (activeCategory === 'all') return true;
    return i.category === activeCategory;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Shop Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shadow-inner">
            🛍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Cửa Hàng Đổi Đồ Sun Shop</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 font-mono">
                Số Dư: {state.sunCoins} ☀️ Hạt Nắng
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Đổi điểm thưởng tự học lấy khung avatar, thú cưng bàn học và danh hiệu siêu dễ thương!
            </p>
          </div>
        </div>

        {/* Categories Tab Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'avatar_frame', label: '🖼️ Khung Avatar' },
            { id: 'desk_pet', label: '🐱 Thú Cưng Bàn' },
            { id: 'desk_theme', label: '🎨 Theme Bàn' },
            { id: 'title', label: '🏅 Danh Hiệu' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => {
          const isAffordable = state.sunCoins >= item.price;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all group ${
                item.equipped
                  ? 'bg-gradient-to-b from-amber-950/40 to-zinc-900 border-amber-500/50 shadow-xl shadow-amber-500/10'
                  : item.unlocked
                  ? 'bg-zinc-900/90 border-zinc-700/80'
                  : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Item Category & Status Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {item.category === 'avatar_frame' ? 'Khung Avatar' :
                     item.category === 'desk_pet' ? 'Thú Cưng' :
                     item.category === 'desk_theme' ? 'Theme Bàn' : 'Danh Hiệu'}
                  </span>

                  {item.equipped ? (
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Đang Dùng
                    </span>
                  ) : item.unlocked ? (
                    <span className="px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                      Đã Sở Hữu
                    </span>
                  ) : (
                    <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold font-mono border border-amber-500/20">
                      {item.price} ☀️
                    </span>
                  )}
                </div>

                {/* Big Visual Icon */}
                <div className="my-3 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white text-center">
                  {item.name}
                </h4>
                <p className="text-[11px] text-zinc-400 text-center mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                <button
                  onClick={() => handleBuyOrEquip(item)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    item.equipped
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                      : item.unlocked
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-black shadow-md'
                      : isAffordable
                      ? 'bg-amber-600 hover:bg-amber-500 text-white font-black shadow-lg shadow-amber-600/20'
                      : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                  }`}
                >
                  {item.equipped ? (
                    <>
                      <Check size={13} />
                      <span>Đang Sử Dụng</span>
                    </>
                  ) : item.unlocked ? (
                    <span>Trang Bị Ngay</span>
                  ) : (
                    <>
                      <Sun size={13} />
                      <span>Đổi ({item.price} ☀️)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
