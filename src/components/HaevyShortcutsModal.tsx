import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  X, 
  Sparkles, 
  Wallet, 
  Layers, 
  Plus, 
  Moon, 
  Music, 
  BrainCircuit, 
  Sun, 
  Heart, 
  Mic, 
  Gamepad2, 
  Crown, 
  Maximize, 
  Volume2, 
  Sliders, 
  PiggyBank, 
  Users, 
  Calculator, 
  Compass, 
  Search, 
  RotateCcw, 
  Check, 
  Edit3, 
  SlidersHorizontal, 
  CloudCheck, 
  Loader2, 
  Info,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShortcutItemConfig, ShortcutsConfig, ShortcutCategory } from '../types';
import { getShortcutDisplayKeys, DEFAULT_SHORTCUTS_CONFIG } from '../data/defaultShortcuts';
import { haptics } from '../utils/haptics';

interface HaevyShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShortcutAction?: (action: string) => void;
}

export function HaevyShortcutsModal({
  isOpen,
  onClose,
  onSelectShortcutAction
}: HaevyShortcutsModalProps) {
  const { 
    user, 
    shortcutsConfig, 
    isShortcutsSyncing, 
    updateSingleShortcut, 
    updateShortcutsConfig, 
    resetShortcutsToDefault 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'view' | 'customize'>('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | 'all'>('all');
  
  // Key Recorder State
  const [recordingActionId, setRecordingActionId] = useState<string | null>(null);
  const [recordedDraft, setRecordedDraft] = useState<{
    code: string;
    keyChar: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    allowAltOrCtrl: boolean;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRecordingActionId(null);
      setRecordedDraft(null);
      setStatusMessage(null);
    }
  }, [isOpen]);

  // Handle physical key press when recording a new shortcut
  useEffect(() => {
    if (!recordingActionId) return;

    const handleRecordKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind purely solitary modifier key press
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;

      let keyChar = e.key;
      if (e.code.startsWith('Key')) {
        keyChar = e.code.replace('Key', '');
      } else if (e.code.startsWith('Digit')) {
        keyChar = e.code.replace('Digit', '');
      } else if (e.code === 'Space') {
        keyChar = 'Space';
      } else if (e.code === 'Escape') {
        keyChar = 'Esc';
      } else if (e.code === 'ArrowRight') {
        keyChar = '→';
      } else if (e.code === 'ArrowLeft') {
        keyChar = '←';
      } else if (e.code === 'ArrowUp') {
        keyChar = '↑';
      } else if (e.code === 'ArrowDown') {
        keyChar = '↓';
      }

      setRecordedDraft({
        code: e.code,
        keyChar: keyChar.toUpperCase(),
        ctrlKey: isCtrlOrMeta,
        altKey: isAlt,
        shiftKey: isShift,
        allowAltOrCtrl: false
      });
      haptics.impact('medium');
    };

    window.addEventListener('keydown', handleRecordKey, { capture: true });
    return () => window.removeEventListener('keydown', handleRecordKey, { capture: true });
  }, [recordingActionId]);

  if (!isOpen) return null;

  const currentConfig: ShortcutsConfig = shortcutsConfig || DEFAULT_SHORTCUTS_CONFIG;
  const configList = Object.values(currentConfig);

  // Group config items by category
  const categories: Array<{ id: ShortcutCategory | 'all'; label: string; icon: any; count: number }> = [
    { id: 'all', label: 'Tất Cả', icon: Layers, count: configList.length },
    { id: 'navigation', label: 'Chuyển Chế Độ', icon: Sparkles, count: configList.filter(i => i.category === 'navigation').length },
    { id: 'finance', label: 'Haevy Finance', icon: Wallet, count: configList.filter(i => i.category === 'finance').length },
    { id: 'media', label: 'Trình Phát Nhạc', icon: Music, count: configList.filter(i => i.category === 'media').length },
    { id: 'system', label: 'Hệ Thống', icon: Sliders, count: configList.filter(i => i.category === 'system').length },
  ];

  const filteredItems = configList.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = searchQuery.trim() === '' || 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSaveRecording = async (actionId: string) => {
    if (!recordedDraft) return;
    haptics.impact('heavy');
    const res = await updateSingleShortcut(actionId, {
      code: recordedDraft.code,
      keyChar: recordedDraft.keyChar,
      ctrlKey: recordedDraft.ctrlKey,
      altKey: recordedDraft.altKey,
      shiftKey: recordedDraft.shiftKey,
      allowAltOrCtrl: recordedDraft.allowAltOrCtrl,
      enabled: true,
      isCustomized: true
    });

    if (res.success) {
      setStatusMessage({ text: 'Đã lưu và đồng bộ phím tắt thành công lên đám mây!', type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setRecordingActionId(null);
    setRecordedDraft(null);
  };

  const handleToggleEnable = async (item: ShortcutItemConfig) => {
    haptics.impact('light');
    const res = await updateSingleShortcut(item.id, {
      enabled: !item.enabled
    });
    if (res.success) {
      setStatusMessage({ 
        text: item.enabled ? `Đã tắt phím tắt "${item.label}"` : `Đã bật phím tắt "${item.label}"`, 
        type: 'info' 
      });
    }
  };

  const handleResetSingle = async (actionId: string) => {
    const defaultItem = DEFAULT_SHORTCUTS_CONFIG[actionId];
    if (!defaultItem) return;
    haptics.impact('medium');
    const res = await updateSingleShortcut(actionId, {
      ...defaultItem,
      isCustomized: false
    });
    if (res.success) {
      setStatusMessage({ text: `Đã khôi phục mặc định cho "${defaultItem.label}"`, type: 'success' });
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('Bạn có chắc muốn khôi phục toàn bộ phím tắt về mặc định ban đầu?')) {
      haptics.warning();
      const res = await resetShortcutsToDefault();
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
      }
    }
  };

  const getActionIcon = (action: string) => {
    if (action.startsWith('mode_space')) return Sparkles;
    if (action.startsWith('mode_finance') || action.startsWith('finance_')) return Wallet;
    if (action.startsWith('mode_haevy_ai')) return BrainCircuit;
    if (action.startsWith('mode_morning')) return Sun;
    if (action.startsWith('mode_spiritual')) return Moon;
    if (action.startsWith('mode_couple') || action === 'finance_family') return Heart;
    if (action.startsWith('mode_studio')) return Mic;
    if (action.startsWith('mode_games')) return Gamepad2;
    if (action.startsWith('mode_vip')) return Crown;
    if (action.startsWith('mode_portal')) return Compass;
    if (action.startsWith('media_')) return Music;
    return Keyboard;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
              <Keyboard size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Trung Tâm Phím Tắt Toàn Cục Haevy
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {isShortcutsSyncing ? (
                    <>
                      <Loader2 size={11} className="animate-spin text-emerald-400" />
                      <span>Đang đồng bộ Firestore...</span>
                    </>
                  ) : (
                    <>
                      <CloudCheck size={12} className="text-emerald-400" />
                      <span>Đồng bộ thời gian thực {user ? `(${user.email || 'Đã đăng nhập'})` : '(Cục bộ)'}</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Điều khiển bàn phím siêu tốc & Tùy biến phím tắt cá nhân hóa lưu trên đám mây
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Tab switcher */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
              <button
                onClick={() => {
                  haptics.selection();
                  setActiveTab('view');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'view' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Bảng Phím Tắt
              </button>
              <button
                onClick={() => {
                  haptics.selection();
                  setActiveTab('customize');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'customize' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 shadow-md font-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Tùy Chỉnh Phím</span>
              </button>
            </div>

            <button
              onClick={() => {
                haptics.impact('light');
                onClose();
              }}
              className="w-9 h-9 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className={`px-5 py-2 text-xs flex items-center justify-between border-b ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
              : statusMessage.type === 'error'
              ? 'bg-red-500/10 text-red-300 border-red-500/20'
              : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles size={13} />
              <span>{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)}
              className="text-zinc-400 hover:text-white text-xs underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    haptics.selection();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm phím tắt hoặc mô tả..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {activeTab === 'customize' && (
              <button
                onClick={handleResetAll}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Khôi phục tất cả phím tắt về mặc định"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          {activeTab === 'view' ? (
            /* ================= VIEW TAB ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map(item => {
                const Icon = getActionIcon(item.action);
                const displayKeys = getShortcutDisplayKeys(item);
                const isCustomized = Boolean(item.isCustomized);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.action && onSelectShortcutAction && item.enabled) {
                        haptics.impact('light');
                        onSelectShortcutAction(item.action);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border transition-all cursor-pointer group ${
                      !item.enabled
                        ? 'opacity-40 bg-zinc-900/30 border-zinc-900'
                        : item.action === 'finance_jars'
                        ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-purple-500/40 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        item.action === 'finance_jars' 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-zinc-200 group-hover:text-white truncate">
                            {item.label}
                          </p>
                          {isCustomized && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Đã tùy chỉnh
                            </span>
                          )}
                          {!item.enabled && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-500">
                              Đã tắt
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {displayKeys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className={`px-2 py-1 rounded-lg text-[11px] font-black font-mono shadow-sm border ${
                            item.action === 'finance_jars'
                              ? 'bg-amber-400 text-zinc-950 border-amber-300'
                              : 'bg-zinc-950 text-purple-300 border-zinc-700 group-hover:border-purple-400'
                          }`}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= CUSTOMIZE TAB ================= */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Nhấn <strong>"Ghi phím mới"</strong> trên bất kỳ phím tắt nào, sau đó gõ tổ hợp phím trên bàn phím vật lý của bạn (VD: <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono text-[10px]">Ctrl + Shift + G</kbd> hoặc <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono text-[10px]">Alt + 1</kbd>). Cấu hình sẽ tự động đồng bộ lên tài khoản Firestore của bạn trong thời gian thực.
                </p>
              </div>

              <div className="space-y-2.5">
                {filteredItems.map(item => {
                  const Icon = getActionIcon(item.action);
                  const isRecording = recordingActionId === item.id;
                  const displayKeys = isRecording && recordedDraft 
                    ? getShortcutDisplayKeys({
                        ...item,
                        code: recordedDraft.code,
                        keyChar: recordedDraft.keyChar,
                        ctrlKey: recordedDraft.ctrlKey,
                        altKey: recordedDraft.altKey,
                        shiftKey: recordedDraft.shiftKey,
                        allowAltOrCtrl: recordedDraft.allowAltOrCtrl
                      })
                    : getShortcutDisplayKeys(item);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isRecording
                          ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/20'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white truncate">
                              {item.label}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-semibold">
                              {item.category}
                            </span>
                            {item.isCustomized && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Đã sửa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right side controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        {/* Current key display */}
                        <div className="flex items-center gap-1">
                          {isRecording ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 text-xs font-bold animate-pulse">
                              <Radio size={12} className="animate-spin text-purple-400" />
                              <span>{recordedDraft ? displayKeys.join(' + ') : 'Hãy nhấn phím trên bàn phím...'}</span>
                            </div>
                          ) : (
                            displayKeys.map((k, kIdx) => (
                              <kbd
                                key={kIdx}
                                className="px-2 py-1 rounded-lg text-xs font-black font-mono bg-zinc-950 text-purple-300 border border-zinc-700 shadow-sm"
                              >
                                {k}
                              </kbd>
                            ))
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {isRecording ? (
                            <>
                              <button
                                onClick={() => handleSaveRecording(item.id)}
                                disabled={!recordedDraft}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                              >
                                <Check size={13} />
                                <span>Lưu Phím</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRecordingActionId(null);
                                  setRecordedDraft(null);
                                }}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  haptics.selection();
                                  setRecordingActionId(item.id);
                                  setRecordedDraft(null);
                                }}
                                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Edit3 size={12} />
                                <span>Ghi phím</span>
                              </button>

                              {item.isCustomized && (
                                <button
                                  onClick={() => handleResetSingle(item.id)}
                                  className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
                                  title="Đặt lại phím này về mặc định"
                                >
                                  <RotateCcw size={13} />
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleEnable(item)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                  item.enabled
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                                }`}
                                title={item.enabled ? 'Đang bật - Nhấn để tắt' : 'Đang tắt - Nhấn để bật'}
                              >
                                {item.enabled ? 'Bật' : 'Tắt'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>Phím tắt hoạt động mọi lúc (trừ khi đang nhập văn bản trong ô gõ).</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold border border-zinc-700 cursor-pointer transition-colors"
            >
              Đóng (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
