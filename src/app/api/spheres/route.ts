import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { initialSpheres } from '@/app/data/initialSpheres';

export async function GET() {
  try {
    await connectToDatabase();
    let spheres = await Sphere.find({}).lean();

    // Seed the DB on first run
    if (spheres.length === 0) {
      await Sphere.insertMany(initialSpheres);
      spheres = await Sphere.find({}).lean();
    }

    return NextResponse.json(spheres);
  } catch (error) {
    console.error('GET /api/spheres error:', error);
    return NextResponse.json({ error: 'Failed to fetch spheres' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const sphere = await Sphere.create(body);
    return NextResponse.json(sphere, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres error:', error);
    return NextResponse.json({ error: 'Failed to create sphere' }, { status: 500 });
  }
}

