import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchAlerts = async () => {
        const { data } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setAlerts(data);
      };
      fetchAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible Backdrop for clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={onClose}
        />
      )}

      {/* Modern Dropdown Panel */}
      {isOpen && (
        <div className="fixed top-16 right-6 z-[100] w-[380px] origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="bg-[var(--surface-base)]/90 backdrop-blur-2xl border border-gray-200 rounded-xl shadow-2xl overflow-hidden ring-1 ring-gray-200/50">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Bell size={14} className="text-gray-700" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-critical)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-critical)]"></span>
                </div>
                <h3 className="text-xs font-bold italic text-gray-900 font-sans">Signals</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold italic text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{alerts.length} New</span>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content SCROLL AREA */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <CheckCircle2 size={24} className="mb-3 opacity-20" />
                  <p className="text-xs font-bold italic opacity-60">All Systems Nominal</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="group px-4 py-3.5 rounded-xl border border-transparent hover:bg-bg-hover hover:border-gray-200 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`mt-0.5 p-1 rounded-md border ${alert.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                        alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                          'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        }`}>
                        {alert.severity === 'critical' ? <ShieldAlert size={12} /> :
                          alert.severity === 'warning' ? <AlertTriangle size={12} /> :
                            <Clock size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className={`text-xs font-bold italic tracking-wide truncate pr-2 ${alert.severity === 'critical' ? 'text-rose-400' : 'text-gray-800'
                            }`}>
                            {alert.title || 'System Alert'}
                          </span>
                          <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-bold italic group-hover:text-gray-600 transition-colors line-clamp-2">
                          {alert.message || 'Anomaly detected in operational sector.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-200 bg-gray-50 backdrop-blur-md">
              <button className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg text-xs font-bold italic transition-all border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2 group">
                Open Command Center <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

