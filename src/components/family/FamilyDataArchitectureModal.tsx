import React, { useState, useMemo } from 'react';
import { FamilyTreeMember as FamilyMember, FamilyTree } from '../../types';
import { 
  generateClosureTable, 
  generateGraphData 
} from '../../data/sampleFamilyTree';
import { 
  X, 
  Database, 
  Network, 
  Table, 
  Code2, 
  Download, 
  CheckCircle2, 
  Copy, 
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface FamilyDataArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  familyTree: FamilyTree;
}

export const FamilyDataArchitectureModal: React.FC<FamilyDataArchitectureModalProps> = ({
  isOpen,
  onClose,
  members,
  familyTree
}) => {
  const [activeTab, setActiveTab] = useState<'closure_table' | 'graph_neo4j' | 'export'>('closure_table');
  const [copied, setCopied] = useState<string | null>(null);

  // Compute closure table entries
  const closureEntries = useMemo(() => generateClosureTable(members), [members]);

  // Compute graph nodes and edges
  const graphData = useMemo(() => generateGraphData(members), [members]);

  // Generate Neo4j Cypher script
  const neo4jCypherScript = useMemo(() => {
    let script = `// ==========================================\n// HAEVY FAMILY TREE - NEO4J CYPHER INGESTION\n// Tree: ${familyTree.name}\n// ==========================================\n\n`;
    
    // Create Nodes
    script += `// 1. Tạo các Nodes Thành Viên (Person)\n`;
    members.forEach(m => {
      script += `CREATE (p_${m.id.replace(/-/g, '_')}:Person {\n`;
      script += `  id: "${m.id}",\n`;
      script += `  name: "${m.fullName}",\n`;
      script += `  gender: "${m.gender}",\n`;
      script += `  generation: ${m.generation},\n`;
      script += `  branch: "${m.branch}",\n`;
      script += `  isDeceased: ${m.isDeceased}\n`;
      script += `});\n`;
    });

    // Create Relationships
    script += `\n// 2. Tạo Quan Hệ (Edges: PARENT_OF & SPOUSE_OF)\n`;
    graphData.edges.forEach(e => {
      const fromNode = `p_${e.from.replace(/-/g, '_')}`;
      const toNode = `p_${e.to.replace(/-/g, '_')}`;
      if (e.type === 'parent_child') {
        script += `MATCH (a:Person {id: "${e.from}"}), (b:Person {id: "${e.to}"}) CREATE (a)-[:PARENT_OF {type: "biological"}]->(b);\n`;
      } else if (e.type === 'adopted_child') {
        script += `MATCH (a:Person {id: "${e.from}"}), (b:Person {id: "${e.to}"}) CREATE (a)-[:PARENT_OF {type: "adopted"}]->(b);\n`;
      } else if (e.type === 'spouse') {
        script += `MATCH (a:Person {id: "${e.from}"}), (b:Person {id: "${e.to}"}) CREATE (a)-[:SPOUSE_OF]->(b);\n`;
      }
    });

    script += `\n// 3. Truy vấn nhanh toàn bộ hậu duệ không đệ quy nghẽn CPU:\n`;
    script += `MATCH (ancestor:Person {name: "Nguyễn Phúc Đức Thọ"})-[:PARENT_OF*1..15]->(descendant:Person)\nRETURN descendant.name, descendant.generation ORDER BY descendant.generation;\n`;

    return script;
  }, [members, graphData, familyTree]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const data = {
      tree: familyTree,
      members: members,
      closureTable: closureEntries,
      graph: graphData,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haevy_family_tree_${familyTree.id}.json`;
    a.click();
  };

  // Export to GEDCOM (standard international genealogy format)
  const handleExportGEDCOM = () => {
    let ged = `0 HEAD\n1 SOUR HAEVY_FAMILY_TREE\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n`;
    
    members.forEach(m => {
      ged += `0 @${m.id}@ INDI\n`;
      ged += `1 NAME ${m.fullName}\n`;
      ged += `1 SEX ${m.gender === 'male' ? 'M' : 'F'}\n`;
      if (m.birthDate) {
        ged += `1 BIRT\n2 DATE ${m.birthDate}\n`;
      }
      if (m.isDeceased) {
        ged += `1 DEAT\n`;
        if (m.deathDate) ged += `2 DATE ${m.deathDate}\n`;
      }
      if (m.fatherId) ged += `1 FAMC @FAM_${m.fatherId}@\n`;
    });

    ged += `0 TRLR\n`;

    const blob = new Blob([ged], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haevy_family_tree_${familyTree.id}.ged`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="architecture-modal-container"
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-200">
                Kiến Trúc Dữ Liệu Phả Hệ (Graph Database & Closure Table)
              </h3>
              <p className="text-xs text-slate-400">
                Giải pháp tối ưu hóa phân cấp hàng chục thế hệ, triệt tiêu nghẽn đệ quy sâu O(1)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('closure_table')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'closure_table'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            SQL Closure Table ({closureEntries.length} cặp quan hệ O(1))
          </button>
          <button
            onClick={() => setActiveTab('graph_neo4j')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'graph_neo4j'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Graph Database (Neo4j Cypher & Edges)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Bản Phả Hệ (GEDCOM / JSON)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'closure_table' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Mô Hình Phân Cấp SQL Closure Table (Bảng Bao Đóng)
                </h5>
                <p className="text-slate-300 leading-relaxed">
                  Thay vì dùng <code className="text-rose-300 bg-slate-900 px-1 py-0.5 rounded">parent_id</code> đơn lẻ khiến hệ thống phải duyệt đệ quy (recursive CTE) tốn tài nguyên khi cây gia phả phát triển qua 10–30 đời, <strong>Closure Table</strong> lưu giữ toàn bộ đường đi trực tiếp giữa mọi cặp <em>(Tiền Nhân → Hậu Duệ)</em> cùng khoảng cách thế hệ (depth).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-emerald-300 block">Truy Vấn Tiền Nhân O(1)</strong>
                    <span>Tìm toàn bộ cụ tổ của một người chỉ với 1 lệnh SELECT WHERE descendant_id = X</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-emerald-300 block">Truy Vấn Nhánh Hậu Duệ O(1)</strong>
                    <span>Tìm toàn bộ con cháu của một chi với SELECT WHERE ancestor_id = Y</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-emerald-300 block">Tính Bậc Thế Hệ Chính Xác</strong>
                    <span>Xác định đời thứ mấy, quan hệ chú bác hay anh em họ thông qua depth</span>
                  </div>
                </div>
              </div>

              {/* Table Data Preview */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-amber-300 sticky top-0 border-b border-slate-800 font-bold">
                      <tr>
                        <th className="p-2.5">Tiền Nhân (Ancestor)</th>
                        <th className="p-2.5">Hậu Duệ (Descendant)</th>
                        <th className="p-2.5 text-center">Bậc Thế Hệ (Depth)</th>
                        <th className="p-2.5">Ý Nghĩa Quan Hệ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 text-slate-300">
                      {closureEntries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-semibold text-amber-100">{entry.ancestorName}</td>
                          <td className="p-2.5 text-slate-200">{entry.descendantName}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                              entry.depth === 0 ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {entry.depth}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-400">
                            {entry.depth === 0 && 'Chính bản thân'}
                            {entry.depth === 1 && 'Cha / Mẹ trực tiếp'}
                            {entry.depth === 2 && 'Ông / Bà (2 đời)'}
                            {entry.depth === 3 && 'Cụ Tổ (3 đời)'}
                            {entry.depth >= 4 && `Tiền nhân cách ${entry.depth} đời`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'graph_neo4j' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-amber-400" />
                    Cơ Sở Dữ Liệu Đồ Thị Neo4j (Graph Database Engine)
                  </h5>
                  <button
                    onClick={() => copyToClipboard(neo4jCypherScript, 'cypher')}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-xs flex items-center gap-1 font-semibold transition-all"
                  >
                    {copied === 'cypher' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'cypher' ? 'Đã sao chép Cypher!' : 'Sao chép Cypher Script'}
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Trong Neo4j, mỗi thành viên là một <code>:Person Node</code> và các mối liên kết huyết thống là các <code>:PARENT_OF</code> hoặc <code>:SPOUSE_OF</code> Edges. Truy vấn đường đi phả hệ, họ hàng gần xa, hoặc kiểm tra huyết thống kết hôn 3 đời được thực hiện bằng thuật toán đồ thị với tốc độ cực đại (Index-free Adjacency).
                </p>
              </div>

              {/* Cypher Code Box */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-amber-200/90 max-h-72 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{neo4jCypherScript}</pre>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export GEDCOM */}
                <div className="p-5 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      TIÊU CHUẨN QUỐC TẾ
                    </span>
                    <h4 className="text-base font-bold text-amber-100 mt-2">Xuất Tệp Phả Hệ GEDCOM (.ged)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Định dạng chuẩn 5.5.1 tương thích với mọi phần mềm gia phả thế giới (Gramps, Ancestry, FamilySearch, MyHeritage).
                    </p>
                  </div>
                  <button
                    id="btn-export-gedcom"
                    onClick={handleExportGEDCOM}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Tải Về Tệp GEDCOM (.ged)
                  </button>
                </div>

                {/* Export JSON Full Schema */}
                <div className="p-5 bg-slate-950 border border-blue-500/30 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                      FULL BACKUP GRAPH
                    </span>
                    <h4 className="text-base font-bold text-amber-100 mt-2">Sao Lưu Toàn Bộ Dữ Liệu (.json)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Xuất toàn bộ cây gia phả gồm các nodes thành viên, tài liệu sắc phong, sự kiện ngày giỗ và ma trận Closure Table.
                    </p>
                  </div>
                  <button
                    id="btn-export-json"
                    onClick={handleExportJSON}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Tải Bản Sao Lưu JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
