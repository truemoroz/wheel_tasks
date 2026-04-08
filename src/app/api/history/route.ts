import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CompletedTask from '@/lib/models/CompletedTask';
import { auth } from '@/auth';

export interface DayEntry {
  date: string;        // "YYYY-MM-DD"
  significance: number;
  count: number;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const days = Math.min(365, Math.max(7, parseInt(searchParams.get('days') ?? '30')));

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const aggregated = await CompletedTask.aggregate<{ _id: string; significance: number; count: number }>([
      { $match: { userId: session.user.id, completedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          significance: { $sum: '$significance' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a full date range filling missing days with zeros
    const byDate: Record<string, { significance: number; count: number }> = {};
    for (const entry of aggregated) {
      byDate[entry._id] = { significance: entry.significance, count: entry.count };
    }

    const result: DayEntry[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, significance: byDate[key]?.significance ?? 0, count: byDate[key]?.count ?? 0 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

