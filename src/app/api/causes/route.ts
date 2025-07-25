import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const causes = await prisma.cause.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        description: true,
        impactScore: true,
        _count: {
          select: {
            initiatives: true,
            contributors: true
          }
        }
      },
      orderBy: {
        impactScore: 'desc'
      }
    });

    return NextResponse.json(causes);
  } catch (error) {
    console.error('Error fetching causes:', error);
    return NextResponse.json({ error: 'Failed to fetch causes' }, { status: 500 });
  }
}