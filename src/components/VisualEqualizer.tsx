import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Sliders, 
  Flame, 
  Music, 
  Mic, 
  Zap, 
  Radio, 
  Equal, 
  Activity, 
  RotateCcw, 
  Power, 
  Sparkles,
  Waves,
  BarChart2,
  TrendingUp,
  Headphones
} from 'lucide-react';
import { 
  webAudioEqualizer, 
  EQUALIZER_BANDS, 
  EQUALIZER_PRESETS, 
  EqualizerPresetKey 
} from '../lib/webAudioEqualizer';

interface VisualEqualizerProps {
  isPlaying: boolean;
  isVip?: boolean;
  className?: string;
}

export function VisualEqualizer({
  isPlaying,
  isVip = false,
  className = ''
}: VisualEqualizerProps) {
  const [currentPreset, setCurrentPreset] = useState<EqualizerPresetKey>(webAudioEqualizer.getCurrentPreset());
  const [gains, setGains] = useState<number[]>(webAudioEqualizer.getCurrentGains());
  const [isEnabled, setIsEnabled] = useState<boolean>(webAudioEqualizer.getIsActive());
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'curve'>('bars');
  const [activeHoverBand, setActiveHoverBand] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync state with Web Audio Equalizer updates
  useEffect(() => {
    const unsubscribe = webAudioEqualizer.subscribe(() => {
      setCurrentPreset(webAudioEqualizer.getCurrentPreset());
      setGains(webAudioEqualizer.getCurrentGains());
      setIsEnabled(webAudioEqualizer.getIsActive());
    });
    return () => unsubscribe();
  }, []);

  const handleSelectPreset = (presetKey: EqualizerPresetKey) => {
    webAudioEqualizer.setPreset(presetKey);
    webAudioEqualizer.resume();
  };

  const handleBandChange = (index: number, val: number) => {
    webAudioEqualizer.setBandGain(index, val);
    webAudioEqualizer.resume();
  };

  const handleTogglePower = () => {
    webAudioEqualizer.setEnabled(!isEnabled);
    webAudioEqualizer.resume();
  };

  const handleReset = () => {
    webAudioEqualizer.resetToFlat();
    webAudioEqualizer.resume();
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const bufferLength = 64;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Read real Web Audio data if available
      webAudioEqualizer.getFrequencyData(freqData);
      webAudioEqualizer.getTimeDomainData(timeData);

      // Check if actual frequency energy exists
      let hasRealAudio = false;
      if (isPlaying) {
        for (let i = 0; i < 16; i++) {
          if (freqData[i] > 10) {
            hasRealAudio = true;
            break;
          }
        }
      }

      phase += 0.05;

      if (visualMode === 'bars') {
        // Multi-Band Spectrum Visualizer
        const barCount = 32;
        const barWidth = (width / barCount) - 3;
        const activePresetConfig = EQUALIZER_PRESETS[currentPreset];

        for (let i = 0; i < barCount; i++) {
          let value = 0;
          if (isPlaying) {
            if (hasRealAudio) {
              const dataIdx = Math.floor((i / barCount) * (bufferLength / 2));
              value = freqData[dataIdx] / 255;
            } else {
              // Synthetic wave based on band gains and sine
              const bandIdx = Math.min(5, Math.floor((i / barCount) * 6));
              const boost = (gains[bandIdx] + 12) / 24;
              const wave1 = Math.sin(phase * 1.5 + i * 0.3) * 0.3 + 0.5;
              const wave2 = Math.cos(phase * 2.1 + i * 0.15) * 0.2;
              value = Math.max(0.1, (wave1 + wave2) * boost * 0.85);
            }
          } else {
            // Idle subtle resting state
            value = 0.05 + Math.sin(phase * 0.5 + i * 0.2) * 0.03;
          }

          const barHeight = Math.max(4, value * (height - 18));
          const x = i * (barWidth + 3) + 2;
          const y = height - barHeight - 4;

          // Gradient color for bars
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          if (currentPreset === 'bass_boost') {
            gradient.addColorStop(0, '#7c2d12');
            gradient.addColorStop(0.5, '#ea580c');
            gradient.addColorStop(1, '#fdba74');
          } else if (currentPreset === 'acoustic') {
            gradient.addColorStop(0, '#164e63');
            gradient.addColorStop(0.5, '#06b6d4');
            gradient.addColorStop(1, '#67e8f9');
          } else if (currentPreset === 'vocal') {
            gradient.addColorStop(0, '#581c87');
            gradient.addColorStop(0.5, '#a855f7');
            gradient.addColorStop(1, '#f0abfc');
          } else if (currentPreset === 'electronic') {
            gradient.addColorStop(0, '#831843');
            gradient.addColorStop(0.5, '#ec4899');
            gradient.addColorStop(1, '#fbcfe8');
          } else if (isVip) {
            gradient.addColorStop(0, '#78350f');
            gradient.addColorStop(0.5, '#f59e0b');
            gradient.addColorStop(1, '#fef08a');
          } else {
            gradient.addColorStop(0, '#312e81');
            gradient.addColorStop(0.5, '#6366f1');
            gradient.addColorStop(1, '#a5b4fc');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Peak cap
          if (isPlaying) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, Math.max(0, y - 3), barWidth, 2);
          }
        }
      } else if (visualMode === 'wave') {
        // Smooth Oscilloscope Waveform
        ctx.lineWidth = 2.5;
        const waveGradient = ctx.createLinearGradient(0, 0, width, 0);
        waveGradient.addColorStop(0, '#06b6d4');
        waveGradient.addColorStop(0.5, '#a855f7');
        waveGradient.addColorStop(1, '#f59e0b');

        ctx.strokeStyle = waveGradient;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = 128;
          if (isPlaying) {
            if (hasRealAudio) {
              v = timeData[i];
            } else {
              v = 128 + Math.sin(phase * 2 + i * 0.25) * 35 + Math.cos(phase * 1.3 + i * 0.1) * 20;
            }
          } else {
            v = 128 + Math.sin(phase + i * 0.1) * 4;
          }

          const y = (v / 256) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();

        // Glow pass
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
      } else {
        // EQ Frequency Response Curve
        const points = EQUALIZER_BANDS.map((band, idx) => {
          const px = (idx / (EQUALIZER_BANDS.length - 1)) * (width - 40) + 20;
          // Scale -12dB to +12dB to canvas Y
          const gain = gains[idx] || 0;
          const py = height / 2 - (gain / 12) * (height * 0.38);
          return { x: px, y: py, gain, label: band.label };
        });

        // Draw center baseline (0dB)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(10, height / 2);
        ctx.lineTo(width - 10, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

        const curveGradient = ctx.createLinearGradient(0, 0, width, 0);
        curveGradient.addColorStop(0, '#f97316');
        curveGradient.addColorStop(0.5, '#a855f7');
        curveGradient.addColorStop(1, '#06b6d4');

        ctx.strokeStyle = curveGradient;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw node circles
        points.forEach((p, idx) => {
          ctx.fillStyle = idx === activeHoverBand ? '#ffffff' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(p.x, p.y, idx === activeHoverBand ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentPreset, gains, visualMode, isVip, activeHoverBand]);

  const presetList: EqualizerPresetKey[] = [
    'bass_boost',
    'acoustic',
    'vocal',
    'electronic',
    'rock',
    'flat',
  ];

  return (
    <div 
      id="visual-equalizer-container"
      className={`bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col gap-5 ${className}`}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Title, Power Switch & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Sliders size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Web Audio Equalizer</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30">
                  DSP Hi-Fi
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              {isEnabled ? EQUALIZER_PRESETS[currentPreset].subtitle : 'Bộ lọc âm thanh đang tạm tắt (Bypass)'}
            </p>
          </div>
        </div>

        {/* Right Controls: Visualizer view toggle & Reset */}
        <div className="flex items-center gap-2">
          {/* Visual Mode Selector */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setVisualMode('bars')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                visualMode === 'bars' ? 'bg-zinc-800 text-amber-400 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Phổ tần số Multi-band"
            >
              <BarChart2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => setVisualMode('wave')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                visualMode === 'wave' ? 'bg-zinc-800 text-amber-400 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Sóng âm Oscilloscope"
            >
              <Waves size={13} />
            </button>
            <button
              type="button"
              onClick={() => setVisualMode('curve')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                visualMode === 'curve' ? 'bg-zinc-800 text-amber-400 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Đường cong đáp tuyến tần số EQ"
            >
              <TrendingUp size={13} />
            </button>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
            title="Đặt lại EQ về chuẩn Flat (0 dB)"
          >
            <RotateCcw size={13} />
          </button>

          {/* Master Power Toggle */}
          <button
            type="button"
            onClick={handleTogglePower}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
            title={isEnabled ? 'Tắt bộ lọc EQ (Bypass)' : 'Bật bộ lọc EQ'}
          >
            <Power size={12} className={isEnabled ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>{isEnabled ? 'ON' : 'BYPASS'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Visualizer Screen */}
      <div className="relative w-full h-24 bg-zinc-950 rounded-2xl border border-zinc-800/90 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={540}
          height={96}
          className="w-full h-full object-cover"
        />

        {/* Overlay Current Preset Badge */}
        <div className="absolute top-2 left-3 flex items-center gap-1.5 pointer-events-none">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${
            EQUALIZER_PRESETS[currentPreset].badgeBg
          }`}>
            <Activity size={10} className="animate-pulse" />
            <span>Preset: {EQUALIZER_PRESETS[currentPreset].name}</span>
          </span>
          {isPlaying && (
            <span className="text-[9px] text-zinc-400 font-mono hidden sm:inline">
              • 48kHz / 32-bit Float DSP
            </span>
          )}
        </div>
      </div>

      {/* Preset Mode Selector Buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Chế độ âm sắc (Presets)
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
            Bấm để kích hoạt tức thì
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {presetList.map((key) => {
            const preset = EQUALIZER_PRESETS[key];
            const isSelected = currentPreset === key;

            return (
              <button
                key={key}
                id={`eq-preset-btn-${key}`}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative group overflow-hidden ${
                  isSelected
                    ? `${preset.badgeBg} shadow-md ring-1 ring-white/10 scale-[1.02]`
                    : 'bg-zinc-900/80 hover:bg-zinc-800/80 border-zinc-800/90 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1 rounded-lg bg-black/40 border border-white/5 shrink-0">
                    {key === 'bass_boost' && <Flame size={14} className="text-orange-400" />}
                    {key === 'acoustic' && <Music size={14} className="text-cyan-400" />}
                    {key === 'vocal' && <Mic size={14} className="text-purple-400" />}
                    {key === 'electronic' && <Zap size={14} className="text-pink-400" />}
                    {key === 'rock' && <Radio size={14} className="text-amber-400" />}
                    {key === 'flat' && <Equal size={14} className="text-zinc-400" />}
                  </div>

                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-extrabold text-white truncate leading-tight">
                    {preset.name.split('/')[0]}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate opacity-80 mt-0.5">
                    {key === 'bass_boost' ? 'Siêu Bass' :
                     key === 'acoustic' ? 'Trong Trẻo' :
                     key === 'vocal' ? 'Tôn Giọng' :
                     key === 'electronic' ? 'Sôi Động' :
                     key === 'rock' ? 'Uy Lực' : 'Chuẩn'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6-Band Graphic Equalizer Faders */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders size={13} className="text-amber-400" />
            <span className="text-xs font-bold text-zinc-300">
              Dải tần số chi tiết (Graphic Equalizer Faders)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Dải điều chỉnh: -12 dB ~ +12 dB
          </span>
        </div>

        {/* Faders Container */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-2">
          {EQUALIZER_BANDS.map((band, idx) => {
            const gain = gains[idx] || 0;
            const isBoosted = gain > 0;
            const isCut = gain < 0;

            return (
              <div 
                key={band.freq}
                className="flex flex-col items-center gap-2.5 group"
                onMouseEnter={() => setActiveHoverBand(idx)}
                onMouseLeave={() => setActiveHoverBand(null)}
              >
                {/* dB Readout Pill */}
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                  isBoosted
                    ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                    : isCut
                    ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30'
                    : 'text-zinc-400 bg-zinc-800 border border-zinc-700'
                }`}>
                  {gain > 0 ? `+${gain}` : `${gain}`} dB
                </span>

                {/* Vertical Slider Track Container */}
                <div className="relative h-28 sm:h-32 flex items-center justify-center w-full py-2">
                  {/* Center Line (0dB tick) */}
                  <div className="absolute w-full h-[1px] bg-zinc-700/60 pointer-events-none top-1/2 -translate-y-1/2" />

                  {/* Native input range rotated vertically */}
                  <input
                    id={`eq-band-${idx}`}
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    disabled={!isEnabled}
                    onChange={(e) => handleBandChange(idx, Number(e.target.value))}
                    className="w-24 sm:w-28 -rotate-90 origin-center bg-zinc-800/90 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-amber-300 disabled:opacity-40"
                  />
                </div>

                {/* Frequency Label & Description */}
                <div className="text-center">
                  <div className="text-xs font-bold text-zinc-200 tracking-tight">
                    {band.label}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate max-w-[50px] sm:max-w-none">
                    {band.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
