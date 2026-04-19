import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
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
    const goalId = `g-${Date.now()}`;
    const sphere = await Sphere.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $push: { goals: { id: goalId, title } } },
      { returnDocument: 'after' },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    const hydrated = await getHydratedSphere(id, session.user.id);
    return NextResponse.json(hydrated, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres/[id]/goals error:', error);
    return NextResponse.json({ error: 'Failed to add goal' }, { status: 500 });
  }
}
