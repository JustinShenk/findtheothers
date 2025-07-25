import OpenAI from 'openai';
import { Initiative } from '@/types/initiative';
import { Contributor } from '@/types/contributor';
import { Cause } from '@/types/cause';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  metadata: any;
}

export class EmbeddingGenerator {
  private model = 'text-embedding-3-small';
  private dimensions = 1536;

  /**
   * Generate embedding for an initiative
   */
  async generateInitiativeEmbedding(initiative: Initiative): Promise<EmbeddingResult> {
    const text = this.createInitiativeText(initiative);
    const embedding = await this.getEmbedding(text);
    
    return {
      embedding,
      text,
      metadata: {
        type: 'initiative',
        id: initiative.id,
        stars: initiative.stars,
        forks: initiative.forks,
        languages: initiative.languages,
        topics: initiative.topics,
      },
    };
  }

  /**
   * Generate embedding for a contributor
   */
  async generateContributorEmbedding(contributor: Contributor): Promise<EmbeddingResult> {
    const text = this.createContributorText(contributor);
    const embedding = await this.getEmbedding(text);
    
    return {
      embedding,
      text,
      metadata: {
        type: 'contributor',
        id: contributor.id,
        name: contributor.name,
        location: contributor.location,
        skills: contributor.skills,
      },
    };
  }

  /**
   * Generate embedding for a cause
   */
  async generateCauseEmbedding(cause: Cause): Promise<EmbeddingResult> {
    const text = this.createCauseText(cause);
    const embedding = await this.getEmbedding(text);
    
    return {
      embedding,
      text,
      metadata: {
        type: 'cause',
        id: cause.id,
        name: cause.name,
        impactScore: cause.impactScore,
        keywords: cause.keywords,
      },
    };
  }

  /**
   * Generate batch embeddings for multiple items
   */
  async generateBatchEmbeddings(items: Array<Initiative | Contributor | Cause>): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(item => {
        if ('platform' in item) {
          return this.generateInitiativeEmbedding(item as Initiative);
        } else if ('githubUsername' in item) {
          return this.generateContributorEmbedding(item as Contributor);
        } else {
          return this.generateCauseEmbedding(item as Cause);
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Create text representation of an initiative
   */
  private createInitiativeText(initiative: Initiative): string {
    const parts = [
      `Project: ${initiative.name}`,
      `Description: ${initiative.description}`,
      `Platform: ${initiative.platform}`,
      `Stars: ${initiative.stars}`,
      `Forks: ${initiative.forks}`,
    ];

    if (initiative.languages?.length) {
      parts.push(`Languages: ${initiative.languages.join(', ')}`);
    }

    if (initiative.topics?.length) {
      parts.push(`Topics: ${initiative.topics.join(', ')}`);
    }

    if (initiative.tags?.length) {
      parts.push(`Tags: ${initiative.tags.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Create text representation of a contributor
   */
  private createContributorText(contributor: Contributor): string {
    const parts = [
      `Contributor: ${contributor.name || 'Unknown'}`,
      `Bio: ${contributor.bio || 'No bio available'}`,
      `Location: ${contributor.location || 'Unknown'}`,
    ];

    if (contributor.skills?.length) {
      const skillNames = contributor.skills.map(s => s.name).join(', ');
      parts.push(`Skills: ${skillNames}`);
    }

    if (contributor.causes?.length) {
      const causeNames = contributor.causes.map(c => c.causeId).join(', ');
      parts.push(`Causes: ${causeNames}`);
    }

    return parts.join('\n');
  }

  /**
   * Create text representation of a cause
   */
  private createCauseText(cause: Cause): string {
    const parts = [
      `Cause: ${cause.name}`,
      `Description: ${cause.description}`,
      `Impact Score: ${cause.impactScore}`,
    ];

    if (cause.keywords?.length) {
      parts.push(`Keywords: ${cause.keywords.join(', ')}`);
    }

    if (cause.metadata) {
      const metadata = cause.metadata as any;
      if (metadata.urgency) {
        parts.push(`Urgency: ${metadata.urgency}`);
      }
      if (metadata.tractability) {
        parts.push(`Tractability: ${metadata.tractability}`);
      }
      if (metadata.geographicScope) {
        parts.push(`Geographic Scope: ${metadata.geographicScope}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Get embedding from OpenAI API
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      // Log large texts for debugging
      if (text.length > 6000) {
        console.log(`\n🚨 LARGE TEXT DETECTED (${text.length} characters):`);
        console.log('='.repeat(80));
        console.log(text);
        console.log('='.repeat(80));
        console.log(`Estimated tokens: ~${Math.ceil(text.length / 4)}`);
        console.log('');
      }

      const response = await openai.embeddings.create({
        model: this.model,
        input: text,
        dimensions: this.dimensions,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      console.error(`Text length was: ${text.length} characters`);
      console.error('Full text that caused error:');
      console.error(text);
      // Return a zero vector as fallback
      return new Array(this.dimensions).fill(0);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find similar items using embedding similarity
   */
  static findSimilar(
    targetEmbedding: number[],
    candidates: EmbeddingResult[],
    topK: number = 5
  ): Array<EmbeddingResult & { similarity: number }> {
    const similarities = candidates.map(candidate => ({
      ...candidate,
      similarity: this.cosineSimilarity(targetEmbedding, candidate.embedding),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Reduce embedding dimensions using PCA
   */
  static reduceDimensions(embeddings: number[][], targetDimensions: number = 3): number[][] {
    if (embeddings.length === 0) return [];

    // This is a simplified PCA implementation
    // For production, use a proper PCA library
    const mean = embeddings[0].map((_, i) => 
      embeddings.reduce((sum, emb) => sum + emb[i], 0) / embeddings.length
    );

    // Center the data
    const centered = embeddings.map(emb => 
      emb.map((val, i) => val - mean[i])
    );

    // For simplicity, just take the first N dimensions
    // In a full implementation, you'd compute the covariance matrix and eigenvectors
    return centered.map(emb => emb.slice(0, targetDimensions));
  }
}