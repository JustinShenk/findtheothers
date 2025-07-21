import { PrismaClient } from '@prisma/client';
import { kmeans } from 'ml-kmeans';
import { EmbeddingGenerator } from '@/lib/embeddings/generator';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DiscoveredCause {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  color: string;
  projects: string[];
  centroid: number[];
  confidence: number;
  size: number;
}

export interface ProjectCluster {
  projectId: string;
  embedding: number[];
  metadata: {
    name: string;
    description: string;
    languages: string[];
    topics: string[];
    tags: string[];
    stars: number;
  };
}

export class CauseDiscovery {
  private embeddingGenerator = new EmbeddingGenerator();
  
  /**
   * Discover causes automatically from project embeddings and metadata
   */
  async discoverCauses(
    maxCauses: number = 8,
    minProjectsPerCause: number = 3
  ): Promise<DiscoveredCause[]> {
    console.log('🔍 Starting automatic cause discovery...');
    
    // Get all projects with embeddings
    const projects = await this.getProjectsWithEmbeddings();
    console.log(`Found ${projects.length} projects with embeddings`);
    
    if (projects.length < maxCauses * minProjectsPerCause) {
      console.warn('Not enough projects for reliable clustering');
      return [];
    }
    
    // Extract embeddings for clustering
    const embeddings = projects.map(p => p.embedding);
    const optimalK = this.calculateOptimalClusters(embeddings, maxCauses, minProjectsPerCause);
    
    console.log(`Clustering ${projects.length} projects into ${optimalK} causes...`);
    
    // Perform k-means clustering on embeddings
    const clusterResult = kmeans(embeddings, optimalK, {
      initialization: 'kmeans++',
      maxIterations: 100,
    });
    
    // Group projects by cluster
    const clusters = this.groupProjectsByClusters(projects, clusterResult);
    
    // Generate cause names and descriptions using LLM
    const discoveredCauses = await this.generateCauseDescriptions(clusters);
    
    console.log(`✅ Discovered ${discoveredCauses.length} causes:`);
    discoveredCauses.forEach(cause => {
      console.log(`  - ${cause.name}: ${cause.projects.length} projects`);
    });
    
    return discoveredCauses;
  }
  
  /**
   * Get all projects with their embeddings
   */
  private async getProjectsWithEmbeddings(): Promise<ProjectCluster[]> {
    const initiatives = await prisma.initiative.findMany({
      where: {
        embeddingJson: { not: null }
      },
      select: {
        id: true,
        name: true,
        description: true,
        languagesJson: true,
        topicsJson: true,
        tagsJson: true,
        stars: true,
        embeddingJson: true,
      }
    });
    
    return initiatives.map(init => ({
      projectId: init.id,
      embedding: JSON.parse(init.embeddingJson || '[]'),
      metadata: {
        name: init.name,
        description: init.description,
        languages: JSON.parse(init.languagesJson || '[]'),
        topics: JSON.parse(init.topicsJson || '[]'),
        tags: JSON.parse(init.tagsJson || '[]'),
        stars: init.stars,
      }
    })).filter(p => p.embedding.length > 0);
  }
  
  /**
   * Calculate optimal number of clusters using elbow method
   */
  private calculateOptimalClusters(
    embeddings: number[][],
    maxK: number,
    minProjectsPerCluster: number
  ): number {
    const maxPossibleK = Math.floor(embeddings.length / minProjectsPerCluster);
    const targetK = Math.min(maxK, maxPossibleK);
    
    // Simple heuristic: sqrt(n/2) bounded by constraints
    const heuristicK = Math.max(2, Math.min(targetK, Math.floor(Math.sqrt(embeddings.length / 2))));
    
    console.log(`Optimal clusters: ${heuristicK} (max: ${maxK}, feasible: ${maxPossibleK})`);
    return heuristicK;
  }
  
  /**
   * Group projects by their cluster assignments
   */
  private groupProjectsByClusters(
    projects: ProjectCluster[],
    clusterResult: any
  ): Array<{
    clusterId: number;
    projects: ProjectCluster[];
    centroid: number[];
  }> {
    const clusterMap = new Map<number, ProjectCluster[]>();
    
    projects.forEach((project, index) => {
      const clusterId = clusterResult.clusters[index];
      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, []);
      }
      clusterMap.get(clusterId)!.push(project);
    });
    
    return Array.from(clusterMap.entries()).map(([clusterId, clusterProjects]) => ({
      clusterId,
      projects: clusterProjects,
      centroid: clusterResult.centroids[clusterId],
    }));
  }
  
  /**
   * Generate cause names and descriptions using LLM analysis
   */
  private async generateCauseDescriptions(
    clusters: Array<{
      clusterId: number;
      projects: ProjectCluster[];
      centroid: number[];
    }>
  ): Promise<DiscoveredCause[]> {
    const discoveredCauses: DiscoveredCause[] = [];
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4',
      '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
    ];
    
    for (const [index, cluster] of clusters.entries()) {
      try {
        const cause = await this.analyzeCauseCluster(cluster, colors[index % colors.length]);
        discoveredCauses.push(cause);
      } catch (error) {
        console.error(`Error analyzing cluster ${cluster.clusterId}:`, error);
        // Fallback to simple analysis
        const fallbackCause = this.createFallbackCause(cluster, colors[index % colors.length]);
        discoveredCauses.push(fallbackCause);
      }
    }
    
    return discoveredCauses;
  }
  
  /**
   * Use LLM to analyze a cluster and generate cause description
   */
  private async analyzeCauseCluster(
    cluster: {
      clusterId: number;
      projects: ProjectCluster[];
      centroid: number[];
    },
    color: string
  ): Promise<DiscoveredCause> {
    // Prepare project data for LLM analysis
    const projectSummaries = cluster.projects.slice(0, 10).map(p => ({
      name: p.metadata.name,
      description: p.metadata.description.slice(0, 200), // Truncate to avoid token limits
      topics: p.metadata.topics.slice(0, 5),
      tags: p.metadata.tags.slice(0, 5),
      languages: p.metadata.languages.slice(0, 3),
    }));
    
    const prompt = `Analyze these ${cluster.projects.length} open-source projects that were grouped together by AI clustering. Identify the common cause or problem domain they address.

Projects:
${projectSummaries.map((p, i) => 
  `${i + 1}. ${p.name}: ${p.description}
     Topics: ${p.topics.join(', ')}
     Tags: ${p.tags.join(', ')}`
).join('\n\n')}

Respond with a JSON object containing:
{
  "name": "Clear, concise cause name (2-4 words)",
  "description": "Brief description of what this cause area addresses (1-2 sentences)",
  "keywords": ["3-5 relevant keywords that define this cause"],
  "confidence": 0.95 // How confident you are this is a coherent cause (0-1)
}

Focus on the underlying problem or mission, not just the technology used.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });
    
    const analysisText = response.choices[0]?.message?.content || '{}';
    
    try {
      const analysis = JSON.parse(analysisText);
      
      return {
        id: `discovered-${cluster.clusterId}`,
        name: analysis.name || `Cause ${cluster.clusterId + 1}`,
        description: analysis.description || 'Automatically discovered cause area',
        keywords: analysis.keywords || [],
        color,
        projects: cluster.projects.map(p => p.projectId),
        centroid: cluster.centroid,
        confidence: analysis.confidence || 0.5,
        size: cluster.projects.length,
      };
    } catch (parseError) {
      console.error('Failed to parse LLM response:', analysisText);
      return this.createFallbackCause(cluster, color);
    }
  }
  
  /**
   * Create fallback cause when LLM analysis fails
   */
  private createFallbackCause(
    cluster: {
      clusterId: number;
      projects: ProjectCluster[];
      centroid: number[];
    },
    color: string
  ): DiscoveredCause {
    // Extract common keywords from topics and tags
    const allKeywords = new Set<string>();
    cluster.projects.forEach(p => {
      p.metadata.topics.forEach(topic => allKeywords.add(topic.toLowerCase()));
      p.metadata.tags.forEach(tag => allKeywords.add(tag.toLowerCase()));
    });
    
    const topKeywords = Array.from(allKeywords)
      .slice(0, 5)
      .map(kw => kw.charAt(0).toUpperCase() + kw.slice(1));
    
    const name = topKeywords.length > 0 ? 
      topKeywords[0].charAt(0).toUpperCase() + topKeywords[0].slice(1) + ' Technology' :
      `Technology Cluster ${cluster.clusterId + 1}`;
    
    return {
      id: `discovered-${cluster.clusterId}`,
      name,
      description: `Projects focused on ${topKeywords.slice(0, 3).join(', ').toLowerCase()} solutions`,
      keywords: topKeywords,
      color,
      projects: cluster.projects.map(p => p.projectId),
      centroid: cluster.centroid,
      confidence: 0.3,
      size: cluster.projects.length,
    };
  }
  
  /**
   * Calculate silhouette score for clustering quality
   */
  calculateClusteringQuality(
    embeddings: number[][],
    clusterAssignments: number[]
  ): number {
    // Implementation of silhouette score calculation
    // This helps evaluate if the automatic clustering is working well
    return 0.5; // Placeholder
  }
}