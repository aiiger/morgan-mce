import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { FileText, TrendingUp, ArrowUpRight, Users } from 'lucide-react';

interface TendersModuleProps {
  tenders?: any[];
}

export const TendersModule: React.FC<TendersModuleProps> = ({ tenders = [] }) => {
  return (
    <Card className="h-full bg-[var(--bg-surface)]/80 backdrop-blur-md border-[var(--surface-border)]" padding="none">
      <CardHeader className="px-6 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-surface)]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-[var(--text-secondary)]" />
            <CardTitle className="text-sm font-bold italic text-[var(--text-primary)]">TENDER TRACKER</CardTitle>
          </div>
          {tenders.length > 0 && (
            <Badge variant="outline" className="bg-[var(--morgan-teal)]/10 text-[var(--morgan-teal)] border-[var(--morgan-teal)]/20 text-xs px-1.5 py-0.5">
              {tenders.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-[var(--surface-border)] flex-col h-full overflow-y-auto custom-scrollbar">
        {tenders.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-tertiary)] text-xs font-bold italic opacity-50">No Active Tenders</div>
        ) : (
          tenders.map((tender, idx) => {
            const probability = tender.winProbability || tender.probability || 'Medium';
            const probColor =
              probability === 'High' ? 'var(--color-success)' :
              probability === 'Medium' ? 'var(--color-warning)' :
              'var(--color-critical)';

            return (
              <div
                key={tender.id}
                className="p-3 hover:bg-[var(--bg-hover)]/30 transition-all duration-200 group cursor-pointer relative border-l-2 border-transparent hover:border-[var(--morgan-teal)]"
              >
                {/* Trend Indicator */}
                <div className="absolute left-0 top-3 w-6 h-6 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-[var(--morgan-teal)] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="pl-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold italic text-[var(--text-primary)] group-hover:text-[var(--morgan-teal)] transition-colors line-clamp-2 leading-snug">
                        {tender.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gov-label text-[var(--text-tertiary)] uppercase tracking-wider font-oswald">
                          {tender.client}
                        </span>
                        {tender.status && (
                          <>
                            <span className="text-[var(--text-tertiary)]">•</span>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-1 h-1 rounded-full animate-pulse"
                                style={{
                                  backgroundColor: tender.status === 'Pre-Award' ? 'var(--color-success)' :
                                    tender.status === 'Tender Stage' ? 'var(--color-warning)' : 'var(--color-critical)'
                                }}
                              />
                              <span className="text-gov-label font-mono text-[var(--text-tertiary)] uppercase">
                                {tender.status}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Value Badge */}
                    {tender.value && (
                      <div className="shrink-0 px-2 py-1 rounded-md bg-[var(--bg-layer)]/50 border border-[var(--surface-border)]">
                        <div className="text-xs font-mono font-bold italic text-[var(--text-primary)] group-hover:text-[var(--morgan-teal)] transition-colors">
                          {(tender.value / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-caption text-[var(--text-tertiary)] uppercase tracking-wider">AED</div>
                      </div>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between mt-2">
                    {/* Team Avatars */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-[var(--bg-layer)] border border-[var(--surface-border)] flex items-center justify-center text-gov-label font-bold text-[var(--text-tertiary)]">
                          AB
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[var(--bg-layer)] border border-[var(--surface-border)] flex items-center justify-center text-gov-label font-bold text-[var(--text-tertiary)]">
                          MC
                        </div>
                      </div>
                      <span className="text-gov-label text-[var(--text-tertiary)] font-bold italic">+3</span>
                    </div>

                    {/* Probability Badge */}
                    <div
                      className="px-2 py-0.5 rounded-md text-gov-label font-bold tracking-wider border"
                      style={{
                        backgroundColor: `${probColor}15`,
                        borderColor: `${probColor}30`,
                        color: probColor
                      }}
                    >
                      {probability} PROB
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
