# Working Files from Query Refinement Process

These files represent the iterative refinement process used by the sub-agent to develop the final curated search queries.

## Refinement Evolution

### 1. `test-climate-queries.js` - Initial Brainstorm
- **42 queries** across 10 climate areas
- Comprehensive coverage from energy to international development
- Too broad - needed focusing

### 2. `test-refined-queries.ts` - First Refinement  
- **10 core queries** with better filtering
- Focus on topic-based searches and specific applications
- Added detailed analysis functionality

### 3. `test-niche-queries.ts` - Niche Area Testing
- **18 queries** targeting specific niches
- Organized by categories: Urban, Agriculture, Transportation, etc.  
- Better categorization and result analysis

### 4. **Final Result** → `CLIMATE_SEARCH_DELIVERABLE.md`
- **18 curated queries** proven to work
- Expected yield: ~250 repositories
- Ready for production implementation

## Process Insights

The sub-agent went through multiple iterations to find the right balance:
- **Breadth vs Focus**: Started too broad, refined to manageable scope
- **Size Filtering**: Consistently used 10-500 star range to avoid mega-projects
- **Activity Filtering**: All queries include `pushed:>2024-07-01` for recency
- **Category Balance**: Ensured coverage across different climate sub-areas

## Key Learnings

1. **Topic searches** (`topic:climate-change`) are most reliable
2. **Star range filtering** is crucial for finding "middle tier" projects  
3. **Language-specific searches** ensure developer tool coverage
4. **Niche area queries** reveal emerging climate tech areas
5. **Activity filters** essential to avoid abandoned projects

These working files show how the search strategy evolved from initial brainstorming to a refined, validated set of queries ready for implementation.