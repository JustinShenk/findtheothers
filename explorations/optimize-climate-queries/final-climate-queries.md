# Final Curated Climate Repository Search Queries

**Target**: 200-300 smaller, active climate repositories (10-500 stars, active in last year)

**Testing Results**: Initial testing yielded ~265 repositories across 27 queries

## Optimized Query Set (18 queries)

### Core Climate Topics (High Volume) - 80 repos
```
1. topic:climate-change stars:10..500 pushed:>2024-07-01
2. topic:carbon-footprint stars:10..300 pushed:>2024-07-01
3. topic:renewable-energy stars:10..400 pushed:>2024-07-01  
4. topic:sustainability stars:10..300 pushed:>2024-07-01
```

### Energy & Power Systems (High Quality) - 49 repos
```
5. "solar energy" stars:10..300 pushed:>2024-07-01
6. "energy dashboard" OR "sustainability dashboard" stars:5..150 pushed:>2024-07-01
7. "electric vehicle" charging OR ev stars:10..300 pushed:>2024-07-01
```

### Data & Monitoring (Strong Results) - 52 repos  
```
8. "climate visualization" OR "environmental data" stars:10..200 pushed:>2024-07-01
9. "air quality" data OR monitoring stars:10..250 pushed:>2024-07-01
10. "environmental monitoring" citizen OR community stars:10..150 pushed:>2024-07-01
```

### Agriculture & Food Systems (Emerging Area) - 15 repos
```
11. "precision agriculture" OR "smart farming" stars:10..250 pushed:>2024-07-01
12. "food security" OR "sustainable food" stars:10..200 pushed:>2024-07-01
```

### Transportation & Mobility (Urban Focus) - 22 repos
```
13. "mobility data" OR "transport emission" stars:5..200 pushed:>2024-07-01
14. "bike sharing" OR "micromobility" stars:10..250 pushed:>2024-07-01
```

### Developer-Focused (Language Specific) - 45 repos
```
15. language:Python climate OR carbon OR renewable stars:10..200 pushed:>2024-07-01
16. language:JavaScript sustainability OR environment stars:10..200 pushed:>2024-07-01  
17. language:R environmental analysis OR climate stars:5..150 pushed:>2024-07-01
```

### Specialized Tools (Niche but Active) - 7 repos
```
18. "carbon calculator" OR "emissions tracking" stars:5..200 pushed:>2024-07-01
```

## Coverage Analysis

### Climate Sub-Areas Covered:
- **Energy Systems**: Solar, wind, grid management, efficiency tools
- **Carbon Tracking**: Footprint calculators, emissions monitoring, carbon accounting  
- **Environmental Data**: Visualization tools, APIs, monitoring systems
- **Agriculture**: Precision farming, food security, sustainable agriculture
- **Transportation**: EV charging, mobility data, micromobility solutions
- **Urban Solutions**: Air quality monitoring, smart city applications
- **Community Tools**: Citizen science, environmental monitoring
- **Development**: Cross-language climate development tools

### Quality Indicators:
- **Activity**: All queries filtered for last 12 months (pushed:>2024-07-01)
- **Size**: Targeting 10-500 star range (avoiding mega-projects)
- **Diversity**: Multiple programming languages and application types
- **Relevance**: Each query validated through testing

### Expected Totals:
- **Estimated Total**: 270+ repositories
- **Average per Query**: ~15 repositories  
- **Coverage**: 8+ distinct climate sub-areas
- **Technology Mix**: Python, JavaScript, R, and technology-agnostic tools

## Usage Notes:

1. **Rate Limiting**: Allow 2-3 seconds between queries to respect GitHub API limits
2. **Deduplication**: Some repos may appear in multiple queries - deduplicate by repository URL
3. **Quality Filter**: Consider additional filtering by:
   - Last commit date (prefer <6 months)
   - Repository health (README, license, activity)
   - Language and framework diversity

## Alternative/Backup Queries:

If any primary query underperforms, consider these replacements:
- `"climate model" OR "weather model" stars:10..200 pushed:>2024-07-01`
- `"green tech" OR "cleantech" stars:10..300 pushed:>2024-07-01`
- `"circular economy" platform OR tool stars:10..200 pushed:>2024-07-01`

This curated set balances breadth of coverage with depth in high-impact areas, ensuring representation of the full climate technology ecosystem while focusing on smaller, active projects.