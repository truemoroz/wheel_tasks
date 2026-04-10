import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'Telegram is not configured' }, { status: 503 });
  }

  const text = [
    '💬 <b>New proposal from Wheel of Life</b>',
    name?.trim() ? `👤 <b>From:</b> ${name.trim()}` : null,
    '',
    message.trim(),
  ]
    .filter((line) => line !== null)
    .join('\n');

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    },
  );

  if (!res.ok) {
    const body = await res.json();
    console.error('Telegram API error:', JSON.stringify(body, null, 2));
    console.error(
      'Hint: Make sure you have sent at least one message to your bot in Telegram first.',
      'Then visit /api/feedback/test to find the correct chat_id.',
    );
    return NextResponse.json({ error: 'Failed to send message', detail: body }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

