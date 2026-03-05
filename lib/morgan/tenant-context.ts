import { getSafeAuth } from '@/lib/auth-safe';
import { buildTenantContext, type MorganTenantContext } from './persistence';

export interface TenantResolution {
  ok: boolean;
  context: MorganTenantContext | null;
  status: number;
  error: string | null;
}

export async function resolveMorganTenantContext(request: Request, body?: any): Promise<TenantResolution> {
  const { userId, orgId } = await getSafeAuth();
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  if (!userId && !isAuthDisabled) {
    return {
      ok: false,
      context: null,
      status: 401,
      error: 'Unauthorized'
    };
  }

  const url = new URL(request.url);
  const workspaceId =
    body?.workspaceId ||
    url.searchParams.get('workspaceId') ||
    request.headers.get('x-workspace-id') ||
    orgId ||
    (isAuthDisabled ? 'local-dev' : null);

  if (!workspaceId) {
    return {
      ok: false,
      context: null,
      status: 403,
      error: 'Workspace context required'
    };
  }

  return {
    ok: true,
    context: buildTenantContext(userId || 'local-dev-user', workspaceId),
    status: 200,
    error: null
  };
}
