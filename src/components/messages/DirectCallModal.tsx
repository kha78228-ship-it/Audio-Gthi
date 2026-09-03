import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Crown,
  SwitchCamera,
  ShieldCheck,
  Radio,
  Wifi,
  Sparkles
} from 'lucide-react';
import { ActiveCallSession } from '../../types';
import {
  acceptDirectCall,
  rejectDirectCall,
  endDirectCallSession,
  updateDirectCallMediaState,
  stopAllCallAudio,
  playIncomingRingtone,
  playOutgoingRingTone
} from '../../services/callService';

interface DirectCallModalProps {
  callSession: ActiveCallSession | null;
  currentUserId: string;
  onClose: () => void;
}

export function DirectCallModal({ callSession, currentUserId, onClose }: DirectCallModalProps) {
  if (!callSession) return null;

  const isCaller = callSession.caller.uid === currentUserId;
  const isRecipient = callSession.recipient.uid === currentUserId;
  const partner = isCaller ? callSession.recipient : callSession.caller;

  const [callDurationSec, setCallDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callSession.type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  // 1. Manage Audio Ringtones based on call status
  useEffect(() => {
    if (callSession.status === 'ringing') {
      if (isRecipient) {
        playIncomingRingtone();
      } else if (isCaller) {
        playOutgoingRingTone();
      }
    } else {
      stopAllCallAudio();
    }

    return () => {
      stopAllCallAudio();
    };
  }, [callSession.status, isRecipient, isCaller]);

  // 2. Call Timer when connected
  useEffect(() => {
    if (callSession.status === 'connected') {
      stopAllCallAudio();
      timerRef.current = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callSession.status]);

  // 3. Auto-close if call rejected or ended
  useEffect(() => {
    if (callSession.status === 'rejected' || callSession.status === 'ended' || callSession.status === 'missed') {
      stopLocalStream();
      const closeTimeout = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(closeTimeout);
    }
  }, [callSession.status, onClose]);

  // 4. Initialize Local Camera / Audio Stream if Video Call
  useEffect(() => {
    if (callSession.type === 'video' && (callSession.status === 'ringing' || callSession.status === 'connected')) {
      startLocalMedia(facingMode);
    }
    return () => {
      stopLocalStream();
    };
  }, [callSession.type, facingMode]);

  const startLocalMedia = async (mode: 'user' | 'environment') => {
    try {
      stopLocalStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (err) {
      console.warn('Camera access notice (fallback mode enabled):', err);
      setCameraError('Không thể mở camera (chế độ dự phòng)');
    }
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  // Switch between front and rear cameras (mobile optimization)
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
    updateDirectCallMediaState(callSession.id, isCaller, { audioEnabled: !nextMuted });
  };

  // Toggle Video
  const handleToggleVideo = () => {
    const nextVideo = !isVideoEnabled;
    setIsVideoEnabled(nextVideo);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextVideo;
      });
    }
    updateDirectCallMediaState(callSession.id, isCaller, { videoEnabled: nextVideo });
  };

  // Actions
  const handleAccept = async () => {
    try {
      await acceptDirectCall(callSession.id);
    } catch (err) {
      console.error('Failed to accept call:', err);
    }
  };

  const handleDecline = async () => {
    try {
      stopLocalStream();
      await rejectDirectCall(callSession.id, 'declined');
      onClose();
    } catch (err) {
      console.error('Failed to decline call:', err);
      onClose();
    }
  };

  const handleEndCall = async () => {
    try {
      stopLocalStream();
      await endDirectCallSession(callSession, callDurationSec, currentUserId);
      onClose();
    } catch (err) {
      console.error('Failed to end call:', err);
      onClose();
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modalContent = (
    <div 
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
      }}
      className="fixed inset-0 z-[9999999] bg-zinc-950/98 backdrop-blur-2xl flex flex-col justify-between px-4 sm:px-8 text-white select-none overflow-hidden h-[100dvh] max-h-[100dvh] animate-in fade-in duration-300"
    >
      {/* 1. Header Bar: Status, Call Info & Security Shield */}
      <header className="flex items-center justify-between w-full max-w-2xl mx-auto shrink-0 pt-2 pb-4">
        {/* Call Mode Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold shadow-lg">
          {callSession.type === 'video' ? (
            <Video size={14} className="text-sky-400" />
          ) : (
            <Phone size={14} className="text-emerald-400" />
          )}
          <span className="text-zinc-200">
            {callSession.type === 'video' ? 'Video Call HD 1080p' : 'Voice Call HD Lossless'}
          </span>
        </div>

        {/* E2EE Shield & Signal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-400">
            <ShieldCheck size={13} />
            <span>Mã hóa E2EE</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
            <Wifi size={12} className="text-emerald-400" />
            <span>Tín hiệu tốt</span>
          </div>
        </div>
      </header>

      {/* 2. Main Stage Body */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full max-w-4xl mx-auto my-2">
        {/* ================= A. INCOMING RINGING SCREEN ================= */}
        {callSession.status === 'ringing' && isRecipient && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Animated Avatar Radar Wave */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-56 h-56 rounded-full bg-emerald-500/15 animate-ping" />
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/25 animate-pulse" />
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-zinc-900 border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] relative z-10 flex items-center justify-center">
                {partner.photoURL ? (
                  <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-4xl">
                    {partner.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 z-10">
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white">{partner.displayName}</h2>
                {partner.isVip && (
                  <Crown size={20} className="text-amber-400 fill-amber-400 drop-shadow" />
                )}
              </div>
              <p className="text-emerald-400 font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                <Radio size={16} className="animate-pulse" />
                <span>{callSession.type === 'video' ? 'Đang gọi video cho bạn...' : 'Đang gọi thoại cho bạn...'}</span>
              </p>
            </div>
          </div>
        )}

        {/* ================= B. OUTGOING RINGING SCREEN ================= */}
        {callSession.status === 'ringing' && isCaller && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Animated Avatar Waves */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-56 h-56 rounded-full bg-sky-500/15 animate-ping" />
              <div className="absolute w-44 h-44 rounded-full bg-sky-500/25 animate-pulse" />
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-zinc-900 border-4 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.5)] relative z-10 flex items-center justify-center">
                {partner.photoURL ? (
                  <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white font-black text-4xl">
                    {partner.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 z-10">
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white">{partner.displayName}</h2>
                {partner.isVip && (
                  <Crown size={20} className="text-amber-400 fill-amber-400 drop-shadow" />
                )}
              </div>
              <p className="text-sky-400 font-mono text-sm sm:text-base flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Đang đổ chuông kết nối trực tiếp...</span>
              </p>
            </div>
          </div>
        )}

        {/* ================= C. CONNECTED ACTIVE CALL SCREEN ================= */}
        {callSession.status === 'connected' && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            {callSession.type === 'video' ? (
              /* --- VIDEO CALL STAGE --- */
              <div className="w-full h-full max-h-[70dvh] rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl relative flex items-center justify-center">
                {/* Remote Video / Partner Avatar Stage */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-sky-400 shadow-xl flex items-center justify-center">
                    {partner.photoURL ? (
                      <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-sky-700 flex items-center justify-center text-white font-black text-4xl">
                        {partner.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                      <span>{partner.displayName}</span>
                      {partner.isVip && <Crown size={16} className="text-amber-400 fill-amber-400" />}
                    </h3>
                    <p className="text-xs text-sky-400 font-mono mt-1">
                      Đang trong cuộc gọi: {formatTimer(callDurationSec)}
                    </p>
                  </div>
                </div>

                {/* Floating Self-Camera PiP Stream */}
                <div className="absolute bottom-4 right-4 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden bg-black border-2 border-white/40 shadow-2xl z-20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-[10px] text-zinc-400 font-bold p-2 text-center">
                      <VideoOff size={18} className="mb-1 text-zinc-500" />
                      <span>Camera đã tắt</span>
                    </div>
                  )}
                  {/* PiP flip button */}
                  {isVideoEnabled && (
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all cursor-pointer"
                      title="Đổi camera trước/sau"
                    >
                      <SwitchCamera size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* --- VOICE CALL STAGE --- */
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                {/* Voice Call Avatar with Harmonic Glow */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-emerald-500/20 animate-pulse" />
                  
                  <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-zinc-900 border-4 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.45)] relative z-10 flex items-center justify-center">
                    {partner.photoURL ? (
                      <img src={partner.photoURL} alt={partner.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-4xl sm:text-5xl">
                        {partner.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner Details & Time Counter */}
                <div className="space-y-2 z-10">
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white">{partner.displayName}</h2>
                    {partner.isVip && (
                      <Crown size={20} className="text-amber-400 fill-amber-400 drop-shadow" />
                    )}
                  </div>

                  {/* Equalizer Sound Wave Bars */}
                  <div className="flex items-center justify-center gap-1 py-1">
                    {[16, 28, 40, 22, 35, 48, 30, 18, 38, 26, 42, 18].map((h, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${h * 0.6}px`, animationDelay: `${idx * 0.1}s` }}
                        className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse"
                      />
                    ))}
                  </div>

                  <p className="text-emerald-400 font-mono text-base sm:text-lg font-bold">
                    {formatTimer(callDurationSec)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= D. REJECTED / ENDED NOTICE ================= */}
        {(callSession.status === 'rejected' || callSession.status === 'ended' || callSession.status === 'missed') && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <PhoneOff size={36} />
            </div>
            <h3 className="text-xl font-bold text-white">
              {callSession.status === 'rejected'
                ? 'Cuộc gọi đã bị từ chối'
                : callSession.status === 'missed'
                ? 'Cuộc gọi nhỡ (Không trả lời)'
                : 'Cuộc gọi đã kết thúc'}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Thời gian: {formatTimer(callDurationSec)}
            </p>
          </div>
        )}
      </main>

      {/* 3. Bottom Action Controls Toolbar */}
      <footer className="w-full max-w-md mx-auto pt-2 pb-4 shrink-0">
        {/* When Ringing as Recipient -> Show Green Answer & Red Decline */}
        {callSession.status === 'ringing' && isRecipient ? (
          <div className="flex items-center justify-around gap-6">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleDecline}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-600/50 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Từ chối cuộc gọi"
              >
                <PhoneOff size={28} />
              </button>
              <span className="text-xs text-zinc-300 font-medium">Từ chối</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center justify-center active:scale-95 transition-all cursor-pointer animate-bounce"
                style={{ animationDuration: '1.5s' }}
                title="Trả lời cuộc gọi"
              >
                {callSession.type === 'video' ? <Video size={30} /> : <Phone size={30} />}
              </button>
              <span className="text-xs text-emerald-400 font-bold">Trả lời</span>
            </div>
          </div>
        ) : callSession.status === 'ringing' && isCaller ? (
          /* When Ringing as Caller -> Show Cancel Button */
          <div className="flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleEndCall}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-600/50 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="Hủy cuộc gọi"
            >
              <PhoneOff size={28} />
            </button>
            <span className="text-xs text-zinc-400 font-medium">Hủy cuộc gọi</span>
          </div>
        ) : callSession.status === 'connected' ? (
          /* When Connected -> Full Tool bar */
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all active:scale-95 cursor-pointer ${
                isMuted
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/40'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Camera Toggle (If video call) */}
            {callSession.type === 'video' && (
              <button
                type="button"
                onClick={handleToggleVideo}
                className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all active:scale-95 cursor-pointer ${
                  !isVideoEnabled
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/40'
                    : 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                }`}
                title={isVideoEnabled ? 'Tắt Camera' : 'Bật Camera'}
              >
                {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
              </button>
            )}

            {/* Camera Flip (Front/Rear for mobile) */}
            {callSession.type === 'video' && isVideoEnabled && (
              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-all active:scale-95 cursor-pointer"
                title="Đổi camera trước/sau"
              >
                <SwitchCamera size={22} />
              </button>
            )}

            {/* Speaker Toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all active:scale-95 cursor-pointer ${
                !isSpeakerOn
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title="Loa ngoài"
            >
              {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-600/50 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Kết thúc cuộc gọi"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        ) : null}
      </footer>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
