import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Check, 
  X, 
  UserCheck, 
  UserX, 
  MessageSquare, 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  Clock,
  Trash2,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Friendship, FriendRequest } from '../../types';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  cancelFriendRequest, 
  removeFriendship 
} from '../../services/socialService';
import { useBatchUserPresence } from '../../services/presenceService';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface FriendsTabProps {
  onOpenAuth: () => void;
  onOpenChatWithUser: (userUid: string) => void;
}

export function FriendsTab({
  onOpenAuth,
  onOpenChatWithUser
}: FriendsTabProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName } = useAuth();

  // Sub-tabs in Friends view
  const [subSection, setSubSection] = useState<'search' | 'requests' | 'my-friends'>('search');

  // Data states
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  // Search user state
  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [searchResultUsers, setSearchResultUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // 1. Subscribe to Friendships
  useEffect(() => {
    if (!user) {
      setFriendships([]);
      return;
    }

    const qFriends = query(
      collection(db, 'friendships'),
      where('userIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(qFriends, (snap) => {
      const list: Friendship[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Friendship));
      setFriendships(list);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to Received Requests (Pending)
  useEffect(() => {
    if (!user) {
      setReceivedRequests([]);
      return;
    }

    const qRec = query(
      collection(db, 'friendRequests'),
      where('receiverUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(qRec, (snap) => {
      const list: FriendRequest[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as FriendRequest));
      setReceivedRequests(list);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Subscribe to Sent Requests (Pending)
  useEffect(() => {
    if (!user) {
      setSentRequests([]);
      return;
    }

    const qSent = query(
      collection(db, 'friendRequests'),
      where('senderUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(qSent, (snap) => {
      const list: FriendRequest[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as FriendRequest));
      setSentRequests(list);
    });

    return () => unsubscribe();
  }, [user]);

  // 4. Load Suggested Users from Firestore users collection
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const qUsers = query(collection(db, 'users'), limit(15));
        const snap = await getDocs(qUsers);
        const list: any[] = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.uid !== user?.uid) {
            list.push({
              uid: data.uid || d.id,
              displayName: data.displayName || 'Người dùng',
              accountId: data.accountId || 'HV-USER',
              photoURL: data.photoURL || '',
              isVip: Boolean(data.isVip),
              isAuthorVerified: Boolean(data.isAuthorVerified),
              stageName: data.stageName || data.authorStageName || ''
            });
          }
        });
        setSuggestedUsers(list);
      } catch (err) {
        console.warn('Suggested users fetch error:', err);
      }
    };

    loadSuggestions();
  }, [user]);

  // Handle Search Users by Account ID or Name
  const handleSearchUsers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchAccountQuery.trim().toLowerCase();
    if (!q) {
      setSearchResultUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const results: any[] = [];

      snap.forEach(d => {
        const data = d.data();
        const docUid = data.uid || d.id;
        if (docUid === user?.uid) return;

        const name = (data.displayName || '').toLowerCase();
        const accId = (data.accountId || '').toLowerCase();
        const stageName = (data.stageName || data.authorStageName || '').toLowerCase();

        if (name.includes(q) || accId.includes(q) || stageName.includes(q)) {
          results.push({
            uid: docUid,
            displayName: data.displayName || 'Người dùng',
            accountId: data.accountId || 'HV-USER',
            photoURL: data.photoURL || '',
            isVip: Boolean(data.isVip),
            isAuthorVerified: Boolean(data.isAuthorVerified),
            stageName: data.stageName || data.authorStageName || ''
          });
        }
      });

      setSearchResultUsers(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Track real-time presence (10-second threshold) for all friends and discovered users
  const allTargetUids = React.useMemo(() => {
    const uids = new Set<string>();
    friendships.forEach((f) => {
      f.userIds.forEach((id) => {
        if (id && id !== user?.uid) uids.add(id);
      });
    });
    suggestedUsers.forEach((u) => {
      if (u.uid && u.uid !== user?.uid) uids.add(u.uid);
    });
    searchResultUsers.forEach((u) => {
      if (u.uid && u.uid !== user?.uid) uids.add(u.uid);
    });
    receivedRequests.forEach((r) => {
      if (r.senderUid && r.senderUid !== user?.uid) uids.add(r.senderUid);
    });
    sentRequests.forEach((r) => {
      if (r.receiverUid && r.receiverUid !== user?.uid) uids.add(r.receiverUid);
    });
    return Array.from(uids);
  }, [friendships, suggestedUsers, searchResultUsers, receivedRequests, sentRequests, user?.uid]);

  const { getUserStatus, isUserOnline } = useBatchUserPresence(allTargetUids);

  // Helper: check relationship status with a user
  const getRelationStatus = (targetUid: string) => {
    const isFriend = friendships.some(f => f.userIds.includes(targetUid));
    if (isFriend) return 'friend';
    const isSent = sentRequests.some(r => r.receiverUid === targetUid);
    if (isSent) return 'sent';
    const isReceived = receivedRequests.some(r => r.senderUid === targetUid);
    if (isReceived) return 'received';
    return 'none';
  };

  // Send Friend Request handler
  const handleSendRequest = async (targetUser: any) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const res = await sendFriendRequest({
      sender: {
        uid: user.uid,
        displayName: user.displayName,
        accountId: accountId,
        photoURL: user.photoURL,
        isVip,
        isAuthorVerified,
        stageName: authorStageName
      },
      receiver: targetUser
    });

    showNotice(res.message);
  };

  // Accept Friend Request handler
  const handleAcceptRequest = async (req: FriendRequest) => {
    if (!user) return;
    const res = await acceptFriendRequest(req.id, req, {
      uid: user.uid,
      displayName: user.displayName || 'Người dùng',
      accountId: accountId || 'HV-USER',
      photoURL: user.photoURL || '',
      isVip,
      isAuthorVerified,
      stageName: authorStageName
    });
    showNotice(res.message);
  };

  // Reject Friend Request handler
  const handleRejectRequest = async (requestId: string) => {
    const res = await rejectFriendRequest(requestId);
    showNotice(res.message);
  };

  // Cancel sent request handler
  const handleCancelRequest = async (requestId: string) => {
    const res = await cancelFriendRequest(requestId);
    showNotice(res.message);
  };

  // Remove friendship
  const handleUnfriend = async (friendshipId: string, friendName: string) => {
    if (confirm(`Bạn có chắc muốn hủy kết bạn với ${friendName}?`)) {
      const res = await removeFriendship(friendshipId);
      showNotice(res.message);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. Header & Navigation Sub-Tabs */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl backdrop-blur-md space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-white truncate">Quản Lý & Kết Bạn Mới</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">Tìm kiếm, gửi lời mời và quản lý bạn bè</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Segmented Controls */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSubSection('search')}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              subSection === 'search'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search size={13} />
            <span>Tìm Kiếm</span>
          </button>

          <button
            type="button"
            onClick={() => setSubSection('requests')}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 relative whitespace-nowrap ${
              subSection === 'requests'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus size={13} />
            <span>Lời Mời</span>
            {receivedRequests.length > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center ml-0.5">
                {receivedRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubSection('my-friends')}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              subSection === 'my-friends'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck size={13} />
            <span>Bạn Bè ({friendships.length})</span>
          </button>
        </div>

        {notice && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 font-semibold flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* 2. Sub-Section 1: Search & Discover */}
      {subSection === 'search' && (
        <div className="space-y-6">
          {/* Search Input Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search size={15} className="text-amber-400" />
              <span>Tìm bạn theo Tên hoặc Mã Tài Khoản</span>
            </h4>

            <form onSubmit={handleSearchUsers} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchAccountQuery}
                  onChange={(e) => setSearchAccountQuery(e.target.value)}
                  placeholder="Nhập tên người dùng hoặc mã ID (ví dụ: HV-123456)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all shadow-md shadow-amber-500/20"
              >
                {isSearching ? 'Đang tìm...' : 'Tìm Kiếm'}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searchAccountQuery && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Kết Quả Tìm Kiếm ({searchResultUsers.length})
              </h4>

              {searchResultUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResultUsers.map((targetUser) => {
                    const status = getRelationStatus(targetUser.uid);
                    const isOnline = isUserOnline(targetUser.uid);

                    return (
                      <div
                        key={targetUser.uid}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className={`w-11 h-11 rounded-2xl overflow-hidden p-0.5 border shadow ${
                              targetUser.isVip ? 'border-amber-400 bg-amber-500/20' : isOnline ? 'border-emerald-500 bg-zinc-800' : 'border-zinc-700 bg-zinc-800'
                            }`}>
                              {targetUser.photoURL ? (
                                <img src={targetUser.photoURL} alt="" className="w-full h-full object-cover rounded-[14px]" />
                              ) : (
                                <div className="w-full h-full rounded-[14px] bg-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                                  {targetUser.displayName?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            {isOnline ? (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </span>
                            ) : (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-950" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-white truncate max-w-[130px]">
                                {targetUser.stageName || targetUser.displayName}
                              </h5>
                              {targetUser.isVip && (
                                <Crown size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              ID: {targetUser.accountId}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons based on status */}
                        {status === 'friend' ? (
                          <button
                            type="button"
                            onClick={() => onOpenChatWithUser(targetUser.uid)}
                            className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-[11px] font-bold flex items-center gap-1"
                          >
                            <MessageSquare size={13} />
                            <span>Nhắn tin</span>
                          </button>
                        ) : status === 'sent' ? (
                          <span className="text-[10px] text-amber-300 font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            Đã gửi lời mời
                          </span>
                        ) : status === 'received' ? (
                          <span className="text-[10px] text-emerald-300 font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            Đã nhận lời mời
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendRequest(targetUser)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-bold flex items-center gap-1 shadow"
                          >
                            <UserPlus size={13} />
                            <span>Kết bạn</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic py-3 text-center">
                  Không tìm thấy người dùng phù hợp với từ khóa "{searchAccountQuery}".
                </p>
              )}
            </div>
          )}

          {/* Suggested Friends */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={15} className="text-amber-400" />
              <span>Gợi Ý Kết Bạn Từ Cộng Đồng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {suggestedUsers.map((sugUser) => {
                const status = getRelationStatus(sugUser.uid);
                const isOnline = isUserOnline(sugUser.uid);

                return (
                  <div
                    key={sugUser.uid}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between gap-3 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-2xl overflow-hidden p-0.5 border shadow ${
                          sugUser.isVip ? 'border-amber-400 bg-amber-500/20' : isOnline ? 'border-emerald-500 bg-zinc-800' : 'border-zinc-700 bg-zinc-800'
                        }`}>
                          {sugUser.photoURL ? (
                            <img src={sugUser.photoURL} alt="" className="w-full h-full object-cover rounded-[14px]" />
                          ) : (
                            <div className="w-full h-full rounded-[14px] bg-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                              {sugUser.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        {isOnline ? (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center" title="Đang trực tuyến">
                            <span className="w-1 h-1 rounded-full bg-white" />
                          </span>
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zinc-600 border-2 border-zinc-950" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h5 className="text-xs font-bold text-white truncate">
                            {sugUser.stageName || sugUser.displayName}
                          </h5>
                          {sugUser.isVip && (
                            <Crown size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          ID: {sugUser.accountId}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    {status === 'friend' ? (
                      <button
                        type="button"
                        onClick={() => onOpenChatWithUser(sugUser.uid)}
                        className="w-full py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} />
                        <span>Nhắn tin</span>
                      </button>
                    ) : status === 'sent' ? (
                      <div className="w-full py-1.5 rounded-xl bg-zinc-800 text-zinc-400 text-[11px] font-semibold text-center">
                        Đã gửi lời mời
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendRequest(sugUser)}
                        className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-bold flex items-center justify-center gap-1 shadow"
                      >
                        <UserPlus size={13} />
                        <span>Kết bạn</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Sub-Section 2: Friend Requests (Received & Sent) */}
      {subSection === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-400" />
              <span>Lời Mời Kết Bạn Đã Nhận ({receivedRequests.length})</span>
            </h4>

            {receivedRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                        {req.senderPhoto ? (
                          <img src={req.senderPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                            {req.senderName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-white truncate">
                            {req.senderAuthorStageName || req.senderName}
                          </h5>
                          {req.isSenderVip && (
                            <Crown size={12} className="text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          ID: {req.senderAccountId}
                        </p>
                      </div>
                    </div>

                    {/* Accept & Reject buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <X size={13} />
                        <span>Từ chối</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <Check size={13} />
                        <span>Đồng ý</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <UserCheck size={28} className="mx-auto text-zinc-600" />
                <p className="text-xs">Hiện tại không có lời mời kết bạn nào đang chờ duyệt.</p>
              </div>
            )}
          </div>

          {/* Sent Pending Requests */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>Lời Mời Đã Gửi Đi ({sentRequests.length})</span>
            </h4>

            {sentRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                        {req.receiverPhoto ? (
                          <img src={req.receiverPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">
                            {req.receiverName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">
                          {req.receiverAuthorStageName || req.receiverName}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          ID: {req.receiverAccountId}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700 text-xs font-semibold"
                    >
                      Hủy yêu cầu
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic text-center py-4">
                Bạn chưa gửi lời mời kết bạn nào.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Sub-Section 3: My Friends List */}
      {subSection === 'my-friends' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={16} className="text-amber-400" />
            <span>Danh Sách Bạn Bè ({friendships.length})</span>
          </h4>

          {friendships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {friendships.map((f) => {
                if (!user) return null;
                const friendUid = f.userIds.find(id => id !== user.uid) || '';
                const friendData = (f.users ? f.users[friendUid] || {} : {}) as any;
                const name = friendData.stageName || friendData.displayName || 'Bạn Bè';
                const isOnline = isUserOnline(friendUid);
                const statusDetails = getUserStatus(friendUid);

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl bg-zinc-950 border transition-all flex flex-col justify-between gap-3 shadow-md ${
                      isOnline ? 'border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-950/20' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-2xl overflow-hidden p-0.5 border shadow ${
                          friendData.isVip ? 'border-amber-400 bg-amber-500/20' : isOnline ? 'border-emerald-500 bg-zinc-800' : 'border-zinc-700 bg-zinc-800'
                        }`}>
                          {friendData.photoURL ? (
                            <img src={friendData.photoURL} alt="" className="w-full h-full object-cover rounded-[14px]" />
                          ) : (
                            <div className="w-full h-full rounded-[14px] bg-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                              {name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        {/* Presence badge */}
                        {isOnline ? (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center" title="Đang trực tuyến">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          </span>
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-950" title={statusDetails.statusText} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-white truncate">
                            {name}
                          </h5>
                          {friendData.isVip && (
                            <Crown size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                          )}
                          {friendData.isAuthorVerified && (
                            <CheckCircle2 size={11} className="text-sky-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[10px] text-zinc-500 font-mono">
                            ID: {friendData.accountId || 'HV-USER'}
                          </p>
                          {isOnline ? (
                            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-500 font-medium">
                              {statusDetails.badgeText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => onOpenChatWithUser(friendUid)}
                        className="flex-1 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        <span>Nhắn tin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUnfriend(f.id, name)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                        title="Hủy kết bạn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 space-y-3">
              <Users size={36} className="mx-auto text-zinc-600" />
              <h5 className="text-sm font-bold text-zinc-300">Chưa Có Bạn Bè Nào</h5>
              <p className="text-xs max-w-sm mx-auto">
                Chuyển qua tab "Tìm Kiếm & Khám Phá" để gửi lời mời kết bạn đến mọi người trong hệ sinh thái!
              </p>
              <button
                type="button"
                onClick={() => setSubSection('search')}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-black shadow"
              >
                Khám phá người dùng ngay
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
