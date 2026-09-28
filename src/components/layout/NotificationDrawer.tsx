import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useWorkshop();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div
      ref={drawerRef}
      className="absolute right-4 top-16 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No notifications right now</div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.linkTab) {
                  setActiveTab(item.linkTab);
                  onClose();
                }
              }}
              className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                !item.read ? 'bg-sky-50/40' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
              </div>
              {!item.read && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
