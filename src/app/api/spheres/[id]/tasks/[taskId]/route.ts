import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import CompletedTask from '@/lib/models/CompletedTask';
import { auth } from '@/auth';
import { getHydratedSphere, collectDescendantIds } from '@/lib/taskHelpers';

interface RouteParams {
  params: Promise<{ id: string; taskId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, taskId } = await params;
    const body = await request.json();

    // Fetch the current state before updating (needed for completion diff)
    const before = await Task.findOne({ _id: taskId, sphereId: id, userId: session.user.id }).lean();
    if (!before) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const update: Record<string, unknown> = {};
    if (typeof body.completed === 'boolean') update.completed = body.completed;
    if (body.title) update.title = body.title;
    if (typeof body.significance === 'number') update.significance = Math.min(10, Math.max(1, body.significance));
    if (typeof body.recurring === 'boolean') update.recurring = body.recurring;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, sphereId: id, userId: session.user.id },
      { $set: update },
      { returnDocument: 'after' },
    ).lean();
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Log completion history (only for non-recurring tasks)
    if (typeof body.completed === 'boolean' && !before.recurring) {
      if (body.completed && !before.completed) {
        // Task was just marked complete → record it
        await CompletedTask.create({
          taskId,
          userId: session.user.id,
          sphereId: id,
          taskTitle: task.title,
          significance: task.significance,
          completedAt: new Date(),
        });
      } else if (!body.completed && before.completed) {
        // Task was unchecked → remove its history
        await CompletedTask.deleteMany({ taskId, userId: session.user.id });
      }
    }

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('PATCH /api/spheres/[id]/tasks/[taskId] error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, taskId } = await params;

    // Load all tasks to find descendants
    const allTasks = await Task.find({ sphereId: id, userId: session.user.id }).lean();
    const toDelete = collectDescendantIds(allTasks, taskId);
    await Task.deleteMany({ _id: { $in: toDelete }, userId: session.user.id });

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('DELETE /api/spheres/[id]/tasks/[taskId] error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
