import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';

/** GET /api/telegram/link — check whether the current user has a linked Telegram account. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false, linked: false });
  }
  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();
  return NextResponse.json({ authenticated: true, linked: !!user?.telegramChatId });
}

/** POST /api/telegram/link — generate a 10-minute deep-link token for account linking. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return NextResponse.json({ error: 'Bot not configured' }, { status: 503 });
  }

  await connectToDatabase();
  const token = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await User.findByIdAndUpdate(session.user.id, {
    telegramLinkToken: token,
    telegramLinkTokenExpires: expires,
  });

  const deepLink = `https://t.me/${botUsername}?start=${token}`;
  return NextResponse.json({ deepLink });
}

/** DELETE /api/telegram/link — remove the Telegram link for the current user. */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectToDatabase();
  await User.findByIdAndUpdate(session.user.id, {
    telegramChatId: null,
    telegramLinkToken: null,
    telegramLinkTokenExpires: null,
  });
  return NextResponse.json({ ok: true });
}

