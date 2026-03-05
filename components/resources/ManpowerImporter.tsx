'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertTriangle, FileText, Terminal, Play } from 'lucide-react';
import Papa from 'papaparse';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '@/lib/toast-context';
import { logger } from '@/lib/logger';

interface ImportRow {
  name: string;
  email?: string;
  role: string;
  department?: string;
  skills?: string;
  allocation_percent?: string;
  project_name?: string;
}

export default function ManpowerImporter() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'importing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const toast = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogs([`Initializing parser for: ${file.name}`]);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportData(results.data as ImportRow[]);
        setImportStatus('preview');
        setLogs(prev => [...prev, `✅ Parsing complete. Detected ${results.data.length} records.`]);
        toast.info("CSV Parsed", `Ready to import ${results.data.length} personnel nodes.`);
      },
      error: (err) => {
        logger.error('CSV_PARSE_ERROR', err);
        setImportStatus('error');
        toast.error("Parsing Failed", err.message);
      }
    });
  };

  const handleStartImport = async () => {
    setImportStatus('importing');
    setLogs(prev => [...prev, `Starting bulk ingestion...`]);
    
    let success = 0;
    let failed = 0;

    for (const row of importData) {
      try {
        const res = await fetch('/api/morgan/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            email: row.email,
            role: row.role,
            department: row.department,
            skills: row.skills ? row.skills.split(',').map(s => s.trim()) : [],
            allocation_percent: row.allocation_percent ? Number(row.allocation_percent) : null,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        success++;
        setLogs(prev => [`[IMPORT] ✅ Node synchronized: ${row.name}`, ...prev.slice(0, 10)]);
      } catch (err) {
        failed++;
        setLogs(prev => [`[ERROR] ❌ Failed to bind node: ${row.name}`, ...prev.slice(0, 10)]);
      }
    }

    setImportStatus('success');
    toast.success("Import Complete", `${success} nodes successfully synchronized with the registry.`);
    setLogs(prev => [`🎉 FINAL_STATUS: ${success} Success, ${failed} Failed`, ...prev]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card variant="matte" padding="none">
        <CardHeader className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload size={20} className="text-brand-500" />
            <CardTitle>Manpower Ingestion Gate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div 
            onClick={() => fileInput.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-brand-500/30 hover:bg-bg-surface transition-all cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInput} 
              className="hidden" 
              accept=".csv" 
              onChange={handleFileUpload} 
            />
            <FileText size={48} className="mx-auto mb-4 text-gray-700 group-hover:text-brand-500 transition-colors" />
            <h4 className="text-sm font-bold italic text-gray-700 tracking-tight">Drop Manpower CSV</h4>
            <p className="text-caption font-mono text-gray-500 mt-2">Maximum payload: 10MB • Format: UTF-8</p>
          </div>

          {(importStatus === 'preview' || importStatus === 'importing') && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-bg-surface border border-gray-200 rounded-xl">
                <span className="text-gov-label font-bold italic text-gray-500 tracking-widest block mb-2">Payload Preview</span>
                <div className="max-h-[200px] overflow-auto text-caption font-mono text-gray-500">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="pb-2">NAME</th>
                        <th className="pb-2">ROLE</th>
                        <th className="pb-2">DEPT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="py-1">{row.name}</td>
                          <td className="py-1">{row.role}</td>
                          <td className="py-1">{row.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importData.length > 5 && (
                    <div className="pt-2 text-gray-700">... and {importData.length - 5} more records</div>
                  )}
                </div>
              </div>
              
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={handleStartImport}
                loading={importStatus === 'importing'}
                disabled={importStatus === 'importing'}
              >
                <Play size={14} className="mr-2" /> {importStatus === 'importing' ? 'Ingesting...' : 'Start Neural Binding'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" padding="none">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-emerald-500" />
            <CardTitle className="text-xs">Activity Stream</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gray-50 font-mono text-caption p-6 h-[450px] overflow-auto space-y-1 text-gray-500">
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} className={log.includes('❌') ? 'text-rose-500' : log.includes('✅') ? 'text-emerald-500' : ''}>
                {log}
              </div>
            )) : (
              <div className="italic text-zinc-800">AWAITING_PAYLOAD...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
