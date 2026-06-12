import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  return { session, userId };
}
