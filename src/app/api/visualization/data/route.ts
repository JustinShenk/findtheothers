import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kmeans } from 'ml-kmeans';
import { cache, createCacheKey } from '@/lib/cache';
import { visualizationSchema, validateSearchParams } from '@/lib/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Validate parameters
  const { data: params, error } = validateSearchParams(
    searchParams,
    visualizationSchema
  );

  if (error) {
    return NextResponse.json(
      { error: `Invalid parameters: ${error}` },
      { status: 400 }
    );
  }

  const { causes: causeFilter, limit, auto: useAutoDiscovery } = params!;

  // Create cache key based on request parameters
  const cacheKey = createCacheKey('visualization', {
    causes: causeFilter.join(','),
    limit,
    auto: useAutoDiscovery
  });

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    // Use automatic cause discovery by default
    if (useAutoDiscovery && causeFilter.length === 0) {
      const result = await getAutoDiscoveredVisualization(limit);
      const data = await result.json();
      cache.set(cacheKey, data, 300); // Cache for 5 minutes
      return NextResponse.json(data);
    }
    
    // Fallback to original predefined causes logic for specific filters
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
      
      causesData = await db.cause.findMany({
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
      causesData = await db.cause.findMany({
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

    const responseData = {
      nodes: nodes.slice(0, limit),
      edges: edges.slice(0, limit * 2),
      metrics,
    };

    // Cache the result
    cache.set(cacheKey, responseData, 300); // Cache for 5 minutes

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching visualization data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

/**
 * Auto-discovered visualization using clustering
 */
async function getAutoDiscoveredVisualization(limit: number) {
  console.log('🔍 Using automatic cause discovery for visualization...');
  
  // Get initiatives with embeddings
  const initiatives = await db.initiative.findMany({
    where: {
      embeddingJson: { not: null }
    },
    take: Math.min(limit, 100), // Cap for performance
    orderBy: { stars: 'desc' },
  });

  if (initiatives.length < 6) {
    console.warn('Not enough projects for auto-discovery, using fallback');
    return NextResponse.json({
      nodes: [],
      edges: [],
      metrics: { totalNodes: 0, totalEdges: 0, discoveredCauses: 0 },
      message: 'Not enough data for automatic cause discovery'
    });
  }

  // Extract project data for clustering
  const projectData = initiatives.map(init => ({
    id: init.id,
    name: init.name,
    description: init.description,
    stars: init.stars,
    forks: init.forks,
    languages: JSON.parse(init.languagesJson || '[]'),
    topics: JSON.parse(init.topicsJson || '[]'),
    tags: JSON.parse(init.tagsJson || '[]'),
    embedding: JSON.parse(init.embeddingJson || '[]'),
  })).filter(p => p.embedding.length > 0);

  // Perform clustering
  const clusters = Math.min(6, Math.floor(projectData.length / 5));
  const embeddings = projectData.map(p => p.embedding.slice(0, 50));
  const clusterResult = kmeans(embeddings, clusters, {
    initialization: 'kmeans++',
    maxIterations: 50,
  });

  // Group projects by cluster and create visualization
  const clusteredProjects = new Map<number, typeof projectData>();
  projectData.forEach((project, index) => {
    const clusterId = clusterResult.clusters[index];
    if (!clusteredProjects.has(clusterId)) {
      clusteredProjects.set(clusterId, []);
    }
    clusteredProjects.get(clusterId)!.push(project);
  });

  const nodes: any[] = [];
  const edges: any[] = [];
  const colors = ['#ef4444', '#f97316', '#22c55e', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

  // Create discovered cause nodes
  Array.from(clusteredProjects.entries()).forEach(([clusterId, clusterProjects], clusterIndex) => {
    if (clusterProjects.length < 2) return;
    
    const causeName = generateCauseName(clusterProjects);
    const color = colors[clusterIndex % colors.length];
    
    // Add discovered cause node  
    const causeNode = {
      id: `discovered-cause-${clusterId}`,
      type: 'discovered-cause',
      label: causeName,
      x: (clusterIndex * 120) - 300,
      y: 0,
      size: Math.min(35, 15 + clusterProjects.length * 1.5),
      color,
      visible: true,
      highlighted: false,
      opacity: 1,
      data: {
        clusterId,
        projectCount: clusterProjects.length,
        avgStars: Math.round(clusterProjects.reduce((sum, p) => sum + p.stars, 0) / clusterProjects.length),
        topTopics: getTopItems(clusterProjects.flatMap(p => p.topics)),
        isDiscovered: true,
      },
    };
    nodes.push(causeNode);

    // Add project nodes
    clusterProjects.forEach((project, projectIndex) => {
      const angle = (projectIndex / clusterProjects.length) * 2 * Math.PI;
      const radius = 60 + Math.random() * 30;
      
      const projectNode = {
        id: `init-${project.id}`,
        type: 'initiative',
        label: project.name,
        x: causeNode.x + Math.cos(angle) * radius,
        y: causeNode.y + Math.sin(angle) * radius,
        size: Math.min(12, 4 + Math.log10(project.stars + 1) * 1.8),
        color,
        visible: true,
        highlighted: false,
        opacity: 0.8,
        data: {
          initiativeId: project.id,
          stars: project.stars,
          forks: project.forks,
          description: project.description,
          languages: project.languages,
          topics: project.topics,
        },
      };
      nodes.push(projectNode);

      // Edge from cause to project
      edges.push({
        id: `edge-${causeNode.id}-${projectNode.id}`,
        source: causeNode.id,
        target: projectNode.id,
        type: 'belongs-to',
        weight: 0.8,
        visible: true,
        color,
      });
    });
  });

  const metrics = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    causes: Array.from(clusteredProjects.keys()).length,
    initiatives: projectData.length,
    contributors: 0, // No contributors in auto-discovery yet
    discoveredCauses: Array.from(clusteredProjects.keys()).length,
    clusteringMethod: 'auto-embedding-kmeans',
  };

  console.log(`✅ Auto-discovered ${clusteredProjects.size} causes from ${projectData.length} projects`);

  return NextResponse.json({
    nodes,
    edges, 
    metrics,
  });
}

/**
 * Generate meaningful cause name from cluster projects
 */
function generateCauseName(projects: any[]): string {
  const allTerms = projects.flatMap(p => [...p.topics, ...p.tags]);
  const termCounts = new Map<string, number>();
  
  allTerms.forEach(term => {
    const cleaned = term.toLowerCase().replace(/[-_]/g, ' ');
    termCounts.set(cleaned, (termCounts.get(cleaned) || 0) + 1);
  });
  
  const meaningfulTerms = Array.from(termCounts.entries())
    .filter(([term, count]) => 
      count >= 2 && 
      term.length > 2 && 
      !['javascript', 'python', 'react', 'nodejs', 'api', 'web', 'app'].includes(term)
    )
    .sort(([,a], [,b]) => b - a)
    .map(([term]) => term);
  
  if (meaningfulTerms.length > 0) {
    const primary = meaningfulTerms[0];
    return primary.charAt(0).toUpperCase() + primary.slice(1).replace(/\b\w/g, l => l.toUpperCase());
  }
  
  const descriptions = projects.map(p => p.description.toLowerCase()).join(' ');
  const commonWords = ['health', 'education', 'climate', 'ai', 'finance', 'government'];
  const foundWord = commonWords.find(word => descriptions.includes(word));
  
  return foundWord ? 
    foundWord.charAt(0).toUpperCase() + foundWord.slice(1) :
    `Technology Cluster`;
}

/**
 * Get top N most frequent items
 */
function getTopItems(items: string[], n: number = 3): string[] {
  const counts = new Map<string, number>();
  items.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  
  return Array.from(counts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, n)
    .map(([item]) => item);
}