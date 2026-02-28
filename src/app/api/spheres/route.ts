import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { initialSpheres } from '@/app/data/initialSpheres';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    await connectToDatabase();
    let spheres = await Sphere.find({ userId }).lean();

    // Seed the DB for this user on first run
    if (spheres.length === 0) {
      const seeded = initialSpheres.map((s) => ({
        ...s,
        id: `${userId}-${s.id}`,
        userId,
      }));
      await Sphere.insertMany(seeded);
      spheres = await Sphere.find({ userId }).lean();
    }

    return NextResponse.json(spheres);
  } catch (error) {
    console.error('GET /api/spheres error:', error);
    return NextResponse.json({ error: 'Failed to fetch spheres' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const body = await request.json();
    const sphere = await Sphere.create({ ...body, userId: session.user.id });
    return NextResponse.json(sphere, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres error:', error);
    return NextResponse.json({ error: 'Failed to create sphere' }, { status: 500 });
  }
}



