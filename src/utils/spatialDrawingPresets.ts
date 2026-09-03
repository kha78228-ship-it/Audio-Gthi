export interface PresetStrokePoint {
  x: number;
  y: number;
  z?: number;
  color?: string;
}

export interface PresetStroke {
  id?: string;
  points: PresetStrokePoint[];
  color: string;
  brushType?: string;
}

/**
 * Generate 3D spatial points for calligraphy and geometrical shapes
 * All strokes are strictly isolated (segmented) so characters & lines NEVER merge or stick together in 3D space.
 */

// 1. 💖 3D Parametric Heart (with genuine 3D spatial depth curvature)
export function generate3DHeartPreset(color: string = '#f43f5e'): PresetStroke[] {
  const strokes: PresetStroke[] = [];
  
  // Left half of the heart
  const leftHalf: PresetStrokePoint[] = [];
  const total = 40;
  for (let i = 0; i <= total; i++) {
    const t = (i / total) * Math.PI; // 0 to PI
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = Math.sin(t) * 6;
    leftHalf.push({
      x: 0.5 + (x / 38) * 0.42,
      y: 0.48 - (y / 38) * 0.42,
      z: 0.5 + (z / 20) * 0.35,
      color
    });
  }
  strokes.push({ id: 'heart-left', points: leftHalf, color, brushType: 'neon_laser' });

  // Right half of the heart (isolated stroke to ensure crisp vertex tips)
  const rightHalf: PresetStrokePoint[] = [];
  for (let i = 0; i <= total; i++) {
    const t = Math.PI + (i / total) * Math.PI; // PI to 2PI
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = Math.sin(t) * 6;
    rightHalf.push({
      x: 0.5 + (x / 38) * 0.42,
      y: 0.48 - (y / 38) * 0.42,
      z: 0.5 + (z / 20) * 0.35,
      color
    });
  }
  strokes.push({ id: 'heart-right', points: rightHalf, color, brushType: 'neon_laser' });

  return strokes;
}

// 2. ⭐ 3D Star Constellation (Distinct 5 rays with depth perspective)
export function generate3DStarPreset(color: string = '#fbbf24'): PresetStroke[] {
  const strokes: PresetStroke[] = [];
  
  // 5 distinct rays radiating from center to give authentic 3D starburst
  for (let r = 0; r < 5; r++) {
    const angle = (r / 5) * Math.PI * 2 - Math.PI / 2;
    const ray: PresetStrokePoint[] = [];
    const len = 12;
    for (let i = 0; i <= len; i++) {
      const dist = (i / len) * 0.35;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const z = Math.sin((i / len) * Math.PI) * 0.22;
      ray.push({
        x: 0.5 + x,
        y: 0.5 - y,
        z: 0.5 + z,
        color
      });
    }
    strokes.push({ id: `star-ray-${r}`, points: ray, color, brushType: 'stardust_comet' });
  }

  // Outer perimeter loop
  const ring: PresetStrokePoint[] = [];
  for (let i = 0; i <= 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? 0.32 : 0.14;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    const z = (i % 2 === 0 ? 0.15 : -0.15);
    ring.push({
      x: 0.5 + x,
      y: 0.5 - y,
      z: 0.5 + z,
      color
    });
  }
  strokes.push({ id: 'star-ring', points: ring, color, brushType: 'neon_laser' });

  return strokes;
}

// 3. ⭕ Zen Enso Calligraphy (Thư Pháp Vòng Tròn Đạo)
export function generate3DZenEnsoPreset(color: string = '#34d399'): PresetStroke[] {
  const points: PresetStrokePoint[] = [];
  const total = 50;
  for (let i = 0; i <= total; i++) {
    const t = (i / total) * Math.PI * 1.88 - Math.PI / 2;
    const r = 0.33 + Math.sin(t * 4) * 0.02;
    const x = Math.cos(t) * r;
    const y = Math.sin(t) * r;
    const z = Math.cos((i / total) * Math.PI) * 0.25;
    points.push({
      x: 0.5 + x,
      y: 0.5 - y,
      z: 0.5 + z,
      color
    });
  }
  return [{ id: 'zen-enso', points, color, brushType: 'anime_ribbon' }];
}

// 4. ✍️ Chữ 3D "HAEVY" & "SPACE" (Từng nét & từng ký tự tách rời 100%, không dính nét)
export function generate3DHaevyLogoPreset(color: string = '#38bdf8'): PresetStroke[] {
  const strokes: PresetStroke[] = [];
  const zBase = 0.5;

  // Helper to build a clean segmented straight line
  const addSegment = (id: string, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, c: string, brush = 'neon_laser') => {
    const pts: PresetStrokePoint[] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      pts.push({
        x: x1 + (x2 - x1) * frac,
        y: y1 + (y2 - y1) * frac,
        z: z1 + (z2 - z1) * frac,
        color: c
      });
    }
    strokes.push({ id, points: pts, color: c, brushType: brush });
  };

  // LETTER 'H' (x: 0.18 -> 0.28)
  addSegment('H-left', 0.18, 0.32, zBase + 0.08, 0.18, 0.65, zBase - 0.08, '#38bdf8');
  addSegment('H-right', 0.27, 0.32, zBase + 0.08, 0.27, 0.65, zBase - 0.08, '#38bdf8');
  addSegment('H-cross', 0.18, 0.48, zBase, 0.27, 0.48, zBase, '#38bdf8');

  // LETTER 'A' (x: 0.31 -> 0.41)
  addSegment('A-left', 0.36, 0.32, zBase + 0.12, 0.31, 0.65, zBase - 0.05, '#818cf8');
  addSegment('A-right', 0.36, 0.32, zBase + 0.12, 0.41, 0.65, zBase - 0.05, '#818cf8');
  addSegment('A-cross', 0.33, 0.52, zBase + 0.03, 0.39, 0.52, zBase + 0.03, '#818cf8');

  // LETTER 'E' (x: 0.45 -> 0.54)
  addSegment('E-vert', 0.46, 0.32, zBase + 0.06, 0.46, 0.65, zBase - 0.06, '#c084fc');
  addSegment('E-top', 0.46, 0.32, zBase + 0.06, 0.54, 0.32, zBase + 0.09, '#c084fc');
  addSegment('E-mid', 0.46, 0.48, zBase, 0.52, 0.48, zBase + 0.02, '#c084fc');
  addSegment('E-bot', 0.46, 0.65, zBase - 0.06, 0.54, 0.65, zBase - 0.03, '#c084fc');

  // LETTER 'V' (x: 0.58 -> 0.68)
  addSegment('V-left', 0.58, 0.32, zBase + 0.1, 0.63, 0.65, zBase - 0.1, '#f472b6');
  addSegment('V-right', 0.68, 0.32, zBase + 0.1, 0.63, 0.65, zBase - 0.1, '#f472b6');

  // LETTER 'Y' (x: 0.72 -> 0.82)
  addSegment('Y-left', 0.72, 0.32, zBase + 0.08, 0.77, 0.48, zBase, '#fb7185');
  addSegment('Y-right', 0.82, 0.32, zBase + 0.08, 0.77, 0.48, zBase, '#fb7185');
  addSegment('Y-stem', 0.77, 0.48, zBase, 0.77, 0.65, zBase - 0.1, '#fb7185');

  return strokes;
}

// 5. 🍃 Thư Pháp "Tâm An" 3D (Từng nét bút riêng biệt, vuốt nhọn nghệ thuật)
export function generate3DTamAnPreset(color: string = '#fbbf24'): PresetStroke[] {
  const strokes: PresetStroke[] = [];
  
  // --- CHỮ TÂM ---
  // Nét 1: Chấm điểm trung tâm (Nét điểm sương)
  const dot1: PresetStrokePoint[] = [];
  for (let i = 0; i <= 10; i++) {
    const f = i / 10;
    dot1.push({ x: 0.35 + f * 0.03, y: 0.32 + f * 0.04, z: 0.6 - f * 0.08, color: '#fbbf24' });
  }
  strokes.push({ id: 'taman-dot1', points: dot1, color: '#fbbf24', brushType: 'gold_sacred' });

  // Nét 2: Vòng cung đại bi (Uốn lượn 3D như vành trăng khuyết)
  const crescent: PresetStrokePoint[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = (i / 36) * Math.PI * 1.25 - 0.25;
    const x = 0.22 + (i / 36) * 0.26;
    const y = 0.62 - Math.sin(t) * 0.19;
    const z = 0.45 + Math.sin(t * 2) * 0.18;
    crescent.push({ x, y, z, color: '#fbbf24' });
  }
  strokes.push({ id: 'taman-crescent', points: crescent, color: '#fbbf24', brushType: 'gold_sacred' });

  // Nét 3: Chấm tả & Chấm hữu (2 nét rải bên trên)
  const dot2: PresetStrokePoint[] = [];
  for (let i = 0; i <= 8; i++) {
    dot2.push({ x: 0.26 + (i / 8) * 0.03, y: 0.42 + (i / 8) * 0.05, z: 0.52 + (i / 8) * 0.06, color: '#fbbf24' });
  }
  strokes.push({ id: 'taman-dot2', points: dot2, color: '#fbbf24', brushType: 'gold_sacred' });

  const dot3: PresetStrokePoint[] = [];
  for (let i = 0; i <= 10; i++) {
    dot3.push({ x: 0.46 + (i / 10) * 0.04, y: 0.43 - (i / 10) * 0.08, z: 0.58 - (i / 10) * 0.12, color: '#fbbf24' });
  }
  strokes.push({ id: 'taman-dot3', points: dot3, color: '#fbbf24', brushType: 'gold_sacred' });

  // --- CHỮ AN ---
  // Mái che (Bộ Miên)
  const mienTop: PresetStrokePoint[] = [];
  for (let i = 0; i <= 12; i++) {
    mienTop.push({ x: 0.68 + (i / 12) * 0.02, y: 0.28 + (i / 12) * 0.05, z: 0.6, color: '#34d399' });
  }
  strokes.push({ id: 'an-top', points: mienTop, color: '#34d399', brushType: 'emerald' });

  const mienRoof: PresetStrokePoint[] = [];
  for (let i = 0; i <= 24; i++) {
    const f = i / 24;
    mienRoof.push({ x: 0.58 + f * 0.24, y: 0.36 + Math.sin(f * Math.PI) * 0.03, z: 0.52 + Math.cos(f * Math.PI) * 0.12, color: '#34d399' });
  }
  strokes.push({ id: 'an-roof', points: mienRoof, color: '#34d399', brushType: 'emerald' });

  // Thân chữ An (Bộ Nữ mềm mại)
  const nuCurve: PresetStrokePoint[] = [];
  for (let i = 0; i <= 30; i++) {
    const f = i / 30;
    const angle = f * Math.PI * 1.2;
    nuCurve.push({
      x: 0.68 + Math.sin(angle) * 0.11,
      y: 0.42 + f * 0.24,
      z: 0.5 + Math.cos(angle * 1.5) * 0.15,
      color: '#34d399'
    });
  }
  strokes.push({ id: 'an-body', points: nuCurve, color: '#34d399', brushType: 'emerald' });

  // Nét ngang vững chãi
  const nuCross: PresetStrokePoint[] = [];
  for (let i = 0; i <= 20; i++) {
    nuCross.push({ x: 0.56 + (i / 20) * 0.28, y: 0.58, z: 0.55, color: '#34d399' });
  }
  strokes.push({ id: 'an-cross', points: nuCross, color: '#34d399', brushType: 'emerald' });

  return strokes;
}

// 6. 🧬 Chuỗi Xoắn DNA / Helix 3D (True 3D Spatial Geometry)
export function generate3DHelixPreset(color: string = '#06b6d4'): PresetStroke[] {
  const strokes: PresetStroke[] = [];
  
  // Strand 1
  const strand1: PresetStrokePoint[] = [];
  const total = 60;
  for (let i = 0; i <= total; i++) {
    const t = (i / total) * Math.PI * 4;
    const y = 0.2 + (i / total) * 0.6;
    const x = 0.5 + Math.cos(t) * 0.18;
    const z = 0.5 + Math.sin(t) * 0.18;
    strand1.push({ x, y, z, color: '#06b6d4' });
  }
  strokes.push({ id: 'dna-strand1', points: strand1, color: '#06b6d4', brushType: 'neon_laser' });

  // Strand 2 (Opposite phase)
  const strand2: PresetStrokePoint[] = [];
  for (let i = 0; i <= total; i++) {
    const t = (i / total) * Math.PI * 4 + Math.PI;
    const y = 0.2 + (i / total) * 0.6;
    const x = 0.5 + Math.cos(t) * 0.18;
    const z = 0.5 + Math.sin(t) * 0.18;
    strand2.push({ x, y, z, color: '#a855f7' });
  }
  strokes.push({ id: 'dna-strand2', points: strand2, color: '#a855f7', brushType: 'neon_laser' });

  // Base Pair Rungs (Connecting bridges)
  for (let r = 0; r < 8; r++) {
    const frac = (r + 0.5) / 8;
    const t = frac * Math.PI * 4;
    const y = 0.2 + frac * 0.6;
    const x1 = 0.5 + Math.cos(t) * 0.18;
    const z1 = 0.5 + Math.sin(t) * 0.18;
    const x2 = 0.5 + Math.cos(t + Math.PI) * 0.18;
    const z2 = 0.5 + Math.sin(t + Math.PI) * 0.18;

    const rungPts: PresetStrokePoint[] = [
      { x: x1, y, z: z1, color: '#fbbf24' },
      { x: (x1 + x2) / 2, y, z: (z1 + z2) / 2, color: '#ffffff' },
      { x: x2, y, z: z2, color: '#fbbf24' }
    ];
    strokes.push({ id: `dna-rung-${r}`, points: rungPts, color: '#fbbf24', brushType: 'stardust_comet' });
  }

  return strokes;
}

// 7. 🧊 Khối Lập Phương Không Gian 3D (3D Cyber Wireframe Cube)
export function generate3DCyberCubePreset(color: string = '#38bdf8'): PresetStroke[] {
  const strokes: PresetStroke[] = [];
  const s = 0.16; // Half side length
  const cx = 0.5, cy = 0.5, cz = 0.5;

  const vertices = [
    { x: cx - s, y: cy - s, z: cz - s }, // 0
    { x: cx + s, y: cy - s, z: cz - s }, // 1
    { x: cx + s, y: cy + s, z: cz - s }, // 2
    { x: cx - s, y: cy + s, z: cz - s }, // 3
    { x: cx - s, y: cy - s, z: cz + s }, // 4
    { x: cx + s, y: cy - s, z: cz + s }, // 5
    { x: cx + s, y: cy + s, z: cz + s }, // 6
    { x: cx - s, y: cy + s, z: cz + s }, // 7
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // Back face
    [4, 5], [5, 6], [6, 7], [7, 4], // Front face
    [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
  ];

  edges.forEach(([i1, i2], idx) => {
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const pts: PresetStrokePoint[] = [];
    for (let k = 0; k <= 8; k++) {
      const f = k / 8;
      pts.push({
        x: v1.x + (v2.x - v1.x) * f,
        y: v1.y + (v2.y - v1.y) * f,
        z: v1.z + (v2.z - v1.z) * f,
        color
      });
    }
    strokes.push({ id: `cube-edge-${idx}`, points: pts, color, brushType: 'neon_laser' });
  });

  return strokes;
}

// 8. ♾️ Vòng Lặp Vô Cực 3D (3D Infinity Möbius Knot)
export function generate3DInfinityPreset(color: string = '#ec4899'): PresetStroke[] {
  const points: PresetStrokePoint[] = [];
  const total = 70;
  for (let i = 0; i <= total; i++) {
    const t = (i / total) * Math.PI * 2;
    const scale = 0.28;
    const x = 0.5 + (scale * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
    const y = 0.5 + (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
    const z = 0.5 + Math.sin(t * 2) * 0.22;
    points.push({ x, y, z, color });
  }
  return [{ id: 'infinity-3d', points, color, brushType: 'quantum_crystal' }];
}
