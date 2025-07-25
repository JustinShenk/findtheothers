import { Octokit } from '@octokit/rest';
import { PrismaClient } from '@prisma/client';
import { Initiative } from '@/types/initiative';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN || undefined,
});

interface GitHubSearchParams {
  query?: string;
  topics?: string[];
  language?: string;
  minStars?: number;
  since?: Date;
  perPage?: number;
  maxResults?: number;
}

// Cause-related search queries
const CAUSE_QUERIES = {
  'climate-change': [
    'climate change',
    'carbon footprint',
    'renewable energy',
    'sustainability',
    'environmental',
    'green tech',
    'climate action',
    'carbon emissions',
    'clean energy',
  ],
  'ai-safety': [
    'ai safety',
    'ai alignment',
    'artificial intelligence ethics',
    'machine learning safety',
    'ai governance',
    'ai risk',
    'interpretability',
    'explainable ai',
    'responsible ai',
  ],
  'global-health': [
    'public health',
    'healthcare',
    'medical',
    'disease prevention',
    'pandemic',
    'vaccine',
    'health equity',
    'telemedicine',
    'health data',
  ],
  'education-access': [
    'education technology',
    'edtech',
    'online learning',
    'educational',
    'literacy',
    'skill development',
    'mooc',
    'learning platform',
    'education access',
  ],
  'poverty-alleviation': [
    'poverty',
    'financial inclusion',
    'microfinance',
    'economic development',
    'social impact',
    'humanitarian',
    'basic income',
    'development aid',
    'economic empowerment',
  ],
  'governance-policy': [
    'civic tech',
    'government',
    'democracy',
    'transparency',
    'open government',
    'policy',
    'voting',
    'civic engagement',
    'public service',
  ],
};

export const githubScraper = {
  async scrape(params: GitHubSearchParams): Promise<any[]> {
    const results: any[] = [];
    const { maxResults = 100, perPage = 100 } = params;
    
    try {
      // Build search query
      let searchQuery = params.query || '';
      if (params.minStars) {
        searchQuery += ` stars:>=${params.minStars}`;
      }
      if (params.language) {
        searchQuery += ` language:${params.language}`;
      }
      if (params.since) {
        searchQuery += ` created:>=${params.since.toISOString().split('T')[0]}`;
      }

      logger.info(`Searching GitHub with query: ${searchQuery}`);

      const response = await octokit.search.repos({
        q: searchQuery,
        sort: 'stars',
        order: 'desc',
        per_page: Math.min(perPage, maxResults),
      });

      for (const repo of response.data.items) {
        // Get additional repo details
        const [languages, contributors, topics] = await Promise.all([
          octokit.repos.listLanguages({ owner: repo.owner?.login || '', repo: repo.name }).catch(() => ({ data: {} })),
          octokit.repos.listContributors({ owner: repo.owner?.login || '', repo: repo.name, per_page: 5 }).catch(() => ({ data: [] })),
          Promise.resolve({ data: repo.topics || [] }),
        ]);

        const initiative = {
          type: 'repository',
          platform: 'github',
          externalId: repo.id.toString(),
          name: repo.name,
          description: repo.description || '',
          url: repo.html_url,
          ownerJson: JSON.stringify({
            id: repo.owner?.id.toString(),
            name: repo.owner?.login,
            type: repo.owner?.type.toLowerCase(),
            avatar: repo.owner?.avatar_url,
            url: repo.owner?.html_url,
          }),
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          languagesJson: JSON.stringify(Object.keys(languages.data)),
          topicsJson: JSON.stringify(repo.topics || []),
          tagsJson: JSON.stringify([
            ...repo.topics || [],
            repo.language || '',
          ].filter(Boolean)),
          activityJson: JSON.stringify({
            commits: 0, // Would need separate API call
            issues: repo.open_issues_count,
            pullRequests: 0, // Would need separate API call
            lastCommitAt: repo.pushed_at,
            contributionFrequency: this.getActivityFrequency(new Date(repo.pushed_at)),
            growthRate: 0, // Would need historical data
            engagementScore: this.calculateEngagementScore(repo),
          }),
          impactJson: JSON.stringify({
            score: this.calculateImpactScore(repo),
            reach: 'global',
            beneficiaries: repo.stargazers_count * 10, // Rough estimate
            communitySize: contributors?.data?.length || 0,
            citationCount: 0,
            derivativeWorks: repo.forks_count,
          }),
          coordinationNeedsJson: JSON.stringify([]),
          metadataJson: JSON.stringify({
            license: repo.license?.spdx_id || 'Unknown',
            documentation: {
              hasReadme: true, // GitHub repos have README by default
              hasContributing: false,
              hasCodeOfConduct: false,
              hasLicense: !!repo.license,
            },
            maintainability: {
              overall: 70, // Placeholder
            },
            accessibility: {
              overall: 60, // Placeholder
              languageSupport: [repo.language || 'Unknown'],
            },
            fundingStatus: {
              status: 'unknown',
            },
          }),
          createdAt: new Date(repo.created_at),
          updatedAt: new Date(repo.updated_at),
          lastActivityAt: new Date(repo.pushed_at),
        };

        results.push(initiative);

        if (results.length >= maxResults) {
          break;
        }
      }

      logger.info(`Scraped ${results.length} repositories from GitHub`);
      return results;
    } catch (error) {
      logger.error('GitHub scraping error:', error);
      throw error;
    }
  },

  async scrapeForAllCauses(reposPerCause: number = 500): Promise<any[]> {
    const allRepos: any[] = [];
    const causes = await prisma.cause.findMany();
    
    for (const cause of causes) {
      const queries = (CAUSE_QUERIES as any)[cause.slug] || [cause.name.toLowerCase()];
      const reposForCause: any[] = [];
      
      for (const query of queries) {
        if (reposForCause.length >= reposPerCause) break;
        
        try {
          const repos = await this.scrape({
            query,
            minStars: 10, // Focus on somewhat popular repos
            maxResults: Math.ceil(reposPerCause / queries.length),
            perPage: 100,
          });
          
          // Add cause information
          for (const repo of repos) {
            repo.causeId = cause.id;
            repo.suggestedCause = cause.slug;
          }
          
          reposForCause.push(...repos);
          
          // Rate limiting - GitHub allows 30 requests per minute for authenticated users
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between queries
        } catch (error) {
          logger.error(`Error scraping for cause ${cause.name} with query "${query}":`, error);
        }
      }
      
      allRepos.push(...reposForCause.slice(0, reposPerCause));
      logger.info(`Collected ${reposForCause.length} repos for cause: ${cause.name}`);
    }
    
    return allRepos;
  },

  getActivityFrequency(lastPush: Date): string {
    const daysSinceLastPush = (Date.now() - lastPush.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastPush < 7) return 'daily';
    if (daysSinceLastPush < 30) return 'weekly';
    if (daysSinceLastPush < 90) return 'monthly';
    if (daysSinceLastPush < 365) return 'sporadic';
    return 'inactive';
  },

  calculateEngagementScore(repo: any): number {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const issues = repo.open_issues_count || 0;
    const watchers = repo.watchers_count || 0;
    
    // Weighted score
    const score = (stars * 0.4) + (forks * 0.3) + (watchers * 0.2) + (issues * 0.1);
    
    // Normalize to 0-100
    return Math.min(100, Math.log10(score + 1) * 20);
  },

  calculateImpactScore(repo: any): number {
    const engagement = this.calculateEngagementScore(repo);
    const recency = this.getActivityFrequency(new Date(repo.pushed_at)) === 'daily' ? 20 : 
                    this.getActivityFrequency(new Date(repo.pushed_at)) === 'weekly' ? 15 : 10;
    const hasLicense = repo.license ? 10 : 0;
    const hasDescription = repo.description ? 10 : 0;
    
    return Math.min(100, engagement * 0.6 + recency + hasLicense + hasDescription);
  },
};

export default githubScraper;