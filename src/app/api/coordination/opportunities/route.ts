import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const causes = searchParams.get('causes')?.split(',') || [];
  const status = searchParams.get('status') || 'open';
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const opportunities = await prisma.coordinationOpportunity.findMany({
      where: {
        status,
        ...(type && { type }),
        ...(causes.length > 0 && { causeId: { in: causes } }),
      },
      include: {
        cause: true,
        initiative: true,
        participants: {
          include: {
            contributor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      type: opp.type,
      title: opp.title,
      description: opp.description,
      causeId: opp.causeId,
      initiativeId: opp.initiativeId,
      createdBy: opp.createdById,
      createdAt: opp.createdAt,
      status: opp.status,
      participants: opp.participants.map(p => ({
        id: p.id,
        contributor: p.contributor,
        role: p.role,
        joinedAt: p.joinedAt,
      })),
      requirements: opp.requirementsJson ? JSON.parse(opp.requirementsJson) : {},
      outcomes: [],
      visibility: opp.visibility,
      tags: opp.tagsJson ? JSON.parse(opp.tagsJson) : [],
      cause: opp.cause,
      initiative: opp.initiative,
    }));

    return NextResponse.json(formattedOpportunities);

  } catch (error) {
    console.error('Error fetching coordination opportunities:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}