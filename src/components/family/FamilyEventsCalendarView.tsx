import React, { useState } from 'react';
import { FamilyEvent, FamilyTreeMember as FamilyMember, FamilyRole } from '../../types';
import { 
  Bell, 
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { FamilyCalendarIntegration } from './FamilyCalendarIntegration';

interface FamilyEventsCalendarViewProps {
  events: FamilyEvent[];
  members: FamilyMember[];
  userRole: FamilyRole;
  onAddEvent: (event: FamilyEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onSelectMember?: (member: FamilyMember) => void;
}

export const FamilyEventsCalendarView: React.FC<FamilyEventsCalendarViewProps> = ({
  events,
  members,
  userRole,
  onAddEvent,
  onDeleteEvent,
  onSelectMember
}) => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);

  // Handle Push Notification Permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
        new Notification('Haevy Family Tree', {
          body: 'Đã kích hoạt chuông báo nhắc nhở ngày giỗ & sự kiện gia tộc thành công!',
          icon: '/favicon.ico'
        });
      }
    } else {
      setNotificationEnabled(true);
      setSimulatedAlert('Hệ thống nhắc nhở tự động trong ứng dụng đã sẵn sàng!');
      setTimeout(() => setSimulatedAlert(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Notification Reminder & Action */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-200">
              Lịch Gia Tộc & Sinh Nhật Tự Động 4.0
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Tích hợp đồng bộ ngày sinh của toàn thể thành viên trong dòng họ, ngày giỗ phụng sự tiên tổ và các ngày đại lễ hội tế. Tự động đếm ngược theo thời gian thực và thông báo cho con cháu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            id="btn-enable-push-notifications"
            onClick={requestNotificationPermission}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              notificationEnabled
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 font-black'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{notificationEnabled ? 'Đã Bật Chuông Nhắc' : 'Bật Chuông Nhắc Lịch'}</span>
          </button>
        </div>
      </div>

      {simulatedAlert && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{simulatedAlert}</span>
        </motion.div>
      )}

      {/* Embedded Full Interactive Calendar Integration */}
      <FamilyCalendarIntegration
        isEmbeddedView={false}
        events={events}
        members={members}
        userRole={userRole}
        onAddEvent={onAddEvent}
        onDeleteEvent={onDeleteEvent}
        onSelectMember={onSelectMember}
      />
    </div>
  );
};

export default FamilyEventsCalendarView;
