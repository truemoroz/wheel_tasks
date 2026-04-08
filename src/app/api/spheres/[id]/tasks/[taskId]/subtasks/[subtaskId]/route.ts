import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';
interface RouteParams {
  params: Promise<{ id: string; taskId: string; subtaskId: string }>;
}
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectToDatabase();
    const { id, taskId, subtaskId } = await params;
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body.completed === 'boolean') update['tasks.$[task].subtasks.$[sub].completed'] = body.completed;
    if (body.title) update['tasks.$[task].subtasks.$[sub].title'] = body.title;
    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id },
      { $set: update },
      { arrayFilters: [{ 'task.id': taskId }, { 'sub.id': subtaskId }], new: true },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(sphere);
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
    const { id, taskId, subtaskId } = await params;
    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id, 'tasks.id': taskId },
      { $pull: { 'tasks.$.subtasks': { id: subtaskId } } },
      { new: true },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(sphere);
  } catch (error) {
    console.error('DELETE subtask error:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}
