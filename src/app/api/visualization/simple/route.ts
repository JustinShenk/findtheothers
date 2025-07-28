import { NextResponse } from 'next/server';
import { PCA } from 'ml-pca';
import { db } from '@/lib/db';

function calculateDotSize({
  value, minSize, maxSize, scaleFactor
}: { value: number; minSize: number; maxSize: number; scaleFactor: number }) {
  const size = Math.min(maxSize, minSize + Math.log10(value + 1) * scaleFactor);
  return size;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const causeId = searchParams.get('causeId'); // Optional cause filter
  const dimReduction = searchParams.get('dimreduction') || 'pca'; // 'pca' or 'trunc'

  try {
    // Build where clause for PCA data
    const pcaWhere = causeId ? { causeId } : { causeId: null }; // null = global scope

    // Get precomputed PCA data
    const pcaData = await db.precomputedPCA.findMany({
      where: pcaWhere,
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            description: true,
            stars: true,
            forks: true,
            url: true,
            embeddingJson: true,
            cause: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      }
    });

    if (pcaData.length === 0) {
      console.log('No precomputed PCA data found, falling back to direct computation');
      
      // Fallback: Get initiatives with embeddings and compute PCA on the fly
      const initiatives = await db.initiative.findMany({
        where: causeId ? { causeId } : {},
        select: {
          id: true,
          name: true,
          description: true,
          stars: true,
          forks: true,
          url: true,
          embeddingJson: true,
          cause: {
            select: {
              name: true,
              color: true
            }
          }
        },
        take: 100,
        orderBy: { stars: 'desc' }
      });

      if (initiatives.length === 0) {
        return NextResponse.json({
          data: [],
          metadata: {
            totalCount: 0,
            pcaExplainedVariance: [],
            method: 'none'
          }
        });
      }

      // Simple 2D positioning without embeddings
      const dotData = initiatives.map((init, index) => {
        const angle = (index / initiatives.length) * 2 * Math.PI;
        const radius = 0.3 + Math.random() * 0.3;
        
        return {
          id: init.id,
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
          size: calculateDotSize({
            value: init.stars,
            minSize: 4,
            maxSize: 20,
            scaleFactor: 3
          }),
          color: init.cause.color,
          name: init.name,
          description: init.description || '',
          stars: init.stars,
          forks: init.forks,
          url: init.url,
          cause: init.cause.name
        };
      });

      return NextResponse.json({
        data: dotData,
        metadata: {
          totalCount: dotData.length,
          pcaExplainedVariance: [],
          method: 'fallback-circular'
        }
      });
    }

    // Convert to react-dot-visualization format using precomputed PCA or truncation
    const data = pcaData.map((pca) => {
      const [x, y] = dimReduction === 'trunc'
        ? JSON.parse(pca.initiative.embeddingJson || '[]') // Use first 2 embedding dims
        : pca.components; // Use first 2 PCA components

      const scale = dimReduction === 'trunc' ? 300 : 100; // Scale for truncation vs PCA
      return {
        id: pca.initiative.id,
        x: x * scale, // Scale coordinates
        y: y * scale,
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
        method: dimReduction === 'trunc' ? 'truncation-2d' : 'precomputed-pca-2d',
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