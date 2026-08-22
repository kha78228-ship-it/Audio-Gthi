import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Link2, 
  Check, 
  Loader2, 
  Sparkles,
  Camera
} from 'lucide-react';
import { fileToDataUrl } from '../../lib/imageUtils';

interface ImageUploadPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  className?: string;
}

export function ImageUploadPicker({
  value,
  onChange,
  label = 'Hình Ảnh',
  helperText = 'Chọn ảnh từ thư viện máy hoặc kéo thả trực tiếp',
  aspectRatio = 'auto',
  className = ''
}: ImageUploadPickerProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const dataUrl = await fileToDataUrl(file, 1200, 1200, 0.85);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xử lý hình ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleClearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'wide': return 'aspect-[16/7]';
      default: return 'aspect-[4/3] max-h-56';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <ImageIcon size={14} className="text-rose-400" />
          <span>{label}</span>
        </label>
        
        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeMode === 'upload' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Từ Máy
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeMode === 'url' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Link URL
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />

      {/* Image Preview if selected */}
      {value ? (
        <div className={`relative w-full ${getAspectClass()} rounded-2xl overflow-hidden bg-zinc-950 border border-rose-500/40 group shadow-lg`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-bold shadow-md hover:bg-zinc-100 flex items-center gap-1 cursor-pointer"
            >
              <Upload size={13} />
              <span>Đổi Ảnh Khác</span>
            </button>
            <button
              type="button"
              onClick={handleClearImage}
              className="p-1.5 rounded-xl bg-rose-600 text-white text-xs hover:bg-rose-700 shadow-md cursor-pointer"
              title="Xóa ảnh"
            >
              <X size={15} />
            </button>
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-emerald-300 font-bold flex items-center gap-1 border border-white/10">
            <Check size={11} />
            <span>Ảnh đã sẵn sàng</span>
          </div>
        </div>
      ) : activeMode === 'upload' ? (
        /* Dropzone / Upload box */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            dragActive 
              ? 'border-rose-500 bg-rose-500/10 scale-[0.99]' 
              : 'border-zinc-800 hover:border-rose-500/50 bg-zinc-950/60 hover:bg-zinc-950'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 py-3 text-rose-400">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs font-bold">Đang tải và tối ưu ảnh...</span>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-md">
                <Upload size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-white">
                  Nhấn để chọn ảnh từ máy hoặc kéo thả vào đây
                </p>
                <p className="text-[10px] sm:text-xs text-zinc-400">
                  {helperText} (PNG, JPG, WEBP)
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* URL Input alternative */
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Dán đường dẫn ảnh (https://...)"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={!urlInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs disabled:opacity-40 cursor-pointer"
          >
            Áp Dụng
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-rose-400 font-medium">{errorMsg}</p>
      )}
    </div>
  );
}
