import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import Task from '@/lib/models/Task';
import { auth } from '@/auth';
import { getHydratedSphere } from '@/lib/taskHelpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    const { name, rating, goals } = await request.json();
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (rating !== undefined) update.rating = rating;
    if (goals !== undefined) update.goals = goals;

    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id },
      { $set: update },
      { returnDocument: 'after' },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });

    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('PUT /api/spheres/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update sphere' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    await Sphere.deleteOne({ id, userId: session.user.id });
    // Also delete all tasks belonging to this sphere
    await Task.deleteMany({ sphereId: id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/spheres/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete sphere' }, { status: 500 });
  }
}
