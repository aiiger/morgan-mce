import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Easy-mode fix for Vercel "MIDDLEWARE_INVOCATION_FAILED":
// If Clerk isn't configured in this environment (missing env vars), do not run Clerk middleware.
// This matches existing app behavior (Providers renders without ClerkProvider when key missing).
const isClerkConfigured = Boolean(
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '').trim() &&
  (process.env.CLERK_SECRET_KEY ?? '').trim()
);

const isDev = process.env.NODE_ENV === 'development';
const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

const ALLOWED_EMAIL = 'mkhalil024@gmail.com';

// Define public routes that do not require authentication.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',

  // Webhooks must be reachable without auth
  '/api/webhooks(.*)',

  // Health / diagnostics endpoints must return JSON to CLI probes
  '/api/health',
  '/api/ai/ready',
  '/api/ai/health',
  '/api/ai/version',
  
  // Backdoor for stress testing
  '/api/stress-test',
]);

const adminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

const executiveRoute = createRouteMatcher([
  '/agents(.*)',
  '/cockpit(.*)',
  '/api/morgan/automations(.*)',
  '/api/morgan/automation(.*)',
]);

const tierScore = (claims: unknown) => {
  const c = (claims ?? {}) as Record<string, any>;
  const metadata = (c.metadata ?? c.public_metadata ?? {}) as Record<string, any>;
  const explicitTier = String(metadata.tier ?? c.tier ?? '').toUpperCase();
  const explicitRole = String(metadata.role ?? c.role ?? '').toLowerCase();

  if (explicitTier === 'L4' || explicitRole === 'super_admin') return 4;
  if (explicitTier === 'L3' || explicitRole === 'manager') return 3;
  if (explicitTier === 'L2' || explicitRole === 'agent') return 2;
  if (explicitTier === 'L1' || explicitRole === 'viewer') return 1;
  return 1;
};

const ensureTier = (requiredTier: number, currentTier: number) => currentTier >= requiredTier;

const configuredMiddleware = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req) || isAuthDisabled) return;

  await auth.protect();
  const { sessionClaims, userId } = await auth();

  // Hard lock to a single user for initial deployment
  if (userId) {
    let email = '';
    // if email is in sessionClaims, use it
    if (sessionClaims && (sessionClaims as any).email) {
      email = (sessionClaims as any).email;
    } else {
      try {
        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        email = user.emailAddresses.find((e: any) => e.id === user.primaryEmailAddressId)?.emailAddress || '';
      } catch (e) {
        console.error('Failed to fetch user email in middleware', e);
      }
    }

    if (email && email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
      }
      return new NextResponse('<h1>Access Denied</h1><p>This application is currently restricted.</p>', {
        status: 403,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }

  const currentTier = tierScore(sessionClaims);

  if (adminRoute(req) && !ensureTier(4, currentTier)) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Insufficient tier: L4 required.' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (executiveRoute(req) && !ensureTier(3, currentTier)) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Insufficient tier: L3 required.' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // All authenticated users (L1+) can create, edit, and delete.
  // The tier system only gates admin (L4) and executive/automation (L3) routes above.
});

const failClosedMiddleware = (req: NextRequest) => {
  if (isPublicRoute(req) || isAuthDisabled) return;
  if (isDev) return;

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Authentication is not configured for this environment.' },
      { status: 503 }
    );
  }

  return new NextResponse('Authentication is not configured for this environment.', { status: 503 });
};

export default isClerkConfigured ? configuredMiddleware : failClosedMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
