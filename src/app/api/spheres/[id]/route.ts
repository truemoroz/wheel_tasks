import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const sphere = await Sphere.findOneAndUpdate({ id }, body, { new: true }).lean();
    if (!sphere) return NextResponse.json({ error: 'Sphere not found' }, { status: 404 });
    return NextResponse.json(sphere);
  } catch (error) {
    console.error('PUT /api/spheres/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update sphere' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Sphere.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/spheres/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete sphere' }, { status: 500 });
  }
}

