/**
 * Call Service: Real-time Direct Voice & Video Calling Signaling and Sound Engine
 */
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActiveCallSession, CallUserParticipant } from '../types';
import { sendChatMessage } from './socialService';

// Audio Context Singleton for synthetic call tones
let audioCtx: AudioContext | null = null;
let outgoingInterval: any = null;
let incomingInterval: any = null;
let activeOscillators: OscillatorNode[] = [];

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Sound synthesis: Outgoing Ringback Dial Tone
 */
export function playOutgoingRingTone() {
  stopAllCallAudio();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playTone = () => {
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 1.2);
      gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.3);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.3);
      osc2.stop(ctx.currentTime + 1.3);

      activeOscillators.push(osc1, osc2);
    } catch (err) {
      console.warn('Ringback tone notice:', err);
    }
  };

  playTone();
  outgoingInterval = setInterval(playTone, 3200);
}

/**
 * Sound synthesis: Incoming Melody Ringtone
 */
export function playIncomingRingtone() {
  stopAllCallAudio();
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 523.25, time: 0, dur: 0.18 }, // C5
    { freq: 659.25, time: 0.2, dur: 0.18 }, // E5
    { freq: 783.99, time: 0.4, dur: 0.22 }, // G5
    { freq: 1046.50, time: 0.65, dur: 0.4 }, // C6
    { freq: 783.99, time: 1.15, dur: 0.18 }, // G5
    { freq: 1046.50, time: 1.35, dur: 0.45 }, // C6
  ];

  const playSequence = () => {
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const startTime = ctx.currentTime;

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime + time);

        gain.gain.setValueAtTime(0, startTime + time);
        gain.gain.linearRampToValueAtTime(0.18, startTime + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + time);
        osc.stop(startTime + time + dur);
        activeOscillators.push(osc);
      });
    } catch (err) {
      console.warn('Incoming ringtone notice:', err);
    }
  };

  playSequence();
  incomingInterval = setInterval(playSequence, 2800);
}

/**
 * Connected chime: pleasant 2-tone chime
 */
export function playConnectedChime() {
  stopAllCallAudio();
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') ctx.resume();
    const startTime = ctx.currentTime;
    const notes = [
      { freq: 587.33, time: 0, dur: 0.15 }, // D5
      { freq: 880.00, time: 0.15, dur: 0.35 } // A5
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + time);

      gain.gain.setValueAtTime(0, startTime + time);
      gain.gain.linearRampToValueAtTime(0.15, startTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + time);
      osc.stop(startTime + time + dur);
    });
  } catch {}
}

/**
 * Hangup / Ended chime
 */
export function playHangupChime() {
  stopAllCallAudio();
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') ctx.resume();
    const startTime = ctx.currentTime;
    const notes = [
      { freq: 659.25, time: 0, dur: 0.12 }, // E5
      { freq: 523.25, time: 0.14, dur: 0.12 }, // C5
      { freq: 392.00, time: 0.28, dur: 0.3 }  // G4
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + time);

      gain.gain.setValueAtTime(0, startTime + time);
      gain.gain.linearRampToValueAtTime(0.15, startTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + time);
      osc.stop(startTime + time + dur);
    });
  } catch {}
}

export function stopAllCallAudio() {
  if (outgoingInterval) {
    clearInterval(outgoingInterval);
    outgoingInterval = null;
  }
  if (incomingInterval) {
    clearInterval(incomingInterval);
    incomingInterval = null;
  }
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {}
  });
  activeOscillators = [];
}

/**
 * Initiate a direct 1-on-1 Call
 */
export async function initiateDirectCall(params: {
  caller: CallUserParticipant;
  recipient: CallUserParticipant;
  type: 'voice' | 'video';
  conversationId?: string;
}): Promise<string> {
  const callId = `call_${params.caller.uid}_${params.recipient.uid}_${Date.now()}`;
  const callDocRef = doc(db, 'activeCalls', callId);

  const callData: Omit<ActiveCallSession, 'id'> = {
    caller: params.caller,
    recipient: params.recipient,
    type: params.type,
    status: 'ringing',
    conversationId: params.conversationId || '',
    callerAudioEnabled: true,
    callerVideoEnabled: params.type === 'video',
    recipientAudioEnabled: true,
    recipientVideoEnabled: params.type === 'video',
    startedAt: serverTimestamp(),
    durationSec: 0
  };

  await setDoc(callDocRef, callData);
  playOutgoingRingTone();
  return callId;
}

/**
 * Accept an incoming call
 */
export async function acceptDirectCall(callId: string): Promise<void> {
  stopAllCallAudio();
  playConnectedChime();
  const callDocRef = doc(db, 'activeCalls', callId);
  await updateDoc(callDocRef, {
    status: 'connected',
    connectedAt: serverTimestamp()
  });
}

/**
 * Reject / Decline an incoming call
 */
export async function rejectDirectCall(callId: string, reason: string = 'declined'): Promise<void> {
  stopAllCallAudio();
  playHangupChime();
  const callDocRef = doc(db, 'activeCalls', callId);
  try {
    await updateDoc(callDocRef, {
      status: 'rejected',
      endedAt: serverTimestamp(),
      rejectReason: reason
    });
  } catch (err) {
    console.warn('rejectDirectCall error:', err);
  }
}

/**
 * End an ongoing active call and record call history to chat
 */
export async function endDirectCallSession(
  callSession: ActiveCallSession,
  durationSec: number,
  endedByUid: string
): Promise<void> {
  stopAllCallAudio();
  playHangupChime();

  const callDocRef = doc(db, 'activeCalls', callSession.id);
  try {
    await updateDoc(callDocRef, {
      status: 'ended',
      endedAt: serverTimestamp(),
      durationSec: durationSec
    });
  } catch (err) {
    console.warn('endDirectCall updateDoc notice:', err);
  }

  // Record call log in chat if conversation exists
  if (callSession.conversationId) {
    const isCompleted = durationSec > 0 || callSession.status === 'connected';
    const statusType: 'completed' | 'missed' | 'declined' = isCompleted
      ? 'completed'
      : callSession.caller.uid === endedByUid
      ? 'missed'
      : 'declined';

    const min = Math.floor(durationSec / 60);
    const sec = (durationSec % 60).toString().padStart(2, '0');
    const callTypeName = callSession.type === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại';
    const textMsg = isCompleted
      ? `[${callTypeName} • ${min}:${sec}]`
      : statusType === 'missed'
      ? `[${callTypeName} nhỡ]`
      : `[${callTypeName} bị từ chối]`;

    try {
      await sendChatMessage({
        conversationId: callSession.conversationId,
        sender: {
          uid: callSession.caller.uid,
          displayName: callSession.caller.displayName,
          photoURL: callSession.caller.photoURL || '',
          isVip: callSession.caller.isVip,
          isAuthorVerified: callSession.caller.isAuthorVerified,
          authorStageName: callSession.caller.authorStageName
        },
        recipientUid: callSession.recipient.uid,
        callLog: {
          type: callSession.type,
          durationSec: durationSec,
          status: statusType
        },
        text: textMsg
      });
    } catch (err) {
      console.warn('Could not post call log to chat:', err);
    }
  }
}

/**
 * Update realtime media toggles (Mute Mic, Camera Off)
 */
export async function updateDirectCallMediaState(
  callId: string,
  isCaller: boolean,
  state: { audioEnabled?: boolean; videoEnabled?: boolean }
): Promise<void> {
  const callDocRef = doc(db, 'activeCalls', callId);
  const updatePayload: Record<string, any> = {};
  if (state.audioEnabled !== undefined) {
    if (isCaller) updatePayload.callerAudioEnabled = state.audioEnabled;
    else updatePayload.recipientAudioEnabled = state.audioEnabled;
  }
  if (state.videoEnabled !== undefined) {
    if (isCaller) updatePayload.callerVideoEnabled = state.videoEnabled;
    else updatePayload.recipientVideoEnabled = state.videoEnabled;
  }
  try {
    await updateDoc(callDocRef, updatePayload);
  } catch {}
}

/**
 * Realtime listener for incoming calls to the current user
 */
export function listenForIncomingCalls(
  currentUserUid: string,
  onIncomingCall: (call: ActiveCallSession) => void
): () => void {
  if (!currentUserUid) return () => {};

  const callsRef = collection(db, 'activeCalls');
  const q = query(
    callsRef,
    where('recipient.uid', '==', currentUserUid),
    where('status', '==', 'ringing')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          // Filter out calls older than 45 seconds to prevent stale rings
          const startedAt = data.startedAt?.toDate ? data.startedAt.toDate().getTime() : Date.now();
          const ageMs = Date.now() - startedAt;
          if (ageMs < 45000 && data.status === 'ringing') {
            onIncomingCall({
              id: change.doc.id,
              ...data
            } as ActiveCallSession);
          }
        }
      });
    },
    (error) => {
      console.warn('listenForIncomingCalls notice:', error);
    }
  );

  return unsubscribe;
}

/**
 * Realtime listener for a specific active call session
 */
export function listenToActiveCall(
  callId: string,
  onUpdate: (call: ActiveCallSession | null) => void
): () => void {
  if (!callId) return () => {};

  const callDocRef = doc(db, 'activeCalls', callId);
  const unsubscribe = onSnapshot(
    callDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({
          id: docSnap.id,
          ...docSnap.data()
        } as ActiveCallSession);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('listenToActiveCall error:', error);
    }
  );

  return unsubscribe;
}
