import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';

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

    const sphere = await Sphere.findOne({ id, userId: session.user.id });
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });

    const task = sphere.tasks.find((t) => t.id === taskId);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    if (typeof body.completed === 'boolean') task.completed = body.completed;
    if (body.title) task.title = body.title;

    await sphere.save();
    return NextResponse.json(sphere.toObject());
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
    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id },
      { $pull: { tasks: { id: taskId } } },
      { returnDocument: 'after' },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    return NextResponse.json(sphere);
  } catch (error) {
    console.error('DELETE /api/spheres/[id]/tasks/[taskId] error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}



