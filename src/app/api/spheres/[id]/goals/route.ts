import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { title } = await request.json();
    const goalId = `g-${Date.now()}`;
    const sphere = await Sphere.findOneAndUpdate(
      { id },
      { $push: { goals: { id: goalId, title } } },
      { new: true },
    ).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    return NextResponse.json(sphere, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres/[id]/goals error:', error);
    return NextResponse.json({ error: 'Failed to add goal' }, { status: 500 });
  }
}

