import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  FileCheck
} from 'lucide-react';
import {
  isGoogleDocsConnected,
  getGoogleDocsUser,
  connectGoogleDocs,
  createGoogleDoc,
  GoogleDocExportOptions,
  GoogleDocExportResult
} from '../../services/googleDocsService';
import { haptics } from '../../utils/haptics';

interface GoogleDocsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: GoogleDocExportOptions | null;
  onSuccess?: (result: GoogleDocExportResult) => void;
}

export function GoogleDocsExportModal({
  isOpen,
  onClose,
  options,
  onSuccess
}: GoogleDocsExportModalProps) {
  const [docTitle, setDocTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<GoogleDocExportResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state on open
  useEffect(() => {
    if (!isOpen) {
      setExportResult(null);
      setErrorMsg(null);
      return;
    }

    const connected = isGoogleDocsConnected();
    const user = getGoogleDocsUser();
    setIsConnected(connected);
    setUserEmail(user?.email || null);

    if (options) {
      setDocTitle(options.title || 'Tài liệu Haevy Export');
    }
  }, [isOpen, options]);

  if (!isOpen || !options) return null;

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    haptics.selection();

    try {
      const res = await connectGoogleDocs();
      setIsConnected(true);
      setUserEmail(res.user.email);
      haptics.success();
    } catch (err: any) {
      console.error('Connect Google error:', err);
      setErrorMsg(err.message || 'Không thể đăng nhập Google. Vui lòng thử lại.');
      haptics.warning();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmExport = async () => {
    if (!isConnected) {
      setErrorMsg('Vui lòng kết nối tài khoản Google trước khi xuất tài liệu.');
      return;
    }

    setIsExporting(true);
    setErrorMsg(null);
    haptics.impact('medium');

    try {
      const result = await createGoogleDoc({
        ...options,
        title: docTitle.trim() || options.title
      });

      setExportResult(result);
      haptics.success();
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      console.error('Export Google Doc error:', err);
      setErrorMsg(err.message || 'Lỗi khi tạo tài liệu trên Google Docs. Vui lòng thử lại.');
      haptics.warning();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!exportResult?.editUrl) return;
    try {
      await navigator.clipboard.writeText(exportResult.editUrl);
      setCopiedLink(true);
      haptics.selection();
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  // Approximate word count
  const wordCount = options.contentMarkdown.trim().split(/\s+/).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Xuất Sang Google Docs</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                  Google Docs API
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Tạo tài liệu trực tiếp trên Google Drive & mở trong Google Docs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-5 space-y-4 relative z-10">
          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Success State */}
          {exportResult ? (
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
                <FileCheck size={32} />
              </div>

              <div>
                <h4 className="text-base font-black text-white">Xuất Google Docs Thành Công!</h4>
                <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto">
                  Tài liệu <strong className="text-emerald-300 font-bold">"{exportResult.name}"</strong> đã sẵn sàng trên Google Drive của bạn.
                </p>
              </div>

              {/* Action Link Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
                <a
                  href={exportResult.editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all group"
                >
                  <span>Mở Ngay Trong Google Docs</span>
                  <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>

                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Sao Chép Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Document Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Tên Tài Liệu Google Docs:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Nhập tên tài liệu..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              {/* Content Preview Summary Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Nguồn dữ liệu: {options.categoryLabel || options.category || 'Haevy App'}</span>
                  </span>
                  <span className="font-mono">~{wordCount.toLocaleString()} từ</span>
                </div>

                {options.summary && (
                  <p className="text-xs text-zinc-300 italic line-clamp-2 border-l-2 border-blue-500 pl-2">
                    "{options.summary}"
                  </p>
                )}

                {options.tags && options.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {options.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Connection Status & Official Google Sign-in */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isConnected ? <CheckCircle2 size={16} /> : <Lock size={15} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate">
                      {isConnected ? 'Đã Kết Nối Google' : 'Chưa Kết Nối Google'}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {isConnected ? (userEmail || 'Tài khoản Google sẵn sàng') : 'Cần đăng nhập để xuất tài liệu'}
                    </div>
                  </div>
                </div>

                {!isConnected && (
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                    className="gsi-material-button text-xs py-1.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 size={14} className="animate-spin text-zinc-900" />
                    ) : (
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                    )}
                    <span>Đăng nhập Google</span>
                  </button>
                )}
              </div>

              {/* Confirmation Notice */}
              <div className="flex items-start gap-2 text-[11px] text-zinc-400 leading-relaxed bg-blue-950/20 p-3 rounded-2xl border border-blue-500/20">
                <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Hành động này sẽ tạo một file Google Doc mới trong Google Drive của bạn dưới sự cho phép của bạn. Không ghi đè hay xóa bất kỳ tệp tin nào có sẵn.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!exportResult && (
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5 relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={handleConfirmExport}
              disabled={isExporting || !isConnected}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang Tạo Google Doc...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Xác Nhận Xuất Google Docs</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        )}

        {exportResult && (
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
