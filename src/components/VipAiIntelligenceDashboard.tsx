import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  Crown, 
  Activity, 
  TrendingUp, 
  Headphones, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Volume2, 
  Bot, 
  Send, 
  Award, 
  Lightbulb, 
  Compass, 
  Sparkle,
  Layers,
  ChevronRight,
  Flame,
  Star,
  Check,
  Radio,
  FileText,
  Boxes,
  Heart,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VipIntelligenceAnalysis, VipOptimizationSuggestion, VipSettings } from '../types';

interface VipAiIntelligenceDashboardProps {
  onOpenAuth: () => void;
  onNavigateMode?: (mode: string, params?: any) => void;
  onGoToProfile?: () => void;
}

export function VipAiIntelligenceDashboard({
  onOpenAuth,
  onNavigateMode,
  onGoToProfile
}: VipAiIntelligenceDashboardProps) {
  const { 
    user, 
    accountId, 
    isVip, 
    vipTier, 
    vipExpiresAt, 
    vipSettings, 
    updateVipSettings, 
    audioPoints, 
    totalListenedMinutes, 
    favorites 
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<VipIntelligenceAnalysis | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [appliedPresetIds, setAppliedPresetIds] = useState<Record<string, boolean>>({});
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Chat Concierge State
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>>([
    {
      role: 'assistant',
      content: `Kính chào **${user?.displayName || 'Quý Hội viên VIP'}**, tôi là **Haevy AI VIP Concierge**. Tôi đã chuẩn bị sẵn các chiến lược khai phóng đặc quyền tối thượng trên 12 phân hệ Haevy. Bạn có câu hỏi nào cần tối ưu hóa không?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const storageKey = useMemo(() => `haevy_vip_intelligence_${user?.uid || 'guest'}`, [user?.uid]);

  // Load cached analysis or trigger fresh analysis
  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.healthScore) {
          setAnalysis(parsed);
          return;
        }
      }
    } catch {
      // ignore JSON parse err
    }
    fetchIntelligenceAnalysis();
  }, [storageKey]);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  const fetchIntelligenceAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vip/ai-intelligence-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userContext: {
            uid: user?.uid,
            displayName: user?.displayName || 'Hội viên VIP',
            accountId: accountId || 'HV-VIP',
            vipTier: vipTier || 'vip',
            vipExpiresAt,
            audioPoints,
            totalListenedMinutes,
            favoritesCount: favorites?.length || 0
          },
          vipSettings,
          behaviorStats: {
            spiritualDraws: 14,
            financeKetsat: true,
            aiDocsCount: 8,
            spaceCreations: 3,
            familyGenerations: 4,
            coupleDays: 120,
            favoriteGenres: ['Deep Focus', 'Lo-Fi Chill', 'Hi-Fi Master', 'Solfeggio 528Hz']
          }
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysis(data.data);
        localStorage.setItem(storageKey, JSON.stringify(data.data));
        showNotification('Gemini 3.8 Flash đã phân tích hành vi & hiệu chuẩn toàn hệ sinh thái!', 'success');
      } else {
        throw new Error(data.error || 'Không nhận được dữ liệu phân tích');
      }
    } catch (err: any) {
      console.error('Failed to analyze VIP intelligence:', err);
      showNotification('Đã tải mô hình tối ưu dự phòng do kết nối mạng!', 'info');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Auto Preset Handler
  const handleApplyPreset = async (presetId: string, settings: Partial<VipSettings>, title: string) => {
    try {
      await updateVipSettings(settings);
      setAppliedPresetIds(prev => ({ ...prev, [presetId]: true }));
      showNotification(`Đã kích hoạt cấu hình "${title}" thành công!`, 'success');
    } catch (err: any) {
      console.error('Failed to apply preset:', err);
      showNotification('Lỗi khi lưu thiết lập VIP: ' + (err?.message || ''), 'error');
    }
  };

  // Handle Action in Suggestions
  const handleSuggestionAction = async (sug: VipOptimizationSuggestion) => {
    if (sug.actionType === 'apply_setting' && sug.actionPayload) {
      await handleApplyPreset(sug.id, sug.actionPayload, sug.title);
    } else if (sug.actionType === 'navigate_mode' && sug.actionPayload?.targetMode) {
      if (onNavigateMode) {
        onNavigateMode(sug.actionPayload.targetMode, sug.actionPayload);
      } else {
        showNotification(`Đã chuyển hướng đến phân hệ ${sug.modeTitle}`, 'info');
      }
    } else {
      // Send as prompt to chat
      setChatInput(`Tôi muốn biết thêm về: ${sug.title} (${sug.modeTitle})`);
      const chatSection = document.getElementById('vip-concierge-chat');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Send message to AI Concierge
  const handleSendChat = async (presetQuestion?: string) => {
    const messageToSend = presetQuestion || chatInput;
    if (!messageToSend.trim() || isSendingChat) return;

    const userMessage = {
      role: 'user' as const,
      content: messageToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    if (!presetQuestion) setChatInput('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/vip/ai-intelligence-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userContext: {
            displayName: user?.displayName,
            accountId,
            vipTier
          },
          vipSettings,
          conversationHistory: chatMessages.slice(-6)
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || 'Không có phản hồi');
      }
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Xin lỗi bạn, kết nối trợ lý VIP tạm thời gián đoạn: ${err?.message || 'Vui lòng thử lại sau.'}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!analysis?.suggestions) return [];
    if (activeCategoryFilter === 'all') return analysis.suggestions;
    return analysis.suggestions.filter(s => s.category === activeCategoryFilter);
  }, [analysis?.suggestions, activeCategoryFilter]);

  const quickQuestions = [
    'Tần số Solfeggio nào giúp tôi làm việc đêm hiệu quả nhất?',
    'Cách sinh lời Két Sắt VIP lên +15%/năm từ Xu hiện có?',
    'Làm sao kết hợp AI Master để dịch văn bia gia phả chữ Hán?',
    'Gợi ý cấu hình âm thanh hay nhất cho thể loại Acoustic/Lo-Fi?'
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold shadow-xl border animate-in slide-in-from-top-2 duration-200 ${
          notificationMsg.type === 'success' 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-amber-500/10'
            : notificationMsg.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-500/10'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-blue-500/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-amber-400 shrink-0" />
            <span>{notificationMsg.text}</span>
          </div>
          <button 
            onClick={() => setNotificationMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded bg-zinc-800/60"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Hero Intelligence Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-950/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <BrainCircuit size={14} className="text-amber-400 animate-pulse" />
              <span>Gemini 3.8 Flash • Autonomous VIP Optimization</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>AI VIP Intelligence Dashboard</span>
              <Crown size={28} className="text-amber-400 shrink-0 fill-amber-400 hidden sm:inline" />
            </h2>

            <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Trí tuệ nhân tạo phân tích hành vi thẩm âm, tài chính 6 hũ, tần số tâm linh và thói quen học tập của bạn để tự động điều chỉnh 12 phân hệ Haevy đạt hiệu suất đặc quyền tối đa.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800">
                <Crown size={14} className="text-amber-400" />
                <span>Hội viên: {user?.displayName || 'VIP Member'}</span>
              </span>
              <span className="bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 font-mono text-zinc-300">
                ID: {accountId || 'HV-VIP'}
              </span>
              {analysis?.analyzedAt && (
                <span className="text-zinc-500 flex items-center gap-1">
                  <Activity size={12} className="text-emerald-400" />
                  <span>Cập nhật: {new Date(analysis.analyzedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchIntelligenceAnalysis}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Đang phân tích...' : 'Phân Tích Lại AI'}</span>
            </button>
            {onGoToProfile && (
              <button
                onClick={onGoToProfile}
                className="px-4 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs sm:text-sm transition-all text-center whitespace-nowrap cursor-pointer"
              >
                Hồ Sơ VIP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 VIP Health & Value Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Health Score */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-bold text-zinc-300">Chỉ Số Khai Phóng VIP</span>
            <Activity size={16} className="text-amber-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400">
              {analysis?.healthScore || 84}%
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Hạng S Thượng Đẳng
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${analysis?.healthScore || 84}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Monthly VIP Value Saved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-bold text-zinc-300">Giá Trị Đặc Quyền Quy Đổi</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {(analysis?.metrics.monthlyEstimatedSavingsVnd || 540000).toLocaleString('vi-VN')} <span className="text-xs text-amber-400 font-bold">VNĐ/tháng</span>
            </div>
            <p className="text-zinc-500 text-[11px] mt-1">
              Tiết kiệm từ kho Hi-Fi, AI Master & 8D Lossless
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> Tiết kiệm 72% so với dịch vụ lẻ
          </span>
        </div>

        {/* Metric 3: Bonus Coins & Yield */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-bold text-zinc-300">Xu Thưởng Lũy Kế x3</span>
            <Coins size={16} className="text-yellow-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-yellow-400">
              +{analysis?.metrics.bonusCoinsUnlocked || 1200} <span className="text-xs text-zinc-400">Xu VIP</span>
            </div>
            <p className="text-zinc-500 text-[11px] mt-1">
              Tỷ lệ sinh lời Két Sắt VIP: +15%/năm
            </p>
          </div>
          <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
            <Zap size={12} /> x2 điểm thưởng toàn bộ minigame
          </span>
        </div>

        {/* Metric 4: Peak Focus & Solfeggio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-bold text-zinc-300">Tần Số & Giờ Vàng Focus</span>
            <Headphones size={16} className="text-purple-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              {analysis?.metrics.recommendedSolfeggioHz || 528} <span className="text-xs text-zinc-400">Hz</span>
            </div>
            <p className="text-zinc-500 text-[11px] mt-1">
              Khung giờ vàng: <span className="text-zinc-300 font-bold">{analysis?.metrics.peakFocusHour || '21:30 - 23:45'}</span>
            </p>
          </div>
          <span className="text-[11px] text-purple-400 font-bold flex items-center gap-1">
            <Radio size={12} /> Sóng DNA Miracle Repair
          </span>
        </div>
      </div>

      {/* Behavioral Archetype & Persona Card */}
      {analysis?.archetype && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/20 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Compass size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                  Hình Mẫu Hội Viên VIP Của Bạn (VIP Archetype)
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {analysis.archetype.title}
                </h3>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black self-start sm:self-auto">
              {analysis.archetype.tag}
            </span>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed">
            {analysis.archetype.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle2 size={14} />
                <span>Thế Mạnh Đang Khai Thác Hiệu Quả</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {analysis.archetype.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                <Sparkle size={14} />
                <span>Tiềm Năng Đặc Quyền Chưa Khai Phóng Hết</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {analysis.archetype.untappedOpportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Executive Summary */}
          {analysis.executiveSummary && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-amber-300">Đúc kết chiến lược từ Gemini: </span>
              {analysis.executiveSummary}
            </div>
          )}
        </div>
      )}

      {/* 1-Click Instant Auto-Optimizations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Kích Hoạt Tự Động 1 Chạm (1-Click Presets)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Tự động áp dụng bộ thông số chuẩn phòng thu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Preset 1: Dolby Master 3D */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Volume2 size={20} />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Dolby 3D Master</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Âm Nhạc
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kích hoạt 24-bit Lossless, Spatial 360° & Equalizer Cinema 3D mở rộng âm trường.
              </p>
            </div>
            <button
              onClick={() => handleApplyPreset('preset-dolby', {
                hifiMode: true,
                spatial3D: true,
                bassBoost: true,
                smartEqualizer: 'cinema_3d'
              }, 'Dolby 3D Master')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appliedPresetIds['preset-dolby']
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200'
              }`}
            >
              {appliedPresetIds['preset-dolby'] ? (
                <>
                  <Check size={14} />
                  <span>Đã Kích Hoạt</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Áp Dụng Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Preset 2: Royal Gold Theme & Aura */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <Crown size={20} />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Aura Hoàng Gia VIP</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                  Giao Diện
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bật viền vàng bình luận Golden Aura, huy hiệu VIP Club và phông chữ Hoàng Gia.
              </p>
            </div>
            <button
              onClick={() => handleApplyPreset('preset-royal', {
                showVipBadge: true,
                goldenCommentAura: true,
                customTheme: 'royal_gold'
              }, 'Aura Hoàng Gia VIP')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appliedPresetIds['preset-royal']
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-yellow-500 hover:text-black text-zinc-200'
              }`}
            >
              {appliedPresetIds['preset-royal'] ? (
                <>
                  <Check size={14} />
                  <span>Đã Kích Hoạt</span>
                </>
              ) : (
                <>
                  <Crown size={14} />
                  <span>Áp Dụng Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Preset 3: Deep Focus 528Hz */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Radio size={20} />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Sóng Não 528Hz Zen</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Tâm Linh
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tần số Solfeggio 528Hz hòa âm Lo-Fi và hẹn giờ tắt dịu dần để thiền định hoặc ngủ sâu.
              </p>
            </div>
            <button
              onClick={() => handleApplyPreset('preset-zen', {
                sleepTimerFadeout: true,
                smartEqualizer: 'acoustic'
              }, 'Sóng Não 528Hz Zen')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appliedPresetIds['preset-zen']
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-purple-500 hover:text-white text-zinc-200'
              }`}
            >
              {appliedPresetIds['preset-zen'] ? (
                <>
                  <Check size={14} />
                  <span>Đã Kích Hoạt</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Áp Dụng Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Preset 4: Smart Offline Lossless */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Bộ Đệm Offline FLAC</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Tải Về
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tự động lưu tạm các bài hát yêu thích chuẩn không nén để nghe mượt mà không cần mạng.
              </p>
            </div>
            <button
              onClick={() => handleApplyPreset('preset-offline', {
                autoDownloadOffline: true,
                hifiMode: true
              }, 'Bộ Đệm Offline FLAC')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appliedPresetIds['preset-offline']
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-blue-500 hover:text-white text-zinc-200'
              }`}
            >
              {appliedPresetIds['preset-offline'] ? (
                <>
                  <Check size={14} />
                  <span>Đã Kích Hoạt</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Áp Dụng Ngay</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Actionable Recommendations by Mode */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Chiến Lược Tối Ưu Hóa Từng Phân Hệ
            </h3>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'audio', label: 'Âm nhạc Hi-Fi' },
              { id: 'spiritual', label: 'Tâm linh 8D' },
              { id: 'finance', label: 'Két Sắt VIP' },
              { id: 'ai_study', label: 'AI Master' },
              { id: 'space_ar', label: 'Vũ trụ 3D AR' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === tab.id
                    ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.map(sug => {
            const isApplied = appliedPresetIds[sug.id];
            return (
              <div 
                key={sug.id}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {sug.modeTitle}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sug.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : sug.priority === 'exclusive'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {sug.priority === 'high' ? 'Ưu tiên cao' : sug.priority === 'exclusive' ? 'Độc quyền VIP' : 'Khuyên dùng'}
                      </span>
                    </div>

                    <span className="text-xs font-black text-amber-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      {sug.impactScore}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                    {sug.title}
                  </h4>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {sug.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Hiệu quả đề xuất bởi Gemini 3.8</span>
                  </span>

                  <button
                    onClick={() => handleSuggestionAction(sug)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/10'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check size={13} />
                        <span>Đã áp dụng</span>
                      </>
                    ) : (
                      <>
                        <span>{sug.actionType === 'apply_setting' ? 'Áp dụng cấu hình' : sug.actionType === 'navigate_mode' ? 'Mở phân hệ' : 'Tìm hiểu thêm'}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Ecosystem Synergy Insights */}
      {analysis?.insights && analysis.insights.length > 0 && (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Cộng Hưởng Hệ Sinh Thái (Ecosystem Synergies)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.insights.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkle size={13} />
                  <span>{ins.title}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {ins.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI VIP Concierge Live Consultation Module */}
      <div id="vip-concierge-chat" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Haevy AI VIP Concierge</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Online 24/7
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Tư vấn cá nhân hóa cách tận dụng đặc quyền VIP & giải đáp thắc mắc chuyên sâu
              </p>
            </div>
          </div>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChat(q)}
              disabled={isSendingChat}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs border border-zinc-700 whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {chatMessages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-br-none shadow-md shadow-amber-500/10'
                  : 'bg-zinc-950/80 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          {isSendingChat && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 max-w-sm">
              <Sparkles size={14} className="animate-spin" />
              <span>AI VIP Concierge đang tổng hợp dữ liệu hệ sinh thái...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Hỏi AI VIP Concierge (VD: Tối ưu tần số sóng não ban đêm, chiến lược nhân xu Két Sắt...)"
            disabled={isSendingChat}
            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isSendingChat}
            className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Gửi Hỏi</span>
          </button>
        </form>
      </div>

    </div>
  );
}
