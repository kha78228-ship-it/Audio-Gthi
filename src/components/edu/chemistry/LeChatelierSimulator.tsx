import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Snowflake, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Thermometer, 
  Gauge, 
  Info,
  Layers,
  FlaskConical
} from 'lucide-react';

interface LeChatelierSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function LeChatelierSimulator({ onOpenVideoLesson }: LeChatelierSimulatorProps) {
  // Experiment system: NO2/N2O4 gas or Fe3+/SCN- complex
  const [systemType, setSystemType] = useState<'no2_gas' | 'iron_complex'>('no2_gas');

  // NO2 / N2O4 Gas Equilibrium Params
  const [thermalBath, setThermalBath] = useState<'ice' | 'room' | 'hot'>('room');
  const [pressureState, setPressureState] = useState<'low' | 'normal' | 'high'>('normal');

  // Fe3+ / SCN- Equilibrium Params
  const [addedReagent, setAddedReagent] = useState<'none' | 'fe3' | 'scn' | 'naoh'>('none');

  // Equilibrium status calculations
  // 2 NO2 (brown) <=> N2O4 (colorless), Delta H = -58 kJ/mol (Exothermic forward)
  // Low temp -> shifts forward (more N2O4, lighter brown)
  // High temp -> shifts reverse (more NO2, darker reddish-brown)
  const getGasColor = () => {
    let brownIntensity = 0.5; // normal room temp

    if (thermalBath === 'ice') {
      brownIntensity -= 0.35; // turns almost colorless
    } else if (thermalBath === 'hot') {
      brownIntensity += 0.45; // turns deep dark red-brown
    }

    if (pressureState === 'high') {
      // High pressure shifts to N2O4 side (fewer moles)
      brownIntensity -= 0.15;
    } else if (pressureState === 'low') {
      brownIntensity += 0.2;
    }

    brownIntensity = Math.max(0.08, Math.min(0.95, brownIntensity));

    // Return RGBA string for reddish brown NO2
    // Reddish brown: rgb(185, 28, 28) or rgb(154, 52, 18)
    return `rgba(180, 45, 20, ${brownIntensity})`;
  };

  const getIronColor = () => {
    // Fe3+ (pale yellow) + 3SCN- <=> [Fe(SCN)3] (blood red)
    if (addedReagent === 'fe3' || addedReagent === 'scn') {
      return 'rgba(220, 38, 38, 0.95)'; // intense blood red
    } else if (addedReagent === 'naoh') {
      return 'rgba(234, 179, 8, 0.35)'; // Fe(OH)3 precipitates out, red color fades
    }
    return 'rgba(239, 68, 68, 0.65)'; // standard blood red
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* CTGDPT 2018 Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-orange-950/20 to-zinc-900/60 border border-rose-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono font-bold text-sm">
            HÓA HỌC 11
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Cân Bằng Hóa Học & Chuyển Dịch Nguyên Lý Le Chatelier
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                CTGDPT 2018 • KNTT / CD / CTST
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Nguyên lý: Một hệ cân bằng bị biến đổi một yếu tố (T, p, C) thì cân bằng sẽ tự chuyển dịch theo chiều làm giảm tác động đó.
            </p>
          </div>
        </div>

        {/* System Type Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setSystemType('no2_gas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              systemType === 'no2_gas'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Khí 2NO₂ ⇌ N₂O₄
          </button>
          <button
            onClick={() => setSystemType('iron_complex')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              systemType === 'iron_complex'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Phức Đỏ Máu Fe³⁺ + SCN⁻
          </button>
        </div>
      </div>

      {/* Main Simulation Apparatus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Tube Flask Area */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-4">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Activity size={14} className="text-rose-400" />
              <span>Quan Sát Ống Nghiệm Kín Sau Chuyển Dịch Cân Bằng</span>
            </span>
            <span className="font-mono text-[11px] text-rose-400">
              {systemType === 'no2_gas' 
                ? (thermalBath === 'ice' ? '0°C (Nước Đá) • Tỏa Nhiệt Thuận' : thermalBath === 'hot' ? '80°C (Nước Nóng) • Thu Nhiệt Nghịch' : '25°C (Đối Chứng)')
                : addedReagent === 'none' ? 'Dung dịch cân bằng ban đầu' : `Vừa bổ sung: ${addedReagent.toUpperCase()}`}
            </span>
          </div>

          {/* Test Tube Illustration */}
          <div className="w-full h-72 flex items-center justify-center relative py-4">
            {systemType === 'no2_gas' ? (
              <div className="flex items-end gap-10">
                {/* Reference Tube (Room Temp 25°C) */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] text-zinc-500 font-mono">Ống 1 (Đối chứng 25°C)</span>
                  <div className="w-16 h-52 rounded-b-full border-2 border-zinc-500/80 relative overflow-hidden bg-zinc-900/60 shadow-xl flex items-center justify-center">
                    {/* Gas inside tube */}
                    <div 
                      className="absolute inset-0 transition-colors duration-700" 
                      style={{ backgroundColor: 'rgba(180, 45, 20, 0.45)' }}
                    />
                    <span className="relative z-10 text-[10px] font-bold text-white/90 drop-shadow text-center px-1">
                      Nâu Nhạt Vừa Phải
                    </span>
                  </div>
                </div>

                {/* Active Test Tube under Bath */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] text-rose-400 font-bold font-mono">
                    Ống 2 ({thermalBath === 'ice' ? '0°C Nước Đá' : thermalBath === 'hot' ? '80°C Nước Nóng' : '25°C'})
                  </span>
                  <div className="w-18 h-52 rounded-b-full border-2 border-rose-500/80 relative overflow-hidden bg-zinc-900/60 shadow-2xl flex items-center justify-center">
                    {/* Dynamic Gas Tint */}
                    <div 
                      className="absolute inset-0 transition-colors duration-1000" 
                      style={{ backgroundColor: getGasColor() }}
                    />
                    <div className="relative z-10 text-center px-2">
                      <span className="text-xs font-black text-white drop-shadow-md">
                        {thermalBath === 'ice' ? 'GẦN NHƯ KHÔNG MÀU' : thermalBath === 'hot' ? 'ĐỎ NÂU ĐẬM MÃNH LIỆT' : 'NÂU VỪA'}
                      </span>
                    </div>
                  </div>

                  {/* Water bath container around bottom */}
                  <div className="w-28 h-20 -mt-16 rounded-b-2xl border border-dashed border-zinc-600 bg-cyan-950/30 flex items-end justify-center pb-2 text-[10px] text-cyan-300">
                    {thermalBath === 'ice' ? '🧊 Cốc Nước Đá' : thermalBath === 'hot' ? '♨️ Cốc Nước Nóng' : 'Không ngâm'}
                  </div>
                </div>
              </div>
            ) : (
              /* Fe3+ / SCN- Iron Complex Tube */
              <div className="flex items-center justify-center">
                <div className="w-20 h-56 rounded-b-full border-2 border-amber-500/80 relative overflow-hidden bg-zinc-900/60 shadow-2xl flex items-end justify-center pb-8">
                  <div 
                    className="absolute inset-x-0 bottom-0 h-44 rounded-b-full transition-colors duration-1000"
                    style={{ backgroundColor: getIronColor() }}
                  />
                  <div className="relative z-10 text-center px-2">
                    <span className="text-xs font-black text-white drop-shadow-md">
                      {addedReagent === 'naoh' ? 'MÀU ĐỎ NHẠT DẦN (Tạo Fe(OH)₃↓)' : 'ĐỎ MÁU ĐẬM'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reaction Equation Pill */}
          <div className="w-full mt-2 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center text-xs">
            {systemType === 'no2_gas' ? (
              <div className="space-y-1">
                <span className="font-mono text-sm text-zinc-100 font-bold">
                  2NO₂ (nâu đỏ) ⇌ N₂O₄ (không màu), ΔrH°₂₉₈ = -58 kJ/mol
                </span>
                <p className="text-[11px] text-zinc-400">
                  Phản ứng thuận là tỏa nhiệt (ΔH &lt; 0). Hạ nhiệt độ làm cân bằng chuyển dịch theo chiều thuận (chiều tỏa nhiệt chống lại việc làm lạnh).
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-mono text-sm text-zinc-100 font-bold">
                  Fe³⁺ (vàng) + 3SCN⁻ (không màu) ⇌ [Fe(SCN)₃] (đỏ máu)
                </span>
                <p className="text-[11px] text-zinc-400">
                  Tăng nồng độ chất phản ứng (Fe³⁺ hoặc SCN⁻) làm cân bằng chuyển dịch sang phải, tăng màu đỏ máu.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-rose-400" />
                <span>Tác Nhân Tác Động Vào Hệ Cân Bằng</span>
              </span>
            </div>

            {systemType === 'no2_gas' ? (
              <>
                {/* Nhiệt độ ngâm */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 flex items-center gap-1">
                    <Thermometer size={14} className="text-rose-400" />
                    <span>Nhiệt độ môi trường ngâm ống 2:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setThermalBath('ice')}
                      className={`p-2 rounded-xl text-center border text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        thermalBath === 'ice'
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Snowflake size={14} />
                      <span>0°C Nước Đá</span>
                    </button>
                    <button
                      onClick={() => setThermalBath('room')}
                      className={`p-2 rounded-xl text-center border text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        thermalBath === 'room'
                          ? 'bg-zinc-700/40 border-zinc-600 text-zinc-200 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Thermometer size={14} />
                      <span>25°C Phòng</span>
                    </button>
                    <button
                      onClick={() => setThermalBath('hot')}
                      className={`p-2 rounded-xl text-center border text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        thermalBath === 'hot'
                          ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Flame size={14} />
                      <span>80°C Nước Nóng</span>
                    </button>
                  </div>
                </div>

                {/* Áp suất Pit-tông */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  <label className="text-xs text-zinc-400 flex items-center gap-1">
                    <Gauge size={14} className="text-amber-400" />
                    <span>Áp suất pit-tông xilanh:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'low' as const, label: 'Kéo Ra (Giảm p)' },
                      { id: 'normal' as const, label: 'Bình Thường' },
                      { id: 'high' as const, label: 'Nén Chặt (Tăng p)' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPressureState(p.id)}
                        className={`py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          pressureState === p.id
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Thêm hóa chất phức sắt */
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Nhỏ thêm dung dịch hóa chất:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAddedReagent('fe3')}
                    className={`p-2 rounded-xl text-xs border text-left cursor-pointer ${
                      addedReagent === 'fe3' ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>+ Thêm FeCl₃ 1M</div>
                    <span className="text-[10px] text-zinc-500">Tăng nồng độ Fe³⁺</span>
                  </button>
                  <button
                    onClick={() => setAddedReagent('scn')}
                    className={`p-2 rounded-xl text-xs border text-left cursor-pointer ${
                      addedReagent === 'scn' ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>+ Thêm KSCN 1M</div>
                    <span className="text-[10px] text-zinc-500">Tăng nồng độ SCN⁻</span>
                  </button>
                  <button
                    onClick={() => setAddedReagent('naoh')}
                    className={`p-2 rounded-xl text-xs border text-left cursor-pointer ${
                      addedReagent === 'naoh' ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>+ Thêm NaOH 1M</div>
                    <span className="text-[10px] text-zinc-500">Tạo kết tủa Fe(OH)₃</span>
                  </button>
                  <button
                    onClick={() => setAddedReagent('none')}
                    className="p-2 rounded-xl text-xs border text-left cursor-pointer bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  >
                    <div>Đặt lại ban đầu</div>
                    <span className="text-[10px] text-zinc-500">Dung dịch gốc</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theoretical Summary Box */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 text-xs">
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Info size={14} className="text-rose-400" />
              <span>Dự Đoán Chiều Chuyển Dịch Theo Le Chatelier:</span>
            </span>
            <div className="space-y-1.5 text-zinc-300 leading-relaxed">
              {thermalBath === 'ice' && (
                <p className="text-cyan-300 font-medium">
                  • <strong>Hạ nhiệt độ (0°C):</strong> Cân bằng dịch chuyển theo chiều THUẬN (tạo $N_2O_4$, tỏa nhiệt) để sinh thêm nhiệt chống lại việc bị làm lạnh $\Rightarrow$ Màu nâu đỏ nhạt dần.
                </p>
              )}
              {thermalBath === 'hot' && (
                <p className="text-rose-400 font-medium">
                  • <strong>Tăng nhiệt độ (80°C):</strong> Cân bằng dịch chuyển theo chiều NGHỊCH (tạo $NO_2$, thu nhiệt) để hấp thu bớt nhiệt cung cấp vào $\Rightarrow$ Màu nâu đỏ trở nên sẫm tối.
                </p>
              )}
              {thermalBath === 'room' && (
                <p className="text-zinc-400">
                  • Ở nhiệt độ phòng 25°C, hai phản ứng thuận và nghịch diễn ra với tốc độ bằng nhau ($v_t = v_n$), màu sắc giữ nguyên không đổi theo thời gian.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* First Principles Insight Callout */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Bản Chất Động Của Cân Bằng Hóa Học (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Cân bằng hóa học là cân bằng ĐỘNG (Dynamic Equilibrium):</strong> Các phân tử không hề ngừng phản ứng. Phản ứng thuận và nghịch vẫn liên tục diễn ra với tốc độ chính xác bằng nhau. Hằng số cân bằng $K_C$ chỉ phụ thuộc duy nhất vào nhiệt độ!
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Chất xúc tác có làm chuyển dịch cân bằng không?</strong> KHÔNG! Chất xúc tác làm giảm năng lượng hoạt hóa của cả phản ứng thuận và phản ứng nghịch với mức độ hoàn toàn như nhau, do đó chỉ giúp hệ nhanh chóng đạt đến trạng thái cân bằng chứ không làm thay đổi vị trí cân bằng.
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Cân Bằng Hóa Học & Chuyển Dịch Le Chatelier')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Cân Bằng Le Chatelier</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
