import { NextResponse } from 'next/server';

/**
 * GET /api/feedback/test
 * Calls Telegram getUpdates and returns recent chat IDs so you can
 * confirm the correct TELEGRAM_CHAT_ID value.
 *
 * Steps:
 *  1. Open Telegram and send ANY message to your bot (e.g. /start)
 *  2. Hit this endpoint in the browser: /api/feedback/test
 *  3. Copy the "id" from the "chat" object and set it as TELEGRAM_CHAT_ID
 */
export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not set' }, { status: 503 });
  }

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/getUpdates`,
  );
  const data = await res.json();

  if (!data.ok) {
    return NextResponse.json({ error: 'Telegram API error', detail: data }, { status: 502 });
  }

  // Extract unique chats from updates for easy reading
  const chats = Object.values(
    (data.result as Array<{ message?: { chat: { id: number; first_name?: string; username?: string; type: string } } }>)
      .flatMap((u) => (u.message ? [u.message.chat] : []))
      .reduce<Record<number, { id: number; first_name?: string; username?: string; type: string }>>((acc, chat) => {
        acc[chat.id] = chat;
        return acc;
      }, {}),
  );

  return NextResponse.json({
    hint: 'Copy the "id" of your chat and set it as TELEGRAM_CHAT_ID in .env.local',
    chats,
    rawUpdates: data.result,
  });
}

