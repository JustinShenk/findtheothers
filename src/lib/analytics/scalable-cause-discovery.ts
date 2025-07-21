import { PrismaClient } from '@prisma/client';
import { kmeans } from 'ml-kmeans';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ScalableCause {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  color: string;
  level: number; // 0 = top-level, 1 = subcause, etc.
  parentId?: string;
  projects: string[];
  centroid: number[];
  confidence: number;
  size: number;
  metadata: {
    avgStars: number;
    topLanguages: string[];
    topTopics: string[];
    geographicScope: 'global' | 'regional' | 'local';
    maturity: 'emerging' | 'growing' | 'mature';
  };
}

export class ScalableCauseDiscovery {
  private readonly BATCH_SIZE = 1000;
  private readonly EMBEDDING_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Scalable hierarchical cause discovery
   */
  async discoverCausesHierarchical(
    options: {
      maxTopLevelCauses?: number;
      maxSubCauses?: number;
      minProjectsPerCause?: number;
      useCache?: boolean;
    } = {}
  ): Promise<ScalableCause[]> {
    const {
      maxTopLevelCauses = 8,
      maxSubCauses = 3,
      minProjectsPerCause = 5,
      useCache = true
    } = options;
    
    console.log('🔍 Starting scalable hierarchical cause discovery...');
    
    // Step 1: Get embeddings in batches (scalable for millions of projects)
    const projectEmbeddings = await this.getProjectEmbeddingsBatched(useCache);
    console.log(`Processing ${projectEmbeddings.length} projects`);
    
    if (projectEmbeddings.length < maxTopLevelCauses * minProjectsPerCause) {
      return this.fallbackToMetadataClustering(projectEmbeddings);
    }
    
    // Step 2: Hierarchical clustering approach
    const topLevelCauses = await this.discoverTopLevelCauses(
      projectEmbeddings,
      maxTopLevelCauses,
      minProjectsPerCause
    );
    
    // Step 3: Discover subcauses within each top-level cause
    const allCauses: ScalableCause[] = [...topLevelCauses];
    
    for (const topCause of topLevelCauses) {
      if (topCause.projects.length > minProjectsPerCause * 2) {
        const subCauses = await this.discoverSubCauses(
          topCause,
          projectEmbeddings,
          maxSubCauses,
          minProjectsPerCause
        );
        allCauses.push(...subCauses);
      }
    }
    
    console.log(`✅ Discovered ${allCauses.length} causes (${topLevelCauses.length} top-level)`);
    return allCauses;
  }
  
  /**
   * Get project embeddings in batches for scalability
   */
  private async getProjectEmbeddingsBatched(useCache: boolean): Promise<ProjectEmbedding[]> {
    const results: ProjectEmbedding[] = [];
    let offset = 0;
    
    while (true) {
      const batch = await prisma.initiative.findMany({
        where: useCache ? { embeddingJson: { not: null } } : {},
        select: {
          id: true,
          name: true,
          description: true,
          languagesJson: true,
          topicsJson: true,
          tagsJson: true,
          stars: true,
          forks: true,
          embeddingJson: true,
          createdAt: true,
          lastActivityAt: true,
        },
        skip: offset,
        take: this.BATCH_SIZE,
        orderBy: { stars: 'desc' }, // Process high-impact projects first
      });
      
      if (batch.length === 0) break;
      
      const batchEmbeddings = batch
        .map(this.projectToEmbedding)
        .filter(p => p.embedding.length > 0);
      
      results.push(...batchEmbeddings);
      offset += this.BATCH_SIZE;
      
      console.log(`Loaded ${results.length} projects with embeddings...`);
    }
    
    return results;
  }
  
  /**
   * Discover top-level causes using optimized clustering
   */
  private async discoverTopLevelCauses(
    projects: ProjectEmbedding[],
    maxCauses: number,
    minProjects: number
  ): Promise<ScalableCause[]> {
    // Use dimensionality reduction for better clustering on large datasets
    const reducedEmbeddings = this.reduceDimensionsForClustering(
      projects.map(p => p.embedding)
    );
    
    const optimalK = Math.min(maxCauses, Math.floor(projects.length / minProjects));
    
    const clusterResult = kmeans(reducedEmbeddings, optimalK, {
      initialization: 'kmeans++',
      maxIterations: 50, // Reduced for scalability
    });
    
    return await this.analyzeClustersInBatches(
      this.groupProjectsByCluster(projects, clusterResult),
      0 // level 0 = top-level
    );
  }
  
  /**
   * Discover subcauses within a top-level cause
   */
  private async discoverSubCauses(
    parentCause: ScalableCause,
    allProjects: ProjectEmbedding[],
    maxSubCauses: number,
    minProjects: number
  ): Promise<ScalableCause[]> {
    const parentProjects = allProjects.filter(p => 
      parentCause.projects.includes(p.projectId)
    );
    
    if (parentProjects.length < maxSubCauses * minProjects) {
      return [];
    }
    
    const embeddings = parentProjects.map(p => p.embedding);
    const optimalK = Math.min(maxSubCauses, Math.floor(parentProjects.length / minProjects));
    
    const clusterResult = kmeans(embeddings, optimalK, {
      initialization: 'kmeans++',
      maxIterations: 30,
    });
    
    const subcauses = await this.analyzeClustersInBatches(
      this.groupProjectsByCluster(parentProjects, clusterResult),
      1, // level 1 = subcause
      parentCause.id
    );
    
    // Update parent cause to exclude projects now in subcauses
    const subCauseProjects = new Set(subcauses.flatMap(sc => sc.projects));
    parentCause.projects = parentCause.projects.filter(pid => !subCauseProjects.has(pid));
    
    return subcauses;
  }
  
  /**
   * Analyze clusters in batches with LLM optimization
   */
  private async analyzeClustersInBatches(
    clusters: ProjectCluster[],
    level: number,
    parentId?: string
  ): Promise<ScalableCause[]> {
    const results: ScalableCause[] = [];
    const colors = this.generateColorPalette(clusters.length);
    
    // Process clusters in parallel batches for speed
    const batchSize = 3; // LLM concurrency limit
    for (let i = 0; i < clusters.length; i += batchSize) {
      const batch = clusters.slice(i, i + batchSize);
      const batchPromises = batch.map((cluster, idx) => 
        this.analyzeClusterEfficient(cluster, colors[i + idx], level, parentId)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((result): result is ScalableCause => result !== null));
    }
    
    return results;
  }
  
  /**
   * Efficient cluster analysis with caching and fallbacks
   */
  private async analyzeClusterEfficient(
    cluster: ProjectCluster,
    color: string,
    level: number,
    parentId?: string
  ): Promise<ScalableCause | null> {
    try {
      // Use project metadata aggregation for speed
      const metadata = this.aggregateClusterMetadata(cluster.projects);
      
      // Only use LLM for complex cases or when confidence is needed
      if (cluster.projects.length > 10 || level === 0) {
        return await this.analyzeCauseWithLLM(cluster, color, level, parentId, metadata);
      } else {
        return this.createCauseFromMetadata(cluster, color, level, parentId, metadata);
      }
    } catch (error) {
      console.error(`Error analyzing cluster:`, error);
      return this.createFallbackCause(cluster, color, level, parentId);
    }
  }
  
  /**
   * Aggregate metadata for fast cause identification
   */
  private aggregateClusterMetadata(projects: ProjectEmbedding[]) {
    const languages = new Map<string, number>();
    const topics = new Map<string, number>();
    const tags = new Map<string, number>();
    let totalStars = 0;
    
    projects.forEach(p => {
      p.metadata.languages.forEach(lang => {
        languages.set(lang, (languages.get(lang) || 0) + 1);
      });
      p.metadata.topics.forEach(topic => {
        topics.set(topic, (topics.get(topic) || 0) + 1);
      });
      p.metadata.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });
      totalStars += p.metadata.stars;
    });
    
    const sortByCount = (map: Map<string, number>) => 
      Array.from(map.entries())
        .sort(([,a], [,b]) => b - a)
        .map(([key]) => key);
    
    return {
      topLanguages: sortByCount(languages).slice(0, 5),
      topTopics: sortByCount(topics).slice(0, 10),
      topTags: sortByCount(tags).slice(0, 10),
      avgStars: totalStars / projects.length,
      projectCount: projects.length,
    };
  }
  
  /**
   * Create cause from metadata patterns (fast, no LLM)
   */
  private createCauseFromMetadata(
    cluster: ProjectCluster,
    color: string,
    level: number,
    parentId: string | undefined,
    metadata: any
  ): ScalableCause {
    // Simple heuristic-based naming
    const causeKeywords = this.extractCauseKeywords(metadata.topTopics, metadata.topTags);
    const name = this.generateCauseName(causeKeywords, level);
    
    return {
      id: `auto-${level}-${cluster.clusterId}`,
      name,
      description: `${name} initiatives and projects`,
      keywords: causeKeywords.slice(0, 5),
      color,
      level,
      parentId,
      projects: cluster.projects.map(p => p.projectId),
      centroid: cluster.centroid,
      confidence: 0.7, // Medium confidence for metadata-based
      size: cluster.projects.length,
      metadata: {
        avgStars: metadata.avgStars,
        topLanguages: metadata.topLanguages,
        topTopics: metadata.topTopics.slice(0, 5),
        geographicScope: 'global',
        maturity: metadata.avgStars > 1000 ? 'mature' : 'growing',
      },
    };
  }
  
  /**
   * Enhanced LLM analysis with better prompting
   */
  private async analyzeCauseWithLLM(
    cluster: ProjectCluster,
    color: string,
    level: number,
    parentId: string | undefined,
    metadata: any
  ): Promise<ScalableCause> {
    // Select representative projects for analysis
    const sampleProjects = this.selectRepresentativeProjects(cluster.projects, 8);
    
    const prompt = `Analyze these ${cluster.projects.length} open-source projects that were automatically clustered together. Identify the common cause or impact area they address.

Sample projects (${sampleProjects.length} of ${cluster.projects.length}):
${sampleProjects.map((p, i) => 
  `${i + 1}. ${p.metadata.name} (${p.metadata.stars}⭐)
     ${p.metadata.description.slice(0, 150)}
     Topics: ${p.metadata.topics.slice(0, 4).join(', ')}`
).join('\n\n')}

Common patterns:
- Languages: ${metadata.topLanguages.slice(0, 3).join(', ')}
- Topics: ${metadata.topTopics.slice(0, 5).join(', ')}
- Avg stars: ${Math.round(metadata.avgStars)}

Return JSON:
{
  "name": "2-4 word cause name focusing on IMPACT/PROBLEM not technology",
  "description": "1 sentence describing the societal challenge addressed",
  "keywords": ["4-6 keywords defining this cause area"],
  "confidence": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });
    
    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      id: `llm-${level}-${cluster.clusterId}`,
      name: analysis.name || `Auto-discovered Cause ${cluster.clusterId}`,
      description: analysis.description || 'Automatically discovered cause area',
      keywords: analysis.keywords || [],
      color,
      level,
      parentId,
      projects: cluster.projects.map(p => p.projectId),
      centroid: cluster.centroid,
      confidence: analysis.confidence || 0.8,
      size: cluster.projects.length,
      metadata: {
        avgStars: metadata.avgStars,
        topLanguages: metadata.topLanguages,
        topTopics: metadata.topTopics.slice(0, 5),
        geographicScope: 'global',
        maturity: metadata.avgStars > 1000 ? 'mature' : 'growing',
      },
    };
  }
  
  /**
   * Select representative projects for LLM analysis
   */
  private selectRepresentativeProjects(
    projects: ProjectEmbedding[],
    count: number
  ): ProjectEmbedding[] {
    // Strategy: Mix of high-star projects and diverse examples
    const sorted = [...projects].sort((a, b) => b.metadata.stars - a.metadata.stars);
    const highStar = sorted.slice(0, Math.floor(count * 0.6));
    const diverse = sorted.slice(Math.floor(count * 0.6), count);
    
    return [...highStar, ...diverse];
  }
  
  /**
   * Reduce embedding dimensions for faster clustering on large datasets
   */
  private reduceDimensionsForClustering(embeddings: number[][]): number[][] {
    // For scalability, reduce to 50 dimensions using simple selection
    // In production, use proper PCA or random projection
    return embeddings.map(emb => emb.slice(0, 50));
  }
  
  /**
   * Fallback to simple metadata clustering when embeddings fail
   */
  private async fallbackToMetadataClustering(projects: ProjectEmbedding[]): Promise<ScalableCause[]> {
    console.log('Using fallback metadata clustering...');
    
    // Create feature vectors from metadata
    const features = projects.map(p => this.createMetadataFeatures(p));
    
    const optimalK = Math.min(6, Math.floor(projects.length / 3));
    const clusterResult = kmeans(features, optimalK, {
      initialization: 'kmeans++',
      maxIterations: 30,
    });
    
    return this.analyzeClustersInBatches(
      this.groupProjectsByCluster(projects, clusterResult),
      0,
      undefined
    );
  }
  
  private createMetadataFeatures(project: ProjectEmbedding): number[] {
    // Convert text metadata to numerical features
    const features = [
      Math.log10(project.metadata.stars + 1) / 5,
      Math.log10(project.metadata.forks + 1) / 5,
      project.metadata.languages.length / 10,
      project.metadata.topics.length / 10,
    ];
    
    // Add binary features for common domains
    const domains = ['health', 'climate', 'education', 'ai', 'finance', 'government'];
    domains.forEach(domain => {
      const hasKeyword = project.metadata.topics.some(t => 
        t.toLowerCase().includes(domain)
      ) || project.metadata.tags.some(tag => 
        tag.toLowerCase().includes(domain)
      );
      features.push(hasKeyword ? 1 : 0);
    });
    
    return features;
  }
  
  // Utility methods
  private projectToEmbedding = (init: any): ProjectEmbedding => ({
    projectId: init.id,
    embedding: JSON.parse(init.embeddingJson || '[]'),
    metadata: {
      name: init.name,
      description: init.description || '',
      languages: JSON.parse(init.languagesJson || '[]'),
      topics: JSON.parse(init.topicsJson || '[]'),
      tags: JSON.parse(init.tagsJson || '[]'),
      stars: init.stars || 0,
      forks: init.forks || 0,
    }
  });
  
  private groupProjectsByCluster(projects: ProjectEmbedding[], clusterResult: any): ProjectCluster[] {
    const clusters = new Map<number, ProjectEmbedding[]>();
    
    projects.forEach((project, index) => {
      const clusterId = clusterResult.clusters[index];
      if (!clusters.has(clusterId)) {
        clusters.set(clusterId, []);
      }
      clusters.get(clusterId)!.push(project);
    });
    
    return Array.from(clusters.entries()).map(([clusterId, clusterProjects]) => ({
      clusterId,
      projects: clusterProjects,
      centroid: clusterResult.centroids[clusterId],
    }));
  }
  
  private extractCauseKeywords(topics: string[], tags: string[]): string[] {
    const combined = [...topics, ...tags];
    const meaningful = combined.filter(term => 
      term.length > 2 && !['js', 'css', 'api', 'web', 'app'].includes(term.toLowerCase())
    );
    return meaningful.slice(0, 8);
  }
  
  private generateCauseName(keywords: string[], level: number): string {
    if (keywords.length === 0) return `Discovered Cause`;
    
    const primary = keywords[0];
    const secondary = keywords[1];
    
    if (level === 0) {
      return primary.charAt(0).toUpperCase() + primary.slice(1);
    } else {
      return secondary ? 
        `${primary} ${secondary}`.replace(/\b\w/g, l => l.toUpperCase()) :
        `${primary} Technology`;
    }
  }
  
  private generateColorPalette(count: number): string[] {
    const baseColors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4',
      '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
    ];
    
    // Generate more colors if needed
    const colors = [...baseColors];
    while (colors.length < count) {
      colors.push(...baseColors);
    }
    
    return colors.slice(0, count);
  }
  
  private createFallbackCause(
    cluster: ProjectCluster,
    color: string,
    level: number,
    parentId?: string
  ): ScalableCause {
    return {
      id: `fallback-${level}-${cluster.clusterId}`,
      name: `Cause Area ${cluster.clusterId + 1}`,
      description: 'Automatically identified project cluster',
      keywords: [],
      color,
      level,
      parentId,
      projects: cluster.projects.map(p => p.projectId),
      centroid: cluster.centroid,
      confidence: 0.3,
      size: cluster.projects.length,
      metadata: {
        avgStars: 0,
        topLanguages: [],
        topTopics: [],
        geographicScope: 'global',
        maturity: 'emerging',
      },
    };
  }
}

// Type definitions
interface ProjectEmbedding {
  projectId: string;
  embedding: number[];
  metadata: {
    name: string;
    description: string;
    languages: string[];
    topics: string[];
    tags: string[];
    stars: number;
    forks: number;
  };
}

interface ProjectCluster {
  clusterId: number;
  projects: ProjectEmbedding[];
  centroid: number[];
}