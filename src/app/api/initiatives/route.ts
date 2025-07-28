import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initiativesSchema, validateSearchParams } from '@/lib/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Validate parameters
  const { data: params, error } = validateSearchParams(
    searchParams,
    initiativesSchema
  );

  if (error) {
    return NextResponse.json(
      { error: `Invalid parameters: ${error}` },
      { status: 400 }
    );
  }

  const { limit, causeId } = params!;

  try {
    const initiatives = await db.initiative.findMany({
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