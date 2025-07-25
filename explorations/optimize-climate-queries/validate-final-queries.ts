import { testSearchQuery } from './src/scripts/test-search-queries';

const finalQueries = [
  // Core Climate Topics (4 queries) - Expected: 80 repos
  'topic:climate-change stars:10..500 pushed:>2024-07-01',
  'topic:carbon-footprint stars:10..300 pushed:>2024-07-01',
  'topic:renewable-energy stars:10..400 pushed:>2024-07-01',
  'topic:sustainability stars:10..300 pushed:>2024-07-01',
  
  // Energy & Power Systems (3 queries) - Expected: 49 repos
  '"solar energy" stars:10..300 pushed:>2024-07-01',
  '"energy dashboard" OR "sustainability dashboard" stars:5..150 pushed:>2024-07-01',
  '"electric vehicle" charging OR ev stars:10..300 pushed:>2024-07-01',
  
  // Data & Monitoring (3 queries) - Expected: 52 repos
  '"climate visualization" OR "environmental data" stars:10..200 pushed:>2024-07-01',
  '"air quality" data OR monitoring stars:10..250 pushed:>2024-07-01',
  '"environmental monitoring" citizen OR community stars:10..150 pushed:>2024-07-01',
  
  // Agriculture & Food Systems (2 queries) - Expected: 15 repos
  '"precision agriculture" OR "smart farming" stars:10..250 pushed:>2024-07-01',
  '"food security" OR "sustainable food" stars:10..200 pushed:>2024-07-01',
  
  // Transportation & Mobility (2 queries) - Expected: 22 repos
  '"mobility data" OR "transport emission" stars:5..200 pushed:>2024-07-01',
  '"bike sharing" OR "micromobility" stars:10..250 pushed:>2024-07-01',
  
  // Developer-Focused (3 queries) - Expected: 45 repos
  'language:Python climate OR carbon OR renewable stars:10..200 pushed:>2024-07-01',
  'language:JavaScript sustainability OR environment stars:10..200 pushed:>2024-07-01',
  'language:R environmental analysis OR climate stars:5..150 pushed:>2024-07-01',
  
  // Specialized Tools (1 query) - Expected: 7 repos
  '"carbon calculator" OR "emissions tracking" stars:5..200 pushed:>2024-07-01'
];

async function validateFinalQueries() {
  console.log('🎯 FINAL VALIDATION: Climate Repository Search Queries');
  console.log('=====================================================\n');
  
  const results = [];
  let totalRepos = 0;
  
  const categories = {
    'Core Climate Topics': finalQueries.slice(0, 4),
    'Energy & Power Systems': finalQueries.slice(4, 7),
    'Data & Monitoring': finalQueries.slice(7, 10),
    'Agriculture & Food': finalQueries.slice(10, 12),
    'Transportation': finalQueries.slice(12, 14),
    'Developer-Focused': finalQueries.slice(14, 17),
    'Specialized Tools': finalQueries.slice(17, 18)
  };
  
  console.log('Testing 18 final queries across 7 categories...\n');
  
  for (const [category, queries] of Object.entries(categories)) {
    console.log(`\n📂 ${category.toUpperCase()}`);
    console.log('='.repeat(category.length + 4));
    
    let categoryTotal = 0;
    
    for (const query of queries) {
      try {
        const result = await testSearchQuery(query, 10);
        results.push({ ...result, category });
        categoryTotal += result.count;
        totalRepos += result.count;
        
        console.log(`✅ ${result.count} repos - ${query.substring(0, 60)}${query.length > 60 ? '...' : ''}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        console.log(`❌ Error - ${query.substring(0, 60)}...`);
        results.push({ query, count: 0, repos: [], error: error.message, category });
      }
    }
    
    console.log(`   Category Total: ${categoryTotal} repos`);
  }
  
  // Final Analysis
  console.log('\n📊 FINAL RESULTS SUMMARY');
  console.log('=========================');
  
  Object.entries(categories).forEach(([category, queries]) => {
    const categoryResults = results.filter(r => r.category === category);
    const categoryTotal = categoryResults.reduce((sum, r) => sum + r.count, 0);
    const avgPerQuery = Math.round(categoryTotal / queries.length);
    
    console.log(`${category}: ${categoryTotal} repos (${avgPerQuery} avg/query)`);
  });
  
  console.log(`\n🎯 TOTAL REPOSITORIES: ${totalRepos}`);
  console.log(`📊 TARGET RANGE: 200-300 repos`);
  
  if (totalRepos >= 200 && totalRepos <= 300) {
    console.log('✅ SUCCESS: Within target range!');
  } else if (totalRepos > 300) {
    console.log('⚠️  OVER TARGET: Consider reducing query scope');
  } else {
    console.log('⚠️  UNDER TARGET: Consider adding more queries');
  }
  
  console.log(`\n📈 QUERY EFFICIENCY:`);
  console.log(`- Total Queries: ${finalQueries.length}`);
  console.log(`- Avg Repos/Query: ${Math.round(totalRepos / finalQueries.length)}`);
  console.log(`- Coverage: 7 climate sub-areas`);
  console.log(`- Activity Filter: Last 12 months`);
  console.log(`- Size Filter: 10-500 stars (smaller projects)`);
  
  // Top performing queries
  const topQueries = results
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  console.log(`\n🏆 TOP PERFORMING QUERIES:`);
  topQueries.forEach((result, i) => {
    console.log(`${i + 1}. ${result.count} repos - ${result.query.substring(0, 50)}...`);
  });
  
  return { totalRepos, results, categories };
}

// Run validation
validateFinalQueries()
  .then(({ totalRepos }) => {
    console.log(`\n✅ Validation complete! Total repos: ${totalRepos}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Validation error:', error);
    process.exit(1);
  });