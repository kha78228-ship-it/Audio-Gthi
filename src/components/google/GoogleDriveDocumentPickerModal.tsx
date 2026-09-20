import React, { useState, useEffect, useRef } from 'react';
import {
  HardDrive,
  FileText,
  Search,
  Upload,
  Sparkles,
  Compass,
  Eye,
  ExternalLink,
  CheckCircle2,
  Trash2,
  X,
  Plus,
  RefreshCw,
  FolderOpen,
  Filter,
  BrainCircuit,
  BookOpen,
  ArrowRight,
  Atom,
  TestTube,
  Dna,
  Calculator,
  Layers,
  GraduationCap,
  Cloud
} from 'lucide-react';
import {
  GoogleDriveDocumentItem,
  getAvailableGoogleDriveDocuments,
  uploadDocumentToGoogleDrive,
  deleteGoogleDriveDocument
} from '../../services/googleDriveService';
import { GoogleDriveServiceConfig } from './GoogleIntegrationModal';

interface GoogleDriveDocumentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: GoogleDriveServiceConfig;
  onSelectDocumentForAI?: (doc: GoogleDriveDocumentItem) => void;
  onSelectDocumentForRoadmap?: (doc: GoogleDriveDocumentItem) => void;
  initialTab?: 'browse' | 'upload' | 'settings';
}

export function GoogleDriveDocumentPickerModal({
  isOpen,
  onClose,
  config,
  onSelectDocumentForAI,
  onSelectDocumentForRoadmap,
  initialTab = 'browse'
}: GoogleDriveDocumentPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'settings'>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [documents, setDocuments] = useState<GoogleDriveDocumentItem[]>([]);
  const [previewDoc, setPreviewDoc] = useState<GoogleDriveDocumentItem | null>(null);
  
  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSubject, setUploadSubject] = useState<'Vật Lý' | 'Hóa Học' | 'Sinh Học' | 'Toán Học' | 'Tổng Hợp' | 'Đề Cương'>('Tổng Hợp');
  const [uploadContentText, setUploadContentText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents
  const loadDocuments = () => {
    const list = getAvailableGoogleDriveDocuments();
    setDocuments(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      setActiveTab(initialTab);
      setPreviewDoc(null);
      setUploadSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleUpdated = () => loadDocuments();
    window.addEventListener('haevy-drive-docs-updated', handleUpdated);
    return () => window.removeEventListener('haevy-drive-docs-updated', handleUpdated);
  }, []);

  if (!isOpen) return null;

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesQuery = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = 
      selectedSubject === 'all' || 
      doc.subject.toLowerCase() === selectedSubject.toLowerCase();

    return matchesQuery && matchesSubject;
  });

  const handleSelectFileToUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);

    // Read content
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      setUploadContentText(text);
    };
    reader.readAsText(file);
  };

  const handlePerformUpload = () => {
    if (!uploadFile && !uploadContentText.trim()) {
      alert('Vui lòng chọn tệp hoặc nhập nội dung văn bản cần lưu lên Google Drive.');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const fileName = uploadFile ? uploadFile.name : `Tai_Lieu_Moi_${Date.now().toString().slice(-4)}.txt`;
      const sizeStr = uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB` : `${(uploadContentText.length / 1024).toFixed(1)} KB`;

      uploadDocumentToGoogleDrive({
        name: fileName,
        content: uploadContentText.trim() || `Nội dung tài liệu từ tệp ${fileName}`,
        subject: uploadSubject,
        size: sizeStr
      });

      setIsUploading(false);
      setUploadFile(null);
      setUploadContentText('');
      setUploadSuccessMsg(`Đã tải tệp "${fileName}" lên Google Drive thành công!`);
      loadDocuments();
      setTimeout(() => {
        setUploadSuccessMsg(null);
        setActiveTab('browse');
      }, 1500);
    }, 800);
  };

  const handleDeleteDoc = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tệp "${name}" khỏi Google Drive?`)) {
      deleteGoogleDriveDocument(id);
      loadDocuments();
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Vật Lý': return <Atom size={14} className="text-blue-400" />;
      case 'Hóa Học': return <TestTube size={14} className="text-emerald-400" />;
      case 'Sinh Học': return <Dna size={14} className="text-teal-400" />;
      case 'Toán Học': return <Calculator size={14} className="text-violet-400" />;
      case 'Đề Cương': return <GraduationCap size={14} className="text-amber-400" />;
      default: return <FileText size={14} className="text-zinc-400" />;
    }
  };

  const getFileTypeBadge = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <span className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">PDF</span>;
      case 'docx': return <span className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">DOCX</span>;
      case 'md': return <span className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">MARKDOWN</span>;
      case 'gdoc': return <span className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">G-DOC</span>;
      default: return <span className="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">TEXT</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-emerald-500 to-blue-500 text-zinc-950 flex items-center justify-center shadow-lg font-black shrink-0">
              <HardDrive size={20} className="text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-zinc-100">Kho Tài Liệu Google Drive</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {config?.email || 'kha78228@gmail.com'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Lấy tài liệu học tập, giáo trình, đề cương đưa vào AI phân tích bản chất logic & tạo lộ trình
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('browse'); setPreviewDoc(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <FolderOpen size={14} />
              <span>Tệp Trên Drive</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'browse' ? 'bg-zinc-950/30 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('upload'); setPreviewDoc(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Upload size={14} />
              <span>Tải Lên Drive Mới</span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 hidden sm:flex items-center gap-1">
            <Cloud size={13} className="text-emerald-400" />
            <span>Đám mây đã sẵn sàng</span>
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: BROWSE DOCUMENTS */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              
              {/* Search & Subject Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên giáo trình, đề cương, nguyên lý, công thức..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Subject Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'Vật Lý', label: 'Vật Lý' },
                    { id: 'Hóa Học', label: 'Hóa Học' },
                    { id: 'Sinh Học', label: 'Sinh Học' },
                    { id: 'Toán Học', label: 'Toán Học' },
                    { id: 'Đề Cương', label: 'Đề Cương' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedSubject(filter.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedSubject === filter.id
                          ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDocs.length === 0 ? (
                  <div className="col-span-2 p-10 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                    <FolderOpen size={32} className="mx-auto text-zinc-600" />
                    <h4 className="text-xs font-bold text-zinc-300">Không tìm thấy tài liệu phù hợp</h4>
                    <p className="text-[11px] text-zinc-500">
                      Hãy thử đổi từ khóa tìm kiếm hoặc bấm tab "Tải Lên Drive Mới" để thêm giáo trình của bạn.
                    </p>
                  </div>
                ) : (
                  filteredDocs.map(doc => {
                    const isSelectedPreview = previewDoc?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`p-3.5 rounded-2xl bg-zinc-900/80 border transition-all flex flex-col justify-between gap-3 shadow-md group ${
                          isSelectedPreview
                            ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {/* Top Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/60 group-hover:scale-105 transition-transform">
                                {getSubjectIcon(doc.subject)}
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                                  {doc.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                  <span>{doc.size}</span>
                                  <span>•</span>
                                  <span>{doc.modifiedTime}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {getFileTypeBadge(doc.fileType)}
                              {doc.isUploadedByUser && (
                                <button
                                  onClick={() => handleDeleteDoc(doc.id, doc.name)}
                                  className="p-1 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded-md transition-colors"
                                  title="Xóa tệp khỏi Drive"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Snippet */}
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/60">
                            {doc.snippet}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => setPreviewDoc(isSelectedPreview ? null : doc)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            title="Đọc thử nội dung"
                          >
                            <Eye size={12} />
                            <span>{isSelectedPreview ? 'Đóng xem' : 'Xem nội dung'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {onSelectDocumentForAI && (
                              <button
                                onClick={() => {
                                  onSelectDocumentForAI(doc);
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:scale-102"
                                title="Nạp ngay vào trợ lý AI học tập để mổ xẻ nguyên lý logic"
                              >
                                <BrainCircuit size={12} />
                                <span>Vào AI Học Tập</span>
                              </button>
                            )}

                            {onSelectDocumentForRoadmap && (
                              <button
                                onClick={() => {
                                  onSelectDocumentForRoadmap(doc);
                                  onClose();
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:scale-102"
                                title="Tạo lộ trình học First Principles và lịch học từng ngày"
                              >
                                <Compass size={12} />
                                <span>Tạo Lộ Trình</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Inline Document Preview Box */}
              {previewDoc && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                        Nội Dung Chi Tiết: {previewDoc.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => setPreviewDoc(null)}
                      className="text-zinc-500 hover:text-zinc-300 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
                    {previewDoc.content}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {onSelectDocumentForAI && (
                      <button
                        onClick={() => {
                          onSelectDocumentForAI(previewDoc);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <BrainCircuit size={13} />
                        <span>Nạp Vào AI Học Tập Ngay</span>
                      </button>
                    )}

                    {onSelectDocumentForRoadmap && (
                      <button
                        onClick={() => {
                          onSelectDocumentForRoadmap(previewDoc);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Compass size={13} />
                        <span>Tạo Lộ Trình First Principles</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: UPLOAD NEW DOCUMENT TO GOOGLE DRIVE */}
          {activeTab === 'upload' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-zinc-100">
                  Tải Tệp Tài Liệu Lên Google Drive
                </h4>
                <p className="text-xs text-zinc-400">
                  Tệp được lưu trữ an toàn trong thư mục /Haevy-Ecosystem/ trên Google Drive và sẵn sàng để AI xử lý bất kỳ lúc nào.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/80 transition-all text-center space-y-3 cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx,.doc,.md,.json,.csv"
                  onChange={handleSelectFileToUpload}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload size={22} />
                </div>

                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    {uploadFile ? uploadFile.name : 'Bấm để chọn tệp tài liệu từ thiết bị'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Hỗ trợ: PDF, Word (.docx), Markdown (.md), Văn bản (.txt)
                  </span>
                </div>

                {uploadFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">
                    <CheckCircle2 size={13} />
                    <span>Đã chọn: {(uploadFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>

              {/* Subject Tag Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Chủ đề phân loại tài liệu:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['Vật Lý', 'Hóa Học', 'Sinh Học', 'Toán Học', 'Đề Cương', 'Tổng Hợp'] as const).map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setUploadSubject(subj)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        uploadSubject === subj
                          ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Paste Alternative */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Hoặc dán nhanh nội dung giáo trình/bài giảng:</span>
                  <span className="text-[10px] text-zinc-500">{uploadContentText.length} ký tự</span>
                </label>
                <textarea
                  value={uploadContentText}
                  onChange={(e) => setUploadContentText(e.target.value)}
                  placeholder="Dán nội dung bài học, định luật, đề cương hoặc ghi chú nghiên cứu vào đây nếu không có file..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
                />
              </div>

              {/* Success Notification */}
              {uploadSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handlePerformUpload}
                disabled={isUploading || (!uploadFile && !uploadContentText.trim())}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Upload size={14} className={isUploading ? 'animate-bounce' : ''} />
                <span>{isUploading ? 'Đang tải lên Google Drive...' : 'Tải Lên & Lưu Vào Google Drive'}</span>
              </button>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Google Drive đã kết nối với tài khoản {config?.email || 'kha78228@gmail.com'}</span>
          </div>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Mở Drive trong tab mới</span>
            <ExternalLink size={11} />
          </a>
        </div>

      </div>
    </div>
  );
}
