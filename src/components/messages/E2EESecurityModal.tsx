import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Cpu, 
  Database, 
  Clock, 
  Check, 
  Copy, 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Info,
  RefreshCw,
  Fingerprint
} from 'lucide-react';
import { 
  getConversationE2EEConfig, 
  saveConversationE2EEConfig, 
  getSessionPasskey, 
  setSessionPasskey, 
  lockSessionPasskey, 
  isSessionUnlocked, 
  calculatePasskeyFingerprint, 
  evaluatePasskeyStrength 
} from '../../services/e2eeService';

interface E2EESecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  recipientName: string;
  onPasskeyChanged?: () => void;
}

export function E2EESecurityModal({
  isOpen,
  onClose,
  conversationId,
  recipientName,
  onPasskeyChanged
}: E2EESecurityModalProps) {
  const [passkeyInput, setPasskeyInput] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);
  const [inputMode, setInputMode] = useState<'pin6' | 'custom'>('pin6');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentFingerprint, setCurrentFingerprint] = useState<string>('');
  const [copiedFp, setCopiedFp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'layers' | 'verify'>('setup');

  const strength = evaluatePasskeyStrength(passkeyInput);

  useEffect(() => {
    if (!isOpen) return;
    const config = getConversationE2EEConfig(conversationId);
    setAutoLockMinutes(config.autoLockMinutes || 15);
    const activeKey = getSessionPasskey(conversationId);
    const unlocked = isSessionUnlocked(conversationId);
    setIsUnlocked(unlocked);

    if (activeKey) {
      calculatePasskeyFingerprint(activeKey, conversationId).then(setCurrentFingerprint);
    } else if (config.fingerprint) {
      setCurrentFingerprint(config.fingerprint);
    } else {
      setCurrentFingerprint('');
    }

    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isOpen, conversationId]);

  if (!isOpen) return null;

  const handleSavePasskey = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = passkeyInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập mã bảo mật.');
      return;
    }

    if (inputMode === 'pin6' && !/^\d{6}$/.test(trimmed)) {
      setErrorMessage('Mã PIN 6 lớp phải gồm chính xác 6 chữ số (0-9).');
      return;
    }

    if (trimmed.length < 6) {
      setErrorMessage('Mã bảo mật phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    if (confirmPasskey && trimmed !== confirmPasskey.trim()) {
      setErrorMessage('Mã bảo mật xác nhận không trùng khớp.');
      return;
    }

    try {
      const fp = await calculatePasskeyFingerprint(trimmed, conversationId);
      setSessionPasskey(conversationId, trimmed, autoLockMinutes);
      saveConversationE2EEConfig(conversationId, {
        enabled: true,
        fingerprint: fp,
        autoLockMinutes
      });

      setCurrentFingerprint(fp);
      setIsUnlocked(true);
      setSuccessMessage('Đã kích hoạt & thiết lập Mã Hóa Đầu Cuối 6 Lớp thành công!');
      setPasskeyInput('');
      setConfirmPasskey('');

      if (onPasskeyChanged) onPasskeyChanged();
    } catch (err: any) {
      setErrorMessage('Lỗi thiết lập mã hóa: ' + (err.message || 'Thử lại'));
    }
  };

  const handleLockNow = () => {
    lockSessionPasskey(conversationId);
    setIsUnlocked(false);
    setSuccessMessage('Đã khóa phiên mã hóa an toàn.');
    if (onPasskeyChanged) onPasskeyChanged();
  };

  const handleDisableE2EE = () => {
    lockSessionPasskey(conversationId);
    saveConversationE2EEConfig(conversationId, {
      enabled: false,
      fingerprint: undefined
    });
    setIsUnlocked(false);
    setCurrentFingerprint('');
    setSuccessMessage('Đã tắt mã hóa cho phiên trò chuyện này.');
    if (onPasskeyChanged) onPasskeyChanged();
  };

  const copyFingerprint = () => {
    if (!currentFingerprint) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentFingerprint);
      setCopiedFp(true);
      setTimeout(() => setCopiedFp(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
              isUnlocked 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10'
            }`}>
              {isUnlocked ? <ShieldCheck size={22} /> : <Lock size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Mã Hóa Đầu Cuối 6 Lớp</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isUnlocked 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isUnlocked ? 'ĐÃ MỞ KHÓA' : 'ĐANG KHÓA'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Bảo mật tuyệt đối cùng {recipientName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-1.5 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'setup' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key size={14} className={activeTab === 'setup' ? 'text-amber-400' : ''} />
            <span>Thiết Lập Mã</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'layers' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers size={14} className={activeTab === 'layers' ? 'text-sky-400' : ''} />
            <span>6 Lớp Bảo Mật</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'verify' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Fingerprint size={14} className={activeTab === 'verify' ? 'text-emerald-400' : ''} />
            <span>Xác Minh Khóa</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check size={16} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SETUP */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${isUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isUnlocked ? 'Trạng thái: Phiên Chat Đã Mở Khóa' : 'Trạng thái: Phiên Chat Đang Khóa'}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {isUnlocked 
                        ? 'Tin nhắn gửi và nhận sẽ được mã hóa & giải mã tức thì' 
                        : 'Nhập mã bảo mật để xem và gửi tin nhắn bảo mật'}
                    </p>
                  </div>
                </div>

                {isUnlocked && (
                  <button
                    type="button"
                    onClick={handleLockNow}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Lock size={12} />
                    <span>Khóa Ngay</span>
                  </button>
                )}
              </div>

              {/* Input Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Loại Mã Bảo Mật</span>
                  <span className="text-[10px] text-zinc-500">Người dùng tự đặt</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setInputMode('pin6'); setPasskeyInput(''); }}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      inputMode === 'pin6' 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Key size={14} />
                    <span>Mã PIN 6 Số (Tiện Lợi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setInputMode('custom'); setPasskeyInput(''); }}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      inputMode === 'custom' 
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-md shadow-sky-500/10' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Cpu size={14} />
                    <span>Mật Mã Tùy Chọn (Ký Tự)</span>
                  </button>
                </div>
              </div>

              {/* Passkey Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">
                  {inputMode === 'pin6' ? 'Nhập Mã PIN 6 Lớp' : 'Nhập Mật Mã Bảo Mật'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (inputMode === 'pin6') {
                        setPasskeyInput(val.replace(/\D/g, '').slice(0, 6));
                      } else {
                        setPasskeyInput(val);
                      }
                    }}
                    maxLength={inputMode === 'pin6' ? 6 : 64}
                    placeholder={inputMode === 'pin6' ? 'VD: 849201' : 'Nhập mật mã bảo mật của bạn...'}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 tracking-wider font-mono focus:outline-none pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength Meter */}
                {passkeyInput && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className={`w-4 h-1.5 rounded-full transition-all ${
                            idx <= strength.score ? 'bg-amber-400' : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Passkey */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">Xác Nhận Lại Mã</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPasskey}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (inputMode === 'pin6') {
                      setConfirmPasskey(val.replace(/\D/g, '').slice(0, 6));
                    } else {
                      setConfirmPasskey(val);
                    }
                  }}
                  maxLength={inputMode === 'pin6' ? 6 : 64}
                  placeholder="Nhập lại mã trên để xác nhận..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 tracking-wider font-mono focus:outline-none"
                />
              </div>

              {/* Auto-Lock Duration (Layer 5) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-400" />
                  <span>Thời Gian Tự Động Khóa (Lớp 5)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '5 phút', val: 5 },
                    { label: '15 phút', val: 15 },
                    { label: '30 phút', val: 30 },
                    { label: 'Khi đóng tab', val: 0 }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAutoLockMinutes(item.val)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        autoLockMinutes === item.val
                          ? 'bg-zinc-800 border-amber-500/50 text-amber-300'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSavePasskey}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all active:scale-98"
                >
                  <ShieldCheck size={16} />
                  <span>Áp Dụng Mã Bảo Mật 6 Lớp</span>
                </button>

                {isUnlocked && (
                  <button
                    type="button"
                    onClick={handleDisableE2EE}
                    className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 font-bold text-xs transition-all cursor-pointer"
                  >
                    Tắt E2EE
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THE 6 LAYERS OF SECURITY */}
          {activeTab === 'layers' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2">
                <Sparkles size={16} className="text-sky-400 shrink-0" />
                <span>Mỗi tin nhắn đều được bảo vệ qua chu trình 6 lớp mã hóa độc lập</span>
              </div>

              {[
                {
                  layer: 1,
                  title: 'Khóa Bí Mật Người Dùng (Master Passkey)',
                  desc: 'Mã bảo mật do bạn tự đặt (PIN 6 số hoặc mật khẩu riêng). Không bao giờ lưu ở máy chủ.',
                  badge: 'Cá Nhân Hóa',
                  icon: Key,
                  color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30'
                },
                {
                  layer: 2,
                  title: 'Phân Sinh Khóa PBKDF2 (100.000 Vòng Lặp)',
                  desc: 'Thuật toán PBKDF2 với SHA-256 kết hợp Salt động ngẫu nhiên ngăn chặn tấn công từ điển & Rainbow Tables.',
                  badge: 'PBKDF2-SHA256',
                  icon: Cpu,
                  color: 'from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30'
                },
                {
                  layer: 3,
                  title: 'Mã Hóa Đối Xứng Chuẩn Quân Đội AES-256-GCM',
                  desc: 'Mã hóa phần thân tin nhắn bằng AES-256-GCM với IV 96-bit ngẫu nhiên và 128-bit Authentication Tag xác thực.',
                  badge: 'AES-256-GCM',
                  icon: ShieldCheck,
                  color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
                },
                {
                  layer: 4,
                  title: 'Bao Đóng Nonce & Anti-Replay Envelope',
                  desc: 'Đóng gói dữ liệu kèm Nonce thời gian thực và dấu niêm phong chống phát lại (Replay Attacks).',
                  badge: 'Anti-Replay',
                  icon: Layers,
                  color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30'
                },
                {
                  layer: 5,
                  title: 'Bộ Nhớ Volatile & Tự Động Khóa Inactivity',
                  desc: 'Khóa chỉ tồn tại trong RAM tạm thời, tự hủy khi khóa/đóng tab và bảo vệ chống dò mã Brute-Force Rate Limiter.',
                  badge: 'Auto-Lock & RAM',
                  icon: Clock,
                  color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30'
                },
                {
                  layer: 6,
                  title: 'Zero-Knowledge Firestore & Fingerprint',
                  desc: 'Máy chủ Firebase hoàn toàn Zero-Knowledge (không đọc được nội dung). Người dùng xác minh dấu vân tay MAC.',
                  badge: 'Zero-Knowledge',
                  icon: Database,
                  color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30'
                }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.layer}
                    className={`p-3 sm:p-3.5 rounded-2xl border bg-gradient-to-r ${item.color} space-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-zinc-950/60 flex items-center justify-center text-xs font-black">
                          {item.layer}
                        </div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-950/80 text-zinc-300 border border-zinc-800">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300/90 pl-8 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: VERIFY FINGERPRINT */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <Fingerprint size={26} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dấu Vân Tay Khóa Bảo Mật</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    So sánh dấu vân tay này với đối phương ({recipientName}) để đảm bảo hai bên cùng sử dụng chung mã bảo mật.
                  </p>
                </div>

                {currentFingerprint ? (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/40 flex items-center justify-between gap-2 max-w-xs mx-auto">
                    <span className="font-mono text-base sm:text-lg font-black text-emerald-400 tracking-widest">
                      {currentFingerprint}
                    </span>
                    <button
                      type="button"
                      onClick={copyFingerprint}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Sao chép dấu vân tay"
                    >
                      {copiedFp ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
                    Chưa thiết lập mã bảo mật cho cuộc trò chuyện này.
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                  <Info size={14} className="text-sky-400" />
                  <span>Cách thức hoạt động:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  1. Bạn và đối phương thống nhất chung một mã bảo mật (hoặc PIN 6 số) qua kênh riêng.
                </p>
                <p className="text-[11px] leading-relaxed">
                  2. Khi cả 2 cùng nhập đúng mã, dấu vân tay khóa (vd: <span className="font-mono text-emerald-400">#7B9E-4C21</span>) sẽ hiển thị giống nhau hoàn toàn.
                </p>
                <p className="text-[11px] leading-relaxed">
                  3. Mọi tin nhắn trao đổi được mã hóa ở thiết bị của bạn và chỉ giải mã được trên thiết bị đối phương.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Zero-Knowledge Cryptography</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
