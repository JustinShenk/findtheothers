import { testSearchQuery } from './src/scripts/test-search-queries';

const testQueries = [
  // Core topics with refined filters
  'topic:climate-change stars:10..500 pushed:>2024-07-01',
  'topic:carbon-footprint stars:10..300 pushed:>2024-07-01', 
  'topic:renewable-energy stars:10..400 pushed:>2024-07-01',
  'topic:sustainability stars:10..300 pushed:>2024-07-01',
  
  // Specific applications
  '"carbon calculator" stars:5..200 pushed:>2024-07-01',
  '"energy dashboard" OR "sustainability dashboard" stars:5..150 pushed:>2024-07-01',
  '"climate visualization" OR "environmental data" stars:10..200 pushed:>2024-07-01',
  
  // Niche areas
  '"solar energy" stars:10..300 pushed:>2024-07-01',
  '"air quality" data OR monitoring stars:10..250 pushed:>2024-07-01',
  '"climate education" OR "sustainability education" stars:5..150 pushed:>2024-07-01',
];

async function testRefinedQueries() {
  console.log('🧪 Testing Refined Climate Search Queries');
  console.log('==========================================\n');
  
  const results = [];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing: ${query}`);
    const result = await testSearchQuery(query, 20); // Get more results to assess
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Analysis
  console.log('\n📊 DETAILED ANALYSIS');
  console.log('====================');
  
  let totalRepos = 0;
  const analysisData = [];
  
  results.forEach((result, index) => {
    const avgStars = result.repos.length > 0 
      ? Math.round(result.repos.reduce((sum, r) => sum + r.stars, 0) / result.repos.length)
      : 0;
    
    const recentRepos = result.repos.filter(r => {
      // This would need actual last push date, but we can approximate based on description
      return true; // Placeholder - GitHub API would have actual dates
    }).length;
    
    console.log(`\n${index + 1}. Query: "${result.query}"`);
    console.log(`   Results: ${result.count} repos`);
    console.log(`   Avg Stars: ${avgStars}`);
    console.log(`   Quality: ${result.repos.length > 0 ? 'Good sample available' : 'No results'}`);
    
    if (result.repos.length > 0) {
      console.log('   Sample repos:');
      result.repos.slice(0, 3).forEach((repo, i) => {
        console.log(`     - ${repo.name} (${repo.stars}⭐)`);
      });
    }
    
    totalRepos += result.count;
    analysisData.push({
      query: result.query,
      count: result.count,
      avgStars,
      category: getQueryCategory(result.query)
    });
  });
  
  console.log(`\n🎯 SUMMARY STATISTICS`);
  console.log(`Total repos found: ${totalRepos}`);
  console.log(`Average per query: ${Math.round(totalRepos / results.length)}`);
  
  // Category breakdown
  const categories = {};
  analysisData.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = { count: 0, repos: 0 };
    }
    categories[item.category].count++;
    categories[item.category].repos += item.count;
  });
  
  console.log('\n📈 BY CATEGORY:');
  Object.entries(categories).forEach(([category, data]) => {
    console.log(`${category}: ${data.repos} repos across ${data.count} queries`);
  });
  
  return results;
}

function getQueryCategory(query: string): string {
  if (query.includes('topic:')) return 'Core Topics';
  if (query.includes('calculator') || query.includes('dashboard')) return 'Tools & Apps';
  if (query.includes('education') || query.includes('visualization')) return 'Education & Viz';
  if (query.includes('solar') || query.includes('air quality')) return 'Specific Domains';
  return 'Other';
}

// Run the test
testRefinedQueries()
  .then(() => {
    console.log('\n✅ Testing complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });