import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';

interface RouteParams {
  params: Promise<{ id: string; goalId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id, goalId } = await params;
    const sphere = await Sphere.findOneAndUpdate(
      { id },
      { $pull: { goals: { id: goalId } } },
      { new: true },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    return NextResponse.json(sphere);
  } catch (error) {
    console.error('DELETE /api/spheres/[id]/goals/[goalId] error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}

