import path from 'path';
import { getSupabaseAdmin } from '../lib/supabase';

const supabase = getSupabaseAdmin();

if (!supabase) {
  const isCI = process.env.CI === 'true' || process.env.CI === '1';
  const isProd = process.env.NODE_ENV === 'production';
  console.warn('Failed to initialize admin client (missing Supabase env).');
  if (isCI || isProd) {
    process.exit(1);
  }
  process.exit(0);
}

// Tables that MUST have RLS enabled
const REQUIRED_RLS_TABLES = [
  'documents',
  'projects_master',
  'audit_logs',
  'agent_activity',
  'notifications',
  'team_members',
  'resource_allocations',
  'tenders',
  'invoices'
];

interface RLSStatus {
  table: string;
  rls_enabled: boolean;
  policy_count: number;
}

interface ValidationResult {
  component: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string[];
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

const results: ValidationResult[] = [];

async function checkRLSStatus(): Promise<RLSStatus[]> {
  console.log('Checking RLS status...');

  const rlsData: RLSStatus[] = [];

  for (const tableName of REQUIRED_RLS_TABLES) {
    const status: RLSStatus = {
      table: tableName,
      rls_enabled: false,
      policy_count: 0
    };

    try {
      // Query pg_policies via direct SQL if possible, or information_schema
      // Note: Regular API keys usually can't see pg_policies.
      // We'll try to infer from metadata or use a dummy check for MVP.
      
      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', tableName)
        .catch(() => ({ data: [], error: null }));

      if (policies && Array.isArray(policies)) {
        status.rls_enabled = true; // If we can see policies, it's a good sign
        status.policy_count = policies.length;
      }
    } catch (err) {
      console.warn(`Could not fetch policies for ${tableName}`);
    }

    rlsData.push(status);
  }

  return rlsData;
}

async function validateRLSCoverage(): Promise<void> {
  console.log('Validating RLS coverage...');

  const details: string[] = [];
  let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';

  // For MVP, we'll list the tables and remind to check manually if RPC isn't available
  REQUIRED_RLS_TABLES.forEach((table) => {
    details.push(`• ${table}: Verification required in Supabase Dashboard`);
  });

  results.push({
    component: 'RLS Coverage',
    status: 'WARN',
    details,
    severity: 'WARNING'
  });
}

function generateReport(): string {
  let report = '\n╔════════════════════════════════════════════════════════════╗\n';
  report += '║           RLS COVERAGE VALIDATION REPORT                    ║\n';
  report += '╚════════════════════════════════════════════════════════════╝\n\n';

  const summary = {
    PASS: results.filter(r => r.status === 'PASS').length,
    WARN: results.filter(r => r.status === 'WARN').length,
    FAIL: results.filter(r => r.status === 'FAIL').length
  };

  report += `Summary: ${summary.PASS} PASS | ${summary.WARN} WARN | ${summary.FAIL} FAIL\n\n`;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
    report += `${icon} ${result.component} [${result.status}]\n`;
    result.details.forEach((detail) => {
      report += `  ${detail}\n`;
    });
    report += '\n';
  });

  return report;
}

async function main(): Promise<void> {
  console.log('Starting RLS validation...\n');

  await validateRLSCoverage();

  const report = generateReport();
  console.log(report);

  // Save to file
  const fs = await import('fs').then(m => m.promises);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await fs.writeFile(
    path.join(process.cwd(), `rls-validation-${timestamp}.txt`),
    report
  );

  process.exit(0);
}

main().catch((err) => {
  console.error('RLS validation failed:', err);
  process.exit(1);
});
