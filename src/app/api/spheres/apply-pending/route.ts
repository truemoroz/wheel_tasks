import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import { auth } from '@/auth';
import { getHydratedSpheres } from '@/lib/taskHelpers';

interface PendingSphere { id: string; name: string; rating: number; }

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { spheres }: { spheres: PendingSphere[] } = await request.json();
    if (!Array.isArray(spheres)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    if (spheres.length === 0) return NextResponse.json({ error: 'No spheres to apply' }, { status: 400 });

    const userId = session.user.id;

    await Promise.all(
      spheres.map((s) =>
        Sphere.findOneAndUpdate(
          { id: `${userId}-${s.id}`, userId },
          {
            $set: { name: s.name, rating: s.rating },
            $setOnInsert: { id: `${userId}-${s.id}`, userId, goals: [] },
          },
          { upsert: true, new: true },
        ),
      ),
    );

    const hydrated = await getHydratedSpheres(userId);
    return NextResponse.json(hydrated);
  } catch (error) {
    console.error('PATCH /api/spheres/apply-pending error:', error);
    return NextResponse.json({ error: 'Failed to apply pending spheres' }, { status: 500 });
  }
}

