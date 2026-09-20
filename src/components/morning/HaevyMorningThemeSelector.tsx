import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, Sparkles, X, Sliders, ChevronDown } from 'lucide-react';
import { useHaevyMood } from '../../context/HaevyMoodContext';
import { MorningColorThemeId, MorningColorThemeConfig } from '../../types';

interface HaevyMorningThemeSelectorProps {
  compact?: boolean;
}

export function HaevyMorningThemeSelector({ compact = false }: HaevyMorningThemeSelectorProps) {
  const { morningTheme, setMorningTheme, morningThemeConfig, availableMorningThemes } = useHaevyMood();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/80 text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-md"
        style={{
          boxShadow: `0 0 12px ${morningThemeConfig.accentGlow}`
        }}
        title="Chọn tông màu & năng lượng tâm trạng buổi sáng"
      >
        <span className="text-sm">{morningThemeConfig.iconEmoji}</span>
        <span className="hidden sm:inline text-zinc-300 font-medium">Tâm Trạng:</span>
        <span 
          className="font-bold max-w-[130px] truncate"
          style={{ color: morningThemeConfig.accentColor }}
        >
          {morningThemeConfig.name}
        </span>
        <ChevronDown size={13} className="text-zinc-400 shrink-0" />
      </button>

      {/* Theme Selector Popover / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
              onClick={() => setIsOpen(false)} 
            />

            {/* Menu Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-[320px] sm:w-[380px] rounded-3xl bg-zinc-950/95 border border-zinc-700/90 shadow-2xl p-4 z-50 backdrop-blur-2xl overflow-hidden"
              style={{
                boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 25px ${morningThemeConfig.accentGlow}`
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-inner"
                    style={{ 
                      backgroundColor: morningThemeConfig.badgeBg,
                      color: morningThemeConfig.accentColor 
                    }}
                  >
                    <Palette size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Tông Màu & Năng Lượng Sáng
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      Tùy chỉnh sắc độ nền kính mờ (Glassmorphism)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Theme Options Grid */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {availableMorningThemes.map((theme: MorningColorThemeConfig) => {
                  const isSelected = morningTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setMorningTheme(theme.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-900/90 shadow-md'
                          : 'bg-zinc-900/40 hover:bg-zinc-900/70 border-zinc-800/60'
                      }`}
                      style={{
                        borderColor: isSelected ? theme.accentColor : undefined,
                        boxShadow: isSelected ? `0 0 16px ${theme.accentGlow}` : undefined
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Swatch Pill */}
                        <div 
                          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm shadow-inner mt-0.5 border"
                          style={{
                            background: theme.cardBgGradient,
                            borderColor: theme.cardBorderColor
                          }}
                        >
                          {theme.iconEmoji}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-xs font-black tracking-tight"
                              style={{ color: isSelected ? theme.accentColor : '#f4f4f5' }}
                            >
                              {theme.name}
                            </span>
                            <span 
                              className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                              style={{
                                backgroundColor: theme.badgeBg,
                                color: theme.badgeText,
                                borderColor: theme.cardBorderColor
                              }}
                            >
                              {theme.energyLevel}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-snug mt-1 line-clamp-2">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      {/* Selection Checkmark */}
                      <div className="shrink-0 mt-1">
                        {isSelected ? (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-black shadow-sm"
                            style={{ backgroundColor: theme.accentColor }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/50" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Tự động lưu vào tài khoản</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {morningThemeConfig.vietnameseTitle}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
