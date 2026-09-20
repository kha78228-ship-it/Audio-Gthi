import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ListTodo,
  Plus,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BookOpen,
  FlaskConical,
  GraduationCap,
  BrainCircuit,
  Filter,
  Layers,
  X,
  Tag,
  ShieldCheck
} from 'lucide-react';
import {
  GoogleTaskList,
  GoogleTaskItem,
  fetchGoogleTaskLists,
  fetchGoogleTasks,
  addGoogleTask,
  toggleGoogleTaskStatus,
  deleteGoogleTask,
  createGoogleTaskList,
  importStudyRoadmapToGoogleTasks,
  DEFAULT_HAEVY_TASK_PRESETS,
  isGoogleTasksConnected,
  getGoogleTasksUser,
  connectGoogleTasks
} from '../../services/googleTasksService';
import { haptics } from '../../utils/haptics';

interface GoogleTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'study' | 'stem' | 'exam' | 'spiritual' | 'general';
  initialTaskTitle?: string;
  initialTaskNotes?: string;
}

export function GoogleTasksModal({
  isOpen,
  onClose,
  initialCategory = 'study',
  initialTaskTitle = '',
  initialTaskNotes = ''
}: GoogleTasksModalProps) {
  // Lists and Tasks state
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'needsAction' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // New task form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>(initialTaskTitle);
  const [newTaskNotes, setNewTaskNotes] = useState<string>(initialTaskNotes);
  const [newTaskDue, setNewTaskDue] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<'study' | 'stem' | 'exam' | 'spiritual' | 'general'>(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New List form state
  const [showNewListInput, setShowNewListInput] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');

  // Confirmation Modal for Destructive Deletion (Mandatory for Workspace Integration)
  const [taskToDelete, setTaskToDelete] = useState<GoogleTaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Feedback notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isConnected = isGoogleTasksConnected();
  const currentUser = getGoogleTasksUser();

  // Load task lists on mount or open
  useEffect(() => {
    if (isOpen) {
      loadListsAndTasks();
      if (initialTaskTitle) {
        setNewTaskTitle(initialTaskTitle);
        setNewTaskNotes(initialTaskNotes);
        setShowAddForm(true);
      }
    }
  }, [isOpen, initialTaskTitle, initialTaskNotes]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const loadListsAndTasks = async () => {
    setIsLoading(true);
    try {
      const lists = await fetchGoogleTaskLists();
      setTaskLists(lists);
      const activeId = selectedListId || (lists[0]?.id || '@default');
      setSelectedListId(activeId);
      const items = await fetchGoogleTasks(activeId);
      setTasks(items);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListChange = async (listId: string) => {
    haptics.selection();
    setSelectedListId(listId);
    setIsLoading(true);
    try {
      const items = await fetchGoogleTasks(listId);
      setTasks(items);
    } catch (err) {
      console.error('Failed to change list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    haptics.impact();
    try {
      const created = await createGoogleTaskList(newListName.trim());
      setTaskLists(prev => [created, ...prev]);
      setSelectedListId(created.id);
      setNewListName('');
      setShowNewListInput(false);
      showToast(`Đã tạo danh sách "${created.title}" thành công!`);
      const items = await fetchGoogleTasks(created.id);
      setTasks(items);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleToggleTask = async (task: GoogleTaskItem) => {
    haptics.impact();
    const nextCompleted = task.status !== 'completed';
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextCompleted ? 'completed' : 'needsAction' } : t));

    try {
      await toggleGoogleTaskStatus(selectedListId, task.id, nextCompleted);
      if (nextCompleted) {
        showToast(`🎉 Đã hoàn thành: ${task.title}`);
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    haptics.impact();
    setIsSubmitting(true);
    try {
      const created = await addGoogleTask(selectedListId, {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        due: newTaskDue ? new Date(newTaskDue).toISOString() : undefined,
        category: newTaskCategory
      });

      setTasks(prev => [created, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setShowAddForm(false);
      showToast(`Đã thêm nhiệm vụ vào Google Tasks!`);
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // User confirmation for destructive deletion (strictly adhering to skill instructions)
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    haptics.warning();
    setIsDeleting(true);

    try {
      await deleteGoogleTask(selectedListId, taskToDelete.id);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      showToast(`Đã xóa nhiệm vụ "${taskToDelete.title}" khỏi Google Tasks.`);
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportStudyRoadmap = async () => {
    haptics.impact();
    setIsSyncing(true);
    try {
      const studyPreset = DEFAULT_HAEVY_TASK_PRESETS[0];
      const count = await importStudyRoadmapToGoogleTasks(selectedListId, studyPreset.tasks);
      const refreshed = await fetchGoogleTasks(selectedListId);
      setTasks(refreshed);
      showToast(`Đã thêm thành công ${count} mốc học bài theo quá trình vào Google Tasks!`);
    } catch (err) {
      console.error('Error importing roadmap:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'needsAction') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-sky-950/40 via-zinc-900 to-indigo-950/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <CheckSquare size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Google Tasks Workspace
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                  Workspace
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Nhiệm vụ nhắc nhở học theo quá trình, STEM Lab & Luyện thi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadListsAndTasks}
              disabled={isLoading}
              title="Làm mới từ Google Tasks"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin text-sky-400' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Task Lists Bar & Quick Switcher */}
        <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Layers size={13} className="text-sky-400" />
              <span>Danh mục:</span>
            </span>

            {taskLists.map(list => (
              <button
                key={list.id}
                type="button"
                onClick={() => handleListChange(list.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedListId === list.id
                    ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/20 font-black'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{list.title}</span>
              </button>
            ))}

            {/* Create new list button */}
            {!showNewListInput ? (
              <button
                type="button"
                onClick={() => setShowNewListInput(true)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-sky-300 border border-zinc-800/80 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus size={13} />
                <span>Thêm list</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Tên danh mục mới..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateList();
                    if (e.key === 'Escape') setShowNewListInput(false);
                  }}
                  className="px-2.5 py-1 text-xs bg-zinc-950 border border-sky-500/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-500 w-36"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateList}
                  className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewListInput(false)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Filter Tabs */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-xl border border-zinc-800 text-[11px]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tất cả ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('needsAction')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'needsAction' ? 'bg-amber-500/20 text-amber-300 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Chưa xong ({tasks.filter(t => t.status !== 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Đã xong ({tasks.filter(t => t.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>

        {/* Action Banners & Quick Presets */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-sky-950/30 via-zinc-900/50 to-indigo-950/20 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-300 font-bold flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Gợi ý học tập First Principles:</span>
            </span>
            <button
              type="button"
              onClick={handleImportStudyRoadmap}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <GraduationCap size={13} />
              <span>{isSyncing ? 'Đang nạp lộ trình...' : 'Nạp Lộ Trình Học Quá Trình (5 Nhiệm Vụ)'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
          >
            <Plus size={14} />
            <span>Thêm nhiệm vụ mới</span>
          </button>
        </div>

        {/* Add Task Form (Inline Drawer) */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="p-4 bg-zinc-900/90 border-b border-zinc-800 space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                <Plus size={14} />
                <span>Nhiệm vụ mới cho "{taskLists.find(l => l.id === selectedListId)?.title || 'Danh sách'}"</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Ví dụ: Ôn tập bản chất Đạo hàm (First Principles) chu kỳ ngày 3..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-sky-500 placeholder-zinc-600"
                autoFocus
                required
              />

              <textarea
                placeholder="Ghi chú chi tiết, công thức cần nhớ, tài liệu STEM Lab, lưu ý giải nhanh Casio fx-880..."
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-zinc-600 resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                    <Calendar size={13} className="text-sky-400" />
                    <span>Hạn chót:</span>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    {(['study', 'stem', 'exam', 'spiritual'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewTaskCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          newTaskCategory === cat
                            ? 'bg-zinc-800 text-sky-300 border border-sky-500/40'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {cat === 'study' && '📚 Học bài'}
                        {cat === 'stem' && '🧪 STEM'}
                        {cat === 'exam' && '🎯 Luyện thi'}
                        {cat === 'spiritual' && '🧘 Tâm thức'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTaskTitle.trim()}
                    className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{isSubmitting ? 'Đang lưu...' : 'Lưu nhiệm vụ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Toast Feedback */}
        {successToast && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 size={15} className="text-sky-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tasks List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <RefreshCw size={24} className="animate-spin text-sky-400" />
              <span className="text-xs">Đang đồng bộ Google Tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <ListTodo size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-300">Chưa có nhiệm vụ nào trong danh mục này</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Tạo nhiệm vụ mới hoặc bấm nút nạp lộ trình học First Principles phía trên để đồng bộ ngay.
                </p>
              </div>
              <button
                type="button"
                onClick={handleImportStudyRoadmap}
                className="mt-2 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Nạp 5 mốc học bài theo quá trình mẫu</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                    isCompleted
                      ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-sky-500/40 hover:bg-zinc-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                          : 'border-zinc-700 hover:border-sky-400 bg-zinc-950 text-transparent hover:text-sky-400/50'
                      }`}
                      title={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                    >
                      <CheckCircle2 size={14} className="stroke-[3]" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-xs font-bold leading-snug break-words ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100 group-hover:text-sky-200'
                        }`}>
                          {task.title}
                        </span>

                        {task.category && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-semibold shrink-0">
                            {task.category === 'study' && '📚 Quá trình'}
                            {task.category === 'stem' && '🧪 STEM'}
                            {task.category === 'exam' && '🎯 Ôn thi'}
                            {task.category === 'spiritual' && '🧘 Tâm thức'}
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                          isCompleted ? 'text-zinc-600' : 'text-zinc-400'
                        }`}>
                          {task.notes}
                        </p>
                      )}

                      {task.due && (
                        <div className="flex items-center gap-1 text-[10px] text-sky-400/90 font-mono pt-0.5">
                          <Clock size={11} />
                          <span>Hạn chót: {new Date(task.due).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-900 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tài khoản: <strong className="text-zinc-200 font-mono">{currentUser?.email || 'kha78228@gmail.com'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://calendar.google.com/calendar/u/0/r/tasks"
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
            >
              <span>Mở trên Google Tasks</span>
              <ExternalLink size={12} />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE TASK DELETION */}
        {taskToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Xác nhận xóa nhiệm vụ?</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Bạn có chắc chắn muốn xóa nhiệm vụ <strong className="text-zinc-200">"{taskToDelete.title}"</strong> khỏi Google Tasks không? Hành động này sẽ được đồng bộ và không thể hoàn tác.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTask}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
