import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Radio,
  Command,
  History
} from 'lucide-react';
import { EcosystemMode, ActiveTab } from '../types';
import { ALL_ECOSYSTEM_MODES, EcosystemModeConfig, getEcosystemModeConfig } from '../data/ecosystemModes';
import { switchEcosystemMode, getPreviousEcosystemMode } from '../services/modeSyncService';
import { useModeBadges } from '../context/ModeBadgeContext';
import { useAuth } from '../context/AuthContext';

interface HaevyEcosystemQuickSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab | string) => void;
}

export function HaevyEcosystemQuickSwitcherModal({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}: HaevyEcosystemQuickSwitcherModalProps) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { getBadgeForMode } = useModeBadges();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMode = getPreviousEcosystemMode();

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter modes based on search query, category, and admin rights
  const filteredModes = useMemo(() => {
    return ALL_ECOSYSTEM_MODES.filter(m => {
      // Hide admin mode if not admin
      if (m.id === 'admin' && !isAdmin && !isSuperAdmin) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'spiritual' && m.category !== 'spiritual') return false;
        if (selectedCategory === 'family' && m.category !== 'family') return false;
        if (selectedCategory === 'finance' && m.category !== 'finance') return false;
        if (selectedCategory === 'ai_creative' && m.category !== 'ai' && m.category !== 'creative') return false;
        if (selectedCategory === 'audio' && m.category !== 'audio') return false;
        if (selectedCategory === 'social_games' && m.category !== 'social' && m.category !== 'games') return false;
      }

      // Filter by search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        m.name.toLowerCase().includes(q) ||
        m.shortName.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.englishName.toLowerCase().includes(q) ||
        m.categoryLabel.toLowerCase().includes(q) ||
        m.keywords.some(k => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory, isAdmin, isSuperAdmin]);

  if (!isOpen) return null;

  const handleSelect = (modeId: EcosystemMode, targetTab?: ActiveTab | string) => {
    switchEcosystemMode(modeId, targetTab, 'quick_switcher');
    onSelectMode(modeId, targetTab);
    onClose();
  };

  const currentModeConfig = getEcosystemModeConfig(currentMode);
  const CurrentIcon = currentModeConfig.icon;

  const categories = [
    { id: 'all', label: 'Tất cả phân hệ' },
    { id: 'spiritual', label: 'Tâm Linh & Tử Vi 🔮' },
    { id: 'family', label: 'Gia Phả Dòng Tộc 👑' },
    { id: 'finance', label: 'Thu Chi 6 Hũ 💰' },
    { id: 'ai_creative', label: 'AI & Sáng Tạo 🧠' },
    { id: 'audio', label: 'Âm Nhạc Hi-Fi 🎵' },
    { id: 'social_games', label: 'Cặp Đôi & Games 🎮' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 ring-1 ring-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-950 to-zinc-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${currentModeConfig.color} p-0.5 shrink-0 shadow-md`}>
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <CurrentIcon size={18} className={currentModeConfig.accentColor} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  Đồng Bộ Chuyển Phân Hệ
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                  {ALL_ECOSYSTEM_MODES.length} Phân Hệ
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                <span>Hiện tại:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {currentModeConfig.name}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Nhấn phím tắt Alt + M để mở nhanh</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {previousMode && previousMode !== currentMode && (
              <button
                type="button"
                onClick={() => handleSelect(previousMode)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                title={`Quay lại: ${getEcosystemModeConfig(previousMode).name}`}
              >
                <History size={13} className="text-amber-400" />
                <span>Quay lại</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
              title="Đóng bảng chuyển chế độ (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/40 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phân hệ (VD: Tarot, Tử vi, Gia phả, Thu chi, AI, Audio)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modes Grid / List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
          {filteredModes.map((mode) => {
            const isCurrent = mode.id === currentMode;
            const Icon = mode.icon;
            const badgeCount = getBadgeForMode(mode.id);

            return (
              <div
                key={mode.id}
                id={`quick-switcher-card-${mode.id}`}
                onClick={() => handleSelect(mode.id)}
                className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden text-left select-none ${
                  isCurrent
                    ? 'bg-zinc-900/90 border-amber-400/90 ring-1 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 shadow-sm'
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${mode.color} p-0.5 shrink-0 shadow-md`}>
                        <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                          <Icon size={18} className={mode.accentColor} />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors tracking-tight truncate">
                            {mode.name}
                          </h4>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Đang mở" />
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium truncate block">
                          {mode.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isCurrent ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-black border border-amber-300">
                          Đang hoạt động
                        </span>
                      ) : (
                        <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                          {mode.shortcut}
                        </kbd>
                      )}

                      {badgeCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-rose-500 text-white animate-pulse">
                          {badgeCount} mới
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed mb-2.5">
                    {mode.tagline}
                  </p>
                </div>

                {/* Subpages Quick Jump or Enter Button */}
                <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                    {mode.subPages?.slice(0, 2).map((sub) => (
                      <button
                        key={sub.tabKey + sub.title}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(mode.id, sub.tabKey);
                        }}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                        title={sub.desc}
                      >
                        {sub.title}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(mode.id)}
                    className={`text-[11px] font-bold flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg transition-all ${
                      isCurrent
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-zinc-300 group-hover:text-white group-hover:bg-zinc-800'
                    }`}
                  >
                    <span>{isCurrent ? 'Đang xem' : 'Mở phân hệ'}</span>
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredModes.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-400">
              <Search size={32} className="mx-auto mb-2 text-zinc-600 opacity-50" />
              <p className="text-sm font-semibold text-zinc-300">Không tìm thấy phân hệ nào phù hợp</p>
              <p className="text-xs text-zinc-500 mt-1">Vui lòng thử từ khóa khác như "Tarot", "Gia phả", "AI", "Audio", "Thu chi"...</p>
            </div>
          )}
        </div>

        {/* Footer info & shortcut guidelines */}
        <div className="p-3 sm:p-3.5 border-t border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Sparkles size={12} />
              Đồng bộ tức thì 13 phân hệ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Phím tắt:</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-300">Alt + M</kbd>
            <span className="text-zinc-600">|</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-300">ESC đóng</kbd>
          </div>
        </div>

      </div>
    </div>
  );
}
