import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import CompletedTask from '@/lib/models/CompletedTask';
import { auth } from '@/auth';

interface RouteParams {
  params: Promise<{ id: string; taskId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, taskId } = await params;

    const task = await Task.findOne({ _id: taskId, sphereId: id, userId: session.user.id }).lean();
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (!task.recurring) return NextResponse.json({ error: 'Task is not recurring' }, { status: 400 });

    await CompletedTask.create({
      taskId,
      userId: session.user.id,
      sphereId: id,
      taskTitle: task.title,
      significance: task.significance,
      completedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/spheres/[id]/tasks/[taskId]/log error:', error);
    return NextResponse.json({ error: 'Failed to log task' }, { status: 500 });
  }
}

