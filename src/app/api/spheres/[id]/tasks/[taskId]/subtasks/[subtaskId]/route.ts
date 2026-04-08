import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import CompletedTask from '@/lib/models/CompletedTask';
import { auth } from '@/auth';
import { getHydratedSphere, collectDescendantIds } from '@/lib/taskHelpers';

interface RouteParams {
  params: Promise<{ id: string; taskId: string; subtaskId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, subtaskId } = await params;
    const body = await request.json();

    const before = await Task.findOne({ _id: subtaskId, sphereId: id, userId: session.user.id }).lean();
    if (!before) return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });

    const update: Record<string, unknown> = {};
    if (typeof body.completed === 'boolean') update.completed = body.completed;
    if (body.title) update.title = body.title;
    if (typeof body.significance === 'number') update.significance = Math.min(10, Math.max(1, body.significance));
    if (typeof body.recurring === 'boolean') update.recurring = body.recurring;

    const task = await Task.findOneAndUpdate(
      { _id: subtaskId, sphereId: id, userId: session.user.id },
      { $set: update },
      { returnDocument: 'after' },
    ).lean();
    if (!task) return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });

    // Log completion history (only for non-recurring tasks)
    if (typeof body.completed === 'boolean' && !before.recurring) {
      if (body.completed && !before.completed) {
        await CompletedTask.create({
          taskId: subtaskId,
          userId: session.user.id,
          sphereId: id,
          taskTitle: task.title,
          significance: task.significance,
          completedAt: new Date(),
        });
      } else if (!body.completed && before.completed) {
        await CompletedTask.deleteMany({ taskId: subtaskId, userId: session.user.id });
      }
    }

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('PATCH subtask error:', error);
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, subtaskId } = await params;

    const allTasks = await Task.find({ sphereId: id, userId: session.user.id }).lean();
    const toDelete = collectDescendantIds(allTasks, subtaskId);
    await Task.deleteMany({ _id: { $in: toDelete }, userId: session.user.id });

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('DELETE subtask error:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}
