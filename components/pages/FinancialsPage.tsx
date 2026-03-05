import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ProjectionPulse } from '../dashboard/ProjectionPulse';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { InvoiceForm } from '../forms/InvoiceForm';
import { safeExportToCSV } from '../../utils/exportUtils';
import { DollarSign, FileText, Plus, Search, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';
import { GovernanceTable } from '../governance/GovernanceTable';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Badge } from '../ui/Badge';
import { Box, Text } from '../../components/primitives';
import { cn } from '@/lib/utils';

interface FinancialsPageProps {
   projects: any[];
   onRefresh: () => void;
   onNavigate?: (view: string) => void;
   onSelectProject?: (id: string | null) => void;
   loading?: boolean;
}

/**
 * FinancialsPage - HARMONIZED 2026 (GOLDEN STATE)
 * Fiscal Governance | Pantone Precision | Blue Frame Integration
 */
export const FinancialsPage: React.FC<FinancialsPageProps> = ({
   projects,
   onRefresh,
   onNavigate,
   onSelectProject,
   loading: globalLoading = false
}) => {
   const { purchaseOrders } = useDashboardData();
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [invoices, setInvoices] = useState<any[]>([]);
   const [localLoading, setLocalLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('LEDGER');

   const isLoading = globalLoading || localLoading;

   React.useEffect(() => {
      const fetchInvoices = async () => {
         setLocalLoading(true);
         try {
            const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
            if (data) setInvoices(data);
         } catch (err) {
            console.error('Invoice fetch exception:', err);
         } finally {
            setLocalLoading(false);
         }
      };
      fetchInvoices();
   }, []);

   const safeInvoices = useMemo(() => Array.isArray(invoices) ? invoices : [], [invoices]);
   const safeProjects = useMemo(() => Array.isArray(projects) ? projects : [], [projects]);
   const safePOs = useMemo(() => Array.isArray(purchaseOrders) ? purchaseOrders : [], [purchaseOrders]);

   const stats = useMemo(() => ({
      revenue: safeInvoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? Number(inv.amount || 0) : 0), 0),
      receivables: safeInvoices.reduce((sum, inv) => sum + (inv.status !== 'Paid' ? Number(inv.amount || 0) : 0), 0),
      portfolio: safeProjects.reduce((sum, p) => sum + (Number(p.contract_value_excl_vat || 0)), 0),
      burn: safeInvoices.length > 0 ? Number(((safeInvoices.reduce((s, inv) => s + Number(inv.amount || 0), 0) / safeProjects.reduce((s, p) => s + Number(p.contract_value_excl_vat || 1), 1)) * 100).toFixed(1)) : 0
   }), [safeInvoices, safeProjects]);

   const combinedLedger = useMemo(() => {
      const data = [
         ...safeInvoices.map(inv => ({
            id: inv.id,
            type: 'INVOICE',
            identification: inv.invoice_number,
            value: Number(inv.amount || 0),
            status: inv.status,
            date: inv.due_date,
            client: inv.client_name || 'MCE INTERNAL',
            project_code: inv.project_code || 'N/A'
         })),
         ...safeProjects.map(p => ({
            id: p.id,
            type: 'PROJECT',
            identification: p.project_name,
            value: Number(p.contract_value_excl_vat || 0),
            status: p.project_status,
            date: p.project_completion_date_planned,
            client: p.client_name,
            project_code: p.project_code
         }))
      ];
      return data.sort((a, b) => {
         const aDate = a.date ? new Date(a.date).getTime() : Infinity;
         const bDate = b.date ? new Date(b.date).getTime() : Infinity;
         return aDate - bDate;
      }).filter(item =>
         item.identification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.client?.toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [safeInvoices, safeProjects, searchQuery]);

   const columns = [
      {
         header: 'FISCAL IDENTITY',
         width: '40%',
         accessor: (item: any) => (
            <Box className="flex items-center gap-4 min-w-0">
               <Box className="w-8 h-8 bg-[var(--bg-layer)] border border-[var(--surface-border)] rounded flex items-center justify-center text-[var(--brand-accent)] shrink-0">
                  {item.type === 'INVOICE' ? <FileText size={14} /> : <DollarSign size={14} />}
               </Box>
               <Box className="min-w-0 flex flex-col">
                  <Text className="truncate text-gov-body font-oswald font-bold italic text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--brand-accent)] transition-colors">
                     {item.identification}
                  </Text>
                  <Text className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">
                     {item.client} • {item.project_code}
                  </Text>
               </Box>
            </Box>
         )
      },
      {
         header: 'SETTLEMENT',
         width: '20%',
         align: 'center' as const,
         accessor: (item: any) => {
            const dateStr = item.date;
            const daysLeft = dateStr ? Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            return (
               <Box className="flex flex-col items-center">
                  <Text className={cn(
                     "text-gov-body font-bold font-oswald italic",
                     item.status === 'Paid' ? "text-emerald-500" : (daysLeft !== null && daysLeft < 0 ? "text-[var(--mce-red)]" : "text-[var(--brand-accent)]")
                  )}>
                     {item.status === 'Paid' ? 'CLOSED' : (daysLeft !== null ? `${daysLeft}D` : '--')}
                  </Text>
                  <Text className="text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] opacity-40">Countdown</Text>
               </Box>
            )
         }
      },
      {
         header: 'LITIGATION_RISK',
         width: '20%',
         align: 'center' as const,
         accessor: (item: any) => (
            <Badge 
               variant={item.status === 'Paid' || item.status === 'Active' ? 'success' : 'outline'} 
               className="text-gov-label px-3 py-1 font-bold tracking-widest"
            >
               {item.status || 'PENDING'}
            </Badge>
         )
      },
      {
         header: 'VALUATION',
         width: '20%',
         align: 'right' as const,
         accessor: (item: any) => (
            <Box className="flex flex-col items-end">
               <Box className="flex items-baseline gap-1">
                  <Text className="text-gov-label font-bold italic text-[var(--brand-accent)] opacity-40">AED</Text>
                  <Text className="text-gov-body font-bold font-oswald italic text-[var(--brand-accent)]">
                     {((item.value || 0) / 1000000).toFixed(1)}M
                  </Text>
               </Box>
               <Text className="text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] opacity-60 italic">
                  {item.type} ENTRY
               </Text>
            </Box>
         )
      }
   ];

   const forecastData = [
      { month: 'Feb', confirmed: 480000 },
      { month: 'Mar', confirmed: 720000 },
      { month: 'Apr', confirmed: 1100000 },
      { month: 'May', confirmed: 1250000 },
      { month: 'Jun', confirmed: 950000 },
   ];

   return (
      <DashboardFrame
         title="Financial Command"
         loading={isLoading}
         metrics={
            <>
               <MetricBlock label="Asset Value" value={stats.portfolio} isCurrency trend={{ value: 8.4, type: 'up' }} />
               <MetricBlock label="Verified Revenue" value={stats.revenue} isCurrency trend={{ value: 15.2, type: 'up' }} />
               <MetricBlock label="Receivables" value={stats.receivables} isCurrency status="warning" />
               <MetricBlock label="Operational Burn" value={stats.burn} isCurrency trend={{ value: 2.1, type: 'down' }} />
            </>
         }
         tabs={
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1 bg-[var(--bg-layer)]/40 rounded-xl border border-[var(--surface-border)]">
               <Box className="flex items-center gap-2">
                  {[
                     { id: 'LEDGER', label: 'Fiscal Ledger' },
                     { id: 'FORECAST', label: 'Capital Forecast' }
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                           "px-6 py-2.5 rounded-lg transition-all duration-300 group",
                           activeTab === tab.id
                              ? 'bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border-strong)]'
                              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/40 border border-transparent'
                        )}
                     >
                        <Text variant="gov-header" className={cn(
                           "text-caption font-bold tracking-[0.1em] transition-all",
                           activeTab === tab.id ? "scale-105 text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                        )}>
                           {tab.label}
                        </Text>
                     </button>
                  ))}
               </Box>

               <div className="flex items-center gap-3 pr-2">
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-accent)] transition-colors" size={14} />
                     <input
                        type="text"
                        placeholder="FISCAL QUERY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-[var(--surface-border)] rounded-lg pl-9 pr-4 py-2 text-caption font-bold italic font-oswald text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--brand-accent)]/30 transition-all placeholder:text-[var(--text-tertiary)]/40"
                     />
                  </div>
                  <button onClick={() => safeExportToCSV(combinedLedger, 'MCE_Fiscal_Ledger')} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--brand-accent)] transition-colors">
                     <Download size={16} />
                  </button>
                  <GlassButton onClick={() => setIsFormOpen(true)} className="px-4 py-2 rounded-lg text-gov-label font-bold tracking-widest bg-[var(--brand-accent)] text-white hover:opacity-90">
                     <Plus size={14} className="mr-2" /> Register Entry
                  </GlassButton>
               </div>
            </div>
         }
      >
         {isFormOpen && <InvoiceForm projects={projects} onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}

         <div className="flex flex-col lg:grid lg:grid-cols-3 gap-0 h-full divide-x divide-[var(--surface-border)] bg-[var(--bg-surface)]">
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
               <div className="px-8 py-3 border-b border-[var(--surface-border)] bg-[var(--bg-layer)]/30 flex items-center">
                  <TrendingUp size={12} className="text-[var(--brand-accent)] mr-2" />
                  <span className="text-caption font-bold italic font-oswald text-[var(--text-tertiary)] uppercase tracking-widest">Unified Fiscal Ledger • Verified Records</span>
               </div>
               <div className="flex-1 overflow-hidden">
                  {combinedLedger.length > 0 ? (
                     <GovernanceTable 
                        data={combinedLedger} 
                        columns={columns} 
                        headerClassName="bg-[var(--brand-accent)] text-white border-none shadow-md"
                        onRowClick={(item) => item.type === 'PROJECT' && onSelectProject?.(item.id)} 
                     />
                  ) : (
                     <div className="p-12">
                        <EmptyState
                           icon={DollarSign}
                           title="Fiscal Set Null"
                           description="No transaction artifacts or valuation nodes detected in current ledger view."
                           action={{
                              label: "Register Entry",
                              onClick: () => setIsFormOpen(true)
                           }}
                        />
                     </div>
                  )}
               </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
               {/* Iron Dome POs */}
               {safePOs.length > 0 && (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-1">
                        <h3 className="text-caption font-bold italic font-oswald text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Purchase Order Control</h3>
                        <span className="text-gov-label font-mono font-bold text-[var(--brand-accent)]">{safePOs.length} ACTIVE</span>
                     </div>
                     <div className="grid grid-cols-1 gap-3">
                        {safePOs.map(po => (
                           <div key={po.id} className={cn(
                              "p-4 rounded-xl border transition-all duration-300 bg-white shadow-sm",
                              po.remaining_balance < 0 ? "border-[var(--mce-red)] shadow-[0_0_15px_rgba(194,23,25,0.1)]" : "border-[var(--surface-border)] hover:border-[var(--brand-accent)]/30"
                           )}>
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-gov-label font-bold text-[var(--text-tertiary)] font-mono tracking-tighter opacity-60">{po.po_number}</span>
                                 {po.remaining_balance < 0 && <AlertCircle size={12} className="text-[var(--mce-red)] animate-pulse" />}
                              </div>
                              <h4 className="text-gov-label font-bold italic font-oswald text-[var(--text-primary)] uppercase truncate mb-2">{po.vendor_name}</h4>
                              <div className="flex justify-between items-baseline pt-2 border-t border-[var(--surface-border)]/50">
                                 <span className="text-caption font-bold text-[var(--text-tertiary)] uppercase">Remaining Balance</span>
                                 <span className={cn(
                                    "text-xs font-bold font-mono italic",
                                    po.remaining_balance < 0 ? "text-[var(--mce-red)]" : "text-emerald-600"
                                 )}>AED {Number(po.remaining_balance).toLocaleString()}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Projection Chart */}
               <div className="pt-6 border-t border-[var(--surface-border)]">
                  <ProjectionPulse
                     data={forecastData.map(d => ({ month: d.month, value: d.confirmed }))}
                     trend={12.4}
                     insight="Fiscal engine identifies maturing assets. Revenue yield projected at"
                  />
               </div>
            </div>
         </div>
      </DashboardFrame>
   );
};