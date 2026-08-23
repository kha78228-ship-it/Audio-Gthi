import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Users, 
  Sparkles,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Track } from '../types';
import { ChatTab } from './messages/ChatTab';
import { FeedTab } from './messages/FeedTab';
import { FriendsTab } from './messages/FriendsTab';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MessagesFriendsViewProps {
  tracks?: Track[];
  currentTrack?: Track | null;
  onPlayTrack?: (track: Track) => void;
  onOpenAuth: () => void;
  onOpenGiftShop?: (author?: any) => void;
  initialRecipientUid?: string | null;
  onClearInitialRecipient?: () => void;
  activeSubTab?: 'chat' | 'feed' | 'friends';
  onSelectSubTab?: (tab: 'chat' | 'feed' | 'friends') => void;
}

export function MessagesFriendsView({
  onOpenAuth,
  onPlayTrack,
  initialRecipientUid,
  onClearInitialRecipient,
  activeSubTab,
  onSelectSubTab
}: MessagesFriendsViewProps) {
  const { user } = useAuth();
  const [localTab, setLocalTab] = useState<'chat' | 'feed' | 'friends'>('chat');
  const activeMessageTab = activeSubTab || localTab;

  const setActiveMessageTab = (tab: 'chat' | 'feed' | 'friends') => {
    setLocalTab(tab);
    if (onSelectSubTab) {
      onSelectSubTab(tab);
    }
  };
  const [targetChatRecipientUid, setTargetChatRecipientUid] = useState<string | null>(initialRecipientUid || null);

  // Unread badge counters
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // 1. Subscribe to unread messages count
  useEffect(() => {
    if (!user) {
      setUnreadMsgCount(0);
      return;
    }

    const qConv = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(qConv, (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.unreadCounts && data.unreadCounts[user.uid]) {
          total += data.unreadCounts[user.uid] || 0;
        }
      });
      setUnreadMsgCount(total);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to pending incoming friend requests
  useEffect(() => {
    if (!user) {
      setPendingRequestsCount(0);
      return;
    }

    const qRec = query(
      collection(db, 'friendRequests'),
      where('receiverUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(qRec, (snap) => {
      setPendingRequestsCount(snap.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenChatWithUser = (userUid: string) => {
    setTargetChatRecipientUid(userUid);
    setActiveMessageTab('chat');
  };

  return (
    <div id="haevy-message-ecosystem" className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 pb-36 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Main Tab Views (Navigation is controlled solely via the bottom taskbar) */}
      {activeMessageTab === 'chat' && (
        <ChatTab
          onOpenAuth={onOpenAuth}
          onPlayTrack={onPlayTrack}
          onGoToFriendsTab={() => setActiveMessageTab('friends')}
          initialRecipientUid={targetChatRecipientUid}
          onClearInitialRecipient={() => {
            setTargetChatRecipientUid(null);
            if (onClearInitialRecipient) onClearInitialRecipient();
          }}
        />
      )}

      {activeMessageTab === 'feed' && (
        <FeedTab onOpenAuth={onOpenAuth} />
      )}

      {activeMessageTab === 'friends' && (
        <FriendsTab
          onOpenAuth={onOpenAuth}
          onOpenChatWithUser={handleOpenChatWithUser}
        />
      )}
    </div>
  );
}

