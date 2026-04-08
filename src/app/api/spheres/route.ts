import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sphere from '@/lib/models/Sphere';
import Task from '@/lib/models/Task';
import { initialSpheres } from '@/app/data/initialSpheres';
import { auth } from '@/auth';
import { getHydratedSpheres } from '@/lib/taskHelpers';

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
        id: `${userId}-${s.id}`,
        userId,
        name: s.name,
        rating: s.rating,
        goals: s.goals,
      }));
      await Sphere.insertMany(seeded);

      // Seed initial tasks into the Task collection
      const taskDocs = initialSpheres.flatMap((s) =>
        s.tasks.map((t) => ({
          sphereId: `${userId}-${s.id}`,
          userId,
          parentId: null,
          title: t.title,
          completed: t.completed,
        })),
      );
      if (taskDocs.length) await Task.insertMany(taskDocs);
    }

    const hydrated = await getHydratedSpheres(userId);
    return NextResponse.json(hydrated);
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
    return NextResponse.json({ ...sphere.toObject(), tasks: [] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/spheres error:', error);
    return NextResponse.json({ error: 'Failed to create sphere' }, { status: 500 });
  }
}
