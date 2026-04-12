import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getHydratedSpheres, FrontendTask } from '@/lib/taskHelpers';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendMessage(chatId: number | string, text: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}

function parseCommand(text: string) {
  const parts = text.trim().split(/\s+/);
  const command = parts[0].toLowerCase().split('@')[0];
  return { command, args: parts.slice(1) };
}

const HELP_TEXT = [
  '🌐 <b>Wheel of Life Bot</b>',
  '',
  'Available commands:',
  '/spheres — show your life spheres with ratings',
  '/tasks   — show your active (incomplete) tasks',
  '/goals   — show your goals',
  '/help    — show this message',
].join('\n');

const UNLINKED_TEXT = [
  '🔗 Your Telegram account is not linked yet.',
  '',
  'Open the Wheel of Life app → click the 💬 button → go to the <b>My Bot</b> tab → click <b>Link Telegram Account</b>.',
].join('\n');

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const header = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (header !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  let update: { message?: { chat: { id: number }; text?: string } };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = update?.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const { command, args } = parseCommand(message.text);

  await connectToDatabase();

  // /start [token] — welcome or link account
  if (command === '/start') {
    const token = args[0];
    if (!token) {
      await sendMessage(chatId, HELP_TEXT);
      return NextResponse.json({ ok: true });
    }

    const user = await User.findOne({
      telegramLinkToken: token,
      telegramLinkTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      await sendMessage(chatId, '❌ This link is invalid or has expired. Please generate a new one from the app.');
      return NextResponse.json({ ok: true });
    }

    user.telegramChatId = chatId.toString();
    user.telegramLinkToken = undefined;
    user.telegramLinkTokenExpires = undefined;
    await user.save();

    await sendMessage(chatId, [
      '✅ <b>Account linked!</b>',
      '',
      'You can now use:',
      '/spheres — your life spheres',
      '/tasks   — your active tasks',
      '/goals   — your goals',
      '/help    — show all commands',
    ].join('\n'));
    return NextResponse.json({ ok: true });
  }

  // /help
  if (command === '/help') {
    await sendMessage(chatId, HELP_TEXT);
    return NextResponse.json({ ok: true });
  }

  // Remaining commands require a linked account
  const user = await User.findOne({ telegramChatId: chatId.toString() });
  if (!user) {
    await sendMessage(chatId, UNLINKED_TEXT);
    return NextResponse.json({ ok: true });
  }

  const userId = (user._id as { toString(): string }).toString();
  const spheres = await getHydratedSpheres(userId);

  // /spheres
  if (command === '/spheres') {
    if (!spheres.length) {
      await sendMessage(chatId, '🌐 No spheres found. Open the app to set up your Wheel of Life.');
      return NextResponse.json({ ok: true });
    }

    const lines = ['🌐 <b>Your Wheel of Life</b>', ''];
    for (const sphere of spheres) {
      const filled = Math.min(10, Math.max(0, Math.round(sphere.rating)));
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
      lines.push(`<b>${escHtml(sphere.name)}</b>  <code>${bar}</code>  ${sphere.rating}/10`);
      const goalCount = (sphere.goals as unknown[])?.length ?? 0;
      const activeTasks = (sphere.tasks as FrontendTask[])?.filter((t) => !t.completed).length ?? 0;
      const meta: string[] = [];
      if (goalCount > 0) meta.push(`🎯 ${goalCount} goal${goalCount !== 1 ? 's' : ''}`);
      if (activeTasks > 0) meta.push(`📋 ${activeTasks} task${activeTasks !== 1 ? 's' : ''}`);
      if (meta.length) lines.push(meta.join('  '));
      lines.push('');
    }

    await sendMessage(chatId, lines.join('\n').trim());
    return NextResponse.json({ ok: true });
  }

  // /tasks
  if (command === '/tasks') {
    const activeSpheres = spheres.filter((s) =>
      (s.tasks as FrontendTask[])?.some((t) => !t.completed),
    );
    if (!activeSpheres.length) {
      await sendMessage(chatId, '📋 No active tasks found. Open the app to add some!');
      return NextResponse.json({ ok: true });
    }

    const lines = ['📋 <b>Your Active Tasks</b>', ''];
    for (const sphere of activeSpheres) {
      const incomplete = (sphere.tasks as FrontendTask[]).filter((t) => !t.completed);
      lines.push(`🔹 <b>${escHtml(sphere.name)}</b>`);
      for (const task of incomplete.slice(0, 10)) {
        const badge = task.significance >= 8 ? ' ⭐' : task.significance <= 3 ? ' 🔸' : '';
        lines.push(`  • ${escHtml(task.title)}${badge}`);
      }
      if (incomplete.length > 10) lines.push(`  … and ${incomplete.length - 10} more`);
      lines.push('');
    }

    await sendMessage(chatId, lines.join('\n').trim());
    return NextResponse.json({ ok: true });
  }

  // /goals
  if (command === '/goals') {
    type SphereGoal = { title: string; estimation?: number };
    const spheresWithGoals = spheres.filter(
      (s) => ((s.goals as SphereGoal[])?.length ?? 0) > 0,
    );
    if (!spheresWithGoals.length) {
      await sendMessage(chatId, '🎯 No goals found. Open the app to add some!');
      return NextResponse.json({ ok: true });
    }

    const lines = ['🎯 <b>Your Goals</b>', ''];
    for (const sphere of spheresWithGoals) {
      const goals = sphere.goals as SphereGoal[];
      lines.push(`🔹 <b>${escHtml(sphere.name)}</b>`);
      for (const goal of goals.slice(0, 10)) {
        const est = goal.estimation ? ` <i>(${goal.estimation}h)</i>` : '';
        lines.push(`  • ${escHtml(goal.title)}${est}`);
      }
      if (goals.length > 10) lines.push(`  … and ${goals.length - 10} more`);
      lines.push('');
    }

    await sendMessage(chatId, lines.join('\n').trim());
    return NextResponse.json({ ok: true });
  }

  // Unknown command
  await sendMessage(chatId, '❓ Unknown command. Use /help to see available commands.');
  return NextResponse.json({ ok: true });
}

