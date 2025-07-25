import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PCA } from 'ml-pca';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '500');

  try {
    // Get initiatives with embeddings
    const initiatives = await prisma.initiative.findMany({
      where: {
        embeddingJson: { not: null }
      },
      take: limit,
      orderBy: { stars: 'desc' },
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
    });

    if (initiatives.length === 0) {
      return NextResponse.json({
        data: [],
        message: 'No initiatives with embeddings found'
      });
    }

    // Parse embeddings and prepare for PCA
    const embeddingData = initiatives.map(init => ({
      ...init,
      embedding: JSON.parse(init.embeddingJson || '[]')
    })).filter(init => init.embedding.length > 0);

    if (embeddingData.length < 2) {
      return NextResponse.json({
        data: [],
        message: 'Not enough valid embeddings for visualization'
      });
    }

    // Reduce embeddings to 2D using PCA
    const embeddings = embeddingData.map(init => init.embedding.slice(0, 100)); // Use first 100 dims
    const pca = new PCA(embeddings, { center: true, scale: false });
    const projected = pca.predict(embeddings, { nComponents: 2 });

    // Convert to react-dot-visualization format
    const data = embeddingData.map((init, index) => {
      const [x, y] = projected.getRow(index);
      
      return {
        id: init.id,
        x: x * 100, // Scale coordinates
        y: y * 100,
        size: Math.min(1.5, 0.3 + Math.log10(init.stars + 1) * 0.2), // Size based on stars
        color: init.cause?.color || '#6366f1',
        name: init.name,
        description: init.description,
        stars: init.stars,
        forks: init.forks,
        url: init.url,
        cause: init.cause?.name || 'Unknown'
      };
    });

    return NextResponse.json({
      data,
      metadata: {
        totalCount: data.length,
        pcaExplainedVariance: pca.getExplainedVariance().slice(0, 2),
        method: 'pca-2d'
      }
    });

  } catch (error) {
    console.error('Error creating simple visualization:', error);
    return NextResponse.json({ 
      error: 'Failed to create visualization',
      data: []
    }, { status: 500 });
  }
}