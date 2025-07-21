import { PrismaClient } from '@prisma/client';
import { githubScraper } from '@/lib/pipeline/scrapers/github';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();

// Limited set of high-impact search queries
const LIMITED_QUERIES = {
  'climate-change': [
    'climate change stars:>100',
    'carbon footprint stars:>50',
    'renewable energy stars:>50',
  ],
  'ai-safety': [
    'ai safety stars:>50',
    'ai alignment stars:>30',
    'machine learning ethics stars:>50',
  ],
  'global-health': [
    'public health stars:>50',
    'healthcare open source stars:>100',
    'telemedicine stars:>30',
  ],
  'education-access': [
    'education platform stars:>100',
    'online learning stars:>50',
    'edtech stars:>50',
  ],
  'poverty-alleviation': [
    'financial inclusion stars:>30',
    'social impact stars:>50',
    'humanitarian stars:>30',
  ],
  'governance-policy': [
    'civic tech stars:>50',
    'government transparency stars:>30',
    'democracy technology stars:>20',
  ],
};

async function scrapeLimitedRepos() {
  logger.info('Starting LIMITED GitHub scraping (no auth token)...');
  logger.info('Note: This will collect fewer repos due to rate limits');
  
  try {
    const causes = await prisma.cause.findMany();
    const allRepos: any[] = [];
    const reposPerCause = 50; // Much smaller number due to rate limits
    
    for (const cause of causes) {
      logger.info(`Scraping repos for cause: ${cause.name}`);
      const queries = LIMITED_QUERIES[cause.slug as keyof typeof LIMITED_QUERIES] || [];
      const reposForCause: any[] = [];
      const seenRepoIds = new Set<string>();
      
      for (const query of queries) {
        if (reposForCause.length >= reposPerCause) break;
        
        try {
          logger.info(`  Searching: "${query}"`);
          
          const repos = await githubScraper.scrape({
            query,
            maxResults: Math.ceil(reposPerCause / queries.length),
            perPage: 30, // Smaller page size
          });
          
          for (const repo of repos) {
            if (seenRepoIds.has(repo.externalId)) continue;
            seenRepoIds.add(repo.externalId);
            
            repo.causeId = cause.id;
            reposForCause.push(repo);
          }
          
          // Longer wait time for unauthenticated requests
          logger.info('  Waiting 10 seconds (rate limiting)...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          
        } catch (error: any) {
          if (error.status === 403) {
            logger.error('Rate limit exceeded! Waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
          } else {
            logger.error(`Error with query "${query}":`, error.message);
          }
        }
      }
      
      allRepos.push(...reposForCause);
      logger.info(`  Collected ${reposForCause.length} repos for ${cause.name}`);
    }
    
    logger.info(`Total repos collected: ${allRepos.length}`);
    
    // Save to database
    logger.info('Saving repositories to database...');
    let savedCount = 0;
    
    for (const repo of allRepos) {
      try {
        await prisma.initiative.upsert({
          where: {
            platform_externalId: {
              platform: 'github',
              externalId: repo.externalId,
            },
          },
          update: {
            name: repo.name,
            description: repo.description,
            stars: repo.stars,
            forks: repo.forks,
            languagesJson: repo.languagesJson,
            topicsJson: repo.topicsJson,
            activityJson: repo.activityJson,
            impactJson: repo.impactJson,
            updatedAt: new Date(),
            lastActivityAt: repo.lastActivityAt,
          },
          create: {
            type: repo.type,
            platform: repo.platform,
            externalId: repo.externalId,
            name: repo.name,
            description: repo.description,
            url: repo.url,
            ownerJson: repo.ownerJson,
            causeId: repo.causeId,
            stars: repo.stars,
            forks: repo.forks,
            languagesJson: repo.languagesJson || '[]',
            topicsJson: repo.topicsJson || '[]',
            tagsJson: repo.tagsJson || '[]',
            activityJson: repo.activityJson,
            impactJson: repo.impactJson,
            coordinationNeedsJson: repo.coordinationNeedsJson || '[]',
            metadataJson: repo.metadataJson,
            createdAt: repo.createdAt,
            updatedAt: repo.updatedAt,
            lastActivityAt: repo.lastActivityAt,
          },
        });
        
        savedCount++;
      } catch (error) {
        logger.error(`Error saving repo ${repo.name}:`, error);
      }
    }
    
    logger.info(`✅ Scraping complete! Saved ${savedCount} repos`);
    logger.info('Note: For more repos, add a GitHub token to your .env file');
    
  } catch (error) {
    logger.error('Fatal error during scraping:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the scraper
if (require.main === module) {
  scrapeLimitedRepos()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}