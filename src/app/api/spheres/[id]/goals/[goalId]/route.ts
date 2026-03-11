import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';

interface RouteParams {
  params: Promise<{ id: string; goalId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, goalId } = await params;
    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id },
      { $pull: { goals: { id: goalId } } },
      { returnDocument: 'after' },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    return NextResponse.json(sphere);
  } catch (error) {
    console.error('DELETE /api/spheres/[id]/goals/[goalId] error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id, goalId } = await params;
    const body = await request.json();
    const updateFields: Record<string, unknown> = {};
    if (body.estimation !== undefined) updateFields['goals.$.estimation'] = body.estimation;
    if (body.title !== undefined) updateFields['goals.$.title'] = body.title;

    const sphere = await Sphere.findOneAndUpdate(
      { id, userId: session.user.id, 'goals.id': goalId },
      { $set: updateFields },
      { returnDocument: 'after' },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    return NextResponse.json(sphere);
  } catch (error) {
    console.error('PATCH /api/spheres/[id]/goals/[goalId] error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}
