import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Track } from '../types';

/**
 * Generate a deterministic conversation ID for 2 users
 */
export function getConversationId(uid1: string, uid2: string): string {
  const sorted = [uid1, uid2].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
}

/**
 * Get or create a conversation between 2 users
 */
export async function getOrCreateConversation(user1: any, user2: any): Promise<string> {
  const convId = getConversationId(user1.uid, user2.uid);
  const convRef = doc(db, 'conversations', convId);
  const convSnap = await getDoc(convRef);

  if (!convSnap.exists()) {
    await setDoc(convRef, {
      participants: [user1.uid, user2.uid],
      participantDetails: {
        [user1.uid]: {
          uid: user1.uid,
          displayName: user1.displayName || 'Người Dùng',
          accountId: user1.accountId || 'UID-' + user1.uid.slice(0, 6),
          photoURL: user1.photoURL || '',
          isVip: Boolean(user1.isVip),
          isAuthorVerified: Boolean(user1.isAuthorVerified),
          stageName: user1.stageName || user1.authorStageName || ''
        },
        [user2.uid]: {
          uid: user2.uid,
          displayName: user2.displayName || 'Người Dùng',
          accountId: user2.accountId || 'UID-' + user2.uid.slice(0, 6),
          photoURL: user2.photoURL || '',
          isVip: Boolean(user2.isVip),
          isAuthorVerified: Boolean(user2.isAuthorVerified),
          stageName: user2.stageName || user2.authorStageName || ''
        }
      },
      lastMessageText: '',
      lastMessageSenderId: '',
      lastMessageAt: serverTimestamp(),
      unreadCounts: {
        [user1.uid]: 0,
        [user2.uid]: 0
      },
      createdAt: serverTimestamp()
    });
  }

  return convId;
}

/**
 * Send a chat message with flexible parameter support (text, image, voice, call log, tracks)
 */
export async function sendChatMessage(params: {
  conversationId?: string;
  sender: any;
  recipient?: any;
  recipientUid?: string;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDurationSec?: number;
  callLog?: {
    type: 'voice' | 'video';
    durationSec: number;
    status: 'completed' | 'missed' | 'declined';
  };
  sharedTrack?: Track | null;
  trackAttachment?: any;
  attachments?: any[];
}): Promise<{ success: boolean; message?: string }> {
  try {
    let convId = params.conversationId;
    const recipientUid = params.recipient?.uid || params.recipientUid;

    if (!convId && recipientUid && params.sender) {
      convId = await getOrCreateConversation(params.sender, params.recipient || { uid: recipientUid });
    }

    if (!convId) {
      return { success: false, message: 'Thiếu ID cuộc trò chuyện' };
    }

    const messagesCol = collection(db, 'conversations', convId, 'messages');
    const track = params.sharedTrack || params.trackAttachment;
    const textContent = (params.text || '').trim();

    let previewText = textContent;
    if (params.imageUrl) {
      previewText = previewText ? `[Hình ảnh] ${previewText}` : '[Đã gửi một hình ảnh 📷]';
    } else if (params.voiceUrl) {
      previewText = `[Đoạn ghi âm 🎙️ ${params.voiceDurationSec ? params.voiceDurationSec + 's' : ''}]`;
    } else if (params.callLog) {
      const callTypeStr = params.callLog.type === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại';
      previewText = `[${callTypeStr} • ${Math.floor(params.callLog.durationSec / 60)}:${(params.callLog.durationSec % 60).toString().padStart(2, '0')}]`;
    } else if (track) {
      previewText = `[Tác phẩm: ${track.title}] ${textContent}`;
    }

    const msgData: any = {
      conversationId: convId,
      senderId: params.sender.uid,
      senderUid: params.sender.uid,
      senderName: params.sender.displayName || params.sender.stageName || 'Người Dùng',
      senderPhoto: params.sender.photoURL || '',
      isSenderVip: Boolean(params.sender.isVip),
      isSenderAuthor: Boolean(params.sender.isAuthorVerified),
      senderAuthorStageName: params.sender.stageName || params.sender.authorStageName || '',
      text: textContent,
      reactions: {},
      createdAt: serverTimestamp()
    };

    if (params.imageUrl) {
      msgData.imageUrl = params.imageUrl;
    }
    if (params.voiceUrl) {
      msgData.voiceUrl = params.voiceUrl;
      msgData.voiceDurationSec = params.voiceDurationSec || 0;
    }
    if (params.callLog) {
      msgData.callLog = params.callLog;
    }
    if (params.attachments && params.attachments.length > 0) {
      msgData.attachments = params.attachments;
    }

    if (track) {
      msgData.sharedTrack = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        coverUrl: track.coverUrl,
        url: track.url,
        genre: track.genre || 'Audio'
      };
      msgData.trackAttachment = msgData.sharedTrack;
    }

    await addDoc(messagesCol, msgData);

    // Update conversation metadata with setDoc merge to guarantee it never fails
    const convRef = doc(db, 'conversations', convId);
    const convSnap = await getDoc(convRef);
    const prevUnread = recipientUid && convSnap.exists() ? (convSnap.data()?.unreadCounts?.[recipientUid] || 0) : 0;

    const updatePayload: any = {
      id: convId,
      lastMessageText: previewText || 'Tin nhắn mới',
      lastMessageSenderId: params.sender.uid,
      lastMessageSenderUid: params.sender.uid,
      lastMessageAt: serverTimestamp(),
      [`unreadCounts.${params.sender.uid}`]: 0
    };

    if (recipientUid) {
      updatePayload[`unreadCounts.${recipientUid}`] = prevUnread + 1;
    }

    if (!convSnap.exists()) {
      updatePayload.participants = [params.sender.uid, recipientUid].filter(Boolean);
      updatePayload.createdAt = serverTimestamp();
    }

    await setDoc(convRef, updatePayload, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error('Send chat message error:', err);
    return { success: false, message: err.message || 'Lỗi gửi tin nhắn' };
  }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId: string, currentUid: string): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(convRef, {
      [`unreadCounts.${currentUid}`]: 0
    }, { merge: true });
  } catch (err) {
    console.error('Error marking conversation read:', err);
  }
}

/**
 * Toggle emoji reaction on message
 */
export async function toggleMessageReaction(
  conversationId: string, 
  messageId: string, 
  emoji: string, 
  userUid: string
): Promise<void> {
  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) return;

    const data = msgSnap.data();
    const reactions = data.reactions || {};
    const existingList: string[] = reactions[emoji] || [];

    let updatedList: string[];
    if (existingList.includes(userUid)) {
      updatedList = existingList.filter(u => u !== userUid);
    } else {
      updatedList = [...existingList, userUid];
    }

    const newReactions = { ...reactions };
    if (updatedList.length === 0) {
      delete newReactions[emoji];
    } else {
      newReactions[emoji] = updatedList;
    }

    await updateDoc(msgRef, { reactions: newReactions });
  } catch (err) {
    console.error('Error toggling reaction:', err);
  }
}

/**
 * Send Friend Request (supports single object or 2 arguments)
 */
export async function sendFriendRequest(
  senderOrParams: any, 
  targetUserArg?: any
): Promise<{ success: boolean; message: string }> {
  try {
    const sender = senderOrParams.sender || senderOrParams;
    const targetUser = senderOrParams.receiver || targetUserArg;

    if (!sender || !targetUser) {
      return { success: false, message: 'Thiếu thông tin người gửi hoặc người nhận.' };
    }

    if (sender.uid === targetUser.uid) {
      return { success: false, message: 'Không thể tự kết bạn với chính mình.' };
    }

    // Check existing request
    const q = query(
      collection(db, 'friendRequests'),
      where('senderUid', '==', sender.uid),
      where('receiverUid', '==', targetUser.uid),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { success: false, message: 'Bạn đã gửi lời mời kết bạn trước đó rồi.' };
    }

    await addDoc(collection(db, 'friendRequests'), {
      senderUid: sender.uid,
      senderName: sender.displayName || sender.stageName || 'Người Dùng',
      senderAccountId: sender.accountId || 'UID-' + sender.uid.slice(0, 6),
      senderPhoto: sender.photoURL || '',
      isSenderVip: Boolean(sender.isVip),
      isSenderAuthor: Boolean(sender.isAuthorVerified),
      senderAuthorStageName: sender.stageName || sender.authorStageName || '',
      receiverUid: targetUser.uid,
      receiverName: targetUser.displayName || targetUser.stageName || 'Người Dùng',
      receiverAccountId: targetUser.accountId || 'UID-' + targetUser.uid.slice(0, 6),
      receiverPhoto: targetUser.photoURL || '',
      isReceiverAuthor: Boolean(targetUser.isAuthorVerified),
      receiverAuthorStageName: targetUser.stageName || targetUser.authorStageName || '',
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true, message: 'Đã gửi lời mời kết bạn thành công!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi gửi lời mời kết bạn.' };
  }
}

/**
 * Accept Friend Request
 */
export async function acceptFriendRequest(
  requestId: string, 
  currentUserOrReq?: any, 
  targetUserOrCurrentParticipant?: any
): Promise<{ success: boolean; message: string }> {
  try {
    const reqRef = doc(db, 'friendRequests', requestId);
    await updateDoc(reqRef, { status: 'accepted' });

    let uid1 = '';
    let uid2 = '';
    let user1Data: any = {};
    let user2Data: any = {};

    if (currentUserOrReq && currentUserOrReq.senderUid && currentUserOrReq.receiverUid) {
      uid1 = currentUserOrReq.senderUid;
      uid2 = currentUserOrReq.receiverUid;
      user1Data = {
        uid: uid1,
        displayName: currentUserOrReq.senderName || 'Người Dùng',
        accountId: currentUserOrReq.senderAccountId || 'HV-USER',
        photoURL: currentUserOrReq.senderPhoto || '',
        isVip: Boolean(currentUserOrReq.isSenderVip),
        isAuthorVerified: Boolean(currentUserOrReq.isSenderAuthor),
        stageName: currentUserOrReq.senderAuthorStageName || ''
      };
      user2Data = targetUserOrCurrentParticipant || {
        uid: uid2,
        displayName: currentUserOrReq.receiverName || 'Người Dùng',
        accountId: currentUserOrReq.receiverAccountId || 'HV-USER',
        photoURL: currentUserOrReq.receiverPhoto || '',
        isAuthorVerified: Boolean(currentUserOrReq.isReceiverAuthor),
        stageName: currentUserOrReq.receiverAuthorStageName || ''
      };
    } else if (currentUserOrReq && targetUserOrCurrentParticipant) {
      uid1 = currentUserOrReq.uid;
      uid2 = targetUserOrCurrentParticipant.uid;
      user1Data = currentUserOrReq;
      user2Data = targetUserOrCurrentParticipant;
    }

    if (uid1 && uid2) {
      const friendshipId = `friend_${[uid1, uid2].sort().join('_')}`;
      const friendRef = doc(db, 'friendships', friendshipId);
      await setDoc(friendRef, {
        id: friendshipId,
        userIds: [uid1, uid2],
        users: {
          [uid1]: user1Data,
          [uid2]: user2Data
        },
        createdAt: serverTimestamp()
      });
    }

    return { success: true, message: 'Đã chấp nhận lời mời kết bạn!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi chấp nhận kết bạn.' };
  }
}

/**
 * Reject Friend Request
 */
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  try {
    const reqRef = doc(db, 'friendRequests', requestId);
    await updateDoc(reqRef, { status: 'rejected' });
    return { success: true, message: 'Đã từ chối lời mời kết bạn.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi xử lý yêu cầu.' };
  }
}

/**
 * Cancel Friend Request
 */
export async function cancelFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  try {
    const reqRef = doc(db, 'friendRequests', requestId);
    await deleteDoc(reqRef);
    return { success: true, message: 'Đã hủy lời mời kết bạn.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi hủy lời mời.' };
  }
}

/**
 * Remove Friendship (supports docId or (uid1, uid2))
 */
export async function removeFriendship(
  docIdOrUid1: string, 
  uid2?: string
): Promise<{ success: boolean; message: string }> {
  try {
    let friendshipId = docIdOrUid1;
    if (uid2) {
      friendshipId = `friend_${[docIdOrUid1, uid2].sort().join('_')}`;
    }
    const friendRef = doc(db, 'friendships', friendshipId);
    await deleteDoc(friendRef);
    return { success: true, message: 'Đã hủy kết bạn thành công.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi hủy kết bạn.' };
  }
}

/**
 * Update or create user thought bubble (Bong bóng suy nghĩ / Note)
 */
export async function setThoughtBubble(params: {
  user: any;
  text: string;
  emoji?: string;
  bgColor?: string;
  durationHours?: number; // 3, 6, 12, 24
  musicSnippet?: {
    trackId?: string;
    trackTitle?: string;
    trackArtist?: string;
  };
}): Promise<{ success: boolean; message?: string }> {
  try {
    if (!params.user?.uid) {
      return { success: false, message: 'Vui lòng đăng nhập để tạo bong bóng suy nghĩ.' };
    }
    const durationHours = params.durationHours || 24;
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const bubbleRef = doc(db, 'thoughtBubbles', params.user.uid);
    await setDoc(bubbleRef, {
      id: params.user.uid,
      userId: params.user.uid,
      userName: params.user.displayName || 'Người dùng',
      userAccountId: params.user.accountId || 'UID-' + params.user.uid.slice(0, 6),
      userPhoto: params.user.photoURL || '',
      isUserVip: Boolean(params.user.isVip),
      isAuthorVerified: Boolean(params.user.isAuthorVerified),
      authorStageName: params.user.stageName || params.user.authorStageName || '',
      text: params.text.trim(),
      emoji: params.emoji || '💭',
      bgColor: params.bgColor || '#18181b',
      durationHours: durationHours,
      expiresAt: expiresAt,
      musicSnippet: params.musicSnippet || null,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi cập nhật bong bóng suy nghĩ.' };
  }
}

/**
 * Delete thought bubble
 */
export async function deleteThoughtBubble(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const bubbleRef = doc(db, 'thoughtBubbles', userId);
    await deleteDoc(bubbleRef);
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi xóa bong bóng suy nghĩ.' };
  }
}

/**
 * Create a new Friend Photo Post (Trang Tin Bạn Bè)
 */
export async function createFriendPhotoPost(params: {
  author: any;
  photoUrl: string;
  caption: string;
  captureSource: 'camera' | 'upload';
  location?: string;
  mood?: string;
}): Promise<{ success: boolean; message: string; postId?: string }> {
  try {
    if (!params.author?.uid) {
      return { success: false, message: 'Vui lòng đăng nhập để đăng bài.' };
    }
    if (!params.photoUrl) {
      return { success: false, message: 'Vui lòng chụp ảnh hoặc tải ảnh lên.' };
    }

    const docRef = await addDoc(collection(db, 'friendPhotoPosts'), {
      authorId: params.author.uid,
      authorName: params.author.displayName || 'Người Dùng',
      authorAccountId: params.author.accountId || 'UID-' + params.author.uid.slice(0, 6),
      authorPhoto: params.author.photoURL || '',
      isAuthorVip: Boolean(params.author.isVip),
      isAuthorVerified: Boolean(params.author.isAuthorVerified),
      authorStageName: params.author.stageName || params.author.authorStageName || '',
      photoUrl: params.photoUrl,
      caption: params.caption.trim(),
      captureSource: params.captureSource,
      location: params.location || '',
      mood: params.mood || '',
      likes: [],
      commentsCount: 0,
      createdAt: serverTimestamp()
    });

    return { success: true, message: 'Đã đăng ảnh lên Bản Tin Bạn Bè thành công!', postId: docRef.id };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi đăng ảnh.' };
  }
}

/**
 * Delete a Friend Photo Post
 */
export async function deleteFriendPhotoPost(postId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const postRef = doc(db, 'friendPhotoPosts', postId);
    await deleteDoc(postRef);
    return { success: true, message: 'Đã xóa bài đăng.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi xóa bài đăng.' };
  }
}

/**
 * Like / Unlike a Friend Photo Post
 */
export async function toggleLikePhotoPost(postId: string, userUid: string): Promise<void> {
  try {
    const postRef = doc(db, 'friendPhotoPosts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const likes: string[] = data.likes || [];
    let updatedLikes: string[];

    if (likes.includes(userUid)) {
      updatedLikes = likes.filter(id => id !== userUid);
    } else {
      updatedLikes = [...likes, userUid];
    }

    await updateDoc(postRef, { likes: updatedLikes });
  } catch (err) {
    console.error('Error toggling like photo post:', err);
  }
}

/**
 * Add Comment to a Friend Photo Post
 */
export async function addPhotoPostComment(
  postId: string,
  user: any,
  text: string
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!user?.uid || !text.trim()) {
      return { success: false, message: 'Nội dung bình luận không hợp lệ.' };
    }

    const commentsCol = collection(db, 'friendPhotoPosts', postId, 'comments');
    await addDoc(commentsCol, {
      postId,
      authorId: user.uid,
      authorName: user.displayName || 'Người Dùng',
      authorPhoto: user.photoURL || '',
      isAuthorVip: Boolean(user.isVip),
      text: text.trim(),
      createdAt: serverTimestamp()
    });

    const postRef = doc(db, 'friendPhotoPosts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data()?.commentsCount || 0;
      await updateDoc(postRef, { commentsCount: currentCount + 1 });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi gửi bình luận.' };
  }
}

/**
 * Delete Comment from a Friend Photo Post
 */
export async function deletePhotoPostComment(
  postId: string,
  commentId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const commentRef = doc(db, 'friendPhotoPosts', postId, 'comments', commentId);
    await deleteDoc(commentRef);

    const postRef = doc(db, 'friendPhotoPosts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = Math.max(0, (postSnap.data()?.commentsCount || 1) - 1);
      await updateDoc(postRef, { commentsCount: currentCount });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi xóa bình luận.' };
  }
}

