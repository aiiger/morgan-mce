'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X, ChevronDown, Activity } from 'lucide-react';
import { DocumentChangeEvent } from '../../types';
import { useToast } from '@/lib/toast-context';
import { Button } from '../ui/Button';

interface DeltaGateAlertProps {
  documentId: string;
  onAcknowledge: () => void;
  onClose: () => void;
  autoHide?: boolean;
}

export default function DeltaGateAlert({
  documentId,
  onAcknowledge,
  onClose,
  autoHide = false,
}: DeltaGateAlertProps) {
  const [deltaInfo, setDeltaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchDeltaInfo();
  }, [documentId]);

  const fetchDeltaInfo = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/detect-delta`);
      if (!response.ok) return;
      const data = await response.json();
      setDeltaInfo(data);

      if (data.has_critical_changes) {
        setExpanded(true);
      }

      // Auto-hide if no changes
      if (!data.changes || data.changes.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to fetch delta info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      // Create acknowledgment in DB
      const res = await fetch(`/api/documents/${documentId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Reviewer acknowledged delta changes' })
      });

      if (res.ok) {
        toast.success("Changes Acknowledged", "Requirement variance has been documented.");
        onAcknowledge();
        setDeltaInfo((prev: any) => ({
          ...prev,
          requires_acknowledgment: false,
          changes: []
        }));
        onClose();
      }
    } catch (err) {
      toast.error("Acknowledgment Failed");
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading || !deltaInfo?.changes || deltaInfo.changes.length === 0) {
    return null;
  }

  const { changes, has_critical_changes, highest_impact, requires_acknowledgment } = deltaInfo;

  const getImpactStyles = () => {
    switch (highest_impact) {
      case 'CRITICAL': return 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'HIGH': return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
      case 'MEDIUM': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
    }
  };

  return (
    <div className={`border rounded-xl p-4 mb-6 transition-all duration-500 ${getImpactStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="shrink-0 mt-1">
            {has_critical_changes ? (
              <AlertTriangle size={18} className="animate-pulse" />
            ) : (
              <Activity size={18} />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xs font-bold italic tracking-[0.2em]">
              {has_critical_changes ? 'Neural Delta Detected: Critical Variance' : 'Requirement Shift Detected'}
            </h3>

            <p className="text-caption font-mono mt-1 opacity-80 tracking-widest">
              {changes.length} Logical change{changes.length !== 1 ? 's' : ''} identified since last maturation.
            </p>

            {expanded && (
              <div className="mt-4 space-y-2 max-h-[300px] overflow-auto pr-2">
                {changes.map((change: DocumentChangeEvent, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-gray-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gov-label font-bold italic tracking-widest text-gray-500">
                        Field: {change.field_changed}
                      </span>
                      <span className={`text-caption font-bold italic px-1.5 py-0.5 rounded border ${
                        change.impact_level === 'CRITICAL' ? 'border-rose-500/30 bg-rose-500/10' : 'border-gray-200'
                      }`}>
                        {change.impact_level}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-caption font-mono">
                      <div className="opacity-40">FROM: {change.old_value || 'NULL'}</div>
                      <div className="text-gray-900">TO: {change.new_value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {requires_acknowledgment && (
        <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
          <Button
            variant="danger"
            size="xs"
            onClick={handleAcknowledge}
            loading={acknowledging}
          >
            Acknowledge System Variance
          </Button>
          <button
            onClick={onClose}
            className="text-gov-label font-bold italic tracking-widest text-gray-500 hover:text-gray-900 transition-colors px-3"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
