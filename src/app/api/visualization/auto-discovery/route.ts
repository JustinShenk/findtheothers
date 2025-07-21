import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { kmeans } from 'ml-kmeans';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const clusters = parseInt(searchParams.get('clusters') || '6');

  try {
    console.log('🔍 Starting automatic cause discovery...');
    
    // Get all initiatives with embeddings and metadata
    const initiatives = await prisma.initiative.findMany({
      where: {
        embeddingJson: { not: null }
      },
      take: limit,
      orderBy: { stars: 'desc' },
    });

    console.log(`Found ${initiatives.length} initiatives with embeddings`);

    if (initiatives.length < clusters * 2) {
      return NextResponse.json({ 
        error: 'Not enough data for clustering',
        message: `Need at least ${clusters * 2} projects, found ${initiatives.length}`
      });
    }

    // Extract embeddings and metadata
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

    console.log(`Processing ${projectData.length} projects for clustering`);

    // Perform k-means clustering on embeddings
    const embeddings = projectData.map(p => p.embedding.slice(0, 50)); // Use first 50 dims for speed
    const clusterResult = kmeans(embeddings, clusters, {
      initialization: 'kmeans++',
      maxIterations: 50,
    });

    // Group projects by cluster
    const clusteredProjects = new Map<number, typeof projectData>();
    projectData.forEach((project, index) => {
      const clusterId = clusterResult.clusters[index];
      if (!clusteredProjects.has(clusterId)) {
        clusteredProjects.set(clusterId, []);
      }
      clusteredProjects.get(clusterId)!.push(project);
    });

    // Generate nodes and edges for visualization
    const nodes: any[] = [];
    const edges: any[] = [];
    const colors = ['#ef4444', '#f97316', '#22c55e', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

    // Create discovered cause nodes and project nodes
    Array.from(clusteredProjects.entries()).forEach(([clusterId, clusterProjects], clusterIndex) => {
      if (clusterProjects.length < 2) return; // Skip tiny clusters
      
      // Analyze cluster to generate cause name
      const causeName = generateCauseName(clusterProjects);
      const color = colors[clusterIndex % colors.length];
      
      // Add discovered cause node
      const causeNode = {
        id: `discovered-cause-${clusterId}`,
        type: 'discovered-cause',
        label: causeName,
        x: (clusterIndex * 150) - 300,
        y: 0,
        size: Math.min(40, 20 + clusterProjects.length * 2),
        color,
        visible: true,
        highlighted: false,
        opacity: 1,
        data: {
          clusterId,
          projectCount: clusterProjects.length,
          avgStars: clusterProjects.reduce((sum, p) => sum + p.stars, 0) / clusterProjects.length,
          topLanguages: getTopItems(clusterProjects.flatMap(p => p.languages)),
          topTopics: getTopItems(clusterProjects.flatMap(p => p.topics)),
          confidence: calculateClusterConfidence(clusterProjects),
        },
      };
      nodes.push(causeNode);

      // Add project nodes in this cluster
      clusterProjects.forEach((project, projectIndex) => {
        const angle = (projectIndex / clusterProjects.length) * 2 * Math.PI;
        const radius = 80 + Math.random() * 40;
        
        const projectNode = {
          id: `project-${project.id}`,
          type: 'project',
          label: project.name,
          x: causeNode.x + Math.cos(angle) * radius,
          y: causeNode.y + Math.sin(angle) * radius,
          size: Math.min(15, 5 + Math.log10(project.stars + 1) * 2),
          color,
          visible: true,
          highlighted: false,
          opacity: 0.8,
          data: {
            projectId: project.id,
            stars: project.stars,
            forks: project.forks,
            description: project.description,
            languages: project.languages,
            topics: project.topics,
            clusterId,
          },
        };
        nodes.push(projectNode);

        // Add edge from cause to project
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

    // Add connections between similar projects across clusters
    projectData.forEach((project1, i) => {
      projectData.slice(i + 1).forEach((project2, j) => {
        const cluster1 = clusterResult.clusters[i];
        const cluster2 = clusterResult.clusters[i + j + 1];
        
        if (cluster1 !== cluster2) {
          const similarity = calculateProjectSimilarity(project1, project2);
          if (similarity > 0.7) { // High similarity threshold
            edges.push({
              id: `similarity-${project1.id}-${project2.id}`,
              source: `project-${project1.id}`,
              target: `project-${project2.id}`,
              type: 'similarity',
              weight: similarity,
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
      discoveredCauses: clusteredProjects.size,
      projectsClustered: projectData.length,
      averageClusterSize: projectData.length / clusteredProjects.size,
      clusteringMethod: 'embedding-kmeans',
    };

    console.log(`✅ Auto-discovered ${clusteredProjects.size} causes from ${projectData.length} projects`);

    return NextResponse.json({
      nodes,
      edges,
      metrics,
      clusters: Array.from(clusteredProjects.entries()).map(([id, projects]) => ({
        id,
        name: generateCauseName(projects),
        size: projects.length,
        avgStars: projects.reduce((sum, p) => sum + p.stars, 0) / projects.length,
        topLanguages: getTopItems(projects.flatMap(p => p.languages)),
        projects: projects.map(p => ({ id: p.id, name: p.name, stars: p.stars })),
      })),
    });

  } catch (error) {
    console.error('Error in automatic cause discovery:', error);
    return NextResponse.json({ 
      error: 'Failed to discover causes automatically',
      details: (error as any).message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Generate meaningful cause name from cluster projects
 */
function generateCauseName(projects: any[]): string {
  // Extract common keywords from topics and tags
  const allTerms = projects.flatMap(p => [...p.topics, ...p.tags]);
  const termCounts = new Map<string, number>();
  
  allTerms.forEach(term => {
    const cleaned = term.toLowerCase().replace(/[-_]/g, ' ');
    termCounts.set(cleaned, (termCounts.get(cleaned) || 0) + 1);
  });
  
  // Get most common meaningful terms
  const meaningfulTerms = Array.from(termCounts.entries())
    .filter(([term, count]) => 
      count >= 2 && 
      term.length > 2 && 
      !['javascript', 'python', 'react', 'nodejs', 'api', 'web', 'app', 'open', 'source'].includes(term)
    )
    .sort(([,a], [,b]) => b - a)
    .map(([term]) => term);
  
  if (meaningfulTerms.length > 0) {
    const primary = meaningfulTerms[0];
    return primary.charAt(0).toUpperCase() + primary.slice(1).replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Fallback: use description keywords
  const descriptions = projects.map(p => p.description.toLowerCase()).join(' ');
  const commonWords = ['health', 'education', 'climate', 'ai', 'finance', 'government', 'social'];
  const foundWord = commonWords.find(word => descriptions.includes(word));
  
  return foundWord ? 
    foundWord.charAt(0).toUpperCase() + foundWord.slice(1) :
    `Technology Cluster ${Math.floor(Math.random() * 100)}`;
}

/**
 * Get top N most frequent items
 */
function getTopItems(items: string[], n: number = 5): string[] {
  const counts = new Map<string, number>();
  items.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  
  return Array.from(counts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, n)
    .map(([item]) => item);
}

/**
 * Calculate cluster confidence based on internal similarity
 */
function calculateClusterConfidence(projects: any[]): number {
  if (projects.length < 2) return 1.0;
  
  // Simple confidence based on topic/language overlap
  const allTopics = projects.flatMap(p => p.topics);
  const uniqueTopics = new Set(allTopics);
  const overlap = allTopics.length > 0 ? (allTopics.length - uniqueTopics.size) / allTopics.length : 0;
  
  return Math.min(1.0, 0.5 + overlap);
}

/**
 * Calculate similarity between two projects
 */
function calculateProjectSimilarity(p1: any, p2: any): number {
  // Topic overlap
  const topics1 = new Set(p1.topics);
  const topics2 = new Set(p2.topics);
  const topicIntersection = new Set([...topics1].filter(x => topics2.has(x)));
  const topicUnion = new Set([...topics1, ...topics2]);
  const topicSimilarity = topicUnion.size > 0 ? topicIntersection.size / topicUnion.size : 0;
  
  // Language overlap
  const langs1 = new Set(p1.languages);
  const langs2 = new Set(p2.languages);
  const langIntersection = new Set([...langs1].filter(x => langs2.has(x)));
  const langUnion = new Set([...langs1, ...langs2]);
  const langSimilarity = langUnion.size > 0 ? langIntersection.size / langUnion.size : 0;
  
  return (topicSimilarity * 0.7) + (langSimilarity * 0.3);
}