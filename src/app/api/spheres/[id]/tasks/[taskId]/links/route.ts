import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { getHydratedSpheres } from '@/lib/taskHelpers';

interface RouteParams {
  params: Promise<{ id: string; taskId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, taskId } = await params;
    const body = await request.json() as { linkedTaskIds?: unknown };
    const linkedTaskIds: string[] | null = Array.isArray(body.linkedTaskIds)
      ? [...new Set(body.linkedTaskIds.filter((value: unknown): value is string => typeof value === 'string'))]
      : null;

    if (!linkedTaskIds) {
      return NextResponse.json({ error: 'Invalid linkedTaskIds' }, { status: 400 });
    }

    const sourceTask = await Task.findOne({ _id: taskId, sphereId: id, userId: session.user.id }).lean();
    if (!sourceTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const targets = linkedTaskIds.length
      ? await Task.find({ _id: { $in: linkedTaskIds }, userId: session.user.id }).lean()
      : [];

    if (targets.length !== linkedTaskIds.length) {
      return NextResponse.json({ error: 'Linked task not found' }, { status: 404 });
    }

    if (targets.some((task) => task.sphereId === id || task._id.toString() === taskId)) {
      return NextResponse.json({ error: 'Tasks can only be linked across different spheres' }, { status: 400 });
    }

    const previousLinkedIds = sourceTask.linkedTaskIds ?? [];
    const removedLinkedIds = previousLinkedIds.filter((linkedId) => !linkedTaskIds.includes(linkedId));

    await Task.updateOne(
      { _id: taskId, sphereId: id, userId: session.user.id },
      { $set: { linkedTaskIds } },
    );

    if (linkedTaskIds.length) {
      await Task.updateMany(
        { _id: { $in: linkedTaskIds }, userId: session.user.id },
        { $addToSet: { linkedTaskIds: taskId } },
      );
    }

    if (removedLinkedIds.length) {
      await Task.updateMany(
        { _id: { $in: removedLinkedIds }, userId: session.user.id },
        { $pull: { linkedTaskIds: taskId } },
      );
    }

    const hydrated = await getHydratedSpheres(session.user.id);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('PATCH /api/spheres/[id]/tasks/[taskId]/links error:', error);
    return NextResponse.json({ error: 'Failed to update task links' }, { status: 500 });
  }
}
