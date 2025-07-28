import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searchSchema, validateSearchParams } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    // Validate request parameters
    const { data: params, error } = validateSearchParams(
      request.nextUrl.searchParams,
      searchSchema
    );

    if (error) {
      return NextResponse.json(
        { error: `Invalid parameters: ${error}` },
        { status: 400 }
      );
    }

    const { q: query, type, limit } = params!;

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: any = {
      initiatives: [],
      causes: [],
      contributors: []
    };

    // Search initiatives
    if (type === 'all' || type === 'initiatives') {
      results.initiatives = await db.initiative.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          cause: {
            select: {
              name: true,
              color: true,
              slug: true
            }
          }
        },
        orderBy: { stars: 'desc' },
        take: limit
      });
    }

    // Search causes
    if (type === 'all' || type === 'causes') {
      results.causes = await db.cause.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          _count: {
            select: {
              initiatives: true,
              contributors: true
            }
          }
        },
        orderBy: { impactScore: 'desc' },
        take: limit
      });
    }

    // Search contributors
    if (type === 'all' || type === 'contributors') {
      results.contributors = await db.contributor.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
            { githubUsername: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          causes: {
            include: {
              cause: {
                select: {
                  name: true,
                  color: true
                }
              }
            }
          }
        },
        orderBy: { lastActiveAt: 'desc' },
        take: limit
      });
    }

    // Calculate total results
    const totalResults = 
      results.initiatives.length + 
      results.causes.length + 
      results.contributors.length;

    return NextResponse.json({
      query,
      type,
      totalResults,
      results
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}