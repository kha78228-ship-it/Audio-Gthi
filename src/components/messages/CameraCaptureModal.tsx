import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (base64Photo: string) => void;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onPhotoCaptured
}: CameraCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'none' | 'vintage' | 'warm' | 'cool' | 'bnw'>('none');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera stream
  useEffect(() => {
    if (!isOpen) return;

    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      setHasCameraError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setHasCameraError('Không thể truy cập camera. Vui lòng cho phép quyền truy cập máy ảnh hoặc sử dụng tính năng tải ảnh từ máy.');
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Clean up when closed
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCapturedPhoto(null);
    onClose();
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Apply mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply color filter if selected
    if (selectedFilter === 'bnw') {
      ctx.filter = 'grayscale(100%)';
    } else if (selectedFilter === 'vintage') {
      ctx.filter = 'sepia(60%) contrast(110%)';
    } else if (selectedFilter === 'warm') {
      ctx.filter = 'sepia(25%) saturate(140%)';
    } else if (selectedFilter === 'cool') {
      ctx.filter = 'hue-rotate(180deg) saturate(110%)';
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto);
      handleClose();
    }
  };

  const toggleCameraFacing = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Chụp Ảnh Trực Tiếp</h3>
              <p className="text-[11px] text-zinc-400">Ghi lại khoảnh khắc ngay lập tức trong Haevy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center">
          {hasCameraError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle size={32} className="text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300 max-w-xs leading-relaxed">{hasCameraError}</p>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              } ${
                selectedFilter === 'bnw'
                  ? 'grayscale'
                  : selectedFilter === 'vintage'
                  ? 'sepia contrast-125'
                  : selectedFilter === 'warm'
                  ? 'saturate-150'
                  : selectedFilter === 'cool'
                  ? 'hue-rotate-180'
                  : ''
              }`}
            />
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Flash indicator */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white flex items-center gap-1 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {capturedPhoto ? 'ĐÃ CHỤP XONG' : 'CAMERA TRỰC TIẾP'}
          </div>
        </div>

        {/* Filter Selection (only when live) */}
        {!capturedPhoto && !hasCameraError && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
            {[
              { id: 'none', label: 'Tự nhiên' },
              { id: 'warm', label: 'Ấm áp ☀️' },
              { id: 'vintage', label: 'Vintage 🎞️' },
              { id: 'cool', label: 'Cool ❄️' },
              { id: 'bnw', label: 'Trắng đen 🖤' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedFilter === f.id
                    ? 'bg-amber-400 text-black shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
              >
                Chụp lại
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black hover:brightness-110 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <Check size={15} />
                <span>Sử dụng ảnh này</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Đổi camera trước / sau"
              >
                <RefreshCw size={18} />
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={Boolean(hasCameraError)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <Camera size={18} />
                <span>Bấm Chụp Ảnh</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
