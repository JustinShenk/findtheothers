import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PCA } from 'ml-pca';

const prisma = new PrismaClient();

function calculateDotSize({
  value, minSize, maxSize, scaleFactor
}: { value: number; minSize: number; maxSize: number; scaleFactor: number }) {
  const size = Math.min(maxSize, minSize + Math.log10(value + 1) * scaleFactor);
  return size;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '500');
  const causeId = searchParams.get('causeId'); // Optional cause filter

  try {
    // Build where clause for PCA data
    const pcaWhere = causeId ? { causeId } : { causeId: null }; // null = global scope

    // Get precomputed PCA data
    const pcaData = await prisma.precomputedPCA.findMany({
      where: pcaWhere,
      take: limit,
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            description: true,
            stars: true,
            forks: true,
            url: true,
            cause: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: {
        initiative: { stars: 'desc' }
      }
    });

    if (pcaData.length === 0) {
      return NextResponse.json({
        data: [],
        message: causeId ? 'No PCA data found for this cause' : 'No precomputed PCA data found'
      });
    }

    // Convert to react-dot-visualization format using precomputed PCA
    const data = pcaData.map((pca) => {
      const [x, y] = pca.components; // Use first 2 PCA components

      return {
        id: pca.initiative.id,
        x: x * 100, // Scale coordinates
        y: y * 100,
        size: calculateDotSize({
          value: pca.initiative.stars,
          minSize: 0.1,
          maxSize: 1.5,
          scaleFactor: 0.15
        }),
        color: pca.initiative.cause?.color || '#6366f1',
        name: pca.initiative.name,
        description: pca.initiative.description,
        stars: pca.initiative.stars,
        forks: pca.initiative.forks,
        url: pca.initiative.url,
        cause: pca.initiative.cause?.name || 'Unknown'
      };
    });

    // Get explained variance from first record (same for all in scope)
    const explainedVariance = pcaData[0]?.variance?.slice(0, 2) || [0, 0];

    return NextResponse.json({
      data,
      metadata: {
        totalCount: data.length,
        pcaExplainedVariance: explainedVariance,
        method: 'precomputed-pca-2d',
        scope: causeId ? 'cause-specific' : 'global'
      }
    });

  } catch (error) {
    console.error('Error creating simple visualization:', error);
    return NextResponse.json({
      error: `Failed to create visualization: ${error}`,
      data: []
    }, { status: 500 });
  }
}