import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';

interface RouteParams {
  params: Promise<{ id: string; taskId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, taskId } = await params;
    const { title } = await request.json();

    const subtaskId = `st-${Date.now()}`;
    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id, 'tasks.id': taskId },
      { $push: { 'tasks.$.subtasks': { id: subtaskId, title, completed: false, subtasks: [] } } },
      { new: true },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(sphere, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres/[id]/tasks/[taskId]/subtasks error:', error);
    return NextResponse.json({ error: 'Failed to add subtask' }, { status: 500 });
  }
}

