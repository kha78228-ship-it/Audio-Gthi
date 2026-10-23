import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  BookOpen, 
  Clock, 
  Trophy, 
  Flame, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Gift, 
  MessageSquare, 
  Wind, 
  ShoppingBag,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  loadSunStudyState, 
  saveSunStudyState, 
  SunStudyState, 
  getRankTierForPoints 
} from '../../../services/sunStudyStorageService';
import { SunStudyDesk } from './SunStudyDesk';
import { SunStudyRooms } from './SunStudyRooms';
import { SunStudyTasks } from './SunStudyTasks';
import { SunStudyKPI } from './SunStudyKPI';
import { SunStudyCountdown } from './SunStudyCountdown';
import { SunStudyRanking } from './SunStudyRanking';
import { SunStudyShop } from './SunStudyShop';
import { SunStudyCommunity } from './SunStudyCommunity';
import { SunStudyStressRelief } from './SunStudyStressRelief';

interface SunStudyAppViewProps {
  onBackToEduRoot?: () => void;
  onJumpToExamPrep?: () => void;
  onJumpToAiAssistant?: () => void;
}

export function SunStudyAppView({ onBackToEduRoot, onJumpToExamPrep, onJumpToAiAssistant }: SunStudyAppViewProps) {
  const [state, setState] = useState<SunStudyState>(() => loadSunStudyState());
  
  // 4 Main Zones:
  // 1. 'study_zone' (Khu học tập: Bàn học cá nhân, Phòng học chung, To-do list, Thống kê KPI)
  // 2. 'countdown' (Áp lực thời gian: Đồng hồ đếm ngược Thi Cấp 3, THPTQG, ĐGNL)
  // 3. 'competition' (Hệ thống thi đấu: Bảng xếp hạng, Cày rank, Đua top nhóm, Cửa hàng đổi đồ)
  // 4. 'community' (Sự kiện & Giao lưu: Box cộng đồng, Trạm xả stress)
  const [activeZone, setActiveZone] = useState<'study_zone' | 'countdown' | 'competition' | 'community'>('study_zone');

  // Sub-tabs within Study Zone: 'desk' | 'rooms' | 'tasks' | 'kpi'
  const [studySubTab, setStudySubTab] = useState<'desk' | 'rooms' | 'tasks' | 'kpi'>('desk');

  // Sub-tabs within Competition Zone: 'ranking' | 'shop'
  const [competitionSubTab, setCompetitionSubTab] = useState<'ranking' | 'shop'>('ranking');

  // Sub-tabs within Community Zone: 'box' | 'stress'
  const [communitySubTab, setCommunitySubTab] = useState<'box' | 'stress'>('box');

  // Toast notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveSunStudyState(state);
  }, [state]);

  const handleUpdateState = (updater: (prev: SunStudyState) => SunStudyState) => {
    setState(prev => {
      const next = updater(prev);
      saveSunStudyState(next);
      return next;
    });
  };

  const handleTriggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRecordStudyTime = (minutes: number) => {
    handleUpdateState(prev => ({
      ...prev,
      todayStudyMinutes: prev.todayStudyMinutes + minutes
    }));
    handleTriggerToast(`+${minutes} phút học tập ghi nhận vào bảng KPI! 🎉`);
  };

  const currentRank = getRankTierForPoints(state.sunXp);

  return (
    <div className="w-full flex flex-col gap-4 animate-fadeIn pb-12">
      {/* Sun Study App Brand Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950/70 via-orange-950/60 to-zinc-950 border border-amber-500/30 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sun size={13} className="animate-spin-slow" />
                <span>Sun Study App</span>
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Kỷ Luật & Tự Học</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-emerald-400 font-mono font-bold">100% Miễn Phí</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Không Gian Học Tập Sun Study</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PRO v4.0
              </span>
            </h2>

            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Bàn học Pomodoro cá nhân, nhạc tập trung tải lên trực tiếp, phòng học chung, To-do list & KPI, đếm ngược ngày thi và hệ thống cày rank Hạt Nắng.
            </p>
          </div>

          {/* Student Status Quick Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950/90 p-1.5 sm:p-2 rounded-xl border border-zinc-800/80 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/20">
              <span className="text-sm">☀️</span>
              <div>
                <div className="text-[9px] text-zinc-400 font-bold uppercase">Hạt Nắng</div>
                <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">{state.sunCoins}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80">
              <span className="text-sm">{currentRank.icon}</span>
              <div>
                <div className="text-[9px] text-zinc-400 font-bold uppercase">{currentRank.badge}</div>
                <div className="text-xs font-black text-white">{state.sunXp} XP</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/30 border border-orange-500/20">
              <span className="text-sm">🔥</span>
              <div>
                <div className="text-[9px] text-zinc-400 font-bold uppercase">Chuỗi Ngày</div>
                <div className="text-xs sm:text-sm font-black text-orange-400 font-mono">{state.currentStreakDays}d</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Main Zones Segmented Navigation with Spring Indicator */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-1.5 bg-zinc-950/60 p-1 rounded-2xl border border-zinc-800/60">
          {[
            { id: 'study_zone', label: '📚 Khu Học Tập', icon: BookOpen },
            { id: 'countdown', label: '⏳ Áp Lực Thời Gian', icon: Clock },
            { id: 'competition', label: '🏆 Hệ Thống Thi Đấu', icon: Trophy },
            { id: 'community', label: '🔥 Sự Kiện & Giao Lưu', icon: Flame },
          ].map(zone => {
            const isActive = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone.id as any)}
                className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  isActive ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sunActiveZoneIndicator"
                    className="absolute inset-0 bg-amber-500 rounded-xl shadow-md shadow-amber-500/20 -z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <zone.icon size={14} className={isActive ? 'text-zinc-950' : 'text-zinc-400'} />
                  <span>{zone.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-24 right-6 z-50 p-3.5 rounded-2xl bg-amber-500 text-zinc-950 font-black text-xs shadow-2xl flex items-center gap-2"
        >
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Main Animated Zone Area */}
      <AnimatePresence mode="wait">
        {/* ---------------- ZONE 1: KHU HỌC TẬP ---------------- */}
        {activeZone === 'study_zone' && (
          <motion.div 
            key="zone-study"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Sub-bar for Study Zone */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar touch-pan-x">
              {[
                { id: 'desk', label: '🪑 Bàn Học Cá Nhân', desc: 'Pomodoro & Lofi' },
                { id: 'rooms', label: '👥 Phòng Học Chung', desc: 'Study With Me' },
                { id: 'tasks', label: '📋 To-do List', desc: 'Nhiệm Vụ Hôm Nay' },
                { id: 'kpi', label: '📊 Thống Kê KPI', desc: 'Tiến Độ Học Tập' }
              ].map(tab => {
                const isSelected = studySubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudySubTab(tab.id as any)}
                    className={`relative px-3.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="sunStudySubTabIndicator"
                        className="absolute inset-0 bg-amber-400 rounded-lg shadow-sm -z-0"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {studySubTab === 'desk' && (
                <motion.div 
                  key="study-desk"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyDesk
                    state={state}
                    onUpdateState={handleUpdateState}
                    onOpenShop={() => {
                      setActiveZone('competition');
                      setCompetitionSubTab('shop');
                    }}
                    onOpenTasks={() => setStudySubTab('tasks')}
                    onRecordStudyTime={handleRecordStudyTime}
                  />
                </motion.div>
              )}

              {studySubTab === 'rooms' && (
                <motion.div 
                  key="study-rooms"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyRooms />
                </motion.div>
              )}

              {studySubTab === 'tasks' && (
                <motion.div 
                  key="study-tasks"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyTasks
                    state={state}
                    onUpdateState={handleUpdateState}
                    onTriggerXpToast={(xp, msg) => handleTriggerToast(msg)}
                  />
                </motion.div>
              )}

              {studySubTab === 'kpi' && (
                <motion.div 
                  key="study-kpi"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyKPI
                    state={state}
                    onUpdateState={handleUpdateState}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ---------------- ZONE 2: ÁP LỰC THỜI GIAN ---------------- */}
        {activeZone === 'countdown' && (
          <motion.div 
            key="zone-countdown"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <SunStudyCountdown
              state={state}
              onUpdateState={handleUpdateState}
              onJumpToExamPrep={onJumpToExamPrep}
            />
          </motion.div>
        )}

        {/* ---------------- ZONE 3: HỆ THỐNG THI ĐẤU ---------------- */}
        {activeZone === 'competition' && (
          <motion.div 
            key="zone-competition"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'ranking', label: 'Cày Rank & Đua Top Nhóm', icon: Trophy },
                { id: 'shop', label: 'Cửa Hàng Đổi Đồ Game ☀️', icon: ShoppingBag },
              ].map(sub => {
                const isSelected = competitionSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setCompetitionSubTab(sub.id as any)}
                    className={`relative px-4 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="sunCompSubTabIndicator"
                        className="absolute inset-0 bg-amber-400 rounded-lg shadow-sm -z-0"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <sub.icon size={13} className={isSelected ? 'text-zinc-950' : 'text-zinc-400'} />
                      <span>{sub.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {competitionSubTab === 'ranking' ? (
                <motion.div 
                  key="comp-ranking"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyRanking
                    state={state}
                    onUpdateState={handleUpdateState}
                    onOpenShop={() => setCompetitionSubTab('shop')}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="comp-shop"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyShop
                    state={state}
                    onUpdateState={handleUpdateState}
                    onTriggerToast={handleTriggerToast}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ---------------- ZONE 4: SỰ KIỆN & GIAO LƯU ---------------- */}
        {activeZone === 'community' && (
          <motion.div 
            key="zone-community"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'box', label: 'Box Cộng Đồng Chém Gió 🔥', icon: MessageSquare },
                { id: 'stress', label: 'Trạm Xả Stress 2 Phút 🌿', icon: Wind },
              ].map(sub => {
                const isSelected = communitySubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setCommunitySubTab(sub.id as any)}
                    className={`relative px-4 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="sunCommSubTabIndicator"
                        className="absolute inset-0 bg-amber-400 rounded-lg shadow-sm -z-0"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <sub.icon size={13} className={isSelected ? 'text-zinc-950' : 'text-zinc-400'} />
                      <span>{sub.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {communitySubTab === 'box' ? (
                <motion.div 
                  key="comm-box"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyCommunity />
                </motion.div>
              ) : (
                <motion.div 
                  key="comm-stress"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <SunStudyStressRelief />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
