import { NextResponse } from 'next/server';
import { listDocumentApprovals, createDocumentApproval, getDocumentApprovalById } from '@/lib/morgan/persistence';
import { resolveMorganTenantContext } from '@/lib/morgan/tenant-context';
import { supabaseAdmin } from '@/lib/supabase';
import { generateResponse } from '@/lib/ai/gemini';

export async function GET(request: Request) {
  try {
    const tenant = await resolveMorganTenantContext(request);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });
    const items = await listDocumentApprovals(tenant.context);
    return NextResponse.json(items);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load document approvals.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let body: Record<string, unknown> = {};
    let file: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'file') {
          file = value instanceof File ? value : null;
          continue;
        }
        body[key] = typeof value === 'string' ? value : String(value);
      }
    } else {
      body = (await request.json()) ?? {};
    }

    const tenant = await resolveMorganTenantContext(request, body);
    if (!tenant.ok) return NextResponse.json({ error: tenant.error }, { status: tenant.status });

    const idempotencyKey = request.headers.get('x-idempotency-key')?.trim();
    if (idempotencyKey && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('morgan_document_approvals')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .eq('user_id', tenant.context.userId)
        .eq('workspace_id', tenant.context.workspaceId)
        .maybeSingle<{ id: string }>();

      if (data?.id) {
        const existing = await getDocumentApprovalById(data.id, tenant.context);
        if (existing) return NextResponse.json(existing, { status: 200 });
      }
    }

    const id = typeof body.id === 'string'
      ? body.id
      : `DAP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    body.id = id;
    if (idempotencyKey) body.idempotencyKey = idempotencyKey;

    if (file) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Storage is not configured.' }, { status: 500 });
      }

      const bucket = process.env.MORGAN_DOCUMENT_APPROVALS_BUCKET || 'morgan-document-approvals';
      const filePath = `${tenant.context.workspaceId}/${tenant.context.userId}/${id}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
      body.fileUrl = publicData?.publicUrl ?? filePath;
      body.fileName = file.name;

      const textCapable = file.type.startsWith('text/') ||
        ['.txt', '.md', '.csv', '.json', '.xml'].some(ext => file.name.toLowerCase().endsWith(ext));

      if (textCapable) {
        const rawText = await file.text();
        const clipped = rawText.slice(0, 6000);
        try {
          const summaryPrompt = `Summarize the following document in 3-5 bullets, focusing on intent, parties, amounts, dates, and requested action.\n\nDocument:\n${clipped}`;
          const errorPrompt = `Scan the following document for risks, inconsistencies, missing fields, or red flags. Return a concise list of issues. If none, respond "No issues detected."\n\nDocument:\n${clipped}`;
          const [aiSummary, errorFlags] = await Promise.all([
            generateResponse(summaryPrompt, ''),
            generateResponse(errorPrompt, ''),
          ]);
          body.aiSummary = aiSummary;
          body.errorFlags = errorFlags;
        } catch (aiError: any) {
          body.aiSummary = 'AI summary unavailable.';
          body.errorFlags = `AI scan failed: ${aiError?.message || 'unknown error'}`;
        }
      } else {
        body.aiSummary = 'Automated summary unavailable for this file type.';
        body.errorFlags = 'Automated scan unavailable for this file type.';
      }
    } else if (contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    const created = await createDocumentApproval(body ?? {}, tenant.context);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create document approval.' },
      { status: 500 },
    );
  }
}
