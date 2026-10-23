import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  Tag, 
  AlertCircle, 
  Flame, 
  Award,
  Filter,
  CheckCheck
} from 'lucide-react';
import { SunStudyState, SunTask } from '../../../services/sunStudyStorageService';

interface SunStudyTasksProps {
  state: SunStudyState;
  onUpdateState: (updater: (prev: SunStudyState) => SunStudyState) => void;
  onTriggerXpToast?: (xp: number, message: string) => void;
}

export function SunStudyTasks({ state, onUpdateState, onTriggerXpToast }: SunStudyTasksProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  // New Task Form
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskSubject, setTaskSubject] = useState<string>('Toán Học');
  const [taskPriority, setTaskPriority] = useState<'urgent' | 'important' | 'normal'>('important');
  const [taskPomodoros, setTaskPomodoros] = useState<number>(2);

  const handleToggleTask = (taskId: string) => {
    onUpdateState(prev => {
      const target = prev.tasks.find(t => t.id === taskId);
      if (!target) return prev;
      const willBeCompleted = !target.completed;

      // Rewarding coins & XP upon completion
      const coinGain = willBeCompleted ? 15 : 0;
      const xpGain = willBeCompleted ? 45 : 0;

      if (willBeCompleted && onTriggerXpToast) {
        onTriggerXpToast(xpGain, `Hoàn thành "${target.title}" (+${coinGain} Hạt Nắng ☀️)!`);
      }

      return {
        ...prev,
        sunCoins: prev.sunCoins + coinGain,
        sunXp: prev.sunXp + xpGain,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: willBeCompleted } : t)
      };
    });
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: SunTask = {
      id: `task_${Date.now()}`,
      title: taskTitle.trim(),
      subject: taskSubject,
      priority: taskPriority,
      estimatedPomodoros: Number(taskPomodoros) || 1,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };

    onUpdateState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    setTaskTitle('');
    setIsAddingTask(false);
  };

  const filteredTasks = state.tasks.filter(t => {
    if (filterMode === 'pending' && t.completed) return false;
    if (filterMode === 'completed' && !t.completed) return false;
    if (selectedSubjectFilter !== 'all' && t.subject !== selectedSubjectFilter) return false;
    return true;
  });

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shadow-inner">
            📋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">To-do List Ghi Chú & Kỷ Luật</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {completedTasks}/{totalTasks} Hoàn Thành ({completionPercent}%)
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Chia nhỏ mục tiêu lớn thành các ca học 25 phút • Nhận ngay 15 Hạt Nắng ☀️ khi tick xong mỗi việc!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
        >
          <Plus size={15} />
          <span>Thêm Công Việc Mới</span>
        </button>
      </div>

      {/* Progress Bar Strip */}
      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-300 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-400" /> Tiến độ công việc trong ngày
          </span>
          <span className="font-mono text-amber-300 font-bold">{completionPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Popover Form */}
      {isAddingTask && (
        <form onSubmit={handleAddTask} className="p-5 rounded-3xl bg-zinc-900 border border-amber-500/40 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span>Thêm Nhiệm Vụ Học Tập</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Hủy
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Nội dung công việc:</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="VD: Làm 30 câu trắc nghiệm dao động điều hòa, học 20 từ vựng..."
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-400"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Môn học:</label>
              <select
                value={taskSubject}
                onChange={(e) => setTaskSubject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                <option value="Toán Học">Toán Học 📐</option>
                <option value="Vật Lý">Vật Lý ⚛️</option>
                <option value="Hóa Học">Hóa Học 🧪</option>
                <option value="Sinh Học">Sinh Học 🧬</option>
                <option value="Ngữ Văn">Ngữ Văn 📖</option>
                <option value="Tiếng Anh">Tiếng Anh 🇬🇧</option>
                <option value="Lịch Sử">Lịch Sử 🏛️</option>
                <option value="Địa Lý">Địa Lý 🌍</option>
                <option value="ĐGNL">ĐGNL ⚡</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Mức ưu tiên:</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                <option value="urgent">🔴 Khẩn Cấp (Làm ngay)</option>
                <option value="important">🟡 Quan Trọng (Trọng tâm)</option>
                <option value="normal">🟢 Thường (Linh hoạt)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Ước tính Pomodoro (25p):</label>
              <select
                value={taskPomodoros}
                onChange={(e) => setTaskPomodoros(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
              >
                <option value={1}>🍅 1 Cà chua (25 phút)</option>
                <option value={2}>🍅🍅 2 Cà chua (50 phút)</option>
                <option value={3}>🍅🍅🍅 3 Cà chua (75 phút)</option>
                <option value={4}>🍅🍅🍅🍅 4 Cà chua (100 phút)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-black disabled:opacity-40"
            >
              Lưu Công Việc
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Subject Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-bold uppercase text-[10px] mr-1">Bộ Lọc:</span>
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'pending', label: '⏳ Chưa Xong' },
            { id: 'completed', label: '✅ Đã Xong' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterMode === f.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Môn:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="bg-zinc-950 text-zinc-300 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            <option value="all">Tất cả môn</option>
            <option value="Toán Học">Toán Học</option>
            <option value="Vật Lý">Vật Lý</option>
            <option value="Hóa Học">Hóa Học</option>
            <option value="Sinh Học">Sinh Học</option>
            <option value="Ngữ Văn">Ngữ Văn</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="ĐGNL">ĐGNL</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 flex flex-col items-center justify-center gap-2">
            <CheckCheck size={28} className="text-zinc-600" />
            <p className="text-xs">Không có công việc nào trong danh mục này. Hãy thêm nhiệm vụ mới để bắt đầu cày cuốc!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                task.completed
                  ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/40 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className={`p-1 rounded-lg transition shrink-0 ${
                    task.completed ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-amber-400'
                  }`}
                >
                  {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold leading-snug ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-100 group-hover:text-amber-300'
                    }`}>
                      {task.title}
                    </span>

                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {task.subject}
                    </span>

                    {task.priority === 'urgent' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔴 Khẩn Cấp
                      </span>
                    )}
                    {task.priority === 'important' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🟡 Quan Trọng
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                    <span>Ước tính: {task.estimatedPomodoros} 🍅 ({task.estimatedPomodoros * 25}p)</span>
                    {task.completed && (
                      <span className="text-emerald-400 font-bold">• Đã nhận +15 ☀️</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDeleteTask(task.id, e)}
                className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800 transition shrink-0"
                title="Xóa công việc"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
