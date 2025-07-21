import { PrismaClient } from '@prisma/client';
import { githubScraper } from '@/lib/pipeline/scrapers/github';
import { logger } from '@/lib/utils/logger';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Expanded search queries for better cause coverage
const CAUSE_SEARCH_QUERIES = {
  'climate-change': [
    'climate change mitigation',
    'carbon footprint tracker',
    'renewable energy monitor',
    'sustainability dashboard',
    'environmental monitoring',
    'green technology',
    'climate data analysis',
    'carbon calculator',
    'clean energy optimization',
    'climate action tool',
    'emissions tracking',
    'solar panel optimization',
    'wind energy analysis',
    'deforestation monitoring',
    'ocean health tracking',
  ],
  'ai-safety': [
    'ai safety research',
    'ai alignment',
    'machine learning ethics',
    'ai interpretability',
    'explainable ai',
    'ai governance framework',
    'ai risk assessment',
    'responsible ai toolkit',
    'ai bias detection',
    'neural network safety',
    'ai transparency tool',
    'model robustness testing',
    'ai fairness audit',
    'adversarial testing ai',
    'ai control problem',
  ],
  'global-health': [
    'public health data',
    'disease surveillance',
    'healthcare accessibility',
    'telemedicine platform',
    'vaccine distribution',
    'epidemic modeling',
    'health equity tool',
    'medical diagnosis ai',
    'patient data privacy',
    'health information system',
    'mental health support',
    'nutrition tracking',
    'maternal health monitoring',
    'disease outbreak prediction',
    'healthcare resource allocation',
  ],
  'education-access': [
    'education platform open source',
    'online learning system',
    'educational content management',
    'skill development platform',
    'literacy app',
    'remote education tool',
    'learning management system',
    'educational game engine',
    'knowledge sharing platform',
    'student assessment tool',
    'curriculum development',
    'language learning app',
    'stem education tool',
    'educational analytics',
    'accessibility learning',
  ],
  'poverty-alleviation': [
    'financial inclusion platform',
    'microfinance system',
    'cash transfer program',
    'economic empowerment tool',
    'poverty mapping',
    'basic income calculator',
    'community development platform',
    'social impact measurement',
    'humanitarian aid distribution',
    'job matching platform',
    'skills marketplace',
    'agricultural support system',
    'small business toolkit',
    'economic mobility tracker',
    'social safety net',
  ],
  'governance-policy': [
    'civic engagement platform',
    'government transparency tool',
    'voting system open source',
    'policy analysis framework',
    'participatory budgeting',
    'citizen feedback system',
    'democratic participation',
    'public service delivery',
    'government data portal',
    'legislative tracking',
    'corruption monitoring',
    'civic tech toolkit',
    'community organizing platform',
    'political accountability',
    'open government data',
  ],
};

async function classifyRepository(repo: any, causes: any[]): Promise<string> {
  try {
    const prompt = `Classify this GitHub repository into one of these cause areas based on its purpose and impact:

Repository: ${repo.name}
Description: ${repo.description || 'No description'}
Topics: ${JSON.parse(repo.topicsJson || '[]').join(', ')}
Language: ${JSON.parse(repo.languagesJson || '[]').join(', ')}

Cause areas:
${causes.map(c => `- ${c.slug}: ${c.description}`).join('\n')}

Return only the slug of the most relevant cause area.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.3,
    });

    const classification = response.choices[0]?.message?.content?.trim().toLowerCase();
    const validCause = causes.find(c => c.slug === classification);
    
    return validCause ? validCause.id : causes[0].id; // Default to first cause if invalid
  } catch (error) {
    logger.error('Error classifying repository:', error);
    // Fallback classification based on keywords
    const repoText = `${repo.name} ${repo.description} ${repo.topicsJson}`.toLowerCase();
    
    for (const cause of causes) {
      const keywords = JSON.parse(cause.keywordsJson || '[]');
      if (keywords.some((keyword: string) => repoText.includes(keyword.toLowerCase()))) {
        return cause.id;
      }
    }
    
    return causes[0].id; // Default to first cause
  }
}

async function scrapeGitHubRepos() {
  logger.info('Starting GitHub repository scraping...');
  
  try {
    // Get all causes from database
    const causes = await prisma.cause.findMany();
    logger.info(`Found ${causes.length} causes`);
    
    const allRepos: any[] = [];
    const reposPerCause = Math.ceil(3000 / causes.length); // Distribute 3000 repos across causes
    
    for (const cause of causes) {
      logger.info(`Scraping repos for cause: ${cause.name}`);
      const queries = CAUSE_SEARCH_QUERIES[cause.slug as keyof typeof CAUSE_SEARCH_QUERIES] || [cause.name];
      const reposForCause: any[] = [];
      const seenRepoIds = new Set<string>();
      
      for (const query of queries) {
        if (reposForCause.length >= reposPerCause) break;
        
        try {
          logger.info(`  Searching: "${query}"`);
          
          const repos = await githubScraper.scrape({
            query,
            minStars: 5, // Lower threshold to get more diverse repos
            maxResults: Math.ceil(reposPerCause / queries.length),
            perPage: 100,
          });
          
          // Filter out duplicates and classify
          for (const repo of repos) {
            if (seenRepoIds.has(repo.externalId)) continue;
            seenRepoIds.add(repo.externalId);
            
            // Use LLM to verify/improve classification
            const classifiedCauseId = await classifyRepository(repo, causes);
            repo.causeId = classifiedCauseId;
            
            reposForCause.push(repo);
          }
          
          // Rate limiting - be respectful of GitHub API
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          logger.error(`Error with query "${query}":`, error);
          // Continue with next query
        }
      }
      
      allRepos.push(...reposForCause.slice(0, reposPerCause));
      logger.info(`  Collected ${reposForCause.length} repos for ${cause.name}`);
    }
    
    logger.info(`Total repos collected: ${allRepos.length}`);
    
    // Save to database
    logger.info('Saving repositories to database...');
    let savedCount = 0;
    let errorCount = 0;
    
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
            languagesJson: repo.languagesJson,
            topicsJson: repo.topicsJson,
            tagsJson: repo.tagsJson,
            activityJson: repo.activityJson,
            impactJson: repo.impactJson,
            coordinationNeedsJson: repo.coordinationNeedsJson,
            metadataJson: repo.metadataJson,
            createdAt: repo.createdAt,
            updatedAt: repo.updatedAt,
            lastActivityAt: repo.lastActivityAt,
          },
        });
        
        savedCount++;
        if (savedCount % 100 === 0) {
          logger.info(`  Progress: ${savedCount}/${allRepos.length} saved`);
        }
      } catch (error) {
        errorCount++;
        logger.error(`Error saving repo ${repo.name}:`, error);
      }
    }
    
    logger.info(`✅ Scraping complete! Saved ${savedCount} repos, ${errorCount} errors`);
    
    // Update cause statistics
    logger.info('Updating cause statistics...');
    for (const cause of causes) {
      const initiativeCount = await prisma.initiative.count({
        where: { causeId: cause.id },
      });
      
      await prisma.cause.update({
        where: { id: cause.id },
        data: {
          metadataJson: JSON.stringify({
            ...JSON.parse(cause.metadataJson || '{}'),
            activeProjects: initiativeCount,
          }),
        },
      });
    }
    
    logger.info('✨ All done!');
    
  } catch (error) {
    logger.error('Fatal error during scraping:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the scraper
if (require.main === module) {
  scrapeGitHubRepos()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}