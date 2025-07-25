import { testSearchQuery } from './src/scripts/test-search-queries';

const nicheQueries = [
  // Urban climate solutions
  '"urban heat" OR "heat island" stars:5..150 pushed:>2024-07-01',
  '"smart city" sustainability stars:10..300 pushed:>2024-07-01',
  '"building energy" efficiency stars:10..250 pushed:>2024-07-01',
  
  // Agriculture & food
  '"precision agriculture" OR "smart farming" stars:10..250 pushed:>2024-07-01',
  '"food security" OR "sustainable food" stars:10..200 pushed:>2024-07-01', 
  '"regenerative agriculture" stars:5..150 pushed:>2024-07-01',
  
  // Transportation
  '"electric vehicle" charging OR ev stars:10..300 pushed:>2024-07-01',
  '"mobility data" OR "transport emission" stars:5..200 pushed:>2024-07-01',
  '"bike sharing" OR "micromobility" stars:10..250 pushed:>2024-07-01',
  
  // Language-specific
  'language:Python climate OR carbon OR renewable stars:10..200 pushed:>2024-07-01',
  'language:JavaScript sustainability OR environment stars:10..200 pushed:>2024-07-01',
  'language:R environmental analysis OR climate stars:5..150 pushed:>2024-07-01',
  
  // Emerging areas
  '"nature based solutions" OR "natural climate" stars:5..100 pushed:>2024-07-01',
  '"circular economy" platform OR tool stars:10..200 pushed:>2024-07-01',
  '"climate adaptation" OR "climate resilience" stars:5..150 pushed:>2024-07-01',
  
  // Community & education (refined terms)
  '"citizen science" environment stars:10..200 pushed:>2024-07-01',
  '"environmental monitoring" citizen OR community stars:10..150 pushed:>2024-07-01',
  '"climate game" OR "environmental game" stars:5..200 pushed:>2024-07-01',
];

async function testNicheQueries() {
  console.log('🌱 Testing Niche Climate Search Queries');
  console.log('========================================\n');
  
  const results = [];
  let totalRepos = 0;
  
  for (const query of nicheQueries) {
    console.log(`\n🔍 Testing: ${query}`);
    try {
      const result = await testSearchQuery(query, 15);
      results.push(result);
      totalRepos += result.count;
      
      // Brief summary for each query
      console.log(`   → ${result.count} repos found (avg ${result.repos.length > 0 ? Math.round(result.repos.reduce((sum, r) => sum + r.stars, 0) / result.repos.length) : 0}⭐)`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({ query, count: 0, repos: [], error: error.message });
    }
  }
  
  // Summary analysis
  console.log('\n📊 NICHE QUERY RESULTS');
  console.log('=======================');
  
  const categories = {
    'Urban Solutions': nicheQueries.slice(0, 3),
    'Agriculture': nicheQueries.slice(3, 6), 
    'Transportation': nicheQueries.slice(6, 9),
    'Language-Specific': nicheQueries.slice(9, 12),
    'Emerging Areas': nicheQueries.slice(12, 15),
    'Community': nicheQueries.slice(15, 18)
  };
  
  Object.entries(categories).forEach(([category, queries]) => {
    const categoryResults = results.filter(r => queries.includes(r.query));
    const categoryTotal = categoryResults.reduce((sum, r) => sum + r.count, 0);
    console.log(`${category}: ${categoryTotal} repos`);
    
    categoryResults.forEach(r => {
      const status = r.count > 10 ? '🟢' : r.count > 5 ? '🟡' : r.count > 0 ? '🟠' : '🔴';
      console.log(`  ${status} ${r.count} repos - ${r.query.substring(0, 50)}...`);
    });
  });
  
  console.log(`\n🎯 Total niche repos: ${totalRepos}`);
  console.log(`📈 Combined with core queries: ~${150 + totalRepos} total repos`);
  
  return results;
}

// Run the test
testNicheQueries()
  .then(() => {
    console.log('\n✅ Niche testing complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });