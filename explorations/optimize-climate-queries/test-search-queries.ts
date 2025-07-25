import { githubScraper } from '@/lib/pipeline/scrapers/github';
import { logger } from '@/lib/utils/logger';

// Test queries for climate change
const TEST_QUERIES = [
  'topic:climate-change stars:>10',
  'topic:carbon-footprint stars:>5',
  'topic:renewable-energy stars:>10',
  '"climate model" language:Python stars:>5',
  '"carbon emissions" stars:>10',
  'org:openclimatefix',
  '"sustainability dashboard" stars:>5',
  '"climate data" visualization stars:>3',
];

async function testSearchQuery(query: string, maxResults = 10) {
  try {
    logger.info(`\n🔍 Testing query: "${query}"`);
    
    const repos = await githubScraper.scrape({
      query,
      maxResults,
      perPage: maxResults,
    });
    
    logger.info(`📊 Found ${repos.length} repositories`);
    
    if (repos.length > 0) {
      logger.info('📋 Top results:');
      repos.slice(0, 5).forEach((repo, i) => {
        const topics = JSON.parse(repo.topicsJson || '[]').slice(0, 3).join(', ');
        logger.info(`  ${i + 1}. ${repo.name} (${repo.stars}⭐)`);
        logger.info(`     ${repo.description || 'No description'}`);
        if (topics) logger.info(`     Topics: ${topics}`);
        logger.info(`     URL: ${repo.url}`);
        logger.info('');
      });
    }
    
    return {
      query,
      count: repos.length,
      repos: repos.slice(0, 5).map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stars,
        topics: JSON.parse(r.topicsJson || '[]'),
        url: r.url
      }))
    };
    
  } catch (error: any) {
    logger.error(`❌ Error testing query "${query}":`, error.message);
    return { query, count: 0, repos: [], error: error.message };
  }
}

async function testAllQueries() {
  logger.info('🧪 GitHub Search Query Testing Tool');
  logger.info('==================================');
  
  const results = [];
  
  for (const query of TEST_QUERIES) {
    const result = await testSearchQuery(query);
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  logger.info('\n📊 SUMMARY');
  logger.info('===========');
  
  results.forEach(result => {
    const status = result.error ? '❌' : result.count > 0 ? '✅' : '⚠️';
    logger.info(`${status} "${result.query}" → ${result.count} repos`);
  });
  
  const totalRepos = results.reduce((sum, r) => sum + r.count, 0);
  logger.info(`\n🎯 Total unique repositories available: ~${totalRepos}`);
  
  return results;
}

// Interactive mode
async function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuery = () => {
    return new Promise<string>((resolve) => {
      rl.question('\n🔍 Enter a search query to test (or "quit" to exit): ', resolve);
    });
  };
  
  logger.info('🧪 Interactive GitHub Search Testing');
  logger.info('Enter search queries to test them in real-time');
  logger.info('Examples:');
  logger.info('  topic:climate-change stars:>10');
  logger.info('  "renewable energy" language:Python');
  logger.info('  org:climatepolicyinitiative');
  
  while (true) {
    const query = await askQuery();
    
    if (query.toLowerCase() === 'quit') {
      break;
    }
    
    if (query.trim()) {
      await testSearchQuery(query.trim());
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  rl.close();
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive')) {
    interactiveMode();
  } else {
    testAllQueries()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

export { testSearchQuery, testAllQueries };