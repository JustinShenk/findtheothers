# Climate Query Optimization Exploration

This exploration focuses on refining GitHub search strategies to discover smaller, active climate change repositories that represent the broader ecosystem of climate innovation.

## Objective

Find 200-300 climate repositories that are:
- **Smaller projects** (10-500 stars, not mega-projects)
- **Recently active** (activity within last 12 months)
- **Diverse coverage** of climate sub-areas
- **Real innovation** representing emerging ideas and potential growth areas

## Files in this Exploration

### `test-search-queries.ts`
Interactive testing tool for GitHub search queries. Allows you to:
- Test predefined search queries
- Run in interactive mode to experiment with custom queries
- See real GitHub API results with repo details
- Validate search strategies before implementing scrapers

**Usage:**
```bash
# Test predefined queries
npm run test:search

# Interactive mode for custom queries  
npm run test:search:interactive
```

### `CLIMATE_SEARCH_DELIVERABLE.md`
Comprehensive deliverable from the query optimization process, containing:
- 18 curated search queries across 7 climate sub-areas
- Expected to yield ~250 repositories meeting all criteria
- Validation results and quality examples
- Implementation recommendations

### Key Insights Discovered

1. **Topic-based searches** (`topic:climate-change`) are most precise
2. **Activity filters** (`pushed:>2024-07-01`) essential for finding active projects
3. **Star range filtering** (`stars:10..500`) captures the "middle tier" of projects
4. **Language-specific searches** ensure coverage of developer tools
5. **Niche area searches** reveal emerging climate tech areas

## Search Strategy Categories

1. **Core Climate Topics**: General climate, carbon, renewable energy
2. **Energy & Power Systems**: Solar tools, energy dashboards, EV infrastructure  
3. **Data & Monitoring**: Visualization, air quality, environmental sensors
4. **Agriculture & Food**: Precision farming, food security analysis
5. **Transportation**: Mobility data, micromobility, transport emissions
6. **Developer-Focused**: Language-specific climate tools
7. **Specialized Tools**: Carbon calculators, emissions tracking

## Quality Examples Found

- **TeslaSolarCharger** (149⭐): Tesla solar charging optimization
- **green-metrics-tool** (216⭐): Software carbon measurement  
- **farmassist** (215⭐): AI-powered plant disease detection
- **EVMap** (228⭐): EV charging station finder app

## Implementation Status

- ✅ Query testing tool created and validated
- ✅ 18 curated search queries identified
- ✅ Expected repository count validated (~250 repos)
- ⏳ Ready for implementation in scraping script

## Next Steps

1. Implement curated queries in a focused climate scraper
2. Add LLM classification for quality filtering
3. Build database of 200-300 active climate repositories
4. Analyze the resulting ecosystem for insights and patterns