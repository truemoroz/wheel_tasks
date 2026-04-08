import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';
import { getHydratedSphere } from '@/lib/taskHelpers';

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

    // Verify sphere belongs to user
    const sphere = await Sphere.findOne({ id, userId: session.user.id }).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });

    await Task.create({ sphereId: id, userId: session.user.id, parentId: null, title, completed: false });

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres/[id]/tasks error:', error);
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
  }
}
