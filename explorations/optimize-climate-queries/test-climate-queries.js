#!/usr/bin/env node

// Climate search query refinement script
// Focus on finding 200-300 smaller, active climate repos (10-500 stars)

const queries = [
  // Core climate topics with activity filter (last year: July 2024 - July 2025)
  'topic:climate-change stars:10..500 pushed:>2024-07-01',
  'topic:carbon-footprint stars:10..300 pushed:>2024-07-01',
  'topic:renewable-energy stars:10..400 pushed:>2024-07-01',
  'topic:sustainability stars:10..300 pushed:>2024-07-01',
  'topic:climate-data stars:10..200 pushed:>2024-07-01',
  
  // Specific climate areas
  '"solar energy" stars:10..300 pushed:>2024-07-01',
  '"wind energy" stars:10..200 pushed:>2024-07-01',
  '"energy efficiency" stars:10..250 pushed:>2024-07-01',
  '"carbon tracking" stars:5..150 pushed:>2024-07-01',
  '"climate monitoring" stars:10..200 pushed:>2024-07-01',
  
  // Agriculture & food systems
  '"climate agriculture" OR "sustainable farming" stars:5..200 pushed:>2024-07-01',
  '"precision agriculture" climate stars:10..250 pushed:>2024-07-01',
  '"food sustainability" OR "food security" stars:10..200 pushed:>2024-07-01',
  '"carbon farming" OR "regenerative agriculture" stars:5..150 pushed:>2024-07-01',
  
  // Urban climate solutions
  '"smart city" climate OR sustainability stars:10..300 pushed:>2024-07-01',
  '"urban heat" OR "heat island" stars:5..150 pushed:>2024-07-01',
  '"green building" OR "building energy" stars:10..250 pushed:>2024-07-01',
  '"urban planning" climate stars:5..200 pushed:>2024-07-01',
  
  // Transportation & mobility
  '"electric vehicle" OR "ev charging" stars:10..300 pushed:>2024-07-01',
  '"transport emissions" OR "mobility data" stars:5..200 pushed:>2024-07-01',
  '"bike sharing" OR "micro mobility" stars:10..250 pushed:>2024-07-01',
  
  // Data & visualization
  '"climate visualization" OR "environmental data" stars:10..200 pushed:>2024-07-01',
  '"weather data" OR "climate api" stars:10..250 pushed:>2024-07-01',
  '"environmental monitoring" stars:10..200 pushed:>2024-07-01',
  '"air quality" data OR monitoring stars:10..250 pushed:>2024-07-01',
  
  // Education & awareness
  '"climate education" OR "sustainability education" stars:5..150 pushed:>2024-07-01',
  '"climate game" OR "environmental game" stars:5..200 pushed:>2024-07-01',
  '"climate storytelling" OR "climate communication" stars:5..100 pushed:>2024-07-01',
  
  // Local & community solutions
  '"community energy" OR "local energy" stars:5..150 pushed:>2024-07-01',
  '"citizen science" environment OR climate stars:10..200 pushed:>2024-07-01',
  '"environmental justice" OR "climate justice" stars:5..150 pushed:>2024-07-01',
  '"neighborhood sustainability" stars:5..100 pushed:>2024-07-01',
  
  // Technology-specific searches
  'language:Python "climate" OR "carbon" OR "renewable" stars:10..200 pushed:>2024-07-01',
  'language:JavaScript "sustainability" OR "climate" stars:10..200 pushed:>2024-07-01',
  'language:R "climate" OR "environmental" stats OR analysis stars:5..150 pushed:>2024-07-01',
  
  // Specific tools & applications
  '"carbon calculator" stars:5..200 pushed:>2024-07-01',
  '"energy dashboard" OR "sustainability dashboard" stars:5..150 pushed:>2024-07-01',
  '"climate risk" assessment OR modeling stars:10..200 pushed:>2024-07-01',
  '"emissions tracking" OR "ghg tracking" stars:5..150 pushed:>2024-07-01',
  
  // Emerging areas
  '"nature based solutions" stars:5..100 pushed:>2024-07-01',
  '"circular economy" digital OR platform stars:10..200 pushed:>2024-07-01',
  '"climate adaptation" tools OR planning stars:5..150 pushed:>2024-07-01',
  '"biodiversity monitoring" OR "ecosystem monitoring" stars:5..150 pushed:>2024-07-01',
  
  // International & development focus
  '"climate resilience" developing OR global stars:5..150 pushed:>2024-07-01',
  '"sustainable development" goals OR sdg stars:10..200 pushed:>2024-07-01',
  '"climate finance" OR "green finance" stars:5..150 pushed:>2024-07-01'
];

console.log('# Climate Repository Search Query Refinement');
console.log(`\nTesting ${queries.length} queries to find 200-300 smaller, active climate repositories.\n`);

queries.forEach((query, index) => {
  console.log(`${index + 1}. \`${query}\``);
});

console.log('\n## Query Strategy:');
console.log('- **Size Filter**: 10-500 stars (avoiding giant projects)');
console.log('- **Activity Filter**: pushed:>2024-07-01 (active in last year)');
console.log('- **Diversity**: Covering multiple climate sub-areas');
console.log('- **Technology Mix**: Various programming languages');
console.log('- **Application Types**: Tools, dashboards, education, monitoring');

console.log('\n## Next Steps:');
console.log('1. Test each query using: `npm run test:search:interactive`');
console.log('2. Record results for each query');  
console.log('3. Refine based on results');
console.log('4. Build final curated list');

console.log('\n## Expected Coverage Areas:');
const areas = [
  'Energy systems (solar, wind, efficiency)',
  'Carbon tracking and emissions',
  'Agriculture and food systems', 
  'Urban climate solutions',
  'Transportation and mobility',
  'Climate data and visualization',
  'Education and awareness',
  'Community and local solutions',
  'Climate risk and adaptation',
  'Biodiversity and ecosystems'
];

areas.forEach(area => console.log(`- ${area}`));