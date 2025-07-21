import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const causeFilter = searchParams.get('causes')?.split(',').filter(Boolean) || [];
  const limit = parseInt(searchParams.get('limit') || '1000');

  try {
    // First, let's get all causes if none specified, or filter by name
    let causesData;
    
    if (causeFilter.length > 0) {
      // Map the numeric IDs to cause names for filtering
      const causeNameMap: { [key: string]: string } = {
        '1': 'Climate Change',
        '2': 'AI Safety',
        '3': 'Global Health',
        '4': 'Education',
        '5': 'Poverty',
        '6': 'Governance'
      };
      
      const causeNames = causeFilter.map(id => causeNameMap[id]).filter(Boolean);
      
      causesData = await prisma.cause.findMany({
        where: { 
          name: { in: causeNames }
        },
        include: {
          initiatives: {
            take: Math.floor(limit / causeFilter.length), // Distribute limit across selected causes
            orderBy: { stars: 'desc' },
          },
          contributors: {
            take: 10,
            include: {
              contributor: true,
            },
          },
        },
      });
      
      console.log(`Filtering by causes: ${causeNames.join(', ')}, found ${causesData.length} causes`);
    } else {
      // Get all causes if none selected
      causesData = await prisma.cause.findMany({
        take: 6, // Limit to top causes
        include: {
          initiatives: {
            take: Math.floor(limit / 6),
            orderBy: { stars: 'desc' },
          },
          contributors: {
            take: 10,
            include: {
              contributor: true,
            },
          },
        },
      });
    }

    // Build nodes and edges from real data
    const nodes: any[] = [];
    const edges: any[] = [];

    // Add cause nodes
    causesData.forEach((cause, index) => {
      nodes.push({
        id: `cause-${cause.id}`,
        type: 'cause',
        label: cause.name,
        x: 0.2 + (index * 0.15),
        y: 0.2 + (index * 0.1),
        size: Math.min(30, 15 + cause.initiatives.length * 0.5),
        color: cause.color,
        visible: true,
        highlighted: false,
        opacity: 1,
        data: {
          causeId: cause.id,
          impact: cause.impactScore,
          description: cause.description,
          initiatives: cause.initiatives.length,
        },
      });

      // Add initiative nodes for this cause
      cause.initiatives.forEach((initiative, initIndex) => {
        const languages = JSON.parse(initiative.languagesJson || '[]');
        const topics = JSON.parse(initiative.topicsJson || '[]');
        
        nodes.push({
          id: `init-${initiative.id}`,
          type: 'initiative',
          label: initiative.name,
          x: 0.2 + (index * 0.15) + (initIndex * 0.02),
          y: 0.35 + (index * 0.1) + (initIndex * 0.02),
          size: Math.min(20, 5 + Math.log10(initiative.stars + 1) * 3),
          color: cause.color,
          visible: true,
          highlighted: false,
          opacity: 0.8,
          data: {
            initiativeId: initiative.id,
            stars: initiative.stars,
            forks: initiative.forks,
            description: initiative.description,
            url: initiative.url,
            languages: languages,
            topics: topics,
          },
        });

        // Add edge from cause to initiative
        edges.push({
          id: `edge-cause-${cause.id}-init-${initiative.id}`,
          source: `cause-${cause.id}`,
          target: `init-${initiative.id}`,
          type: 'impact',
          weight: Math.min(1, initiative.stars / 1000),
          visible: true,
          color: cause.color,
        });
      });

      // Add contributor nodes
      cause.contributors.forEach((contributorCause, contrIndex) => {
        if (contributorCause.contributor) {
          nodes.push({
            id: `contrib-${contributorCause.contributor.id}`,
            type: 'contributor',
            label: contributorCause.contributor.name || 'Unknown',
            x: 0.15 + (index * 0.15) + (contrIndex * 0.03),
            y: 0.6 + (index * 0.1),
            size: 8,
            color: cause.color,
            visible: true,
            highlighted: false,
            opacity: 0.7,
            data: {
              contributorId: contributorCause.contributor.id,
              name: contributorCause.contributor.name,
              bio: contributorCause.contributor.bio,
              location: contributorCause.contributor.location,
              githubUsername: contributorCause.contributor.githubUsername,
            },
          });

          // Add edge from contributor to cause
          edges.push({
            id: `edge-contrib-${contributorCause.contributor.id}-cause-${cause.id}`,
            source: `contrib-${contributorCause.contributor.id}`,
            target: `cause-${cause.id}`,
            type: 'collaboration',
            weight: 0.5,
            visible: true,
            color: '#6b7280',
          });
        }
      });
    });

    // Add some connections between initiatives with similar topics
    nodes.filter(n => n.type === 'initiative').forEach((node1, i) => {
      nodes.filter(n => n.type === 'initiative').forEach((node2, j) => {
        if (i < j && node1.data.topics && node2.data.topics) {
          const commonTopics = node1.data.topics.filter((topic: string) => 
            node2.data.topics.includes(topic)
          );
          
          if (commonTopics.length > 0) {
            edges.push({
              id: `edge-similarity-${node1.id}-${node2.id}`,
              source: node1.id,
              target: node2.id,
              type: 'similarity',
              weight: Math.min(1, commonTopics.length / 3),
              visible: true,
              color: '#9ca3af',
            });
          }
        }
      });
    });

    const metrics = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      causes: nodes.filter(n => n.type === 'cause').length,
      initiatives: nodes.filter(n => n.type === 'initiative').length,
      contributors: nodes.filter(n => n.type === 'contributor').length,
    };

    return NextResponse.json({
      nodes: nodes.slice(0, limit),
      edges: edges.slice(0, limit * 2),
      metrics,
    });

  } catch (error) {
    console.error('Error fetching visualization data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}