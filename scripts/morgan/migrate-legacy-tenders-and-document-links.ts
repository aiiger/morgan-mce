 import path from 'path';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
dotenv.config({ quiet: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const WORKSPACE_ID = 'default';

type LegacyTender = {
  id: string;
  title?: string | null;
  value?: number | string | null;
  value_amount?: number | string | null;
  status?: string | null;
  deadline?: string | null;
  owner_user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type LegacyDocument = {
  id: string;
  title?: string | null;
  category?: string | null;
};

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function toNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeTitle(value?: string | null): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function toMorganStatus(status?: string | null): string {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'submitted' || s === 'awarded' || s === 'won') return 'Active';
  if (s === 'lost' || s === 'cancelled') return 'Inactive';
  return 'Active';
}

async function tableExists(client: SupabaseClient, table: string): Promise<boolean> {
  const { error } = await (client as any).from(table).select('*').limit(1);
  return !error;
}

async function run() {
  const supabase = getClient();
  if (!supabase) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  const [hasLegacyTenders, hasLegacyDocuments, hasMorganTenders, hasLinkTable] = await Promise.all([
    tableExists(supabase, 'tenders'),
    tableExists(supabase, 'documents'),
    tableExists(supabase, 'morgan_tenders'),
    tableExists(supabase, 'morgan_tender_document_links')
  ]);

  if (!hasMorganTenders) {
    throw new Error('morgan_tenders table is missing. Apply Morgan persistence migration first.');
  }

  if (!hasLegacyTenders) {
    console.log('Legacy table tenders not found. Skipping legacy tender consolidation.');
    return;
  }

  const { data: legacyTenders, error: tendersError } = await (supabase as any)
    .from('tenders')
    .select('id,title,value,value_amount,status,deadline,owner_user_id,created_at,updated_at');

  if (tendersError) {
    throw new Error(`Failed to read legacy tenders: ${tendersError.message}`);
  }

  const tenders = (legacyTenders || []) as LegacyTender[];

  const mappedMorganRows = tenders.map((tender) => {
    const userId = tender.owner_user_id || 'public';
    const value = toNumber(tender.value_amount, toNumber(tender.value, 0));

    return {
      id: `LEGACY-${tender.id}`,
      user_id: userId,
      workspace_id: WORKSPACE_ID,
      name: tender.title || 'Legacy Tender',
      value,
      status: toMorganStatus(tender.status),
      compliance: 0,
      deadline_at: tender.deadline || null,
      owner: userId,
      created_at: tender.created_at || new Date().toISOString(),
      updated_at: tender.updated_at || new Date().toISOString()
    };
  });

  if (mappedMorganRows.length) {
    const { error: upsertMorganError } = await (supabase as any)
      .from('morgan_tenders')
      .upsert(mappedMorganRows, { onConflict: 'id' });

    if (upsertMorganError) {
      throw new Error(`Failed to upsert morgan_tenders: ${upsertMorganError.message}`);
    }
  }

  let linksCreated = 0;

  if (hasLegacyDocuments && hasLinkTable) {
    const { data: docs, error: docsError } = await (supabase as any)
      .from('documents')
      .select('id,title,category')
      .in('category', ['CONTRACT', 'TENDER']);

    if (docsError) {
      throw new Error(`Failed to read documents: ${docsError.message}`);
    }

    const documents = (docs || []) as LegacyDocument[];

    const tenderByTitle = new Map<string, LegacyTender>();
    for (const tender of tenders) {
      const key = normalizeTitle(tender.title);
      if (key && !tenderByTitle.has(key)) {
        tenderByTitle.set(key, tender);
      }
    }

    const linkRows = documents.map((doc) => {
      const matched = tenderByTitle.get(normalizeTitle(doc.title));
      const userId = matched?.owner_user_id || 'public';
      return {
        document_id: doc.id,
        legacy_tender_id: matched?.id || null,
        morgan_tender_id: matched?.id ? `LEGACY-${matched.id}` : null,
        user_id: userId,
        workspace_id: WORKSPACE_ID,
        link_reason: matched ? 'title_match' : 'unmatched_document',
        source_title: doc.title || null
      };
    });

    if (linkRows.length) {
      const { error: linkUpsertError } = await (supabase as any)
        .from('morgan_tender_document_links')
        .upsert(linkRows, { onConflict: 'document_id,user_id,workspace_id' });

      if (linkUpsertError) {
        throw new Error(`Failed to upsert morgan_tender_document_links: ${linkUpsertError.message}`);
      }

      linksCreated = linkRows.length;
    }
  } else {
    if (!hasLegacyDocuments) {
      console.log('Legacy table documents not found. Skipping document-to-tender linking.');
    }
    if (!hasLinkTable) {
      console.log('morgan_tender_document_links table not found. Apply 20260301_morgan_legacy_consolidation.sql to enable contract linkage migration.');
    }
  }

  console.log(`Legacy consolidation complete. migrated_tenders=${mappedMorganRows.length}, document_links_processed=${linksCreated}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
