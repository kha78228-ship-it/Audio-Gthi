import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Share2, 
  Users, 
  Check, 
  Copy, 
  Compass, 
  Moon, 
  Flame, 
  Award,
  Globe,
  Loader2,
  BookOpen
} from 'lucide-react';
import { SpiritualShareAttachment, Conversation, Friendship } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  sendChatMessage, 
  getOrCreateConversation 
} from '../../services/socialService';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { haptics } from '../../utils/haptics';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';

interface SpiritualShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: SpiritualShareAttachment | null;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function SpiritualShareModal({
  isOpen,
  onClose,
  attachment,
  onNavigateToMode
}: SpiritualShareModalProps) {
  const { user, isVip, isAuthorVerified, authorStageName } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'message' | 'invite' | 'couple' | 'feed' | 'copy'>('message');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [selectedRecipientUid, setSelectedRecipientUid] = useState<string | null>(null);
  const [selectedRecipientData, setSelectedRecipientData] = useState<any | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  
  // Loading & success states
  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [coupleInfo, setCoupleInfo] = useState<any | null>(null);
  const [loadingCouple, setLoadingCouple] = useState(false);

  // Load conversations and friends
  useEffect(() => {
    if (!isOpen || !user) return;

    // Reset toast & defaults
    setSuccessToast(null);
    setCustomMessage(`Mình vừa có kết quả ${attachment?.title || 'tâm linh vũ trụ'} trên Haevy, gửi bạn xem cùng nhé! ✨`);

    // 1. Fetch recent conversations
    const fetchConvs = async () => {
      try {
        const qConv = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid),
          orderBy('lastMessageAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(qConv);
        const list: Conversation[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
        setConversations(list);

        // Preselect first other user
        if (list.length > 0 && !selectedRecipientUid) {
          const first = list[0];
          const otherUid = first.participants.find(p => p !== user.uid);
          if (otherUid && first.participantDetails && first.participantDetails[otherUid]) {
            setSelectedRecipientUid(otherUid);
            setSelectedRecipientData(first.participantDetails[otherUid]);
          }
        }
      } catch (err) {
        console.warn('Error loading conversations for share:', err);
      }
    };

    // 2. Fetch Couple Data from Firestore
    const fetchCouple = async () => {
      setLoadingCouple(true);
      try {
        const q1 = query(collection(db, 'couples'), where('partner1.uid', '==', user.uid));
        const q2 = query(collection(db, 'couples'), where('partner2.uid', '==', user.uid));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          const data = snap1.docs[0].data();
          if (data.status !== 'cancelled') {
            setCoupleInfo({ id: snap1.docs[0].id, ...data });
            setLoadingCouple(false);
            return;
          }
        }
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          const data = snap2.docs[0].data();
          if (data.status !== 'cancelled') {
            setCoupleInfo({ id: snap2.docs[0].id, ...data });
          }
        }
      } catch (err) {
        console.warn('Error loading couple data:', err);
      }
      setLoadingCouple(false);
    };

    fetchConvs();
    fetchCouple();
  }, [isOpen, user, attachment]);

  if (!isOpen || !attachment) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 2200);
  };

  // 1. Handle Send to Haevy Message
  const handleSendMessage = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để gửi tin nhắn chia sẻ!');
      return;
    }
    if (!selectedRecipientUid) {
      alert('Vui lòng chọn người bạn muốn chia sẻ!');
      return;
    }

    setIsSending(true);
    haptics.impact('medium');
    spiritualAudio.playCardFlipChime();

    try {
      const senderObj = {
        uid: user.uid,
        displayName: user.displayName || 'Người Dùng Haevy',
        photoURL: user.photoURL || '',
        isVip: Boolean(isVip),
        isAuthorVerified: Boolean(isAuthorVerified),
        stageName: authorStageName || ''
      };

      const recipientObj = selectedRecipientData || { uid: selectedRecipientUid };

      const res = await sendChatMessage({
        sender: senderObj,
        recipient: recipientObj,
        recipientUid: selectedRecipientUid,
        text: customMessage.trim(),
        spiritualAttachment: attachment
      });

      if (res.success !== false) {
        spiritualAudio.playTempleBell();
        showToast(`Đã chia sẻ "${attachment.title}" tới bạn bè qua Haevy Message thành công!`);
      } else {
        alert(res.message || 'Không thể gửi tin nhắn.');
      }
    } catch (err) {
      console.error('Error sending spiritual message:', err);
      alert('Đã xảy ra lỗi khi gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  // 2. Handle Invite Co-Reading
  const handleSendInvite = async (inviteType: 'co_reading' | 'love_synastry' | 'tarot_duel') => {
    if (!user || !selectedRecipientUid) {
      alert('Vui lòng chọn người bạn muốn mời!');
      return;
    }

    setIsSending(true);
    haptics.impact('medium');
    spiritualAudio.playWindChime();

    try {
      const inviteAttachment: SpiritualShareAttachment = {
        ...attachment,
        inviteType,
        inviteRoomId: `room_${Date.now()}_${user.uid.slice(0, 4)}`,
        title: inviteType === 'love_synastry' 
          ? '💖 Lời Mời: Xem Độ Hòa Hợp Cung Hoàng Đạo & Tình Yêu' 
          : '🔮 Lời Mời: Cùng Bói Bài Tarot & So Kèo Năng Lượng Vũ Trụ'
      };

      const senderObj = {
        uid: user.uid,
        displayName: user.displayName || 'Người Dùng Haevy',
        photoURL: user.photoURL || '',
        isVip: Boolean(isVip)
      };

      await sendChatMessage({
        sender: senderObj,
        recipientUid: selectedRecipientUid,
        text: `✨ Mình gửi bạn lời mời cùng bói bài và xem tương hợp năng lượng trên Haevy Spiritual!`,
        spiritualAttachment: inviteAttachment
      });

      spiritualAudio.playTempleBell();
      showToast('Đã gửi lời mời trải bài chung thành công!');
    } catch (err) {
      console.error('Error sending invite:', err);
      alert('Không thể gửi lời mời.');
    } finally {
      setIsSending(false);
    }
  };

  // 3. Handle Save to "I Love Haevy" (Couple Diary / Love Notes)
  const handleSaveToCoupleDiary = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập!');
      return;
    }
    if (!coupleInfo) {
      alert('Bạn chưa ghép đôi với người thương trong "I Love Haevy". Hãy sang mục I Love Haevy để kết nối trước nhé!');
      return;
    }

    setIsSending(true);
    haptics.impact('medium');
    spiritualAudio.playSingingBowl(528);

    try {
      // Add a couple diary entry
      const diariesCol = collection(db, 'couples', coupleInfo.id, 'diaries');
      await addDoc(diariesCol, {
        authorUid: user.uid,
        authorName: user.displayName || 'Người Yêu',
        title: `🔮 [Quẻ Vũ Trụ] ${attachment.title}`,
        content: `**Thông điệp**: ${attachment.subtitle || attachment.questionOrTheme || ''}\n\n${attachment.aiVerdictExcerpt || attachment.affirmationText || 'Quẻ bói tình yêu và năng lượng gắn kết được lưu từ Haevy Spiritual.'}`,
        mood: 'happy',
        weather: 'clear',
        category: 'spiritual_reading',
        spiritualAttachment: attachment,
        createdAt: serverTimestamp()
      });

      spiritualAudio.playTempleBell();
      showToast('Đã lưu thành công vào Nhật Ký Tình Yêu của I Love Haevy! 💖');
    } catch (err) {
      console.error('Error saving to couple diary:', err);
      alert('Không thể lưu vào nhật ký cặp đôi.');
    } finally {
      setIsSending(false);
    }
  };

  // 4. Handle Post to Haevy Community Feed
  const handlePostToFeed = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đăng bài lên bảng tin!');
      return;
    }

    setIsSending(true);
    haptics.impact('medium');

    try {
      const feedCol = collection(db, 'feedPosts');
      await addDoc(feedCol, {
        authorId: user.uid,
        authorUid: user.uid,
        authorName: user.displayName || 'Người Dùng Haevy',
        authorPhoto: user.photoURL || '',
        authorIsVip: Boolean(isVip),
        authorIsVerified: Boolean(isAuthorVerified),
        authorStageName: authorStageName || '',
        content: customMessage.trim() || `🔮 Mình vừa trải nghiệm ${attachment.title} tại Haevy Spiritual!`,
        spiritualAttachment: attachment,
        likesCount: 0,
        likedBy: [],
        commentsCount: 0,
        createdAt: serverTimestamp()
      });

      spiritualAudio.playTempleBell();
      showToast('Đã đăng quẻ bói lên Bảng Tin Haevy Feed thành công! ✨');
    } catch (err) {
      console.error('Error posting to feed:', err);
      alert('Không thể đăng lên bảng tin.');
    } finally {
      setIsSending(false);
    }
  };

  // 5. Handle Copy Share Text
  const handleCopyText = () => {
    let text = `🔮 HAEVY SPIRITUAL — ${attachment.title}\n`;
    if (attachment.subtitle) text += `📌 ${attachment.subtitle}\n`;
    if (attachment.questionOrTheme) text += `❓ Chủ đề: ${attachment.questionOrTheme}\n`;
    if (attachment.affirmationText) text += `✨ Thông điệp: "${attachment.affirmationText}"\n`;
    if (attachment.aiVerdictExcerpt) text += `\n📜 Luận giải:\n${attachment.aiVerdictExcerpt}\n`;
    text += `\nTrải nghiệm Bói Tarot 3D & Tử Vi tại: https://ais-pre-admmxjbptihc47fwn3gasm-844895364579.asia-southeast1.run.app`;

    navigator.clipboard.writeText(text);
    haptics.impact('light');
    showToast('Đã sao chép nội dung quẻ bói vào bộ nhớ đệm!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-zinc-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Liên Kết & Chia Sẻ Vũ Trụ
              </h3>
              <p className="text-xs text-purple-300 line-clamp-1">
                {attachment.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-4 pt-3 pb-1 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => { haptics.impact('light'); setActiveTab('message'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'message'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <MessageSquare size={14} />
            <span>Gửi Haevy Message</span>
          </button>

          <button
            onClick={() => { haptics.impact('light'); setActiveTab('invite'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Users size={14} />
            <span>Mời Bói Chung</span>
          </button>

          <button
            onClick={() => { haptics.impact('light'); setActiveTab('couple'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'couple'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Heart size={14} />
            <span>Gửi I Love Haevy</span>
          </button>

          <button
            onClick={() => { haptics.impact('light'); setActiveTab('feed'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Globe size={14} />
            <span>Đăng Bảng Tin</span>
          </button>

          <button
            onClick={() => { haptics.impact('light'); setActiveTab('copy'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'copy'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Copy size={14} />
            <span>Sao Chép</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Card Preview Banner */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
            <div className="w-12 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 border border-purple-400/40 p-1 flex items-center justify-center text-center shrink-0 shadow-md">
              {attachment.type === 'tarot' && <Sparkles className="w-6 h-6 text-amber-300" />}
              {attachment.type === 'tuvi' && <Compass className="w-6 h-6 text-amber-300" />}
              {attachment.type === 'astrology_compatibility' && <Heart className="w-6 h-6 text-rose-300" />}
              {attachment.type === 'cosmic_affirmation' && <Moon className="w-6 h-6 text-cyan-300" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/30">
                Thẻ Đính Kèm Tâm Linh
              </span>
              <h4 className="text-sm font-bold text-white mt-1 truncate">
                {attachment.title}
              </h4>
              <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">
                {attachment.subtitle || attachment.affirmationText || attachment.aiVerdictExcerpt || 'Thông điệp khai mở trực giác từ Hệ sinh thái Haevy'}
              </p>
            </div>
          </div>

          {/* TAB 1: Haevy Message */}
          {activeTab === 'message' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300">
                Chọn người nhận trong danh sách trò chuyện:
              </label>

              {conversations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {conversations.map((conv) => {
                    const otherUid = conv.participants.find(p => p !== user?.uid) || '';
                    const details = conv.participantDetails?.[otherUid] || { displayName: 'Người Dùng', photoURL: '' };
                    const isSelected = selectedRecipientUid === otherUid;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          haptics.impact('light');
                          setSelectedRecipientUid(otherUid);
                          setSelectedRecipientData(details);
                        }}
                        className={`p-2.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-950/60 border-sky-400 text-white shadow-lg shadow-sky-950/40 ring-1 ring-sky-400'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                          {details.photoURL ? (
                            <img src={details.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            details.displayName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{details.displayName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{conv.lastMessageText || 'Chạm để chọn'}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-sky-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-1">
                  <p className="text-xs text-zinc-400">Chưa có hội thoại nào gần đây.</p>
                  <p className="text-[11px] text-zinc-500">Hãy kết bạn tại Haevy Message để chia sẻ nhanh!</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Lời nhắn kèm theo:</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-400 resize-none"
                  placeholder="Nhập lời nhắn gửi bạn bè..."
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isSending || !selectedRecipientUid}
                className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isSending || !selectedRecipientUid
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 active:scale-98'
                }`}
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang gửi qua Haevy Message...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Gửi Quẻ Tới Bạn Bè (Haevy Message)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Invite Co-Reading */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Mời bạn bè cùng tham gia phòng bói bài chung hoặc kiểm tra độ hòa hợp tử vi & chiêm tinh cặp đôi:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSendInvite('co_reading')}
                  disabled={isSending || !selectedRecipientUid}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-950/60 border border-purple-500/40 hover:border-purple-400 text-left space-y-2 group transition-all cursor-pointer hover:scale-102"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <h5 className="text-xs font-bold text-white group-hover:text-purple-300">
                    Trải Bài Tarot Đôi
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Mỗi người bốc 1 lá bài đại diện cho năng lượng hai bên và xem luận giải tương hợp.
                  </p>
                </button>

                <button
                  onClick={() => handleSendInvite('love_synastry')}
                  disabled={isSending || !selectedRecipientUid}
                  className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/40 to-pink-950/60 border border-rose-500/40 hover:border-rose-400 text-left space-y-2 group transition-all cursor-pointer hover:scale-102"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    <Heart size={16} />
                  </div>
                  <h5 className="text-xs font-bold text-white group-hover:text-rose-300">
                    So Kèo Cung Hoàng Đạo
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Mời bạn bè cùng nhập ngày sinh để đo điểm ăn ý chiêm tinh và số mệnh 2026.
                  </p>
                </button>
              </div>

              {!selectedRecipientUid && (
                <p className="text-[11px] text-amber-400 font-medium text-center">
                  ⚠️ Hãy chuyển sang tab "Gửi Haevy Message" để chọn người bạn muốn mời trước nhé.
                </p>
              )}
            </div>
          )}

          {/* TAB 3: I Love Haevy (Couple) */}
          {activeTab === 'couple' && (
            <div className="space-y-4">
              {loadingCouple ? (
                <div className="py-6 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Đang kiểm tra kết nối với I Love Haevy...
                </div>
              ) : coupleInfo ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-rose-400 fill-rose-400/20 shrink-0 animate-pulse" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-black text-rose-200">
                        {coupleInfo.title || 'Mái Ấm Cặp Đôi Hạnh Phúc'}
                      </h4>
                      <p className="text-[11px] text-zinc-300">
                        {coupleInfo.partner1?.nickname || 'Bạn'} & {coupleInfo.partner2?.nickname || 'Người Ấy'} • Đã kết nối
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleSaveToCoupleDiary}
                      disabled={isSending}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer transition-all active:scale-98"
                    >
                      {isSending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <BookOpen size={16} />
                      )}
                      <span>Lưu Quẻ Này Vào Nhật Ký Cặp Đôi (I Love Haevy)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
                  <Heart className="w-8 h-8 text-rose-400 mx-auto opacity-70" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Chưa Ghép Đôi Với Người Thương</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      Hãy chuyển sang không gian <strong>I Love Haevy</strong> để tạo mã kết nối lãng mạn cùng người ấy.
                    </p>
                  </div>

                  {onNavigateToMode && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToMode('couple');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Heart size={14} />
                      <span>Đến I Love Haevy Ngay</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Haevy Community Feed */}
          {activeTab === 'feed' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                Đăng kết quả tâm linh & thông điệp tích cực lên bảng tin Haevy Feed để bạn bè và cộng đồng cùng thả tim:
              </p>

              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-indigo-400 resize-none"
                placeholder="Cảm nghĩ của bạn về thông điệp này..."
              />

              <button
                onClick={handlePostToFeed}
                disabled={isSending}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer transition-all active:scale-98"
              >
                {isSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Globe size={16} />
                )}
                <span>Đăng Ngay Lên Bảng Tin Haevy Feed</span>
              </button>
            </div>
          )}

          {/* TAB 5: Copy & Share Text */}
          {activeTab === 'copy' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                Sao chép nhanh toàn bộ thông điệp và luận giải để chia sẻ qua Messenger, Zalo, Telegram hoặc lưu vào ghi chú:
              </p>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
                {`🔮 HAEVY SPIRITUAL — ${attachment.title}\n${attachment.subtitle || ''}\n\n${attachment.aiVerdictExcerpt || attachment.affirmationText || 'Thông điệp vũ trụ mang lại nguồn năng lượng an lành.'}`}
              </div>

              <button
                onClick={handleCopyText}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-98"
              >
                <Copy size={16} />
                <span>Sao Chép Toàn Bộ Luận Giải</span>
              </button>
            </div>
          )}
        </div>

        {/* Success Toast Floating inside modal */}
        {successToast && (
          <div className="p-3 bg-emerald-900/90 border-t border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <Check size={16} className="text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
