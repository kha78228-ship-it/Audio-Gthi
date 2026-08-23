import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Users,
  Eye,
  CheckCircle2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Play,
  Pause,
  Crown,
  Radio,
  Flame,
  Heart,
  Zap,
  Gift,
  Layers,
  Image as ImageIcon,
  Compass,
  Headphones,
  Music,
  UserCheck,
  Search,
  Tag,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Palette,
  Layout,
  Clock,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  AdminHomeCustomConfig, 
  HomeTargetAudience, 
  HomeHeroStyle, 
  HomeHeroAction, 
  Track, 
  ActiveTab 
} from '../../types';
import { DEFAULT_HOME_CUSTOM_CONFIG } from '../../context/AuthContext';
import { GENRE_LIST, FEATURED_PLAYLISTS } from '../../data';

interface AdminPage5HomepageEditorProps {
  tracks?: Track[];
  allTracks?: Track[];
  usersList?: any[];
  onPlayTrack?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  showToast?: (text: string, type?: 'success' | 'error') => void;
}

export function AdminPage5HomepageEditor({
  tracks = [],
  allTracks = [],
  usersList = [],
  onPlayTrack,
  currentTrack,
  isPlaying = false,
  showToast,
}: AdminPage5HomepageEditorProps) {
  const effectiveTracks = tracks.length > 0 ? tracks : allTracks;
  const { homeCustomConfig, updateHomeCustomConfig, resetHomeCustomConfig, user } = useAuth();

  // Local draft state
  const [formData, setFormData] = useState<AdminHomeCustomConfig>(() => ({
    ...DEFAULT_HOME_CUSTOM_CONFIG,
    ...homeCustomConfig,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Specific Account ID input management
  const [accountIdInput, setAccountIdInput] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserPickerModal, setShowUserPickerModal] = useState(false);

  // Track selector modals / search
  const [showHeroTrackPicker, setShowHeroTrackPicker] = useState(false);
  const [heroTrackSearch, setHeroTrackSearch] = useState('');
  const [showAdminPicksPicker, setShowAdminPicksPicker] = useState(false);
  const [adminPicksSearch, setAdminPicksSearch] = useState('');

  // Live Sandbox Preview Mode
  const [previewPerspective, setPreviewPerspective] = useState<'eligible' | 'ineligible'>('eligible');
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

  // Sync draft whenever remote config updates (if not currently dirty or on first load)
  useEffect(() => {
    setFormData((prev) => ({
      ...DEFAULT_HOME_CUSTOM_CONFIG,
      ...homeCustomConfig,
      // Preserve local targets if any
      targetAccountIds: prev.targetAccountIds.length > 0 ? prev.targetAccountIds : homeCustomConfig.targetAccountIds || [],
    }));
  }, [homeCustomConfig]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await updateHomeCustomConfig(formData);
      if (res.success) {
        setSaveStatus({ type: 'success', text: res.message });
      } else {
        setSaveStatus({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setSaveStatus({ type: 'error', text: 'Lỗi lưu: ' + (e.message || '') });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  // Handle Reset to Default
  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục Trang Chủ về giao diện nguyên bản mặc định?')) {
      return;
    }
    setIsResetting(true);
    setSaveStatus(null);
    try {
      const res = await resetHomeCustomConfig();
      if (res.success) {
        setFormData(DEFAULT_HOME_CUSTOM_CONFIG);
        setSaveStatus({ type: 'success', text: res.message });
      } else {
        setSaveStatus({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setSaveStatus({ type: 'error', text: 'Lỗi: ' + (e.message || '') });
    } finally {
      setIsResetting(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  // Add Account ID to target list
  const handleAddAccountId = (val?: string) => {
    const raw = (val || accountIdInput).trim();
    if (!raw) return;

    // Support comma or whitespace separated pasting
    const newItems = raw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setFormData((prev) => {
      const combined = Array.from(new Set([...prev.targetAccountIds, ...newItems]));
      return { ...prev, targetAccountIds: combined };
    });

    setAccountIdInput('');
  };

  // Remove Account ID
  const handleRemoveAccountId = (idToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAccountIds: prev.targetAccountIds.filter((id) => id !== idToRemove),
    }));
  };

  // Presets Templates
  const applyPreset = (presetKey: string) => {
    if (!window.confirm('Áp dụng mẫu này sẽ thay đổi các thiết lập hiện tại. Bạn muốn tiếp tục?')) return;

    const sampleTrack = tracks[0] || null;

    if (presetKey === 'vip_party') {
      setFormData((prev) => ({
        ...prev,
        isEnabled: true,
        targetAudience: 'vip',
        titleTag: 'Đại Tiệc VIP & EDM Hội Tụ',
        showAdminGreetingBanner: true,
        greetingBannerText: '🔥 ĐẠI TIỆC VIP: Chúc mừng bạn đang trải nghiệm không gian âm thanh Hi-Fi Lossless đặc quyền!',
        greetingBannerSubtext: 'Âm bass tăng cường và âm thanh không gian 3D được kích hoạt tự động.',
        greetingBannerIcon: 'crown',
        greetingBannerColor: 'amber',
        greetingBannerCtaText: 'Tận Hưởng Ngay',
        greetingBannerCtaTab: 'library',
        heroMode: 'custom_banner',
        heroCustomTitle: 'Sóng Âm Cyber & Không Gian Đỉnh Cao',
        heroCustomSubtitle: 'Tuyển tập những bản mix EDM, Lo-fi & Spatial Audio chỉ dành riêng cho các thành viên VIP Haevy.',
        heroCustomTag: 'Đặc Quyền Hội Viên VIP',
        heroCustomCoverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
        heroCustomCtaText: 'Nghe Ngay',
        heroCustomAction: 'open_library',
        heroCustomAuthorName: 'Ban Quản Trị Haevy VIP',
        heroStyle: 'cyber_glow',
        showHeroSpotlight: true,
        showGenresSection: true,
        genresTitle: 'Thể loại âm nhạc đỉnh cao',
        showTrendingSection: true,
        trendingTitle: 'Top VIP Nghe Nhiều Nhất',
        trendingSubtitle: 'Xu hướng âm thanh dẫn đầu tuần qua',
        showAdminPicksSection: true,
        adminPicksTitle: '⭐ Admin VIP Signature Picks',
        adminPicksSubtitle: 'Những tác phẩm được tuyển lựa chất lượng phòng thu',
        adminPicksTrackIds: tracks.slice(0, 4).map((t) => t.id),
        showCuratedCollections: true,
      }));
    } else if (presetKey === 'story_epic') {
      setFormData((prev) => ({
        ...prev,
        isEnabled: true,
        targetAudience: 'all',
        titleTag: 'Thế Giới Cốt Truyện & Tác Giả Ngôi Sao',
        showAdminGreetingBanner: true,
        greetingBannerText: '📖 Khám phá kho Tác Phẩm Cốt Truyện Audio Độc Quyền từ các Tác Giả Cộng Đồng!',
        greetingBannerSubtext: 'Hơn 100+ tập truyện audio, kịch truyền thanh và podcast truyền cảm hứng.',
        greetingBannerIcon: 'sparkles',
        greetingBannerColor: 'purple',
        greetingBannerCtaText: 'Xem Kho Truyện',
        greetingBannerCtaTab: 'library',
        heroMode: sampleTrack ? 'custom_track' : 'auto',
        heroCustomTrackId: sampleTrack?.id,
        heroCustomTitle: sampleTrack ? sampleTrack.title : 'Bản Giao Hưởng Của Những Câu Chuyện',
        heroCustomSubtitle: sampleTrack?.storylineSummary || 'Đắm chìm vào những chương truyện âm thanh được dàn dựng công phu.',
        heroCustomTag: 'Cốt Truyện Nổi Bật Của Tuần',
        heroStyle: 'storyline_epic',
        showHeroSpotlight: true,
        showGenresSection: true,
        genresTitle: 'Khám phá thế giới cốt truyện',
        showTrendingSection: true,
        trendingTitle: 'Các tập audio được yêu thích nhất',
        trendingSubtitle: 'Bình chọn bởi cộng đồng người nghe Haevy',
        showAdminPicksSection: true,
        adminPicksTitle: '🏆 Bộ Sưu Tập Tác Giả Xuất Sắc',
        adminPicksSubtitle: 'Các tác phẩm âm thanh được biên tập kỹ lưỡng',
        adminPicksTrackIds: tracks.slice(0, 3).map((t) => t.id),
        showCuratedCollections: true,
      }));
    } else if (presetKey === 'festival_tribute') {
      setFormData((prev) => ({
        ...prev,
        isEnabled: true,
        targetAudience: 'all',
        titleTag: 'Mùa Tri Ân & Giai Điệu Yêu Thương',
        showAdminGreetingBanner: true,
        greetingBannerText: '🎁 MÙA TRI ÂN HAEVY: Tặng 100 Điểm Thưởng & Khám Phá Âm Nhạc Bất Tận!',
        greetingBannerSubtext: 'Ban Quản Trị gửi lời cảm ơn sâu sắc đến tất cả thành viên đã đồng hành.',
        greetingBannerIcon: 'gift',
        greetingBannerColor: 'rose',
        greetingBannerCtaText: 'Nhận Thưởng & Nghe Ngay',
        greetingBannerCtaTab: 'vip',
        heroMode: 'custom_banner',
        heroCustomTitle: 'Thanh Âm Chữa Lành & Giai Điệu Bình Yên',
        heroCustomSubtitle: 'Hãy để những giai điệu nhẹ nhàng xua tan mệt mỏi sau một ngày dài làm việc.',
        heroCustomTag: 'Chương Trình Tri Ân Đặc Biệt',
        heroCustomCoverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
        heroCustomCtaText: 'Khám Phá',
        heroCustomAction: 'open_library',
        heroCustomAuthorName: 'Haevy Editorial Board',
        heroStyle: 'cinematic_wide',
        showHeroSpotlight: true,
        showGenresSection: true,
        showTrendingSection: true,
        showAdminPicksSection: true,
        adminPicksTitle: '🌸 Lựa Chọn Chữa Lành Tâm Hồn',
        adminPicksSubtitle: 'Tuyển tập thư giãn và xoa dịu cảm xúc',
        adminPicksTrackIds: effectiveTracks.slice(0, 3).map((t) => t.id),
        showCuratedCollections: true,
      }));
    } else if (presetKey === 'minimal_hifi') {
      setFormData((prev) => ({
        ...prev,
        isEnabled: true,
        targetAudience: 'all',
        titleTag: 'Không Gian Tối Giản Hi-Fi',
        showAdminGreetingBanner: false,
        heroMode: 'auto',
        heroStyle: 'minimal_clean',
        showHeroSpotlight: true,
        showGenresSection: true,
        genresTitle: 'Thể loại âm nhạc',
        showTrendingSection: true,
        trendingTitle: 'Bản thu âm mới nhất',
        trendingSubtitle: 'Chất lượng phòng thu 24-bit',
        showAdminPicksSection: false,
        showCuratedCollections: true,
      }));
    }
  };

  // Find selected hero track object if custom_track
  const selectedHeroTrack = effectiveTracks.find((t) => t.id === formData.heroCustomTrackId) || effectiveTracks[0] || null;

  // Filtered tracks for search modals
  const filteredHeroTracks = effectiveTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(heroTrackSearch.toLowerCase()) ||
      t.artist.toLowerCase().includes(heroTrackSearch.toLowerCase()) ||
      (t.genre && t.genre.toLowerCase().includes(heroTrackSearch.toLowerCase()))
  );

  const filteredAdminPickTracks = effectiveTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(adminPicksSearch.toLowerCase()) ||
      t.artist.toLowerCase().includes(adminPicksSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      (u.accountId && u.accountId.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner / Hero Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-800/80 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sliders size={14} />
              <span>Studio Tùy Biến Trang Chủ Haevy Audio</span>
              <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">
                v{formData.version || 1}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Chỉnh Sửa & Phân Phối Trang Chủ Cho Người Dùng
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Tùy biến toàn diện Banner Spotlight, thanh thông báo chào mừng, các mục âm nhạc nổi bật và chỉ định chính xác nhóm người dùng hoặc danh sách tài khoản được nhìn thấy giao diện này.
            </p>
          </div>

          {/* Master Toggle & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            {/* Live Master Switch */}
            <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-2xl bg-zinc-950/70 border border-zinc-700/60 shadow-inner">
              <span className="text-xs font-bold text-zinc-300">
                {formData.isEnabled ? '🟢 Đang Kích Hoạt' : '⚪ Đang Tắt (Mặc Định)'}
              </span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.isEnabled ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Preview Button */}
            <button
              type="button"
              onClick={() => setShowFullscreenPreview(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm border border-zinc-700 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Eye size={16} className="text-amber-400" />
              <span>Xem Thử Trực Tiếp</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu & Áp Dụng</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save Status Notification */}
        {saveStatus && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in ${
              saveStatus.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {saveStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{saveStatus.text}</span>
            </div>
            <button onClick={() => setSaveStatus(null)} className="text-zinc-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Preset Quick Templates */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Mẫu Giao Diện Thiết Kế Sẵn (1-Click Presets)</h2>
              <p className="text-xs text-zinc-400">Chọn mẫu nhanh để hệ thống tự động điền các trường thiết kế</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="text-xs font-semibold text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <RotateCcw size={14} />
            <span>Khôi phục giao diện gốc</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => applyPreset('vip_party')}
            className="flex flex-col text-left p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/60 transition-all group cursor-pointer shadow-sm"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">👑</span>
            <span className="text-xs font-bold text-white group-hover:text-amber-300">Đại Tiệc VIP & EDM</span>
            <span className="text-[11px] text-zinc-400 mt-1">Giao diện màu Cyber Glow, dành riêng hội viên VIP</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('story_epic')}
            className="flex flex-col text-left p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/60 transition-all group cursor-pointer shadow-sm"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">📖</span>
            <span className="text-xs font-bold text-white group-hover:text-purple-300">Cốt Truyện & Tác Giả</span>
            <span className="text-[11px] text-zinc-400 mt-1">Tôn vinh câu chuyện audio & tác phẩm cộng đồng</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('festival_tribute')}
            className="flex flex-col text-left p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-800/60 transition-all group cursor-pointer shadow-sm"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">🎁</span>
            <span className="text-xs font-bold text-white group-hover:text-rose-300">Mùa Lễ Hội & Tri Ân</span>
            <span className="text-[11px] text-zinc-400 mt-1">Banner quà tặng, tri ân thành viên & âm thanh êm dịu</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('minimal_hifi')}
            className="flex flex-col text-left p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/60 transition-all group cursor-pointer shadow-sm"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">🎧</span>
            <span className="text-xs font-bold text-white group-hover:text-blue-300">Tối Giản Hi-Fi Studio</span>
            <span className="text-[11px] text-zinc-400 mt-1">Bố cục gọn gàng, tôn vinh chất lượng âm thanh 24-bit</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: TARGET AUDIENCE CONFIGURATION */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">1. Đối Tượng Được Hiển Thị Giao Diện Này</h2>
            <p className="text-xs text-zinc-400">
              Quyết định ai sẽ nhìn thấy trang chủ tùy biến của Admin khi mở app
            </p>
          </div>
        </div>

        {/* Target Audience Radios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: 'all',
              label: '🌐 Tất cả mọi người (Mọi người truy cập)',
              desc: 'Áp dụng cho toàn bộ thành viên và khách vãng lai.',
            },
            {
              id: 'vip',
              label: '👑 Chỉ thành viên VIP (VIP Members)',
              desc: 'Chỉ tài khoản đang có VIP (bao gồm Guest VIP Pass) mới thấy.',
            },
            {
              id: 'authors',
              label: '✍️ Chỉ Tác giả đã xác minh',
              desc: 'Chỉ các tác giả âm thanh đã được duyệt huy hiệu tác giả.',
            },
            {
              id: 'guests',
              label: '👤 Chỉ Khách chưa đăng nhập (Guests)',
              desc: 'Hiển thị các ưu đãi, hướng dẫn đăng ký & nạp VIP cho khách.',
            },
            {
              id: 'specific_accounts',
              label: '🎯 Chỉ định Danh Sách ID Tài Khoản',
              desc: 'Chỉ những ID tài khoản (HV-..., email, UID) trong danh sách mới thấy.',
            },
          ].map((item) => {
            const isSelected = formData.targetAudience === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setFormData((prev) => ({ ...prev, targetAudience: item.id as HomeTargetAudience }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {item.label}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Specific Account IDs Section */}
        {formData.targetAudience === 'specific_accounts' && (
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Tag size={14} />
                  Danh Sách ID Tài Khoản Được Thay Đổi Trang Chủ ({formData.targetAccountIds.length})
                </span>
                <p className="text-[11px] text-zinc-400">
                  Nhập mã Account ID (ví dụ: <code className="text-amber-300 font-mono">HV-123456</code>, <code className="text-amber-300 font-mono">AH-892140</code>, UID, hoặc Email).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUserPickerModal(true)}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserCheck size={14} />
                <span>Chọn từ danh sách người dùng ({usersList.length})</span>
              </button>
            </div>

            {/* Input & Add button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={accountIdInput}
                  onChange={(e) => setAccountIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAccountId();
                    }
                  }}
                  placeholder="Nhập Account ID (HV-..., AH-..., email...) rồi bấm Thêm..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddAccountId()}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl shadow transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Thêm ID</span>
              </button>
            </div>

            {/* Chips of added accounts */}
            {formData.targetAccountIds.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
                {formData.targetAccountIds.map((accId) => (
                  <div
                    key={accId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-850 border border-zinc-700 text-xs font-mono text-amber-300 shadow-sm"
                  >
                    <span>{accId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccountId(accId)}
                      className="text-zinc-400 hover:text-rose-400 p-0.5 rounded transition-colors"
                      title="Xóa ID này"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, targetAccountIds: [] }))}
                  className="text-[11px] text-rose-400 hover:underline self-center ml-2"
                >
                  Xóa tất cả ({formData.targetAccountIds.length})
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Chưa có tài khoản nào trong danh sách. Hãy thêm ít nhất 1 ID để tính năng phân phối có hiệu lực.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: GREETING & ANNOUNCEMENT RIBBON */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">2. Thanh Thông Báo / Chào Mừng Đầu Trang</h2>
              <p className="text-xs text-zinc-400">Thanh thông điệp nổi bật xuất hiện ngay trên đầu Trang Chủ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">
              {formData.showAdminGreetingBanner ? 'Hiển thị' : 'Ẩn'}
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, showAdminGreetingBanner: !prev.showAdminGreetingBanner }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.showAdminGreetingBanner ? 'bg-purple-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.showAdminGreetingBanner ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {formData.showAdminGreetingBanner && (
          <div className="space-y-4 pt-2 border-t border-zinc-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Biểu tượng (Icon)</label>
                <select
                  value={formData.greetingBannerIcon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, greetingBannerIcon: e.target.value as any }))}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="sparkles">✨ Sparkles (Lấp lánh / Đặc sắc)</option>
                  <option value="crown">👑 Crown (Vương miện VIP)</option>
                  <option value="radio">📻 Radio (Trạm phát sóng)</option>
                  <option value="flame">🔥 Flame (Thịnh hành / Hot)</option>
                  <option value="heart">💖 Heart (Yêu thương / Lãng mạn)</option>
                  <option value="zap">⚡ Zap (Tia chớp / Tốc độ)</option>
                  <option value="gift">🎁 Gift (Quà tặng / Tri ân)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Tông màu chủ đạo</label>
                <select
                  value={formData.greetingBannerColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, greetingBannerColor: e.target.value as any }))}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="amber">Vàng Ánh Kim (Amber Gold)</option>
                  <option value="purple">Tím Hoàng Gia (Royal Purple)</option>
                  <option value="emerald">Xanh Ngọc Lục Bảo (Emerald Green)</option>
                  <option value="rose">Hồng Quyến Rũ (Rose Pink)</option>
                  <option value="indigo">Xanh Indigo Huyền Bí (Indigo Blue)</option>
                  <option value="cyber">Cyber Neon (Neon Glow)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Nội dung thông điệp chính *</label>
              <input
                type="text"
                value={formData.greetingBannerText}
                onChange={(e) => setFormData((prev) => ({ ...prev, greetingBannerText: e.target.value }))}
                placeholder="Ví dụ: Chào mừng bạn đến với Không Gian Âm Nhạc & Cốt Truyện Đặc Quyền..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Nội dung phụ / Chú thích (Subtext)</label>
              <input
                type="text"
                value={formData.greetingBannerSubtext || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, greetingBannerSubtext: e.target.value }))}
                placeholder="Ví dụ: Âm bass tăng cường và chất lượng phòng thu đã được kích hoạt."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Chữ trên nút bấm (CTA Button Text)</label>
                <input
                  type="text"
                  value={formData.greetingBannerCtaText || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, greetingBannerCtaText: e.target.value }))}
                  placeholder="Ví dụ: Khám Phá Ngay"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Đích đến khi bấm nút (Target View)</label>
                <select
                  value={formData.greetingBannerCtaTab || 'library'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, greetingBannerCtaTab: e.target.value as ActiveTab }))}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="library">Kho Audio (Library)</option>
                  <option value="vip">Đặc Quyền VIP (VIP Hub)</option>
                  <option value="community">Cộng Đồng (Community)</option>
                  <option value="studio">Studio Tác Giả (Studio)</option>
                  <option value="games">Game Âm Nhạc (Games)</option>
                  <option value="messages">Tin Nhắn & Bạn Bè (Messages)</option>
                  <option value="finance">Ví Tiền & Quỹ (Finance)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: HERO SPOTLIGHT BANNER CUSTOMIZER */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">3. Banner Tâm Điểm (Hero Spotlight)</h2>
              <p className="text-xs text-zinc-400">Khối trình diễn lớn nhất trên cùng trang chủ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">
              {formData.showHeroSpotlight ? 'Bật' : 'Tắt'}
            </span>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, showHeroSpotlight: !prev.showHeroSpotlight }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.showHeroSpotlight ? 'bg-indigo-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.showHeroSpotlight ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {formData.showHeroSpotlight && (
          <div className="space-y-5 pt-2 border-t border-zinc-800/80">
            {/* Mode selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">Nguồn nội dung Banner:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'auto',
                    title: 'Tự Động (Bài Mới Nhất)',
                    desc: 'Tự động lấy bài hát mới nhất trong kho âm thanh hệ thống.',
                  },
                  {
                    id: 'custom_track',
                    title: 'Chọn 1 Bản Audio Cụ Thể',
                    desc: 'Chọn đích danh 1 bài hát trong thư viện để ghim lên tâm điểm.',
                  },
                  {
                    id: 'custom_banner',
                    title: 'Banner Tùy Biến Hoàn Toàn',
                    desc: 'Tự viết tiêu đề, mô tả cốt truyện, dán ảnh bìa và nút bấm riêng.',
                  },
                ].map((m) => {
                  const isSel = formData.heroMode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setFormData((prev) => ({ ...prev, heroMode: m.id as any }))}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isSel ? 'text-indigo-300' : 'text-white'}`}>
                        {m.title}
                      </span>
                      <p className="text-[11px] text-zinc-400 mt-1">{m.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Style Variant */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Phong cách hiển thị (Style Variant)</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'classic_spotlight', label: 'Classic Spotlight' },
                  { id: 'cinematic_wide', label: 'Cinematic Wide' },
                  { id: 'storyline_epic', label: 'Storyline Epic' },
                  { id: 'cyber_glow', label: 'Cyber Glow' },
                  { id: 'minimal_clean', label: 'Minimal Clean' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, heroStyle: st.id as HomeHeroStyle }))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.heroStyle === st.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Track Picker when mode is custom_track */}
            {formData.heroMode === 'custom_track' && (
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">Bài audio được chọn làm Hero:</span>
                  <button
                    type="button"
                    onClick={() => setShowHeroTrackPicker(true)}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Search size={13} />
                    <span>Đổi bài audio ({tracks.length} bài)</span>
                  </button>
                </div>

                {selectedHeroTrack ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80">
                    <img
                      src={selectedHeroTrack.coverUrl}
                      alt={selectedHeroTrack.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                        {selectedHeroTrack.genre || 'Audio'}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{selectedHeroTrack.title}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{selectedHeroTrack.artist}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">Chưa chọn bài nào. Bấm nút phía trên để chọn.</p>
                )}
              </div>
            )}

            {/* Custom Banner Inputs when mode is custom_banner */}
            {formData.heroMode === 'custom_banner' && (
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Tiêu đề lớn của Banner *</label>
                    <input
                      type="text"
                      value={formData.heroCustomTitle || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomTitle: e.target.value }))}
                      placeholder="Ví dụ: Sóng Âm Cyber & Không Gian Đỉnh Cao"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Thẻ gắn nhãn (Badge Tag)</label>
                    <input
                      type="text"
                      value={formData.heroCustomTag || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomTag: e.target.value }))}
                      placeholder="Ví dụ: Tiêu Điểm Tác Giả Tuần Này"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Mô tả cốt truyện / Giới thiệu</label>
                  <textarea
                    rows={2}
                    value={formData.heroCustomSubtitle || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomSubtitle: e.target.value }))}
                    placeholder="Mô tả ngắn gọn về tác phẩm, thông điệp hoặc cốt truyện nổi bật..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Link Ảnh Bìa (Cover Art Image URL)</label>
                    <input
                      type="url"
                      value={formData.heroCustomCoverUrl || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomCoverUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Tên Tác Giả / Nghệ Sĩ Hiển Thị</label>
                    <input
                      type="text"
                      value={formData.heroCustomAuthorName || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomAuthorName: e.target.value }))}
                      placeholder="Ví dụ: Haevy Master Producer"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Chữ trên nút phát / kêu gọi (CTA Text)</label>
                    <input
                      type="text"
                      value={formData.heroCustomCtaText || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomCtaText: e.target.value }))}
                      placeholder="Ví dụ: Nghe Ngay / Khám Phá"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Hành động khi nhấn nút</label>
                    <select
                      value={formData.heroCustomAction || 'open_library'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroCustomAction: e.target.value as HomeHeroAction }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="open_library">Mở Kho Audio (Library)</option>
                      <option value="play_track">Phát bài audio mẫu</option>
                      <option value="open_vip">Mở Trang VIP</option>
                      <option value="open_studio">Mở Studio Tác Giả</option>
                      <option value="open_community">Mở Thảo Luận Cộng Đồng</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: ADMIN'S SIGNATURE PICKS */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">4. Mục Tác Phẩm Đề Cử Riêng (Admin's Picks)</h2>
              <p className="text-xs text-zinc-400">Danh sách các bản audio do chính Admin tuyển lựa riêng trên Trang Chủ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">
              {formData.showAdminPicksSection ? 'Hiển thị' : 'Ẩn'}
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, showAdminPicksSection: !prev.showAdminPicksSection }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.showAdminPicksSection ? 'bg-amber-400' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.showAdminPicksSection ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {formData.showAdminPicksSection && (
          <div className="space-y-4 pt-2 border-t border-zinc-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Tiêu đề mục đề cử *</label>
                <input
                  type="text"
                  value={formData.adminPicksTitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminPicksTitle: e.target.value }))}
                  placeholder="Ví dụ: Lựa Chọn Của Ban Quản Trị ⭐"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Phụ đề / Lời bình</label>
                <input
                  type="text"
                  value={formData.adminPicksSubtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminPicksSubtitle: e.target.value }))}
                  placeholder="Ví dụ: Những tác phẩm độc đáo & ấn tượng nhất do Admin tuyển chọn"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Selected Tracks in Admin Picks */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">
                  Các bài hát đã chọn ({formData.adminPicksTrackIds.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdminPicksPicker(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 cursor-pointer shadow"
                >
                  <Plus size={14} />
                  <span>Chọn thêm bài audio</span>
                </button>
              </div>

              {formData.adminPicksTrackIds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.adminPicksTrackIds.map((tId) => {
                    const trk = tracks.find((t) => t.id === tId);
                    if (!trk) return null;
                    return (
                      <div
                        key={tId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={trk.coverUrl} alt={trk.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{trk.title}</h4>
                            <p className="text-[11px] text-zinc-400 truncate">{trk.artist}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              adminPicksTrackIds: prev.adminPicksTrackIds.filter((id) => id !== tId),
                            }))
                          }
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Xóa khỏi mục đề cử"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Chưa chọn bài audio nào. Hãy nhấn "Chọn thêm bài audio" để thêm vào mục Admin Picks.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: SECTIONS VISIBILITY & CUSTOM TITLES */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">5. Tùy Biến Hiển Thị & Tiêu Đề Các Mục Khác</h2>
            <p className="text-xs text-zinc-400">Ẩn/Hiện và tùy biến tên gọi các khối nội dung bên dưới</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Genre Section */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Radio size={16} className="text-zinc-400" />
                Mục Khám Phá Theo Thể Loại
              </span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, showGenresSection: !prev.showGenresSection }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.showGenresSection ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.showGenresSection ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {formData.showGenresSection && (
              <input
                type="text"
                value={formData.genresTitle || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, genresTitle: e.target.value }))}
                placeholder="Tiêu đề mục (mặc định: Khám phá theo thể loại)"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            )}
          </div>

          {/* Trending Section */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                Mục Xu Hướng Nghe Nhiều (Trending Tracks)
              </span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, showTrendingSection: !prev.showTrendingSection }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.showTrendingSection ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.showTrendingSection ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {formData.showTrendingSection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.trendingTitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trendingTitle: e.target.value }))}
                  placeholder="Tiêu đề (mặc định: Xu hướng nghe nhiều)"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="text"
                  value={formData.trendingSubtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trendingSubtitle: e.target.value }))}
                  placeholder="Phụ đề (mặc định: Các bản audio thịnh hành trong tuần)"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          {/* Curated Collections Section */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Headphones size={16} className="text-purple-400" />
                Mục Bộ Sưu Tập Chọn Lọc (Curated Collections)
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, showCuratedCollections: !prev.showCuratedCollections }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.showCuratedCollections ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.showCuratedCollections ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {formData.showCuratedCollections && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.curatedCollectionsTitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, curatedCollectionsTitle: e.target.value }))}
                  placeholder="Tiêu đề (mặc định: Bộ sưu tập chọn lọc)"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="text"
                  value={formData.curatedCollectionsSubtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, curatedCollectionsSubtitle: e.target.value }))}
                  placeholder="Phụ đề (mặc định: Playlist tạo sẵn cho từng trạng thái tâm trí)"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <HelpCircle size={15} className="text-amber-400" />
          <span>
            Thay đổi sẽ được áp dụng trực tiếp qua Firebase Firestore và hiển thị theo thời gian thực (Real-time).
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowFullscreenPreview(true)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye size={15} className="text-amber-400" />
            <span>Xem trước</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black font-black text-xs shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Lưu & Công Bố Trang Chủ</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: SELECT HERO TRACK */}
      {showHeroTrackPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music size={18} className="text-indigo-400" />
                <span>Chọn Bài Audio Làm Hero Spotlight</span>
              </h3>
              <button
                onClick={() => setShowHeroTrackPicker(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={heroTrackSearch}
                onChange={(e) => setHeroTrackSearch(e.target.value)}
                placeholder="Tìm theo tên bài, tác giả hoặc thể loại..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 min-h-[250px]">
              {filteredHeroTracks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      heroCustomTrackId: t.id,
                      heroCustomTitle: t.title,
                      heroCustomSubtitle: t.storylineSummary || t.description || '',
                      heroCustomCoverUrl: t.coverUrl,
                      heroCustomAuthorName: t.artist,
                    }));
                    setShowHeroTrackPicker(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-indigo-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={t.coverUrl} alt={t.title} className="w-11 h-11 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-indigo-400">{t.genre || 'Audio'}</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 truncate">{t.title}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{t.artist}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-400 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    Chọn bài này
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SELECT ADMIN PICKS TRACKS */}
      {showAdminPicksPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-amber-400" />
                <span>Thêm Bài Hát Vào Mục Đề Cử Của Admin</span>
              </h3>
              <button
                onClick={() => setShowAdminPicksPicker(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={adminPicksSearch}
                onChange={(e) => setAdminPicksSearch(e.target.value)}
                placeholder="Tìm theo tên bài hoặc tác giả..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 min-h-[250px]">
              {filteredAdminPickTracks.map((t) => {
                const isAlreadySelected = formData.adminPicksTrackIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (isAlreadySelected) {
                        setFormData((prev) => ({
                          ...prev,
                          adminPicksTrackIds: prev.adminPicksTrackIds.filter((id) => id !== t.id),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          adminPicksTrackIds: [...prev.adminPicksTrackIds, t.id],
                        }));
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isAlreadySelected
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={t.coverUrl} alt={t.title} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{t.artist}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl ${
                        isAlreadySelected
                          ? 'bg-amber-400 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {isAlreadySelected ? 'Đã thêm ✓' : '+ Thêm'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAdminPicksPicker(false)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Hoàn Tất ({formData.adminPicksTrackIds.length} bài đã chọn)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK PICK USERS FROM PLATFORM USER LIST */}
      {showUserPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck size={18} className="text-amber-400" />
                  <span>Chọn Người Dùng Để Thêm Vào Danh Sách Được Đổi Trang Chủ</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Nhấp vào người dùng để thêm hoặc gỡ mã Account ID khỏi danh sách phân phối
                </p>
              </div>
              <button
                onClick={() => setShowUserPickerModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Tìm theo Account ID, Tên hiển thị, Email hoặc UID..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 min-h-[300px]">
              {filteredUsers.map((u) => {
                const targetKey = u.accountId || u.id || u.email;
                const isSelected = formData.targetAccountIds.includes(targetKey);

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveAccountId(targetKey);
                      } else {
                        handleAddAccountId(targetKey);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                        {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{u.displayName || 'Người dùng'}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300">
                            {u.accountId || 'Chưa cấp mã'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{u.email || u.id}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isSelected ? 'Đã Chọn ✓' : '+ Chọn'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowUserPickerModal(false)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Hoàn Tất ({formData.targetAccountIds.length} tài khoản trong danh sách)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: FULLSCREEN LIVE PREVIEW SANDBOX */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 animate-fade-in overflow-hidden">
          {/* Preview Control Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Chế Độ Xem Thử Trực Quan (Live Sandbox Preview)</h3>
                <p className="text-[11px] text-zinc-400">Kiểm tra trải nghiệm Trang Chủ dưới các góc nhìn khác nhau</p>
              </div>
            </div>

            {/* Perspective Selector */}
            <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setPreviewPerspective('eligible')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  previewPerspective === 'eligible'
                    ? 'bg-amber-400 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                👁️ Người Được Áp Dụng (Custom View)
              </button>
              <button
                type="button"
                onClick={() => setPreviewPerspective('ineligible')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  previewPerspective === 'ineligible'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                👁️ Người Không Được Áp Dụng (Standard View)
              </button>
            </div>

            {/* Close Preview */}
            <button
              type="button"
              onClick={() => setShowFullscreenPreview(false)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={16} />
              <span>Đóng Xem Thử</span>
            </button>
          </div>

          {/* Sandbox Live Rendering Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Simulation notification bar */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
                <span>
                  {previewPerspective === 'eligible'
                    ? '✨ Bạn đang xem giao diện tùy biến của Admin (dành cho đối tượng được chỉ định).'
                    : '⚪ Bạn đang xem giao diện tiêu chuẩn mặc định của Haevy Audio.'}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Đối tượng: {formData.targetAudience.toUpperCase()}
                </span>
              </div>

              {previewPerspective === 'eligible' && formData.isEnabled ? (
                /* RENDER CUSTOMIZED HOME LAYOUT */
                <div className="space-y-8">
                  {/* Greeting Announcement Ribbon */}
                  {formData.showAdminGreetingBanner && (
                    <div
                      className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                        formData.greetingBannerColor === 'amber'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : formData.greetingBannerColor === 'purple'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                          : formData.greetingBannerColor === 'emerald'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : formData.greetingBannerColor === 'rose'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                          : formData.greetingBannerColor === 'cyber'
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-cyan-500/10'
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md shrink-0">
                          {formData.greetingBannerIcon === 'crown' && <Crown size={22} />}
                          {formData.greetingBannerIcon === 'sparkles' && <Sparkles size={22} />}
                          {formData.greetingBannerIcon === 'radio' && <Radio size={22} />}
                          {formData.greetingBannerIcon === 'flame' && <Flame size={22} />}
                          {formData.greetingBannerIcon === 'heart' && <Heart size={22} />}
                          {formData.greetingBannerIcon === 'zap' && <Zap size={22} />}
                          {formData.greetingBannerIcon === 'gift' && <Gift size={22} />}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{formData.greetingBannerText}</h4>
                          {formData.greetingBannerSubtext && (
                            <p className="text-[11px] text-zinc-300 mt-0.5">{formData.greetingBannerSubtext}</p>
                          )}
                        </div>
                      </div>

                      {formData.greetingBannerCtaText && (
                        <button className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow-md shrink-0 hover:bg-zinc-200 cursor-pointer">
                          {formData.greetingBannerCtaText}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Hero Spotlight Section */}
                  {formData.showHeroSpotlight && (
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/80 border border-zinc-800 p-6 sm:p-10 shadow-2xl">
                      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>
                              {formData.heroCustomTag ||
                                (selectedHeroTrack?.isSeries ? 'Cốt truyện nổi bật hôm nay' : 'Bản audio nổi bật hôm nay')}
                            </span>
                          </div>

                          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                            {formData.heroMode === 'custom_banner'
                              ? formData.heroCustomTitle || 'Âm Thanh Đỉnh Cao Haevy'
                              : selectedHeroTrack?.title || 'Bản Giao Hưởng Đặc Sắc'}
                          </h1>

                          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
                            {formData.heroMode === 'custom_banner'
                              ? formData.heroCustomSubtitle || 'Được tuyển chọn độc quyền từ Ban Quản Trị Haevy Audio.'
                              : selectedHeroTrack?.storylineSummary ||
                                selectedHeroTrack?.description ||
                                'Phát hành chính thức bởi tác giả cộng đồng.'}
                          </p>

                          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xl">
                              <Play size={16} fill="currentColor" />
                              <span>{formData.heroCustomCtaText || 'Phát ngay'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="w-48 sm:w-64 aspect-square rounded-2xl overflow-hidden relative shadow-2xl border border-zinc-700 group shrink-0">
                          <img
                            src={
                              formData.heroMode === 'custom_banner' && formData.heroCustomCoverUrl
                                ? formData.heroCustomCoverUrl
                                : selectedHeroTrack?.coverUrl ||
                                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'
                            }
                            alt="Hero cover"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <span className="text-xs text-zinc-300 font-semibold">
                              {formData.heroMode === 'custom_banner'
                                ? formData.heroCustomAuthorName || 'Haevy Editorial'
                                : selectedHeroTrack?.artist}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Signature Picks Section */}
                  {formData.showAdminPicksSection && formData.adminPicksTrackIds.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Headphones size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {formData.adminPicksTitle || 'Lựa Chọn Của Ban Quản Trị ⭐'}
                          </h2>
                          <p className="text-xs text-zinc-500">
                            {formData.adminPicksSubtitle || 'Những tác phẩm độc đáo & ấn tượng nhất do Admin đề cử'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formData.adminPicksTrackIds.map((tId) => {
                          const trk = tracks.find((t) => t.id === tId);
                          if (!trk) return null;
                          return (
                            <div
                              key={tId}
                              className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md hover:border-amber-500/40 transition-all cursor-pointer"
                            >
                              <img src={trk.coverUrl} alt={trk.title} className="w-14 h-14 rounded-xl object-cover" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                  {trk.genre || 'Audio'}
                                </span>
                                <h3 className="font-bold text-sm text-white truncate">{trk.title}</h3>
                                <p className="text-xs text-zinc-400 truncate">{trk.artist}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Genres Section */}
                  {formData.showGenresSection && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Radio size={20} className="text-zinc-400" />
                        <span>{formData.genresTitle || 'Khám phá theo thể loại'}</span>
                      </h2>
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                        {GENRE_LIST.map((genre) => (
                          <div
                            key={genre}
                            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 whitespace-nowrap"
                          >
                            {genre}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Tracks Section */}
                  {formData.showTrendingSection && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          <Flame size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {formData.trendingTitle || 'Xu hướng nghe nhiều'}
                          </h2>
                          <p className="text-xs text-zinc-500">
                            {formData.trendingSubtitle || 'Các bản audio thịnh hành trong tuần'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tracks.slice(0, 6).map((track) => (
                          <div
                            key={track.id}
                            className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800"
                          >
                            <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-xs text-white truncate">{track.title}</h3>
                              <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Curated Collections Section */}
                  {formData.showCuratedCollections && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Headphones size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {formData.curatedCollectionsTitle || 'Bộ sưu tập chọn lọc'}
                          </h2>
                          <p className="text-xs text-zinc-500">
                            {formData.curatedCollectionsSubtitle || 'Playlist tạo sẵn cho từng trạng thái tâm trí'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {FEATURED_PLAYLISTS.map((item) => (
                          <div key={item.id} className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
                            <img src={item.coverUrl} alt={item.title} className="w-full aspect-[16/10] rounded-2xl object-cover" />
                            <h3 className="font-bold text-sm text-white">{item.title}</h3>
                            <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* RENDER STANDARD DEFAULT HOME VIEW */
                <div className="space-y-8 opacity-85">
                  <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                    <Radio size={32} className="mx-auto text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Giao Diện Tiêu Chuẩn Gốc Của Haevy Audio</h2>
                    <p className="text-xs text-zinc-400">
                      Đây là bố cục mặc định hiển thị cho người dùng khi chưa có tùy biến hoặc người dùng không nằm trong danh sách phân phối.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
