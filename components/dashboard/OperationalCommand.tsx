import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { DeadlineTimeline } from "./DeadlineTimeline";
import { Building2, Clock, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  project_name: string;
  client_name?: string;
  project_code?: string;
  project_completion_date_planned?: string;
  delivery_risk_rating?: string;
  contract_value?: number;
  phase?: string;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  project: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface Tender {
  id: string;
  title: string;
  client?: string;
  value?: number;
  probability?: string;
  status?: string;
}

interface OperationalCommandProps {
  projects?: Project[];
  deadlines?: Deadline[];
  tenders?: Tender[];
}

export const OperationalCommand: React.FC<OperationalCommandProps> = ({
  projects = [],
  deadlines = [],
  tenders = []
}) => {

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const due = new Date(dateString);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden box-border">

      {/* TOP ROW: Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full box-border">
        
        {/* LEFT COLUMN: Project Portfolio (7 cols) */}
        <div className="lg:col-span-7 w-full min-w-0">
          <Card className="h-[450px] bg-[var(--bg-surface)] border-[var(--frame-border)] shadow-[var(--frame-shadow)] flex flex-col overflow-hidden w-full" padding="none">
            <CardHeader className="px-6 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-layer)]/30 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[var(--brand-accent)]" />
                  <CardTitle className="text-sm font-bold italic text-[var(--text-primary)] tracking-wide font-oswald uppercase">
                    PROJECT PORTFOLIO
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-[var(--brand-accent)]/20 text-xs px-2 py-0.5 font-bold italic">
                  {projects.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0 w-full">
              {projects.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-tertiary)] text-sm italic">
                  No active projects
                </div>
              ) : (
                <div className="divide-y divide-[var(--surface-border)] w-full">
                  {projects.map((project) => {
                    const daysRemaining = project.project_completion_date_planned
                      ? getDaysRemaining(project.project_completion_date_planned)
                      : null;
                    const isUrgent = daysRemaining !== null && daysRemaining < 0;
                    const isCritical = project.delivery_risk_rating === 'Critical';

                    return (
                      <div
                        key={project.id}
                        className={cn(
                          "p-4 hover:bg-[var(--brand-accent)]/[0.03] transition-all group cursor-pointer border-l-2 relative w-full",
                          isCritical ? "border-[var(--mce-red)]" : "border-transparent hover:border-[var(--brand-accent)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4 w-full">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold italic text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors truncate font-oswald uppercase tracking-wide">
                              {project.project_name}
                            </h4>
                            <div className="flex items-center gap-2 text-gov-label text-[var(--text-tertiary)] uppercase tracking-widest font-bold truncate">
                              <span>{project.client_name || 'Internal'}</span>
                              <span className="opacity-30">•</span>
                              <span>{project.project_code || 'PRJ-SPEC'}</span>
                            </div>
                          </div>

                          {daysRemaining !== null && (
                            <div className="flex flex-col items-center px-3 border-x border-[var(--surface-border)] shrink-0">
                              <span className={cn(
                                "text-lg font-mono font-bold italic",
                                isUrgent ? "text-[var(--mce-red)] animate-pulse" : "text-[var(--brand-accent)]"
                              )}>
                                {daysRemaining}D
                              </span>
                              <span className="text-caption text-[var(--text-tertiary)] uppercase font-bold tracking-tighter">Countdown</span>
                            </div>
                          )}

                          <div className={cn(
                            "px-3 py-1 rounded-sm text-gov-label font-bold border shrink-0",
                            isCritical
                              ? "bg-[var(--mce-red)]/10 text-[var(--mce-red)] border-[var(--mce-red)]/20"
                              : "bg-[var(--brand-accent)]/5 text-[var(--brand-accent)] border-[var(--brand-accent)]/10"
                          )}>
                            {project.delivery_risk_rating || 'NOMINAL'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Tender Tracker (5 cols) */}
        <div className="lg:col-span-5 w-full min-w-0">
          <Card className="h-[450px] bg-[var(--bg-surface)] border-[var(--frame-border)] shadow-[var(--frame-shadow)] flex flex-col overflow-hidden w-full" padding="none">
            <CardHeader className="px-6 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-layer)]/30 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[var(--brand-accent)]" />
                  <CardTitle className="text-sm font-bold italic text-[var(--text-primary)] tracking-wide font-oswald uppercase">
                    TENDER TRACKER
                  </CardTitle>
                </div>
                {tenders.length > 0 && (
                  <Badge variant="outline" className="bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-[var(--brand-accent)]/20 text-xs px-2 py-0.5 font-bold italic">
                    {tenders.length}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0 w-full">
              {tenders.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-tertiary)] text-sm italic">
                  No active tenders
                </div>
              ) : (
                <div className="divide-y divide-[var(--surface-border)] w-full">
                  {tenders.map((tender) => {
                    const probability = tender.probability || 'Medium';
                    const probColor =
                      probability === 'High' ? 'var(--color-success)' :
                      probability === 'Medium' ? 'var(--color-warning)' :
                      'var(--mce-red)';

                    return (
                      <div
                        key={tender.id}
                        className="p-4 hover:bg-[var(--brand-accent)]/[0.03] transition-all group cursor-pointer border-l-2 border-transparent hover:border-[var(--brand-accent)] w-full"
                      >
                        <div className="flex items-start justify-between gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold italic text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors line-clamp-2 font-oswald uppercase tracking-wide">
                              {tender.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 truncate">
                              <span className="text-gov-label text-[var(--text-tertiary)] font-bold uppercase tracking-widest">
                                {tender.client || 'Client TBD'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {tender.value && (
                              <div className="text-sm font-mono font-bold italic text-[var(--brand-accent)]">
                                AED {(tender.value / 1000000).toFixed(1)}M
                              </div>
                            )}
                            <div
                              className="px-2 py-0.5 rounded-sm text-caption font-bold tracking-wider border"
                              style={{
                                backgroundColor: `rgba(var(--brand-accent-rgb), 0.05)`,
                                borderColor: `rgba(var(--brand-accent-rgb), 0.1)`,
                                color: probColor
                              }}
                            >
                              {probability} PROB
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOTTOM ROW: Timeline - FULL WIDTH */}
      <div className="w-full min-w-0 max-w-full box-border">
        <Card className="bg-[var(--bg-surface)] border-[var(--frame-border)] shadow-[var(--frame-shadow)] overflow-hidden w-full" padding="none">
          <CardHeader className="px-6 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-layer)]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--mce-red)]" />
                <CardTitle className="text-sm font-bold italic text-[var(--text-primary)] tracking-wide font-oswald uppercase">
                  TIMELINE VIEW
                </CardTitle>
              </div>
              {deadlines.length > 0 && (
                <Badge variant="outline" className="bg-[var(--mce-red)]/10 text-[var(--mce-red)] border-[var(--mce-red)]/20 text-xs px-2 py-0.5 font-bold italic">
                  {deadlines.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 w-full overflow-hidden">
            <DeadlineTimeline deadlines={deadlines} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
};