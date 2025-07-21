import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const causeId = searchParams.get('causeId');

  try {
    const initiatives = await prisma.initiative.findMany({
      where: causeId ? { causeId } : {},
      include: {
        cause: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        stars: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(initiatives);

  } catch (error) {
    console.error('Error fetching initiatives:', error);
    return NextResponse.json({ error: 'Failed to fetch initiatives' }, { status: 500 });
  }
}