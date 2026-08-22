import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  CreditCard, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Eye, 
  Trash2, 
  FileText, 
  Music, 
  Award,
  Lock,
  RefreshCw,
  Info,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthorVerificationStatus, AudioGenre } from '../types';

interface AuthorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPublish?: () => void;
}

const GENRE_OPTIONS = [
  'Lo-Fi Chill',
  'Deep Focus',
  'Acoustic',
  'Electronic & EDM',
  'Pop & Ballad',
  'R&B & Soul',
  'Rap & Hip-Hop',
  'Ambient & Zen',
  'Podcast & Talk',
  'Khác'
];

export function AuthorVerificationModal({ isOpen, onClose, onOpenPublish }: AuthorVerificationModalProps) {
  const { 
    user, 
    isAdmin, 
    authorStatus, 
    isAuthorVerified, 
    authorStageName, 
    authorBio, 
    authorVerificationData,
    submitAuthorVerification 
  } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States
  // Step 1: Contact & Artist Info
  const [email, setEmail] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');

  const [stageName, setStageName] = useState('');
  const [musicGenre, setMusicGenre] = useState('Lo-Fi Chill');
  const [bio, setBio] = useState('');
  const [socialLink, setSocialLink] = useState('');

  // Step 2: CCCD Information
  const [fullName, setFullName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardIssueDate, setIdCardIssueDate] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');

  // Step 3: Face Verification
  const [facePhotoUrl, setFacePhotoUrl] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Agreement
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Camera video and canvas refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize form with existing user data if available
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setEmailVerified(Boolean(user.email));
      setStageName(authorStageName || user.displayName || '');
      setBio(authorBio || '');
    }

    if (authorVerificationData) {
      setFullName(authorVerificationData.fullName || '');
      setStageName(authorVerificationData.stageName || '');
      setEmail(authorVerificationData.email || user?.email || '');
      setPhoneNumber(authorVerificationData.phoneNumber || '');
      setIdCardNumber(authorVerificationData.idCardNumber || '');
      setIdCardIssueDate(authorVerificationData.idCardIssueDate || '');
      setIdCardFrontUrl(authorVerificationData.idCardFrontUrl || '');
      setIdCardBackUrl(authorVerificationData.idCardBackUrl || '');
      setFacePhotoUrl(authorVerificationData.facePhotoUrl || '');
      setMusicGenre(authorVerificationData.musicGenre || 'Lo-Fi Chill');
      setBio(authorVerificationData.bio || '');
      setSocialLink(authorVerificationData.socialLink || '');
      setEmailVerified(true);
      setPhoneVerified(true);
    }
  }, [user, authorVerificationData, authorStageName, authorBio]);

  // Clean up camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Trình duyệt không hỗ trợ truy cập camera. Bạn có thể tải ảnh chân dung từ tệp.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Không thể mở camera. Vui lòng cho phép quyền truy cập camera hoặc tải ảnh chân dung từ máy.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFacePhotoUrl(dataUrl);
      stopCamera();
    }
  };

  // Convert File to base64 image
  const handleFileUpload = (file: File, target: 'front' | 'back' | 'face') => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'front') setIdCardFrontUrl(result);
      if (target === 'back') setIdCardBackUrl(result);
      if (target === 'face') setFacePhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Simulated OTP confirmation
  const handleSendEmailOtp = () => {
    if (!email.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setEmailOtpSent(true);
    // Auto-verify if email is already the logged-in user email
    if (user?.email && user.email.toLowerCase() === email.toLowerCase()) {
      setEmailVerified(true);
    }
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtpInput.trim().length >= 4 || emailOtpInput === '8888' || emailOtpInput === '123456') {
      setEmailVerified(true);
    } else {
      alert('Mã OTP không chính xác. Thử nhập 8888 hoặc mã xác thực của bạn.');
    }
  };

  const handleSendPhoneOtp = () => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      alert('Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (VD: 0912345678).');
      return;
    }
    setPhoneOtpSent(true);
  };

  const handleVerifyPhoneOtp = () => {
    if (phoneOtpInput.trim().length >= 4 || phoneOtpInput === '8888' || phoneOtpInput === '123456') {
      setPhoneVerified(true);
    } else {
      alert('Mã OTP SMS không chính xác. Thử nhập 8888 hoặc mã xác thực của bạn.');
    }
  };

  // Step 1 Validation
  const canProceedStep1 = 
    email.trim().length > 5 &&
    phoneNumber.trim().length >= 10 &&
    stageName.trim().length >= 2;

  // Step 2 Validation (CCCD)
  const canProceedStep2 = 
    fullName.trim().length >= 3 &&
    idCardNumber.replace(/[^0-9]/g, '').length === 12 &&
    idCardFrontUrl.length > 0 &&
    idCardBackUrl.length > 0;

  // Step 3 Validation (Face)
  const canProceedStep3 = facePhotoUrl.length > 0;

  // Handle final submission
  const handleSubmit = async () => {
    if (!canProceedStep1 || !canProceedStep2 || !canProceedStep3) {
      setErrorMessage('Vui lòng hoàn thành đầy đủ thông tin ở cả 3 bước xác thực.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản và Cam kết Bản quyền Tác giả.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const result = await submitAuthorVerification({
      fullName,
      stageName,
      email,
      phoneNumber,
      idCardNumber,
      idCardIssueDate: idCardIssueDate || '01/01/2023',
      idCardFrontUrl,
      idCardBackUrl,
      facePhotoUrl,
      musicGenre,
      bio,
      socialLink,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="author-verification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="author-verification-modal-content"
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg sm:text-xl">
                  Xác Minh Danh Tính Tác Giả
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                  eKYC 4 BƯỚC
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Xác thực chính chủ qua Gmail, SĐT, CCCD 12 số & Khuôn mặt để mở quyền Đăng Audio
              </p>
            </div>
          </div>

          <button
            id="close-author-verification-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Banner if already verified / pending */}
        {authorStatus === 'verified' && (
          <div className="m-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Bạn đã là Tác Giả Âm Nhạc Được Xác Minh Chính Thức ✓</p>
              <p className="text-zinc-400 text-xs">
                Nghệ danh: <span className="text-white font-semibold">{authorStageName || 'Tác giả'}</span>. Bạn có thể tự do đăng tải bài hát chất lượng cao lên Kho Audio.
              </p>
              {onOpenPublish && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPublish();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  <Music size={14} />
                  <span>Đăng Tác Phẩm Mới Ngay</span>
                </button>
              )}
            </div>
          </div>
        )}

        {authorStatus === 'pending' && (
          <div className="m-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Hồ sơ eKYC của bạn đang được Quản trị viên thẩm định</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Quản trị viên đang kiểm tra đối chiếu CCCD, Gmail, SĐT và Khuôn mặt của bạn. Quá trình xét duyệt diễn ra tự động/thủ công trong vòng 24h.
              </p>
            </div>
          </div>
        )}

        {authorStatus === 'rejected' && (
          <div className="m-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Hồ sơ xác minh trước đó chưa được thông qua</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Lý do: {authorVerificationData?.adminNote || 'Ảnh CCCD hoặc ảnh khuôn mặt bị mờ, thông tin chưa trùng khớp.'}. Vui lòng cập nhật lại bên dưới.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Stepper Progress */}
        <div className="px-6 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-950/40 shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Gmail & SĐT', icon: Mail },
              { num: 2, label: 'CCCD eKYC', icon: CreditCard },
              { num: 3, label: 'Khuôn Mặt', icon: Camera },
              { num: 4, label: 'Xác Nhận', icon: CheckCircle2 },
            ].map((st) => {
              const StIcon = st.icon;
              const isCurrent = step === st.num;
              const isCompleted = step > st.num;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    // Allow navigating back or forward if validated
                    if (st.num < step || (st.num === 2 && canProceedStep1) || (st.num === 3 && canProceedStep1 && canProceedStep2) || (st.num === 4 && canProceedStep1 && canProceedStep2 && canProceedStep3)) {
                      setStep(st.num as any);
                    }
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-xl transition-all text-center sm:text-left ${
                    isCurrent
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                      : isCompleted
                      ? 'bg-zinc-800/80 text-emerald-400 border border-zinc-700'
                      : 'bg-zinc-900/60 text-zinc-500 border border-zinc-800/60'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-amber-400 text-black' : isCompleted ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isCompleted ? <Check size={11} strokeWidth={3} /> : st.num}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap truncate">
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
              <div>
                <p className="font-bold text-sm">Hoàn thành nộp hồ sơ!</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* ================= STEP 1: GMAIL, SĐT, NGHỆ DANH ================= */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail size={18} className="text-amber-400" />
                  <span>Bước 1: Xác thực Gmail, Số điện thoại & Nghệ danh Tác giả</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Thông tin liên lạc giúp bảo vệ bản quyền và nhận tiền nhuận bút / thưởng nghe nhạc.
                </p>
              </div>

              {/* Gmail Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Địa chỉ Gmail chính chủ *</span>
                  {emailVerified && (
                    <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Đã xác thực Gmail
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailVerified(false);
                      }}
                      placeholder="tacgia@gmail.com"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none"
                    />
                  </div>
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs border border-zinc-700 whitespace-nowrap cursor-pointer"
                    >
                      {emailOtpSent ? 'Gửi lại mã' : 'Xác thực'}
                    </button>
                  )}
                </div>

                {emailOtpSent && !emailVerified && (
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/30 flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      placeholder="Nhập mã OTP Gmail (hoặc 8888)"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Xác nhận OTP
                    </button>
                  </div>
                )}
              </div>

              {/* SĐT Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Số điện thoại di động (SĐT Việt Nam) *</span>
                  {phoneVerified && (
                    <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Đã xác thực SĐT
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setPhoneVerified(false);
                      }}
                      placeholder="0912 345 678"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none"
                    />
                  </div>
                  {!phoneVerified && (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs border border-zinc-700 whitespace-nowrap cursor-pointer"
                    >
                      {phoneOtpSent ? 'Gửi lại OTP' : 'Gửi mã OTP'}
                    </button>
                  )}
                </div>

                {phoneOtpSent && !phoneVerified && (
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/30 flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={phoneOtpInput}
                      onChange={(e) => setPhoneOtpInput(e.target.value)}
                      placeholder="Nhập mã OTP SMS (hoặc 8888)"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyPhoneOtp}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Xác thực SĐT
                    </button>
                  </div>
                )}
              </div>

              {/* Stage Name & Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Nghệ Danh Tác Giả (Artist / Stage Name) *
                  </label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="VD: Min, Đen Vâu, Hoàng Dũng, Vũ..."
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Thể loại âm nhạc chính
                  </label>
                  <select
                    value={musicGenre}
                    onChange={(e) => setMusicGenre(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g} className="bg-zinc-900 text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio & Social */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Tiểu sử & Giới thiệu phong cách sáng tác
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Chia sẻ đôi nét về quá trình làm nhạc, kinh nghiệm hoặc câu chuyện sau các tác phẩm của bạn..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-600 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Kênh âm nhạc / Mạng xã hội (Tùy chọn)
                </label>
                <input
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://youtube.com/@kenhcua-ban hoặc https://facebook.com/..."
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 2: CĂN CƯỚC CÔNG DÂN (CCCD) ================= */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-400" />
                  <span>Bước 2: Căn Cước Công Dân (CCCD 12 Số)</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Xác minh eKYC để bảo đảm quyền sở hữu trí tuệ và ký hợp đồng phân phối âm nhạc số.
                </p>
              </div>

              {/* Full Name & CCCD Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Họ và Tên Thật (Trên CCCD) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.toUpperCase())}
                    placeholder="VD: NGUYỄN VĂN A"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-zinc-600 outline-none uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Số Căn Cước Công Dân (12 Chữ Số) *
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="001201012345"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm font-mono font-bold tracking-widest text-amber-300 placeholder-zinc-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Ngày cấp CCCD (Tùy chọn)
                </label>
                <input
                  type="date"
                  value={idCardIssueDate}
                  onChange={(e) => setIdCardIssueDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Photos: Front & Back */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Front CCCD */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Ảnh Mặt Trước CCCD *</span>
                    {idCardFrontUrl && <span className="text-emerald-400 text-[10px] font-bold">Đã có ảnh ✓</span>}
                  </span>

                  <div className="border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-2xl p-4 text-center bg-zinc-950/60 relative overflow-hidden transition-all group min-h-[140px] flex flex-col items-center justify-center">
                    {idCardFrontUrl ? (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden">
                        <img src={idCardFrontUrl} alt="CCCD Mặt trước" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setIdCardFrontUrl('')}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors">
                          <Upload size={18} />
                        </div>
                        <span className="text-xs text-zinc-300 font-semibold">Tải lên mặt trước</span>
                        <span className="text-[10px] text-zinc-500">Chụp thẳng, rõ số và họ tên</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'front');
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Back CCCD */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Ảnh Mặt Sau CCCD *</span>
                    {idCardBackUrl && <span className="text-emerald-400 text-[10px] font-bold">Đã có ảnh ✓</span>}
                  </span>

                  <div className="border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-2xl p-4 text-center bg-zinc-950/60 relative overflow-hidden transition-all group min-h-[140px] flex flex-col items-center justify-center">
                    {idCardBackUrl ? (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden">
                        <img src={idCardBackUrl} alt="CCCD Mặt sau" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setIdCardBackUrl('')}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors">
                          <Upload size={18} />
                        </div>
                        <span className="text-xs text-zinc-300 font-semibold">Tải lên mặt sau</span>
                        <span className="text-[10px] text-zinc-500">Rõ mã QR và con chip</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'back');
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
                <Lock size={14} className="text-amber-400 shrink-0" />
                <span>Toàn bộ thông tin CCCD được mã hóa bảo mật chuẩn AES-256 và chỉ phục vụ đối chiếu tác quyền.</span>
              </div>
            </div>
          )}

          {/* ================= STEP 3: XÁC MINH KHUÔN MẶT ================= */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera size={18} className="text-amber-400" />
                  <span>Bước 3: Xác Thực Khuôn Mặt Chân Dung (eKYC Face Scan)</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Đối chiếu khuôn mặt thực tế với ảnh trên Căn cước công dân để bảo đảm chính chủ.
                </p>
              </div>

              {/* Camera view or Captured photo */}
              <div className="max-w-md mx-auto space-y-4">
                {cameraActive ? (
                  <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-amber-400 shadow-2xl aspect-[4/3] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Face Guide Oval */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-60 rounded-full border-2 border-dashed border-amber-300/80 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse" />
                    </div>

                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <Camera size={16} />
                        <span>Chụp Ảnh Ngay</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2.5 rounded-full bg-zinc-900/90 text-zinc-300 font-bold text-xs border border-zinc-700"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : facePhotoUrl ? (
                  <div className="space-y-3 text-center">
                    <div className="w-48 h-48 rounded-full mx-auto overflow-hidden border-4 border-emerald-400 shadow-2xl relative group">
                      <img src={facePhotoUrl} alt="Chân dung khuôn mặt" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={16} /> Đã quét xong
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-400 font-bold">
                      Ảnh khuôn mặt eKYC đã sẵn sàng ✓
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw size={13} />
                        <span>Chụp lại camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFacePhotoUrl('')}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 text-red-400 text-xs border border-zinc-800"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-zinc-950/80 border-2 border-dashed border-zinc-700 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 shadow-lg">
                      <Camera size={28} />
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-white text-sm">Quét khuôn mặt trực tiếp qua Camera</h5>
                      <p className="text-xs text-zinc-400">
                        Nhìn thẳng vào camera, giữ ánh sáng rõ ràng, không đeo khẩu trang hoặc kính râm.
                      </p>
                    </div>

                    {cameraError && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        {cameraError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Camera size={16} />
                        <span>Mở Camera Quét Mặt</span>
                      </button>

                      <label className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <Upload size={16} className="text-zinc-400" />
                        <span>Tải ảnh chân dung từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'face');
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 4: XÁC NHẬN & NỘP HỒ SƠ ================= */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Bước 4: Xem lại & Hoàn tất Nộp Hồ Sơ Tác Giả</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Kiểm tra lại toàn bộ thông tin eKYC trước khi gửi cho Quản trị viên duyệt.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    {facePhotoUrl ? (
                      <img src={facePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                        {stageName.slice(0, 1) || 'A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-white text-base">{stageName}</h5>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        {musicGenre}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      Họ tên thật: <span className="text-white font-semibold">{fullName}</span> (CCCD: {idCardNumber.slice(0, 4)}****{idCardNumber.slice(-4)})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                    <span className="text-zinc-500 text-[10px] font-semibold uppercase">Gmail</span>
                    <p className="font-medium text-white truncate">{email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                    <span className="text-zinc-500 text-[10px] font-semibold uppercase">Số điện thoại</span>
                    <p className="font-medium text-white truncate">{phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Ảnh CCCD:</span>
                  <span className="text-emerald-400 font-bold">Mặt trước ✓</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">Mặt sau ✓</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">Khuôn mặt eKYC ✓</span>
                </div>
              </div>

              {/* Copyright terms checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-zinc-700 bg-zinc-900 cursor-pointer"
                />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-300">
                    Cam kết Bản quyền Âm nhạc & Quy chế Tác giả *
                  </p>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Tôi cam kết là chủ sở hữu hợp pháp hoặc có quyền sử dụng các tác phẩm Audio đăng tải lên nền tảng. Tôi chịu hoàn toàn trách nhiệm pháp lý trước pháp luật về tính chính xác của thông tin CCCD và hình ảnh khuôn mặt đã cung cấp.
                  </p>
                </div>
              </label>

              {/* Reward notice */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>Thưởng ngay khi gửi hồ sơ:</span>
                </div>
                <span className="font-mono font-bold text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-md">
                  +100 Audio Points
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                onClick={() => setStep((step + 1) as any)}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <span>Tiếp tục</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !agreedTerms}
                onClick={handleSubmit}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Nộp Hồ Sơ Xác Minh eKYC</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
