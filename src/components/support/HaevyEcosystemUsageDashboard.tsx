import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import {
  PieChart as PieIcon,
  Activity,
  Clock,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Compass,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import {
  getEcosystemUsageData,
  ModeUsageStat,
  CategoryUsageStat,
  TimeframeFilter,
  UsageSummaryStats
} from '../../services/ecosystemUsageService';
import { EcosystemMode, ActiveTab } from '../../types';
import { switchEcosystemMode } from '../../services/modeSyncService';

interface HaevyEcosystemUsageDashboardProps {
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab | string) => void;
  className?: string;
}

export interface UnifiedChartDatum {
  id: string;
  name: string;
  shortName: string;
  category: string;
  categoryLabel: string;
  sessions: number;
  minutes: number;
  percent: number;
  color: string;
  trend: string;
  isGrowing: boolean;
  supportTicketCount?: number;
  modeCount?: number;
  value: number;
  [key: string]: any;
}

// Custom Tooltip for Recharts Pie
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-700 shadow-2xl backdrop-blur-md min-w-[210px] space-y-2 z-50 text-left">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: data.color }}
          />
          <div className="truncate">
            <div className="text-xs font-black text-white truncate">
              {data.name || data.label}
            </div>
            <div className="text-[10px] text-zinc-400">
              {data.categoryLabel || `${data.modeCount || 1} phân hệ`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Tỷ trọng</span>
            <span className="text-emerald-400 font-extrabold text-xs">
              {data.percent}%
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Số phiên</span>
            <span className="text-white font-extrabold text-xs">
              {data.sessions?.toLocaleString() || data.value}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Tổng thời gian</span>
            <span className="text-amber-400 font-extrabold text-xs">
              {Math.round((data.minutes || 0) / 60)} giờ
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Tăng trưởng</span>
            <span
              className={`font-extrabold text-xs flex items-center gap-0.5 ${
                data.isGrowing !== false ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {data.trend || '+12.4%'}
            </span>
          </div>
        </div>

        {data.supportTicketCount !== undefined && (
          <div className="pt-1 text-[10px] text-zinc-400 flex items-center justify-between border-t border-zinc-900">
            <span>Phiếu hỗ trợ kỹ thuật:</span>
            <span className="text-zinc-200 font-bold font-mono">
              {data.supportTicketCount} phiếu
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function HaevyEcosystemUsageDashboard({
  onSelectMode,
  className = ''
}: HaevyEcosystemUsageDashboardProps) {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('month');
  const [viewGrouping, setViewGrouping] = useState<'mode' | 'category'>('mode');
  const [selectedItem, setSelectedItem] = useState<ModeUsageStat | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Fetch telemetry
  const telemetry = useMemo(() => {
    return getEcosystemUsageData(timeframe);
  }, [timeframe, lastRefreshedAt]);

  const { modes, categories, summary } = telemetry;

  // Selected mode to show in highlight card
  useEffect(() => {
    if (modes.length > 0 && !selectedItem) {
      setSelectedItem(modes[0]);
    }
  }, [modes, selectedItem]);

  // Listen to telemetry updates from other parts of the app
  useEffect(() => {
    const handleUpdate = () => {
      setLastRefreshedAt(new Date());
    };
    window.addEventListener('haevy-usage-telemetry-updated', handleUpdate);
    return () => window.removeEventListener('haevy-usage-telemetry-updated', handleUpdate);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshedAt(new Date());
      setIsRefreshing(false);
    }, 450);
  };

  const handlePieClick = (data: any) => {
    if (viewGrouping === 'mode') {
      setSelectedItem(data);
    } else {
      // Find top mode in this category
      const found = modes.find((m) => m.category === data.category);
      if (found) setSelectedItem(found);
    }
  };

  const handleNavigate = (targetMode: EcosystemMode) => {
    if (onSelectMode) {
      onSelectMode(targetMode);
    } else {
      switchEcosystemMode(targetMode);
    }
  };

  const chartData: UnifiedChartDatum[] = useMemo(() => {
    if (viewGrouping === 'mode') {
      return modes.map((m) => ({
        ...m,
        value: m.sessions,
      }));
    }
    return categories.map((c) => ({
      id: c.category,
      name: c.label,
      shortName: c.label,
      category: c.category,
      categoryLabel: `${c.modeCount} phân hệ`,
      sessions: c.sessions,
      minutes: c.minutes,
      percent: c.percent,
      color: c.color,
      trend: '+12.5%',
      isGrowing: true,
      modeCount: c.modeCount,
      value: c.sessions,
    }));
  }, [viewGrouping, modes, categories]);

  return (
    <div
      id="haevy-recharts-usage-dashboard"
      className={`p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-6 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-black border border-emerald-500/20">
            <PieIcon size={13} className="text-emerald-400" />
            <span>RECHARTS ECOSYSTEM TELEMETRY • THỊ PHẦN SỬ DỤNG PHÂN HỆ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Dashboard Mức Độ Sử Dụng Hệ Sinh Thái</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Haevy</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Biểu đồ tròn Recharts phân tích mức độ gắn kết, tổng số phiên hoạt động và thời lượng của 17+ phân hệ chuyên sâu trong toàn bộ vũ trụ Haevy.
          </p>
        </div>

        {/* Controls: Timeframe & Refresh */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Timeframe pill selector */}
          <div className="p-1 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-1 text-xs">
            <button
              type="button"
              id="btn-timeframe-today"
              onClick={() => setTimeframe('today')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === 'today'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              id="btn-timeframe-week"
              onClick={() => setTimeframe('week')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === 'week'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 ngày
            </button>
            <button
              type="button"
              id="btn-timeframe-month"
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === 'month'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 ngày
            </button>
            <button
              type="button"
              id="btn-timeframe-all"
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Toàn thời gian
            </button>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            id="btn-refresh-telemetry"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Làm mới số liệu tức thì"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-400' : ''} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards (4 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sessions */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">Tổng Phiên Sử Dụng</span>
            <Activity size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {summary.totalSessions.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={12} />
            <span>+24.6% so với kỳ trước</span>
          </div>
        </div>

        {/* Total Hours */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">Tổng Giờ Trải Nghiệm</span>
            <Clock size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {summary.totalHours.toLocaleString()}h
          </div>
          <div className="text-[10px] text-zinc-400 font-semibold">
            Trung bình <span className="text-amber-300 font-bold">{summary.averageSessionMinutes} phút</span>/phiên
          </div>
        </div>

        {/* Top Used Mode */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">Phân Hệ Top 1</span>
            <Award size={15} className="text-yellow-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-400 truncate">
            {summary.topMode.shortName}
          </div>
          <div className="text-[10px] text-zinc-400 flex items-center justify-between">
            <span>Chiếm thị phần:</span>
            <span className="text-white font-bold font-mono">{summary.topMode.percent}%</span>
          </div>
        </div>

        {/* Health / Stability */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">Độ Ổn Định Dịch Vụ</span>
            <ShieldCheck size={15} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {summary.systemHealthPercent}%
          </div>
          <div className="text-[10px] text-cyan-400/80 font-semibold flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>Mọi phân hệ vận hành trơn tru</span>
          </div>
        </div>
      </div>

      {/* Main Center Area: Recharts Pie Chart & Interactive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Recharts Pie Chart Canvas (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                BIỂU ĐỒ TRÒN PHÂN BỔ THỊ PHẦN (RECHARTS)
              </span>
            </div>

            {/* View Grouping Toggle */}
            <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1 text-[11px]">
              <button
                type="button"
                id="btn-group-mode"
                onClick={() => setViewGrouping('mode')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  viewGrouping === 'mode'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                17 Phân Hệ
              </button>
              <button
                type="button"
                id="btn-group-category"
                onClick={() => setViewGrouping('category')}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  viewGrouping === 'category'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Theo Lĩnh Vực
              </button>
            </div>
          </div>

          {/* Recharts Pie Canvas */}
          <div className="w-full h-80 sm:h-96 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={118}
                  paddingAngle={2.5}
                  dataKey="value"
                  nameKey="shortName"
                  onClick={(entry) => handlePieClick(entry)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => {
                    const isSelected = selectedItem?.id === entry.id || (viewGrouping === 'category' && selectedItem?.category === entry.category);
                    return (
                      <Cell
                        key={`cell-${entry.id}-${index}`}
                        fill={entry.color}
                        stroke={isSelected ? '#ffffff' : '#09090b'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Display */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-2 max-w-[130px]">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block truncate">
                {selectedItem?.categoryLabel || 'Phân Hệ'}
              </span>
              <span className="text-sm font-black text-white block truncate">
                {selectedItem?.shortName || selectedItem?.name}
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono block">
                {selectedItem?.percent}%
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold block">
                {selectedItem?.sessions.toLocaleString()} phiên
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
            <span>💡 Nhấn vào một lát cắt trên biểu đồ để xem chi tiết & chuyển chế độ.</span>
            <span className="font-mono text-zinc-500">Cập nhật lúc: {lastRefreshedAt.toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>

        {/* Right: Selected Mode Deep Dive & Direct Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedItem ? (
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl space-y-4 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: selectedItem.color }}
              />

              <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div className="space-y-1">
                  <div
                    className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black border"
                    style={{
                      borderColor: `${selectedItem.color}50`,
                      color: selectedItem.color,
                      backgroundColor: `${selectedItem.color}15`
                    }}
                  >
                    {selectedItem.categoryLabel}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {selectedItem.name}
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Mã hệ thống: <span className="text-zinc-300 font-bold">{selectedItem.id}</span>
                  </div>
                </div>

                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-md"
                  style={{
                    backgroundColor: `${selectedItem.color}20`,
                    borderColor: `${selectedItem.color}60`,
                    color: selectedItem.color
                  }}
                >
                  {selectedItem.percent}%
                </div>
              </div>

              {/* Metrics Grid for this mode */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-semibold">Số lượt tương tác</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {selectedItem.sessions.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp size={10} />
                    <span>{selectedItem.trend}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-semibold">Thời lượng sử dụng</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                    {Math.round(selectedItem.minutes / 60)}h {(selectedItem.minutes % 60)}m
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">
                    Độ hài lòng: <span className="text-emerald-400 font-bold">98.5%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-semibold">Tỷ trọng toàn hệ sinh thái</div>
                  <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                    {selectedItem.percent}%
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">
                    Thứ hạng: <span className="text-amber-300 font-bold">Top {modes.findIndex(m => m.id === selectedItem.id) + 1}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-semibold">Yêu cầu hỗ trợ (Tickets)</div>
                  <div className="text-base font-black text-purple-300 font-mono mt-0.5">
                    {selectedItem.supportTicketCount} phiếu
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold mt-0.5">
                    Đã giải quyết 100%
                  </div>
                </div>
              </div>

              {/* Direct Action Button to switch to this mode */}
              <button
                type="button"
                id={`btn-jump-to-mode-${selectedItem.id}`}
                onClick={() => handleNavigate(selectedItem.id)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
                style={{
                  backgroundColor: selectedItem.color,
                  color: '#09090b'
                }}
              >
                <Compass size={14} />
                <span>Mở Phân Hệ "{selectedItem.shortName}" Ngay</span>
                <ExternalLink size={13} />
              </button>
            </div>
          ) : null}

          {/* Quick Support Correlation Insight Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Zap size={14} className="text-amber-400" />
              <span>Ghi Chú Đội Ngũ Haevy Support:</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Các phân hệ <span className="text-emerald-400 font-bold">Haevy Edu (STEM)</span> và{' '}
              <span className="text-purple-400 font-bold">Haevy AI Master</span> đang dẫn đầu về lưu lượng tương tác tuần này. Đội ngũ hỗ trợ đã triển khai Trợ lý AI tự động phản hồi 24/7 để giải đáp thắc mắc người dùng ngay trong vòng 3 giây.
            </p>
          </div>
        </div>

      </div>

      {/* Complete Rankings Breakdown (Top 8 Interactive Pills & Mini Progress Bars) */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <Layers size={14} className="text-emerald-400" />
            <span>BẢNG XẾP HẠNG MỨC ĐỘ SỬ DỤNG THEO PHÂN HỆ ({modes.length} CHẾ ĐỘ)</span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Sắp xếp theo số phiên tương tác thực tế
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {modes.slice(0, 8).map((mode, index) => {
            const isSelected = selectedItem?.id === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedItem(mode)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                  isSelected
                    ? 'bg-zinc-800/90 border-emerald-400/70 shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-black text-[10px] flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-black text-white truncate">
                      {mode.shortName}
                    </span>
                  </div>
                  <span
                    className="text-xs font-black font-mono shrink-0"
                    style={{ color: mode.color }}
                  >
                    {mode.percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, mode.percent * 2.8)}%`,
                      backgroundColor: mode.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{mode.sessions.toLocaleString()} phiên</span>
                  <span className={mode.isGrowing ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {mode.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
