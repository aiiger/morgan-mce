import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

// Clerk sends webhooks to notify us of user lifecycle events.
// We sync user data into todo_users so we have a local profile row.

export async function POST(request: NextRequest) {
  const payload = await request.json() as {
    type: string;
    data: {
      id: string;
      email_addresses?: { email_address: string; verification?: { status: string } }[];
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
  };

  const supabase = createClient();
  const { type, data } = payload;

  if (type === 'user.created' || type === 'user.updated') {
    const primaryEmail = data.email_addresses?.[0];

    if (!primaryEmail) {
      return NextResponse.json({ error: 'No email on user' }, { status: 400 });
    }

    await supabase.from('todo_users').upsert({
      id: data.id,
      email: primaryEmail.email_address,
      email_verified: primaryEmail.verification?.status === 'verified',
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      profile_picture_url: data.profile_image_url ?? null,
    });
  }

  if (type === 'user.deleted') {
    // Cascade deletes handle tasks, categories, etc. via FK constraints
    await supabase.from('todo_users').delete().eq('id', data.id);
  }

  return NextResponse.json({ received: true });
}
