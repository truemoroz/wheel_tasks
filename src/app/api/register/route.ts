import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Sphere from '@/lib/models/Sphere';

interface PendingSphere { id: string; name: string; rating: number; }

export async function POST(request: Request) {
  try {
    const { email, password, spheres: customSpheres } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    await connectToDatabase();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ email: email.toLowerCase(), password: hashed });
    const userId = user._id.toString();

    if (Array.isArray(customSpheres) && customSpheres.length > 0) {
      await Sphere.insertMany(customSpheres.map(({ id, ...rest }: PendingSphere) => ({
        id: `${userId}-${id}`,
        userId,
        ...rest,
        goals: [],
      })));
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}


