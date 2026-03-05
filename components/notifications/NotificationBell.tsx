
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// This is a placeholder type. It should be replaced with the actual Notification type from your types definition.
// Based on the spec, it should look something like this:
export interface Notification {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string; // ISO string
  related_entity_type?: string;
  related_entity_id?: string;
  read_at?: string;
  ack_required?: boolean;
}


interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onNavigateToNotifications: () => void;
  onMarkAllRead: () => void;
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
    const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
        switch (severity) {
            case 'critical': return 'text-[var(--color-critical)]';
            case 'warning': return 'text-[var(--color-warning)]';
            case 'info':
            default: return 'text-[var(--color-info)]';
        }
    }
    
    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

  return (
    <div className="px-4 py-3 border-b border-[var(--surface-border)] hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-start">
        <div className={`w-1 h-1 rounded-full mr-3 mt-1.5 ${getSeverityColor(notification.severity).replace('text-', 'bg-')} shadow-[0_0_8px]`} />
        <div className="flex-1">
          <p className="text-xs text-gray-700 leading-relaxed">{notification.message}</p>
          <div className="flex items-center text-gray-500 text-caption mt-1.5">
            <Clock size={10} className="mr-1.5" />
            <span>{getTimeAgo(notification.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


export const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, unreadCount, onNavigateToNotifications, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`View ${unreadCount} Notifications`}
        className={`p-2 transition-colors relative text-gray-500 hover:text-[var(--color-critical)] ${isOpen ? 'text-[var(--color-critical)] bg-rose-500/5 rounded' : ''}`}
        title="Signals"
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] bg-[var(--color-critical)] text-caption font-bold italic text-gray-900 rounded-full px-0.5 shadow-[0_0_5px_var(--color-critical)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[var(--surface-border)] rounded-md shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--surface-border)] flex justify-between items-center">
            <h3 className="text-xs font-bold italic text-gray-900 tracking-wider">Notifications</h3>
            <Badge variant={unreadCount > 0 ? 'danger' : 'default'}>{unreadCount} New</Badge>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => <NotificationItem key={n.id} notification={n} />)
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs">
                <CheckCircle size={24} className="mx-auto mb-2" />
                All caught up!
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-[var(--surface-layer)] border-t border-[var(--surface-border)] flex justify-between text-xs">
            <button onClick={onMarkAllRead} className="font-bold italic text-gray-500 hover:text-gray-900 transition-colors">Mark All Read</button>
            <button onClick={onNavigateToNotifications} className="font-bold italic text-gray-500 hover:text-gray-900 transition-colors">View All</button>
          </div>
        </div>
      )}
    </div>
  );
};
