import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
type NotificationLike = {
  id: string;
  title?: string;
  message?: string;
  priority?: string;
  severity?: string;
  timestamp?: string;
  created_at?: string;
  acked_at?: string;
  read_at?: string;
};

interface NotificationsAcksPanelProps {
  notifications: NotificationLike[];
}

export const NotificationsAcksPanel: React.FC<NotificationsAcksPanelProps> = ({ notifications }) => {
  // Filter for critical alerts or recent acks
  const criticalSignals = notifications
    .filter(n => {
      const sev = (n.priority || n.severity || '').toString().toLowerCase();
      const ackedAt = n.acked_at || n.read_at;
      return sev === 'critical' || !ackedAt;
    })
    .slice(0, 5);

  const ackRate = notifications.length > 0
    ? Math.round((notifications.filter(n => Boolean(n.acked_at || n.read_at)).length / notifications.length) * 100)
    : 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-[var(--color-info)]" />
          <h4 className="text-xs font-bold italic text-gray-500">Response_Velocity</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold italic text-gray-500">Ack Rate</span>
          <span className={`text-xs font-bold italic font-mono px-2 py-0.5 rounded border ${ackRate >= 90 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-500 border-amber-500/20 bg-amber-500/10'}`}>
            {ackRate}%
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {criticalSignals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <CheckCircle2 size={32} className="mb-4 text-emerald-500" />
            <p className="text-xs font-bold italic text-gray-400">All Signals Resolved</p>
          </div>
        ) : (
          criticalSignals.map((n, i) => {
            const ackedAt = n.acked_at || n.read_at;
            const title = n.title || n.message || 'Signal';
            const ts = n.timestamp || n.created_at;

            return (
              <div key={n.id || i} className="group cursor-default border-b border-gray-200 pb-4 last:border-0 -mx-4 px-4 hover:bg-gray-50 rounded-xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${ackedAt ? 'bg-gray-300' : 'bg-[var(--color-critical)] animate-pulse'}`} />
                    <div>
                      <h5 className={`text-xs font-bold italic tracking-wider ${ackedAt ? 'text-gray-500' : 'text-gray-900'}`}>
                        {title}
                      </h5>
                      <p className="text-xs font-bold italic text-gray-400 mt-1">
                        {new Date(ts || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {ackedAt ? (
                    <span className="text-xs font-bold italic text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">Resolved</span>
                  ) : (
                    <span className="text-xs font-bold italic text-[var(--color-critical)] bg-[var(--color-critical)]/5 px-2 py-1 rounded border border-[var(--color-critical)]/10 animate-pulse">Action Req</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
