import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  PieChart, 
  Layers, 
  Sparkles, 
  Info, 
  ArrowLeft, 
  Eye, 
  RotateCcw, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Landmark, 
  GraduationCap, 
  Gamepad2, 
  HeartHandshake, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Calendar,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory, FinanceBudget } from '../../types';

export interface SunburstNodeData {
  id: string;
  name: string;
  shortName?: string;
  code?: string;
  description?: string;
  color?: string;
  percentage?: number; // target percentage for 6 jars (e.g. 55, 10...)
  budgetAmount?: number;
  spentAmount?: number;
  transactionCount?: number;
  group?: 'root' | 'jar' | 'category' | 'transaction';
  jarId?: string;
  iconName?: string;
  children?: SunburstNodeData[];
  value?: number; // D3 partition size value
}

interface FinanceD3SunburstChartProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  budget?: FinanceBudget;
  selectedMonth: string;
  className?: string;
  onOpenAiAdvisor?: () => void;
}

// 6 Jars Definition & Category Mapping
const SIX_JARS_META = [
  {
    id: 'jar_nec',
    code: 'NEC',
    name: 'Chi Tiêu Cần Thiết (NEC)',
    shortName: 'Cần Thiết',
    pct: 55,
    color: '#0284c7', // Sky Blue
    accentColor: '#38bdf8',
    icon: ShoppingBag,
    desc: 'Ăn uống, thuê nhà, xăng xe, hóa đơn điện nước, bách hóa gia đình',
    categoryIds: ['cat_food', 'cat_rent', 'cat_groceries', 'cat_bills', 'cat_transport', 'cat_health'],
  },
  {
    id: 'jar_ffa',
    code: 'FFA',
    name: 'Tự Do Tài Chính (FFA)',
    shortName: 'Tự Do Tài Chính',
    pct: 10,
    color: '#d97706', // Amber / Gold
    accentColor: '#fbbf24',
    icon: TrendingUp,
    desc: 'Đầu tư chứng khoán, quỹ mở, bất động sản, tài sản sinh lời thụ động',
    categoryIds: ['cat_invest'],
  },
  {
    id: 'jar_ltss',
    code: 'LTSS',
    name: 'Tiết Kiệm Dài Hạn (LTSS)',
    shortName: 'Tiết Kiệm',
    pct: 10,
    color: '#059669', // Emerald
    accentColor: '#34d399',
    icon: Landmark,
    desc: 'Quỹ khẩn cấp 6 tháng, bảo hiểm nhân thọ, mua nhà xe, du lịch tương lai',
    categoryIds: ['cat_savings', 'cat_insurance'],
  },
  {
    id: 'jar_edu',
    code: 'EDU',
    name: 'Giáo Dục & Bản Thân (EDU)',
    shortName: 'Giáo Dục',
    pct: 10,
    color: '#7c3aed', // Violet / Purple
    accentColor: '#a78bfa',
    icon: GraduationCap,
    desc: 'Mua sách, khóa học nâng cao kỹ năng, hội thảo, rèn luyện tư duy',
    categoryIds: ['cat_education'],
  },
  {
    id: 'jar_play',
    code: 'PLAY',
    name: 'Hưởng Thụ & Thư Giãn (PLAY)',
    shortName: 'Hưởng Thụ',
    pct: 10,
    color: '#e11d48', // Rose / Pink
    accentColor: '#fb7185',
    icon: Gamepad2,
    desc: 'Cà phê, rạp chiếu phim, nhà hàng sang chảnh, mua sắm thời trang giải trí',
    categoryIds: ['cat_entertainment', 'cat_shopping', 'cat_couple_date'],
  },
  {
    id: 'jar_give',
    code: 'GIVE',
    name: 'Cho Đi & Thiện Nguyện (GIVE)',
    shortName: 'Cho Đi',
    pct: 5,
    color: '#ea580c', // Orange / Coral
    accentColor: '#fb923c',
    icon: HeartHandshake,
    desc: 'Biếu bố mẹ, làm từ thiện, quyên góp xã hội, quà mừng người thân bạn bè',
    categoryIds: ['cat_gifts'],
  },
];

export function FinanceD3SunburstChart({
  transactions,
  categories,
  budget,
  selectedMonth,
  className = '',
  onOpenAiAdvisor,
}: FinanceD3SunburstChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visualization mode:
  // 'budget': sized by 6-jar planned budget allocation (55/10/10/10/10/5)
  // 'actual_spending': sized by actual VND expenses spent in each jar/category this month
  const [dataMode, setDataMode] = useState<'budget' | 'actual_spending'>('actual_spending');
  const [selectedJarFilter, setSelectedJarFilter] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SunburstNodeData | null>(null);
  const [currentZoomedNode, setCurrentZoomedNode] = useState<d3.HierarchyRectangularNode<SunburstNodeData> | null>(null);
  const [activeBreadcrumbs, setActiveBreadcrumbs] = useState<SunburstNodeData[]>([]);

  // Format currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Base for 6 Jars calculation: if income exists, use it, else default to monthly limit
  const baseMonthlyBudget = useMemo(() => {
    if (totalIncome > 0) return totalIncome;
    if (budget?.totalMonthlyLimit && budget.totalMonthlyLimit > 0) return budget.totalMonthlyLimit;
    return totalExpense > 0 ? totalExpense : 15000000;
  }, [totalIncome, budget, totalExpense]);

  // Group actual expenses by category ID
  const expensesByCatId = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!map[t.categoryId]) {
          map[t.categoryId] = { amount: 0, count: 0 };
        }
        map[t.categoryId].amount += t.amount;
        map[t.categoryId].count += 1;
      });
    return map;
  }, [monthTransactions]);

  // Build hierarchical data for D3 Sunburst
  const sunburstHierarchy = useMemo<SunburstNodeData>(() => {
    const rootName = `Tài Chính Tháng ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`;

    const jarsChildren: SunburstNodeData[] = SIX_JARS_META.map(jar => {
      const jarPlannedBudget = (baseMonthlyBudget * jar.pct) / 100;
      let jarActualSpent = 0;
      let jarTransCount = 0;

      // Build category children for this jar
      const categoryChildren: SunburstNodeData[] = jar.categoryIds.map(catId => {
        const catObj = categories.find(c => c.id === catId);
        const catName = catObj?.name || 'Khác';
        const spentInfo = expensesByCatId[catId] || { amount: 0, count: 0 };
        const catBudget = budget?.categoryLimits?.[catId] || (catObj?.monthlyBudget || jarPlannedBudget / jar.categoryIds.length);

        jarActualSpent += spentInfo.amount;
        jarTransCount += spentInfo.count;

        // Size value depending on dataMode
        const nodeValue = dataMode === 'budget' 
          ? Math.max(catBudget, 100000) 
          : Math.max(spentInfo.amount, 10000);

        return {
          id: `cat_${catId}`,
          name: catName,
          shortName: catName.split('&')[0].trim(),
          color: catObj?.color || jar.accentColor,
          budgetAmount: catBudget,
          spentAmount: spentInfo.amount,
          transactionCount: spentInfo.count,
          group: 'category',
          jarId: jar.id,
          value: nodeValue,
        };
      });

      // Also check if there are custom categories or other transactions not mapped
      if (jar.id === 'jar_nec') {
        // Collect any unmapped expense categories
        const mappedCatIds = SIX_JARS_META.flatMap(j => j.categoryIds);
        const unmappedCatIds = Object.keys(expensesByCatId).filter(id => !mappedCatIds.includes(id));
        unmappedCatIds.forEach(id => {
          const catObj = categories.find(c => c.id === id);
          const spentInfo = expensesByCatId[id];
          if (spentInfo && spentInfo.amount > 0) {
            jarActualSpent += spentInfo.amount;
            jarTransCount += spentInfo.count;
            categoryChildren.push({
              id: `cat_other_${id}`,
              name: catObj?.name || 'Chi tiêu khác',
              shortName: catObj?.name || 'Khác',
              color: catObj?.color || '#94a3b8',
              budgetAmount: 500000,
              spentAmount: spentInfo.amount,
              transactionCount: spentInfo.count,
              group: 'category',
              jarId: jar.id,
              value: dataMode === 'budget' ? 500000 : spentInfo.amount,
            });
          }
        });
      }

      return {
        id: jar.id,
        name: jar.name,
        shortName: jar.shortName,
        code: jar.code,
        description: jar.desc,
        percentage: jar.pct,
        color: jar.color,
        budgetAmount: jarPlannedBudget,
        spentAmount: jarActualSpent,
        transactionCount: jarTransCount,
        group: 'jar',
        children: categoryChildren,
      };
    });

    return {
      id: 'root_finance',
      name: rootName,
      shortName: 'Tổng Quan 6 Hũ',
      description: 'Trung tâm phân bổ ngân sách và chi tiêu 6 hũ tiền',
      budgetAmount: baseMonthlyBudget,
      spentAmount: totalExpense,
      transactionCount: monthTransactions.filter(t => t.type === 'expense').length,
      group: 'root',
      color: '#10b981',
      children: jarsChildren,
    };
  }, [baseMonthlyBudget, budget, categories, dataMode, expensesByCatId, monthTransactions, selectedMonth, totalExpense]);

  // Compute 6 Jars summary statistics for cards & legend
  const jarsSummary = useMemo(() => {
    return SIX_JARS_META.map(meta => {
      const plannedBudget = (baseMonthlyBudget * meta.pct) / 100;
      let actualSpent = 0;
      let txCount = 0;

      meta.categoryIds.forEach(cid => {
        const info = expensesByCatId[cid];
        if (info) {
          actualSpent += info.amount;
          txCount += info.count;
        }
      });

      // If NEC, include any unmapped
      if (meta.id === 'jar_nec') {
        const allMapped = SIX_JARS_META.flatMap(j => j.categoryIds);
        Object.keys(expensesByCatId).forEach(cid => {
          if (!allMapped.includes(cid)) {
            actualSpent += expensesByCatId[cid].amount;
            txCount += expensesByCatId[cid].count;
          }
        });
      }

      const percentUsed = plannedBudget > 0 ? Math.round((actualSpent / plannedBudget) * 100) : 0;
      const isOver = actualSpent > plannedBudget;
      const isWarning = percentUsed >= (budget?.alertThresholdPercent || 80) && !isOver;

      return {
        ...meta,
        plannedBudget,
        actualSpent,
        txCount,
        percentUsed,
        isOver,
        isWarning,
      };
    });
  }, [baseMonthlyBudget, budget, expensesByCatId]);

  // D3 Render & Interactive Zoomable Sunburst Logic
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = 540;
    const height = 540;
    const radius = width / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `-${radius} -${radius} ${width} ${height}`)
      .attr('width', '100%').attr('height', '100%')
      .style('font-family', 'ui-sans-serif, system-ui, sans-serif')
      .style('max-width', '100%')
      .style('height', 'auto');

    // Create D3 Hierarchy & Partition layout
    const hierarchy = d3.hierarchy<SunburstNodeData>(sunburstHierarchy)
      .sum(d => (d.children ? 0 : (d.value || 1)))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const partition = d3.partition<SunburstNodeData>()
      .size([2 * Math.PI, radius]);

    const root = partition(hierarchy);
    (root as any).each((d: any) => (d.current = d));

    // Arc generator
    const arc = d3.arc<d3.HierarchyRectangularNode<SunburstNodeData>>()
      .startAngle(d => (d as any).x0)
      .endAngle(d => (d as any).x1)
      .padAngle(d => Math.min(((d as any).x1 - (d as any).x0) / 2, 0.008))
      .padRadius(radius / 2)
      .innerRadius(d => (d as any).y0)
      .outerRadius(d => Math.max((d as any).y0, (d as any).y1 - 1));

    // Container group
    const g = svg.append('g').attr('class', 'sunburst-root');

    // Filter glow effect
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'sunburst-glow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // Color mapper
    const getNodeColor = (d: d3.HierarchyRectangularNode<SunburstNodeData>) => {
      if (d.depth === 0) return '#18181b'; // Root center dark
      if (d.data.color) return d.data.color;
      return '#3f3f46';
    };

    // Render Arcs
    const path = g.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('class', 'sunburst-arc')
      .attr('fill', d => getNodeColor(d))
      .attr('fill-opacity', d => {
        if (d.depth === 1) return 0.9;
        if (d.depth === 2) return 0.75;
        return 0.6;
      })
      .attr('stroke', '#09090b')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .attr('d', d => arc((d as any).current));

    // Arc hover interactions
    path
      .on('mouseenter', function (event, d) {
        setHoveredNode(d.data);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill-opacity', 1)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2.5);

        // Highlight ancestors path
        const ancestors = d.ancestors();
        setActiveBreadcrumbs(ancestors.map(a => a.data).reverse());

        path.filter(node => !ancestors.includes(node))
          .transition()
          .duration(150)
          .attr('fill-opacity', 0.25);
      })
      .on('mouseleave', function () {
        setHoveredNode(null);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#09090b')
          .attr('stroke-width', 1.5);

        path.transition()
          .duration(150)
          .attr('fill-opacity', d => (d.depth === 1 ? 0.9 : 0.75));

        if (currentZoomedNode) {
          setActiveBreadcrumbs(currentZoomedNode.ancestors().map(a => a.data).reverse());
        } else {
          setActiveBreadcrumbs([]);
        }
      })
      .on('click', (event, p) => {
        clicked(event, p);
      });

    // Central Circle (Center Hub / Click to Zoom out)
    const parentCircle = g.append('circle')
      .datum(root)
      .attr('r', (root as any).y1)
      .attr('fill', '#09090b')
      .attr('stroke', '#27272a')
      .attr('stroke-width', 2)
      .attr('pointer-events', 'all')
      .attr('cursor', 'pointer')
      .on('click', (event, p) => clicked(event, p));

    parentCircle
      .on('mouseenter', function () {
        d3.select(this).attr('stroke', '#f59e0b').attr('stroke-width', 2.5);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke', '#27272a').attr('stroke-width', 2);
      });

    // Arc Text Labels (showing Jar acronym or category name when space allows)
    const label = g.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .style('font-weight', d => (d.depth === 1 ? '900' : '700'))
      .style('font-size', d => (d.depth === 1 ? '11px' : '9.5px'))
      .attr('fill-opacity', d => +labelVisible((d as any).current))
      .attr('transform', d => labelTransform((d as any).current))
      .text(d => {
        if (d.depth === 1) {
          return (d.data as any).code || d.data.shortName || '';
        }
        return d.data.shortName || d.data.name;
      });

    // Helper functions for zoom transitions
    function clicked(event: any, p: d3.HierarchyRectangularNode<SunburstNodeData>) {
      setCurrentZoomedNode(p.depth === 0 ? null : p);
      setActiveBreadcrumbs(p.ancestors().map(a => a.data).reverse());

      parentCircle.datum(p.parent || root);

      root.each((d: any) => {
        d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth * (radius / 3)),
          y1: Math.max(0, d.y1 - p.depth * (radius / 3)),
        };
      });

      const t = g.transition().duration(750);

      path.transition(t as any)
        .tween('data', (d: any) => {
          const i = d3.interpolate(d.current, d.target);
          return (time: number) => {
            d.current = i(time);
          };
        })
        .filter(function (d: any): boolean {
          return Boolean(+((this as SVGElement).getAttribute('fill-opacity') || 0) || arcVisible(d.target));
        })
        .attr('fill-opacity', (d: any) => {
          if (!arcVisible(d.target)) return 0;
          return d.depth === p.depth + 1 ? 0.9 : 0.75;
        })
        .attr('stroke-width', (d: any) => (arcVisible(d.target) ? 1.5 : 0))
        .attrTween('d', (d: any) => () => arc(d.current) || '');

      label.transition(t as any)
        .filter(function (d: any): boolean {
          return Boolean(+((this as SVGElement).getAttribute('fill-opacity') || 0) || labelVisible(d.target));
        })
        .attr('fill-opacity', (d: any) => +labelVisible(d.target))
        .attrTween('transform', (d: any) => () => labelTransform(d.current));
    }

    function arcVisible(d: any) {
      return d.y1 <= radius && d.y0 >= 0 && d.x1 > d.x0;
    }

    function labelVisible(d: any) {
      return d.y1 <= radius && d.y0 >= 0 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.035;
    }

    function labelTransform(d: any) {
      const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [sunburstHierarchy, dataMode]);

  // Center display node (hovered or zoomed or root)
  const activeCenterNode = hoveredNode || (currentZoomedNode?.data) || sunburstHierarchy;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sunburst Top Control Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900/90 border border-amber-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
            <PieChart size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                Biểu Đồ Mặt Trời 6 Hũ (D3.js Sunburst)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold uppercase tracking-wider">
                Interactive D3
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Khám phá phân bổ 6 hũ tiền &amp; cơ cấu chi tiêu thực tế tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
            </p>
          </div>
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto">
          <div className="flex items-center p-1 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setDataMode('actual_spending')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                dataMode === 'actual_spending'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame size={13} />
              <span>Thực Tế Chi Tiêu</span>
            </button>
            <button
              onClick={() => setDataMode('budget')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                dataMode === 'budget'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Kế Hoạch Ngân Sách 6 Hũ</span>
            </button>
          </div>

          {onOpenAiAdvisor && (
            <button
              onClick={onOpenAiAdvisor}
              className="px-3.5 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Phân tích sâu với Gemini AI"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">AI Cố Vấn 6 Hũ</span>
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb Navigation Trail */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
        <span className="text-zinc-500 font-bold shrink-0">Cây phân cấp:</span>
        <button
          onClick={() => {
            setCurrentZoomedNode(null);
            setHoveredNode(null);
            setActiveBreadcrumbs([]);
          }}
          className={`flex items-center gap-1 font-bold cursor-pointer transition-colors ${
            activeBreadcrumbs.length === 0 ? 'text-amber-400 font-black' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Tổng Quan</span>
        </button>

        {activeBreadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id + idx}>
            <ChevronRight size={13} className="text-zinc-600 shrink-0" />
            <span
              className={`font-semibold shrink-0 ${
                idx === activeBreadcrumbs.length - 1 ? 'text-amber-300 font-black' : 'text-zinc-400'
              }`}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}

        {currentZoomedNode && (
          <button
            onClick={() => {
              setCurrentZoomedNode(null);
              setHoveredNode(null);
              setActiveBreadcrumbs([]);
            }}
            className="ml-auto text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Thu nhỏ về Gốc</span>
          </button>
        )}
      </div>

      {/* Main Interactive Grid: D3 Sunburst Chart + Live Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive D3.js Sunburst SVG & Center HUD (7 cols) */}
        <div 
          ref={containerRef}
          className="lg:col-span-7 p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl relative flex flex-col items-center justify-center min-h-[500px]"
        >
          {/* Chart SVG */}
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
            <svg ref={svgRef} className="w-full h-full drop-shadow-xl select-none" />

            {/* Central Information HUD Inside Sunburst */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6">
              <div className="w-[125px] h-[125px] rounded-full bg-zinc-950/90 backdrop-blur-md border border-zinc-800 flex flex-col items-center justify-center p-2 shadow-2xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 line-clamp-1">
                  {activeCenterNode.shortName || activeCenterNode.name}
                </span>

                <div className="text-xs sm:text-sm font-black text-white leading-tight">
                  {formatVND(dataMode === 'actual_spending' ? (activeCenterNode.spentAmount || 0) : (activeCenterNode.budgetAmount || 0))}
                </div>

                <div className="text-[9px] text-zinc-400 font-mono">
                  {dataMode === 'actual_spending' ? 'Thực chi tháng' : 'Hạn mức hũ'}
                </div>

                {activeCenterNode.percentage && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {activeCenterNode.percentage}% ngân sách
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interaction Guide */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full flex items-center justify-between text-[11px] text-zinc-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Chạm hoặc nhấp vào từng vòng tròn để phóng to (Zoom in)</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500">
              <Info size={12} />
              <span>Nhấp tâm vòng tròn để quay lại cấp trước</span>
            </div>
          </div>
        </div>

        {/* Right Column: 6 Jars Breakdown & Health Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Highlighted Node Inspection Card */}
          <div className="p-5 rounded-3xl bg-zinc-900/90 border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: activeCenterNode.color || '#f59e0b' }}
                />
                <h4 className="text-sm font-black text-white">
                  {activeCenterNode.name}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                {activeCenterNode.group === 'jar' ? 'Hũ Tiền' : activeCenterNode.group === 'category' ? 'Danh Mục' : 'Tổng Thể'}
              </span>
            </div>

            {activeCenterNode.description && (
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeCenterNode.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block">Kế hoạch ngân sách:</span>
                <span className="text-xs font-black text-amber-300">
                  {formatVND(activeCenterNode.budgetAmount || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 block">Thực tế đã chi:</span>
                <span className={`text-xs font-black ${
                  (activeCenterNode.spentAmount || 0) > (activeCenterNode.budgetAmount || 0)
                    ? 'text-rose-400'
                    : 'text-emerald-300'
                }`}>
                  {formatVND(activeCenterNode.spentAmount || 0)}
                </span>
              </div>
            </div>

            {/* Progress Ratio Bar */}
            {activeCenterNode.budgetAmount && activeCenterNode.budgetAmount > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Tỷ lệ sử dụng:</span>
                  <span className={`font-mono font-bold ${
                    ((activeCenterNode.spentAmount || 0) / activeCenterNode.budgetAmount) > 1
                      ? 'text-rose-400'
                      : 'text-zinc-200'
                  }`}>
                    {Math.round(((activeCenterNode.spentAmount || 0) / activeCenterNode.budgetAmount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      ((activeCenterNode.spentAmount || 0) / activeCenterNode.budgetAmount) > 1
                        ? 'bg-rose-500'
                        : ((activeCenterNode.spentAmount || 0) / activeCenterNode.budgetAmount) >= 0.8
                        ? 'bg-amber-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.round(((activeCenterNode.spentAmount || 0) / activeCenterNode.budgetAmount) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6 Jars Quick List with Status Badges */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Layers size={14} className="text-amber-400" />
                <span>Chi Tiết 6 Hũ Tháng {selectedMonth.split('-')[1]}</span>
              </h4>
              <span className="text-[10px] text-zinc-500">
                Chuẩn Harv Eker 55/10/10/10/10/5
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {jarsSummary.map(jar => {
                const Icon = jar.icon;
                const isSelected = selectedJarFilter === jar.id;

                return (
                  <div
                    key={jar.id}
                    onClick={() => setSelectedJarFilter(isSelected ? null : jar.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-zinc-800 border-amber-400/80 shadow-md'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: jar.color }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>{jar.shortName} ({jar.code})</span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {jar.pct}%
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {formatVND(jar.actualSpent)} / {formatVND(jar.plannedBudget)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          jar.isOver
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : jar.isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {jar.percentUsed}%
                        </span>
                      </div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(jar.percentUsed, 100)}%`,
                          backgroundColor: jar.isOver ? '#f43f5e' : jar.isWarning ? '#f59e0b' : jar.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
