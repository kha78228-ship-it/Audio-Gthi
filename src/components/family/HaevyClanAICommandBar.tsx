import React, { useState, useMemo } from 'react';
import { FamilyTreeMember as FamilyMember, Track } from '../../types';
import { 
  calculateKinship, 
  getRelationshipStatusInfo, 
  getMemberAudioTracks, 
  getMemberAgeInfo,
  getMemberHometown 
} from '../../utils/familyTreeUtils';
import { 
  Sparkles, 
  Search, 
  Send, 
  User, 
  Heart, 
  Music, 
  MessageSquare, 
  UserPlus, 
  Check, 
  Play, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  RotateCcw,
  Volume2,
  ExternalLink
} from 'lucide-react';
import Markdown from 'react-markdown';

interface HaevyClanAICommandBarProps {
  members: FamilyMember[];
  treeInfo?: any;
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  onOpenMemberProfile?: (member: FamilyMember) => void;
  onOpenChatWithMember?: (member: FamilyMember) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onUpdateMember?: (updatedMember: FamilyMember) => void;
}

export const HaevyClanAICommandBar: React.FC<HaevyClanAICommandBarProps> = ({
  members,
  treeInfo,
  tracks = [],
  onPlayTrack,
  onOpenMemberProfile,
  onOpenChatWithMember,
  onNavigateToMode,
  onUpdateMember,
}) => {
  const [query, setQuery] = useState('');
  const [selectedMemberAId, setSelectedMemberAId] = useState<string>(members[0]?.id || '');
  const [selectedMemberBId, setSelectedMemberBId] = useState<string>(members[1]?.id || members[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<{
    targetMember?: FamilyMember;
    matchedTracks?: Track[];
    kinshipTitle?: string;
  } | null>(null);

  const selectedMemberA = useMemo(() => members.find(m => m.id === selectedMemberAId), [members, selectedMemberAId]);
  const selectedMemberB = useMemo(() => members.find(m => m.id === selectedMemberBId), [members, selectedMemberBId]);

  // Execute quick pre-defined clan command
  const handleQuickCommand = async (type: 'profile' | 'relationship' | 'love' | 'audio' | 'descendants') => {
    if (!selectedMemberA) return;

    let cmdText = '';
    if (type === 'profile') {
      cmdText = `Tra cứu thông tin người này như thế nào: ${selectedMemberA.fullName}`;
    } else if (type === 'relationship') {
      if (!selectedMemberB || selectedMemberA.id === selectedMemberB.id) {
        cmdText = `Mối quan hệ họ hàng của ${selectedMemberA.fullName} trong dòng họ`;
      } else {
        cmdText = `Mối quan hệ giữa ${selectedMemberA.fullName} và ${selectedMemberB.fullName} là gì, xưng hô như thế nào?`;
      }
    } else if (type === 'love') {
      cmdText = `Mối quan hệ tình cảm, hôn nhân, gia đạo của ${selectedMemberA.fullName} như thế nào?`;
    } else if (type === 'audio') {
      cmdText = `Người này đã đăng audio bài thu nào trên Haevy: ${selectedMemberA.fullName}`;
    } else if (type === 'descendants') {
      cmdText = `Ai là con cháu, hậu duệ của ${selectedMemberA.fullName}?`;
    }

    setQuery(cmdText);
    await executeQuery(cmdText, selectedMemberA, selectedMemberB);
  };

  // Main Query Execution Engine (Fast Hybrid: Local Intelligence + Gemini AI)
  const executeQuery = async (customQuery?: string, memA?: FamilyMember, memB?: FamilyMember) => {
    const textToRun = (customQuery || query).trim();
    if (!textToRun) return;

    setIsLoading(true);
    setResponseMarkdown(null);
    setSuggestedActions(null);

    const activeA = memA || selectedMemberA || members[0];
    const activeB = memB || selectedMemberB;

    // Detect matched member
    let targetMem = activeA;
    for (const m of members) {
      if (textToRun.toLowerCase().includes(m.fullName.toLowerCase())) {
        targetMem = m;
        break;
      }
    }

    // Gather local smart context
    const matchedAudio = targetMem ? getMemberAudioTracks(targetMem, tracks) : [];
    const loveInfo = targetMem ? getRelationshipStatusInfo(targetMem, members) : null;
    const kinshipInfo = targetMem && activeB && targetMem.id !== activeB.id 
      ? calculateKinship(activeB, targetMem, members) 
      : null;

    try {
      // Call server AI endpoint
      const res = await fetch('/api/gemini/clan-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: textToRun,
          members,
          treeInfo,
          tracks,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.answer) {
          setResponseMarkdown(json.answer);
          setSuggestedActions({
            targetMember: targetMem,
            matchedTracks: matchedAudio,
            kinshipTitle: kinshipInfo?.suggestedTitle,
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Clan AI network fallback:', err);
    }

    // Heuristic Fallback generator if offline or network fails
    let fallbackMd = '';
    if (targetMem) {
      const ageObj = getMemberAgeInfo(targetMem);
      const hometown = getMemberHometown(targetMem);
      const children = members.filter(m => m.fatherId === targetMem.id || m.motherId === targetMem.id);
      const spouses = members.filter(m => (targetMem.spouseIds || []).includes(m.id));

      fallbackMd = `### 🌟 Thông Tin Nhân Thân & Gia Tộc: **${targetMem.fullName}**

- **Thế hệ**: **Đời thứ ${targetMem.generation}** - Thuộc **${targetMem.branch || 'Chi Trưởng'}**
- **Tuổi / Trạng thái**: ${ageObj.display} (${targetMem.isDeceased ? 'Đã quy tiên' : 'Hiện tiền'})
- **Nguyên quán / Quê hương**: ${hometown}
- **Nơi cư trú**: ${targetMem.currentResidence || 'Đang cập nhật'}
- **Nghề nghiệp / Đóng góp**: ${targetMem.occupation || 'Thành viên gia tộc'}

---

#### 💖 Quan Hệ Tình Cảm & Hôn Phối:
- **Tình trạng**: **${loveInfo?.label || 'Đang cập nhật'}**
- **Chi tiết**: ${loveInfo?.detailsText || 'Gia đạo êm ấm'}
${spouses.length > 0 ? `- **Bạn đời ghi nhận**: ${spouses.map(s => s.fullName).join(', ')}` : ''}
${children.length > 0 ? `- **Hậu duệ nối dõi (${children.length} người)**: ${children.map(c => `${c.fullName} (Đời ${c.generation})`).join(', ')}` : '- **Hậu duệ**: Đang cập nhật thêm thông tin con cháu'}

---

#### 🎙️ Hoạt Động Âm Nhạc & Bản Thu Trên Haevy:
${matchedAudio.length > 0 
  ? `Đã liên kết **${matchedAudio.length} bản audio/bài thu** trên hệ sinh thái Haevy. Bạn có thể bấm nút nghe trực tiếp bên dưới.`
  : `Chưa có bản ghi âm podcast/audio riêng. Bạn có thể kết bạn và nhắn tin để mời người thân cùng đăng bài hát hoặc hồi ký gia tộc lên Haevy Audio!`
}

${kinshipInfo ? `---
#### 🤝 Xưng Hô Thân Tộc với ${activeB?.fullName}:
- **${kinshipInfo.callingPrompt}** (Danh xưng chuẩn: **${kinshipInfo.suggestedTitle}**)
` : ''}`;
    } else {
      fallbackMd = `### 🔍 Kết Quả Tra Cứu Gia Phả
Hệ thống đã nhận lệnh: "${textToRun}". Hãy chọn một thành viên cụ thể trong gia tộc hoặc đặt câu hỏi về xưng hô, tình cảm, audio để được giải đáp chi tiết nhất!`;
    }

    setResponseMarkdown(fallbackMd);
    setSuggestedActions({
      targetMember: targetMem,
      matchedTracks: matchedAudio,
      kinshipTitle: kinshipInfo?.suggestedTitle,
    });
    setIsLoading(false);
  };

  // Toggle friend status with this member
  const handleToggleFriend = (member: FamilyMember) => {
    const currentStatus = member.haevyFriendStatus || 'none';
    const nextStatus: 'pending' | 'none' | 'friend' = currentStatus === 'friend' ? 'none' : 'friend';
    const updated: FamilyMember = { ...member, haevyFriendStatus: nextStatus };
    if (onUpdateMember) {
      onUpdateMember(updated);
    }
  };

  return (
    <div id="haevy-clan-ai-command-bar" className="w-full bg-slate-900/90 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 text-slate-100 mb-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
              Trợ Lý Gia Tộc Haevy AI • Tra Cứu & Kết Nối Hệ Sinh Thái
            </h3>
            <p className="text-xs text-slate-400">
              Hỏi đáp xưng hô thân tộc, tra cứu nhân thân, tình cảm hôn nhân, xem audio đã đăng & kết bạn nhắn tin
            </p>
          </div>
        </div>

        {/* Member selector for quick targeting */}
        {members.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Thành viên tra cứu:</span>
            <select
              value={selectedMemberAId}
              onChange={(e) => setSelectedMemberAId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} (Đời {m.generation})
                </option>
              ))}
            </select>

            {members.length > 1 && (
              <>
                <span className="text-slate-500">với:</span>
                <select
                  value={selectedMemberBId}
                  onChange={(e) => setSelectedMemberBId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      {/* Suggested Command Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        <button
          onClick={() => handleQuickCommand('profile')}
          className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
        >
          <User className="w-3.5 h-3.5" />
          Tra cứu thông tin người này ntn
        </button>

        <button
          onClick={() => handleQuickCommand('relationship')}
          className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Mối quan hệ xưng hô ntn
        </button>

        <button
          onClick={() => handleQuickCommand('love')}
          className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          Quan hệ tình cảm & hôn nhân
        </button>

        <button
          onClick={() => handleQuickCommand('audio')}
          className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
        >
          <Music className="w-3.5 h-3.5 text-emerald-400" />
          Xem đã đăng audio gì trên Haevy
        </button>

        <button
          onClick={() => handleQuickCommand('descendants')}
          className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          Con cháu hậu duệ nối dõi
        </button>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeQuery();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedMemberA 
                ? `Nhập câu lệnh hỏi về ${selectedMemberA.fullName} (vd: quê quán ở đâu, xưng hô với người khác ntn, đã đăng bài hát nào...)`
                : 'Nhập câu lệnh hoặc câu hỏi tra cứu gia phả...'
            }
            className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-amber-500/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          {isLoading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Hỏi Haevy</span>
        </button>
      </form>

      {/* Response Display */}
      {responseMarkdown && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
          <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 text-sm text-slate-200 leading-relaxed max-h-96 overflow-y-auto">
            <Markdown>{responseMarkdown}</Markdown>
          </div>

          {/* Quick Ecosystem Action Buttons */}
          {suggestedActions?.targetMember && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Kết bạn */}
              <button
                onClick={() => handleToggleFriend(suggestedActions.targetMember!)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  suggestedActions.targetMember.haevyFriendStatus === 'friend'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
                }`}
              >
                {suggestedActions.targetMember.haevyFriendStatus === 'friend' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Đã là bạn thân tộc
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Kết bạn với {suggestedActions.targetMember.fullName}
                  </>
                )}
              </button>

              {/* Nhắn tin */}
              <button
                onClick={() => {
                  if (onOpenChatWithMember) {
                    onOpenChatWithMember(suggestedActions.targetMember!);
                  } else if (onNavigateToMode) {
                    onNavigateToMode('messages', 'chat');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Nhắn tin với {suggestedActions.targetMember.fullName}
              </button>

              {/* Mở xem hồ sơ cá nhân */}
              <button
                onClick={() => {
                  if (onOpenMemberProfile) {
                    onOpenMemberProfile(suggestedActions.targetMember!);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Xem hồ sơ chi tiết
              </button>

              {/* Tình cảm: mở I Love Haevy nếu có bạn đời */}
              {suggestedActions.targetMember.relationshipStatus === 'married' && onNavigateToMode && (
                <button
                  onClick={() => onNavigateToMode('couple')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Mở I Love Haevy (Gia đạo)
                </button>
              )}
            </div>
          )}

          {/* Matched audio tracks from Haevy ecosystem */}
          {suggestedActions?.matchedTracks && suggestedActions.matchedTracks.length > 0 && (
            <div className="mt-3 bg-slate-900 border border-emerald-500/20 rounded-xl p-3">
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-2">
                <Volume2 className="w-3.5 h-3.5" />
                Audio & Bản Thu của {suggestedActions.targetMember?.fullName} trên Haevy:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedActions.matchedTracks.map(track => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Music className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-200 truncate">{track.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{track.artist || track.addedByName || 'Thành viên'}</div>
                      </div>
                    </div>
                    {onPlayTrack && (
                      <button
                        onClick={() => onPlayTrack(track)}
                        className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Phát
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
