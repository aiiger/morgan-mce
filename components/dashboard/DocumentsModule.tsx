import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { Badge } from '../ui/Badge';
import { FileText, ChevronDown, Check, SlidersHorizontal, MoreHorizontal, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';


interface DocumentsModuleProps {
  documents: DocumentItem[];
  loading: boolean;
  onRefresh: () => void;
}

type SortOption = 'newest' | 'oldest' | 'type';

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ documents, loading, onRefresh }) => {
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReview = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/documents/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reviewed' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to mark document reviewed');
      }

      onRefresh(); // Trigger re-fetch
    } catch (error) {
      console.error('Failed to review document:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getSortValue = (doc: DocumentItem) => {
    return new Date(doc.created_at).getTime();
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortOrder === 'type') {
      return a.type.localeCompare(b.type);
    }

    const timeA = getSortValue(a);
    const timeB = getSortValue(b);

    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <Card className="motion-entry" padding="none">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gray-500" />
          <CardTitle>Recent Document Flow</CardTitle>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center space-x-2 text-xs font-bold italic text-gray-500 hover:text-gray-600 transition-colors"
            >
              <SlidersHorizontal size={10} />
              <span>Ordering</span>
              <ChevronDown size={10} />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface-base)] rounded border border-[var(--surface-border)] z-20 py-1 overflow-hidden shadow-2xl">
                  <div className="px-3 py-2 text-xs font-bold italic text-gray-500 bg-[var(--surface-layer)]">
                    Sequence Order
                  </div>
                  {[
                    { id: 'newest', label: 'Chronological: Newest' },
                    { id: 'oldest', label: 'Chronological: Oldest' },
                    { id: 'type', label: 'Categorical' },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortOrder(option.id as SortOption);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[var(--surface-layer)] transition-colors ${sortOrder === option.id ? 'text-gray-900 font-bold italic bg-[var(--surface-layer)]' : 'text-gray-600 font-bold italic'
                        }`}
                    >
                      <span className="uppercase">{option.label}</span>
                      {sortOrder === option.id && <Check size={10} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="h-3 w-[1px] bg-[var(--surface-border)]" />
          <button className="text-xs text-gray-500 hover:text-gray-700 font-bold italic transition-colors">
            Expand Flow
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-[var(--surface-border)]">
        {loading && documents.length === 0 ? (
          <div className="p-12 flex justify-center">
            <Loader2 size={16} className="animate-spin text-[var(--color-info)]" />
          </div>
        ) : sortedDocuments.map(doc => (
          <div
            key={doc.id}
            className="px-8 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group cursor-pointer"
          >
            <div className="flex items-start space-x-5">
              <div className={`p-2 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] ${doc.type === 'COMPLIANCE' ? 'text-[var(--color-warning)]' :
                doc.type === 'CONTRACT' ? 'text-gray-500' :
                  doc.type === 'INVOICE' ? 'text-[var(--color-success)]' :
                    'text-gray-700'
                }`}>
                <FileText size={14} />
              </div>
              <div>
                <h4 className="text-gov-body font-bold italic text-gray-900 group-hover:text-[var(--brand-accent)] transition-colors tracking-tight font-brand">{doc.title}</h4>
                <div className="flex items-center space-x-3 mt-1.5 font-brand">
                  <span className="text-xs font-bold italic text-gray-500">
                    {doc.type}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--surface-border)]"></span>
                  <span className="text-xs text-gray-500 font-bold italic tabular-nums font-mono">{doc.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {doc.status === 'Review' ? (
                <button
                  onClick={() => handleReview(doc.id)}
                  disabled={processingId === doc.id}
                  className="text-xs bg-[var(--brand-accent)] text-white px-3 py-1 rounded-sm font-bold italic hover:opacity-90 transition-all disabled:opacity-50 shadow-lg font-brand"
                >
                  {processingId === doc.id && <Loader2 size={10} className="animate-spin mr-1.5" />}
                  Determination
                </button>
              ) : (
                <Badge status={doc.status}>{doc.status}</Badge>
              )}
              <button className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
        {!loading && sortedDocuments.length === 0 && (
          <div className="p-8 text-center text-gray-400 font-bold italic text-xs bg-gray-100">
            [NULL-SET] / NO ACTIVE SIGNALS
          </div>
        )}
      </CardContent>
    </Card>
  );
};


