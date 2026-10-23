import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Filter, 
  Layers, 
  Info, 
  PieChart, 
  Activity, 
  Utensils, 
  GraduationCap, 
  Film, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw, 
  SlidersHorizontal, 
  Zap, 
  Clock, 
  ArrowUpRight, 
  Eye, 
  Plus,
  HelpCircle,
  Award,
  Wallet,
  X,
  ShoppingBag,
  Car,
  Receipt,
  HeartPulse
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory, FinanceBudget } from '../../types';

export interface FinanceHeatmapProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  budget?: FinanceBudget;
  onAddTransaction?: (tx: Partial<FinanceTransaction>) => void;
  onOpenAiAdvisor?: () => void;
  className?: string;
}

export type HeatmapCategoryFilter = 'featured_3' | 'food' | 'edu' | 'entertainment' | 'all';
export type HeatmapColorTheme = 'fire' | 'emerald' | 'cyber';
export type HeatmapViewLayout = 'matrix' | 'weekly_grid';

interface HeatmapCellData {
  dateStr: string;
  displayDate: string;
  dayOfWeek: string;
  categoryId: string;
  categoryName: string;
  categoryGroup: 'food' | 'edu' | 'entertainment' | 'other';
  categoryColor: string;
  amount: number;
  count: number;
  transactions: FinanceTransaction[];
  intensityRatio: number; // 0 to 1 based on max in view
}

interface CategoryRowMeta {
  id: string;
  name: string;
  group: 'food' | 'edu' | 'entertainment' | 'other';
  icon: any;
  color: string;
  tag: string;
  totalAmount: number;
  avgDaily: number;
  activeDaysCount: number;
  categoryIds: string[];
}

export function FinanceHeatmap({
  transactions,
  categories,
  budget,
  onAddTransaction,
  onOpenAiAdvisor,
  className = ''
}: FinanceHeatmapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Controls & Filters
  const [categoryFilter, setCategoryFilter] = useState<HeatmapCategoryFilter>('featured_3');
  const [colorTheme, setColorTheme] = useState<HeatmapColorTheme>('fire');
  const [viewLayout, setViewLayout] = useState<HeatmapViewLayout>('matrix');
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCellData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [seedDataTrigger, setSeedDataTrigger] = useState(0);

  // Generate 30 days array up to today
  const last30Days = useMemo(() => {
    const days: { dateStr: string; displayDate: string; dayOfWeek: string; fullDate: Date; dayNum: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayOfWeek = dayNames[d.getDay()];
      const displayDate = `${date}/${month}`;
      days.push({
        dateStr,
        displayDate,
        dayOfWeek,
        fullDate: d,
        dayNum: d.getDate()
      });
    }
    return days;
  }, []);

  // Category definitions with explicit focus on Food, Edu, and Entertainment
  const categoryRows: CategoryRowMeta[] = useMemo(() => {
    const rows: CategoryRowMeta[] = [
      {
        id: 'group_food',
        name: 'Ăn Uống & Bách Hóa (Food)',
        group: 'food',
        icon: Utensils,
        color: '#f59e0b',
        tag: 'Ăn uống, Cà phê, Siêu thị',
        totalAmount: 0,
        avgDaily: 0,
        activeDaysCount: 0,
        categoryIds: ['cat_food', 'cat_groceries']
      },
      {
        id: 'group_edu',
        name: 'Giáo Dục & Bản Thân (Edu)',
        group: 'edu',
        icon: GraduationCap,
        color: '#8b5cf6',
        tag: 'Khóa học, Sách, STEM, Casio',
        totalAmount: 0,
        avgDaily: 0,
        activeDaysCount: 0,
        categoryIds: ['cat_education']
      },
      {
        id: 'group_entertainment',
        name: 'Giải Trí & Hẹn Hò (Entertainment)',
        group: 'entertainment',
        icon: Film,
        color: '#06b6d4',
        tag: 'Phim ảnh, Du lịch, Cặp đôi',
        totalAmount: 0,
        avgDaily: 0,
        activeDaysCount: 0,
        categoryIds: ['cat_entertainment', 'cat_couple_date']
      }
    ];

    // If 'all' categories is requested, add additional categories
    if (categoryFilter === 'all') {
      rows.push(
        {
          id: 'group_shopping',
          name: 'Mua Sắm & Thời Trang',
          group: 'other',
          icon: ShoppingBag,
          color: '#ec4899',
          tag: 'Quần áo, Đồ dùng cá nhân',
          totalAmount: 0,
          avgDaily: 0,
          activeDaysCount: 0,
          categoryIds: ['cat_shopping']
        },
        {
          id: 'group_transport',
          name: 'Đi Lại & Xăng Xe',
          group: 'other',
          icon: Car,
          color: '#3b82f6',
          tag: 'Xăng xe, Gửi xe, Grab/Be',
          totalAmount: 0,
          avgDaily: 0,
          activeDaysCount: 0,
          categoryIds: ['cat_transport']
        },
        {
          id: 'group_bills',
          name: 'Hóa Đơn & Tiện Ích',
          group: 'other',
          icon: Receipt,
          color: '#ef4444',
          tag: 'Điện, Nước, Internet, Thuê nhà',
          totalAmount: 0,
          avgDaily: 0,
          activeDaysCount: 0,
          categoryIds: ['cat_bills', 'cat_rent']
        },
        {
          id: 'group_health',
          name: 'Y Tế & Sức Khỏe',
          group: 'other',
          icon: HeartPulse,
          color: '#10b981',
          tag: 'Thuốc men, Thể thao, Khám bệnh',
          totalAmount: 0,
          avgDaily: 0,
          activeDaysCount: 0,
          categoryIds: ['cat_health']
        }
      );
    }

    // Filter rows based on user selection
    if (categoryFilter === 'food') {
      return rows.filter(r => r.group === 'food');
    }
    if (categoryFilter === 'edu') {
      return rows.filter(r => r.group === 'edu');
    }
    if (categoryFilter === 'entertainment') {
      return rows.filter(r => r.group === 'entertainment');
    }
    return rows;
  }, [categoryFilter]);

  // Compute 30-Day Grid Matrix Data
  const { matrixData, maxDailySpend, total30DaySpend, peakDay, categoryStats } = useMemo(() => {
    // Expense transactions in the 30-day window
    const dateSet = new Set(last30Days.map(d => d.dateStr));
    const recentExpenses = transactions.filter(t => t.type === 'expense' && dateSet.has(t.date));

    // Match transaction to row
    const getRowForTransaction = (t: FinanceTransaction): string | null => {
      for (const row of categoryRows) {
        if (row.categoryIds.includes(t.categoryId)) return row.id;
        const lowerCat = (t.categoryName || '').toLowerCase();
        if (row.group === 'food' && (lowerCat.includes('ăn') || lowerCat.includes('uống') || lowerCat.includes('bách hóa') || lowerCat.includes('siêu thị'))) return row.id;
        if (row.group === 'edu' && (lowerCat.includes('học') || lowerCat.includes('giáo dục') || lowerCat.includes('sách') || lowerCat.includes('stem'))) return row.id;
        if (row.group === 'entertainment' && (lowerCat.includes('giải trí') || lowerCat.includes('phim') || lowerCat.includes('du lịch') || lowerCat.includes('hẹn hò'))) return row.id;
      }
      return null;
    };

    let overallMax = 0;
    let grandTotal = 0;
    const dailyTotals: Record<string, number> = {};

    const cells: HeatmapCellData[] = [];

    // Initialize daily totals
    last30Days.forEach(d => {
      dailyTotals[d.dateStr] = 0;
    });

    // Populate matrix cells
    categoryRows.forEach(row => {
      let rowTotal = 0;
      let activeDays = 0;

      last30Days.forEach(day => {
        const dayTxs = recentExpenses.filter(t => {
          if (t.date !== day.dateStr) return false;
          const assignedRowId = getRowForTransaction(t);
          return assignedRowId === row.id;
        });

        const dayAmount = dayTxs.reduce((sum, t) => sum + t.amount, 0);
        if (dayAmount > overallMax) overallMax = dayAmount;
        rowTotal += dayAmount;
        grandTotal += dayAmount;
        dailyTotals[day.dateStr] = (dailyTotals[day.dateStr] || 0) + dayAmount;
        if (dayAmount > 0) activeDays++;

        cells.push({
          dateStr: day.dateStr,
          displayDate: day.displayDate,
          dayOfWeek: day.dayOfWeek,
          categoryId: row.id,
          categoryName: row.name,
          categoryGroup: row.group,
          categoryColor: row.color,
          amount: dayAmount,
          count: dayTxs.length,
          transactions: dayTxs,
          intensityRatio: 0 // populated below
        });
      });

      row.totalAmount = rowTotal;
      row.avgDaily = Math.round(rowTotal / 30);
      row.activeDaysCount = activeDays;
    });

    // Calculate intensity ratio
    const effectiveMax = Math.max(1, overallMax);
    cells.forEach(cell => {
      cell.intensityRatio = cell.amount / effectiveMax;
    });

    // Peak spending day
    let peakDateStr = '';
    let peakAmount = 0;
    Object.entries(dailyTotals).forEach(([dateStr, amt]) => {
      if (amt > peakAmount) {
        peakAmount = amt;
        peakDateStr = dateStr;
      }
    });

    const peakDayMeta = last30Days.find(d => d.dateStr === peakDateStr);

    return {
      matrixData: cells,
      maxDailySpend: overallMax,
      total30DaySpend: grandTotal,
      peakDay: peakDayMeta ? { ...peakDayMeta, amount: peakAmount } : null,
      categoryStats: categoryRows
    };
  }, [transactions, last30Days, categoryRows, seedDataTrigger]);

  // Color Interpolators
  const getColorScale = useMemo(() => {
    const domain = [0, Math.max(100000, maxDailySpend * 0.25), Math.max(250000, maxDailySpend * 0.65), Math.max(500000, maxDailySpend)];
    
    if (colorTheme === 'fire') {
      // Warm Fire Theme: Zero (zinc) -> Lemon Yellow -> Bright Amber -> Crimson Red
      return d3.scaleLinear<string>()
        .domain(domain)
        .range(['#18181b', '#fde047', '#f97316', '#ef4444'])
        .clamp(true);
    } else if (colorTheme === 'emerald') {
      // Emerald & Gold Theme: Zero (zinc) -> Mint -> Teal -> Gold
      return d3.scaleLinear<string>()
        .domain(domain)
        .range(['#18181b', '#6ee7b7', '#0d9488', '#eab308'])
        .clamp(true);
    } else {
      // Cyber Neon Theme: Zero (zinc) -> Lavender -> Purple -> Hot Pink
      return d3.scaleLinear<string>()
        .domain(domain)
        .range(['#18181b', '#c084fc', '#9333ea', '#f43f5e'])
        .clamp(true);
    }
  }, [maxDailySpend, colorTheme]);

  // D3 SVG Render Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 40, right: 90, bottom: 45, left: 160 };
    const numCols = last30Days.length;
    const numRows = categoryRows.length;

    // Minimum cell width for comfortable viewing with horizontal scroll if needed
    const cellWidth = Math.max(20, Math.floor((containerWidth - margin.left - margin.right) / numCols));
    const cellHeight = 36;
    const innerWidth = cellWidth * numCols;
    const innerHeight = cellHeight * numRows;
    const totalWidth = innerWidth + margin.left + margin.right;
    const totalHeight = innerHeight + margin.top + margin.bottom;

    svg
      .attr('width', totalWidth)
      .attr('height', totalHeight)
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Defs: Filters and Shadows
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'heat-cell-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', 2).attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // D3 Scales
    const xScale = d3.scaleBand()
      .domain(last30Days.map(d => d.dateStr))
      .range([0, innerWidth])
      .padding(0.12);

    const yScale = d3.scaleBand()
      .domain(categoryRows.map(r => r.id))
      .range([0, innerHeight])
      .padding(0.15);

    // 1. Column Header: Day of week & Day Number
    const colHeaders = g.append('g').attr('class', 'col-headers');
    last30Days.forEach((day) => {
      const x = (xScale(day.dateStr) || 0) + xScale.bandwidth() / 2;
      const isWeekend = day.dayOfWeek === 'T7' || day.dayOfWeek === 'CN';

      // Weekday label
      colHeaders.append('text')
        .attr('x', x)
        .attr('y', -22)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', isWeekend ? '800' : '600')
        .attr('fill', isWeekend ? '#f59e0b' : '#71717a')
        .text(day.dayOfWeek);

      // Date number label
      colHeaders.append('text')
        .attr('x', x)
        .attr('y', -9)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', isWeekend ? '#fbbf24' : '#a1a1aa')
        .text(day.dayNum);
    });

    // 2. Row Header: Category Name & Tag
    const rowHeaders = g.append('g').attr('class', 'row-headers');
    categoryRows.forEach(row => {
      const y = (yScale(row.id) || 0) + yScale.bandwidth() / 2;

      // Group indicator dot
      rowHeaders.append('circle')
        .attr('cx', -15)
        .attr('cy', y - 4)
        .attr('r', 4.5)
        .attr('fill', row.color)
        .attr('stroke', '#27272a')
        .attr('stroke-width', 1.5);

      // Category display name
      rowHeaders.append('text')
        .attr('x', -26)
        .attr('y', y)
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#e4e4e7')
        .text(row.name.length > 24 ? row.name.slice(0, 22) + '...' : row.name);

      // Tag hint below
      rowHeaders.append('text')
        .attr('x', -26)
        .attr('y', y + 12)
        .attr('text-anchor', 'end')
        .attr('font-size', '8.5px')
        .attr('font-weight', '500')
        .attr('fill', '#71717a')
        .text(row.tag.length > 26 ? row.tag.slice(0, 24) + '...' : row.tag);
    });

    // 3. Row Right Summary Column: Total Amount per Category
    const rowSummaries = g.append('g').attr('class', 'row-summaries');
    categoryRows.forEach(row => {
      const y = (yScale(row.id) || 0) + yScale.bandwidth() / 2;
      const x = innerWidth + 14;

      rowSummaries.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'start')
        .attr('font-size', '11px')
        .attr('font-weight', '800')
        .attr('font-family', 'monospace')
        .attr('fill', row.totalAmount > 0 ? row.color : '#52525b')
        .text(new Intl.NumberFormat('vi-VN').format(row.totalAmount) + ' ₫');

      rowSummaries.append('text')
        .attr('x', x)
        .attr('y', y + 11)
        .attr('text-anchor', 'start')
        .attr('font-size', '8.5px')
        .attr('font-weight', '600')
        .attr('fill', '#71717a')
        .text(`${row.activeDaysCount}/30 ngày`);
    });

    // 4. Matrix Heatmap Cells
    const cellsGroup = g.append('g').attr('class', 'heatmap-cells');

    cellsGroup.selectAll('rect')
      .data(matrixData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.dateStr) || 0)
      .attr('y', d => yScale(d.categoryId) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', d => d.amount > 0 ? getColorScale(d.amount) : '#18181b')
      .attr('stroke', d => {
        if (selectedCell?.dateStr === d.dateStr && selectedCell?.categoryId === d.categoryId) {
          return '#38bdf8'; // Sky blue border for selected cell
        }
        return d.amount > 0 ? '#27272a' : '#202023';
      })
      .attr('stroke-width', d => {
        if (selectedCell?.dateStr === d.dateStr && selectedCell?.categoryId === d.categoryId) {
          return 2.5;
        }
        return 1;
      })
      .attr('cursor', 'pointer')
      .style('transition', 'all 0.15s ease')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('filter', 'url(#heat-cell-glow)');

        setHoveredCell(d);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      })
      .on('mouseleave', function(event, d) {
        const isSelected = selectedCell?.dateStr === d.dateStr && selectedCell?.categoryId === d.categoryId;
        d3.select(this)
          .attr('stroke', isSelected ? '#38bdf8' : (d.amount > 0 ? '#27272a' : '#202023'))
          .attr('stroke-width', isSelected ? 2.5 : 1)
          .attr('filter', null);

        setHoveredCell(null);
        setTooltipPos(null);
      })
      .on('click', function(event, d) {
        setSelectedCell(prev => (prev?.dateStr === d.dateStr && prev?.categoryId === d.categoryId ? null : d));
      });

    // 5. Bottom Axis: Column Daily Spending Indicator Strip
    const bottomStrip = g.append('g')
      .attr('class', 'bottom-daily-strip')
      .attr('transform', `translate(0, ${innerHeight + 14})`);

    // Strip label
    bottomStrip.append('text')
      .attr('x', -26)
      .attr('y', 8)
      .attr('text-anchor', 'end')
      .attr('font-size', '9.5px')
      .attr('font-weight', '700')
      .attr('fill', '#a1a1aa')
      .text('Tổng ngày:');

    // Daily total dots/bars
    const maxColumnTotal = d3.max(last30Days, d => {
      return matrixData.filter(m => m.dateStr === d.dateStr).reduce((s, m) => s + m.amount, 0);
    }) || 1;

    last30Days.forEach(day => {
      const dayTotal = matrixData.filter(m => m.dateStr === day.dateStr).reduce((s, m) => s + m.amount, 0);
      const x = (xScale(day.dateStr) || 0) + xScale.bandwidth() / 2;
      const height = Math.min(18, Math.max(3, (dayTotal / maxColumnTotal) * 18));

      if (dayTotal > 0) {
        bottomStrip.append('rect')
          .attr('x', x - 2.5)
          .attr('y', 10 - height)
          .attr('width', 5)
          .attr('height', height)
          .attr('rx', 1.5)
          .attr('fill', dayTotal > maxColumnTotal * 0.5 ? '#f59e0b' : '#52525b')
          .attr('opacity', 0.85);
      } else {
        bottomStrip.append('circle')
          .attr('cx', x)
          .attr('cy', 8)
          .attr('r', 1.5)
          .attr('fill', '#27272a');
      }
    });

  }, [matrixData, last30Days, categoryRows, getColorScale, selectedCell]);

  // Seed sample transactions if user has empty spending history in the last 30 days
  const handleSeedSample30Days = () => {
    if (!onAddTransaction) return;

    // Realistic spending samples over the past 30 days
    const samples = [
      // Food (Ăn uống & Cà phê / Bách hóa)
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 0, amount: 85000, note: 'Cà phê sáng & bánh mì kẹp' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 1, amount: 240000, note: 'Ăn trưa cơm văn phòng & nước ép' },
      { catId: 'cat_groceries', catName: 'Chợ & Siêu thị bách hóa', daysAgo: 2, amount: 560000, note: 'Mua thực phẩm tuần siêu thị' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 3, amount: 120000, note: 'Trà sữa & bánh ngọt' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 5, amount: 350000, note: 'Lẩu cuối tuần cùng bạn bè' },
      { catId: 'cat_groceries', catName: 'Chợ & Siêu thị bách hóa', daysAgo: 8, amount: 480000, note: 'Bách hóa gia đình & sữa chua' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 11, amount: 95000, note: 'Bún bò Huế & trà đào' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 14, amount: 420000, note: 'Bữa tối BBQ mừng hoàn thành dự án' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 18, amount: 150000, note: 'Pizza nướng & nước ngọt' },
      { catId: 'cat_groceries', catName: 'Chợ & Siêu thị bách hóa', daysAgo: 22, amount: 620000, note: 'Rau củ quả sạch & thịt tươi' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 26, amount: 110000, note: 'Phở bò sáng & trà đá' },
      { catId: 'cat_food', catName: 'Ăn uống & Cà phê', daysAgo: 28, amount: 280000, note: 'Cơm gia đình cuối tuần' },

      // Edu (Giáo dục, Khóa học & STEM)
      { catId: 'cat_education', catName: 'Học tập & Khóa học', daysAgo: 2, amount: 450000, note: 'Mua sách First Principles & Toán Casio fx-880' },
      { catId: 'cat_education', catName: 'Học tập & Khóa học', daysAgo: 7, amount: 1200000, note: 'Đăng ký khóa học STEM & Lập trình AI' },
      { catId: 'cat_education', catName: 'Học tập & Khóa học', daysAgo: 15, amount: 350000, note: 'Tài liệu ôn luyện thi THPT Quốc Gia' },
      { catId: 'cat_education', catName: 'Học tập & Khóa học', daysAgo: 24, amount: 800000, note: 'Khóa rèn luyện tư duy phản biện & Tiếng Anh' },

      // Entertainment (Giải trí, Phim ảnh, Hẹn hò)
      { catId: 'cat_entertainment', catName: 'Giải trí & Phim ảnh / Du lịch', daysAgo: 1, amount: 220000, note: 'Vé xem phim rạp IMAX' },
      { catId: 'cat_couple_date', catName: 'Hẹn hò & Quà tặng Cặp đôi', daysAgo: 4, amount: 650000, note: 'Buổi hẹn hò lãng mạn kỷ niệm tháng' },
      { catId: 'cat_entertainment', catName: 'Giải trí & Phim ảnh / Du lịch', daysAgo: 10, amount: 450000, note: 'Vé tham gia triển lãm nghệ thuật số' },
      { catId: 'cat_couple_date', catName: 'Hẹn hò & Quà tặng Cặp đôi', daysAgo: 16, amount: 320000, note: 'Hoa tươi & quà tặng bất ngờ' },
      { catId: 'cat_entertainment', catName: 'Giải trí & Phim ảnh / Du lịch', daysAgo: 21, amount: 180000, note: 'Gói đăng ký nghe nhạc & trò chơi' },
      { catId: 'cat_couple_date', catName: 'Hẹn hò & Quà tặng Cặp đôi', daysAgo: 27, amount: 750000, note: 'Bữa tối nến thơm bên sông' },
    ];

    const today = new Date();
    samples.forEach((s, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - s.daysAgo);
      const dateStr = d.toISOString().split('T')[0];

      onAddTransaction({
        id: `sample_heat_${Date.now()}_${idx}`,
        userId: 'user_haevy',
        amount: s.amount,
        type: 'expense',
        categoryId: s.catId,
        categoryName: s.catName,
        walletId: 'wallet_cash',
        walletName: 'Tiền Mặt',
        date: dateStr,
        note: s.note,
        createdAt: new Date().toISOString()
      });
    });

    setSeedDataTrigger(c => c + 1);
  };

  const formatVND = (amt: number) => {
    return new Intl.NumberFormat('vi-VN').format(amt) + ' ₫';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Banner & Filter Hub */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Flame size={12} className="text-amber-400 animate-pulse" />
                <span>D3.js Visualization Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                <Calendar size={11} className="text-zinc-400" />
                30 Ngày Gần Nhất
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Food • Edu • Entertainment
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Bản Đồ Nhiệt Chi Tiêu 30 Ngày</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-400 font-mono font-medium">
                Finance Heatmap
              </span>
            </h3>

            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Mã hóa quang phổ màu theo cường độ chi tiêu thực tế. Giúp nhận diện tức thì các ngày chi tiêu đột biến, thói quen sinh hoạt và cân bằng giữa <strong className="text-amber-300">Ăn uống</strong>, <strong className="text-purple-300">Giáo dục</strong> và <strong className="text-cyan-300">Giải trí</strong>.
            </p>
          </div>

          {/* Quick Actions & Seed Sample Data */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {total30DaySpend === 0 && (
              <button
                type="button"
                onClick={handleSeedSample30Days}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                title="Tự động nạp các khoản chi mẫu 30 ngày cho Food, Edu và Entertainment để trải nghiệm biểu đồ nhiệt sống động"
              >
                <Sparkles size={14} />
                <span>Nạp Mẫu 30 Ngày</span>
              </button>
            )}

            {onOpenAiAdvisor && (
              <button
                type="button"
                onClick={onOpenAiAdvisor}
                className="px-3.5 py-2 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-purple-400" />
                <span>AI Phân Tích Cường Độ</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Controls Toolbar: Category Filters & Theme Switcher */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 mr-1">
              <Filter size={13} className="text-zinc-500" />
              Lọc Danh Mục:
            </span>
            {[
              { id: 'featured_3', label: '🔥 Trọng Tâm (Food, Edu, Giải trí)' },
              { id: 'food', label: '🍽️ Ăn uống (Food)' },
              { id: 'edu', label: '🎓 Giáo dục (Edu)' },
              { id: 'entertainment', label: '🎬 Giải trí (Entertainment)' },
              { id: 'all', label: 'Toàn Bộ Chi Tiêu' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as HeatmapCategoryFilter)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === tab.id
                    ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Theme Palette Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
              <SlidersHorizontal size={13} className="text-zinc-500" />
              Quang Phổ:
            </span>
            {[
              { id: 'fire', label: '🔥 Hỏa Nhiệt', color: 'from-amber-400 to-rose-500' },
              { id: 'emerald', label: '💎 Lục Bảo', color: 'from-emerald-400 to-amber-400' },
              { id: 'cyber', label: '🌌 Cyber Neon', color: 'from-purple-400 to-pink-500' }
            ].map(thm => (
              <button
                key={thm.id}
                type="button"
                onClick={() => setColorTheme(thm.id as HeatmapColorTheme)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  colorTheme === thm.id
                    ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${thm.color}`} />
                <span>{thm.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Four Key Performance Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Spend in 30 Days */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <Wallet size={14} className="text-amber-400" />
              Tổng Chi 30 Ngày
            </span>
            <span className="text-[10px] text-zinc-500">Cửa sổ 30 ngày</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white font-mono">
            {formatVND(total30DaySpend)}
          </div>
          <div className="text-[10px] text-zinc-400">
            Trung bình: <strong className="text-zinc-200">{formatVND(Math.round(total30DaySpend / 30))}/ngày</strong>
          </div>
        </div>

        {/* Metric 2: Peak Spending Day */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <Flame size={14} className="text-rose-400" />
              Ngày Chi Đỉnh Điểm
            </span>
            <span className="text-[10px] text-rose-400 font-extrabold">Cực đại</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-300 font-mono">
            {peakDay ? formatVND(peakDay.amount) : '0 ₫'}
          </div>
          <div className="text-[10px] text-zinc-400">
            {peakDay ? `${peakDay.dayOfWeek} ngày ${peakDay.displayDate}` : 'Chưa có giao dịch'}
          </div>
        </div>

        {/* Metric 3: Dominant Category */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <PieChart size={14} className="text-purple-400" />
              Nhóm Chi Chiếm Tỷ Trọng Lớn
            </span>
          </div>
          {(() => {
            const sorted = [...categoryStats].sort((a, b) => b.totalAmount - a.totalAmount);
            const top = sorted[0];
            const pct = total30DaySpend > 0 ? Math.round((top.totalAmount / total30DaySpend) * 100) : 0;
            return (
              <>
                <div className="text-base sm:text-lg font-black text-zinc-100 truncate flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: top?.color || '#a1a1aa' }} />
                  <span className="truncate">{top ? top.name.split('(')[0].trim() : 'Chưa rõ'}</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span>Chiếm <strong className="text-purple-300 font-extrabold">{pct}%</strong> dòng tiền</span>
                  <span>• {top ? formatVND(top.totalAmount) : '0 ₫'}</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Metric 4: Investment in Self vs Entertainment Ratio */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span className="flex items-center gap-1">
              <Award size={14} className="text-cyan-400" />
              Chỉ Số Cân Bằng (Edu/Fun)
            </span>
          </div>
          {(() => {
            const eduTotal = categoryStats.find(c => c.group === 'edu')?.totalAmount || 0;
            const funTotal = categoryStats.find(c => c.group === 'entertainment')?.totalAmount || 0;
            const isBalanced = eduTotal >= funTotal * 0.5;
            return (
              <>
                <div className={`text-base sm:text-lg font-black truncate flex items-center gap-1.5 ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span>{isBalanced ? 'Đầu Tư Hợp Lý' : 'Cần Nâng Edu'}</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Edu: <strong className="text-purple-300">{formatVND(eduTotal)}</strong> | Fun: <strong className="text-cyan-300">{formatVND(funTotal)}</strong>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 4. Main Heatmap Visual Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800/90 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400 animate-pulse" />
            <h4 className="text-sm font-black text-white">Ma Trận Cường Độ D3.js (Matrix View)</h4>
            <span className="text-[10px] text-zinc-500 font-mono">
              [30 Cột Ngày × {categoryRows.length} Hàng Danh Mục]
            </span>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Di chuột vào ô để xem chi tiết • Bấm vào ô để chọn ngày</span>
          </div>
        </div>

        {/* Scrollable SVG Wrapper for mobile responsiveness */}
        <div ref={containerRef} className="w-full overflow-x-auto no-scrollbar touch-pan-x py-2">
          <svg ref={svgRef} className="mx-auto block" />
        </div>

        {/* 5. D3 Legend Intensity Scale Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-bold">
            <span>Thang đo cường độ:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-3 rounded bg-zinc-900 border border-zinc-800" title="0 ₫ (Không chi)" />
              <span className="text-[10px] text-zinc-500">0 ₫</span>
              <div 
                className="w-28 h-3 rounded mx-1.5 border border-zinc-700/50" 
                style={{
                  background: colorTheme === 'fire'
                    ? 'linear-gradient(to right, #fde047, #f97316, #ef4444)'
                    : colorTheme === 'emerald'
                    ? 'linear-gradient(to right, #6ee7b7, #0d9488, #eab308)'
                    : 'linear-gradient(to right, #c084fc, #9333ea, #f43f5e)'
                }}
                title="Dải cường độ chi tiêu từ thấp đến cao"
              />
              <span className="text-[10px] font-bold text-amber-300 font-mono">
                {maxDailySpend > 0 ? formatVND(maxDailySpend) : '500.000 ₫+'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Cuối tuần (T7, CN)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              Ngày thường
            </span>
          </div>
        </div>
      </div>

      {/* 6. Selected Cell / Day Deep-Dive Drawer */}
      {selectedCell && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-sky-500/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-sky-400 uppercase tracking-wider">
                    Chi Tiết Ngày Được Chọn
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-bold">
                    {selectedCell.dayOfWeek}, {selectedCell.displayDate}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white mt-0.5">
                  {selectedCell.categoryName}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-zinc-400 font-medium">Tổng chi ô này:</div>
                <div className="text-base font-black text-amber-300 font-mono">
                  {formatVND(selectedCell.amount)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng chi tiết"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Transaction list for selected day & category */}
          {selectedCell.transactions.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span>Danh sách {selectedCell.transactions.length} khoản chi trong ngày:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar">
                {selectedCell.transactions.map((tx, idx) => (
                  <div key={tx.id || idx} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{tx.note || 'Chi tiêu không ghi chú'}</div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                        <span>Ví: {tx.walletName || 'Tiền mặt'}</span>
                        {tx.time && <span>• {tx.time}</span>}
                      </div>
                    </div>
                    <div className="font-black text-rose-400 font-mono shrink-0">
                      -{formatVND(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-zinc-500">
              Không có khoản chi nào được ghi nhận cho danh mục này vào ngày {selectedCell.displayDate}.
            </div>
          )}
        </div>
      )}

      {/* 7. Dedicated Category Deep Dives: Food, Edu & Entertainment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Food & Dining */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-950/20 via-zinc-900 to-zinc-950 border border-amber-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                <Utensils size={18} />
              </div>
              <div>
                <h5 className="text-xs font-black text-white">Ăn Uống & Bách Hóa</h5>
                <span className="text-[10px] text-amber-400 font-bold">Food & Groceries</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400">
              30 Ngày
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="text-xl font-black text-amber-300 font-mono">
              {formatVND(categoryStats.find(c => c.group === 'food')?.totalAmount || 0)}
            </div>
            <div className="text-[11px] text-zinc-400">
              Hoạt động: <strong className="text-zinc-200">{categoryStats.find(c => c.group === 'food')?.activeDaysCount || 0}/30 ngày</strong>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Dòng tiền chi tiêu thiết yếu phục vụ ăn uống gia đình, bữa sáng và siêu thị bách hóa. Nên duy trì ổn định dưới 55% thu nhập (Hũ NEC).
          </p>
        </div>

        {/* Card 2: Education & Self-Development */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-purple-950/20 via-zinc-900 to-zinc-950 border border-purple-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h5 className="text-xs font-black text-white">Giáo Dục & STEM</h5>
                <span className="text-[10px] text-purple-400 font-bold">Education & Books</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400">
              30 Ngày
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="text-xl font-black text-purple-300 font-mono">
              {formatVND(categoryStats.find(c => c.group === 'edu')?.totalAmount || 0)}
            </div>
            <div className="text-[11px] text-zinc-400">
              Hoạt động: <strong className="text-zinc-200">{categoryStats.find(c => c.group === 'edu')?.activeDaysCount || 0}/30 ngày</strong>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Khoản đầu tư có lãi nhất vào bản thân: Sách vở, khóa học STEM, công cụ ôn thi Casio fx-880 và tài liệu học sâu First Principles.
          </p>
        </div>

        {/* Card 3: Entertainment & Romance */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-cyan-950/20 via-zinc-900 to-zinc-950 border border-cyan-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                <Film size={18} />
              </div>
              <div>
                <h5 className="text-xs font-black text-white">Giải Trí & Hẹn Hò</h5>
                <span className="text-[10px] text-cyan-400 font-bold">Entertainment & Dates</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400">
              30 Ngày
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="text-xl font-black text-cyan-300 font-mono">
              {formatVND(categoryStats.find(c => c.group === 'entertainment')?.totalAmount || 0)}
            </div>
            <div className="text-[11px] text-zinc-400">
              Hoạt động: <strong className="text-zinc-200">{categoryStats.find(c => c.group === 'entertainment')?.activeDaysCount || 0}/30 ngày</strong>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Khoản chi tái tạo năng lượng tinh thần: Vé xem phim, âm nhạc Hi-Fi, du lịch và gắn kết tình cảm cặp đôi trong không gian I Love Haevy.
          </p>
        </div>
      </div>

      {/* Floating Hover Tooltip (Portal-like absolute positioning) */}
      {hoveredCell && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-2xl bg-zinc-950/95 border border-zinc-700/80 shadow-2xl text-xs text-white backdrop-blur-md min-w-[200px] space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-1.5">
            <span className="font-extrabold text-amber-300 flex items-center gap-1">
              <span>{hoveredCell.dayOfWeek}</span>
              <span>• {hoveredCell.displayDate}</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold">
              {hoveredCell.count} giao dịch
            </span>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 font-semibold">{hoveredCell.categoryName}</div>
            <div className="text-sm font-black text-white font-mono mt-0.5">
              {formatVND(hoveredCell.amount)}
            </div>
          </div>

          {hoveredCell.transactions.length > 0 && hoveredCell.transactions[0].note && (
            <div className="text-[10px] text-zinc-400 italic truncate max-w-[220px]">
              "{hoveredCell.transactions[0].note}"
            </div>
          )}

          <div className="text-[9px] text-zinc-500 pt-1 border-t border-zinc-800/80 flex items-center justify-between">
            <span>Cường độ chi:</span>
            <span className="font-bold text-zinc-300">
              {hoveredCell.amount === 0
                ? 'Không chi tiêu'
                : hoveredCell.intensityRatio > 0.65
                ? '🔴 Cực cao'
                : hoveredCell.intensityRatio > 0.3
                ? '🟡 Vừa phải'
                : '🟢 Thấp'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
