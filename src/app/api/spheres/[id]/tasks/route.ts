import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    const { title } = await request.json();
    const taskId = `t-${Date.now()}`;
    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id },
      { $push: { tasks: { id: taskId, title, completed: false } } },
      { returnDocument: 'after' },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    return NextResponse.json(sphere, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres/[id]/tasks error:', error);
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
  }
}



