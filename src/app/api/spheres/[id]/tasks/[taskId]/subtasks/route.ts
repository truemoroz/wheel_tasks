import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { auth } from '@/auth';
import { getHydratedSphere } from '@/lib/taskHelpers';

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

    // Verify parent task exists and belongs to this sphere/user
    const parent = await Task.findOne({ _id: taskId, sphereId: id, userId: session.user.id }).lean();
    if (!parent) return NextResponse.json({ error: 'Parent task not found' }, { status: 404 });

    await Task.create({ sphereId: id, userId: session.user.id, parentId: taskId, title, completed: false });

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres/[id]/tasks/[taskId]/subtasks error:', error);
    return NextResponse.json({ error: 'Failed to add subtask' }, { status: 500 });
  }
}
