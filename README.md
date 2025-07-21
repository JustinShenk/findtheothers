# CollabMap - Cause-Driven Coordination Discovery Platform

> Discover your community working on humanity's most important challenges

## Project Structure

```
collabmap/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── causes/            # Cause exploration pages
│   │   ├── contributors/      # Contributor profiles
│   │   ├── coordination/      # Coordination opportunities
│   │   ├── initiatives/       # Initiative details
│   │   └── visualization/     # Visualization pages
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (buttons, cards, etc.)
│   │   ├── layout/           # Layout components (header, footer, nav)
│   │   ├── visualization/    # 2D/3D visualization components
│   │   ├── coordination/     # Coordination & mentorship components
│   │   └── shared/           # Shared/reusable components
│   │
│   ├── lib/                   # Core libraries
│   │   ├── pipeline/         # Data pipeline (scraping, classification)
│   │   │   ├── scrapers/     # Platform-specific scrapers
│   │   │   ├── classifiers/  # LLM cause classification
│   │   │   ├── embeddings/   # Embedding generation
│   │   │   ├── analyzers/    # Impact & metric analysis
│   │   │   └── matchers/     # Coordination matching
│   │   │
│   │   ├── api/              # API utilities
│   │   ├── db/               # Database utilities
│   │   ├── vector/           # Vector storage (Chroma)
│   │   ├── services/         # Business logic services
│   │   └── utils/            # Helper utilities
│   │
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   ├── config/               # Configuration files
│   └── styles/               # Global styles
│
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── tests/                     # Test files
```

## Key Components

### Data Pipeline (`src/lib/pipeline/`)
- **GitHub Scraper**: Collects repository metadata
- **LLM Classifier**: Categorizes initiatives by cause using OpenAI
- **Embedding Generator**: Creates vector embeddings for similarity search
- **Impact Analyzer**: Calculates impact scores and metrics
- **Coordination Matcher**: Identifies collaboration opportunities

### API Routes (`src/app/api/`)
- `/api/initiatives` - CRUD for initiatives
- `/api/causes` - Cause taxonomy management
- `/api/contributors` - Contributor profiles
- `/api/coordination` - Coordination opportunities
- `/api/search` - Vector similarity search
- `/api/visualization` - Graph data for visualization

### Visualization (`src/components/visualization/`)
- **Canvas**: Main 2D/3D visualization using Three.js
- **Graph**: Force-directed graph layout
- **Clusters**: Cause-based clustering visualization
- **Timeline**: Temporal activity visualization
- **Heatmap**: Impact and activity heatmaps

### Coordination Features (`src/components/coordination/`)
- **Opportunity Cards**: Browse coordination opportunities
- **Mentorship Matching**: Connect mentors with mentees
- **Collaboration Forms**: Request collaboration
- **Progress Tracking**: Track mentorship/collaboration progress
- **Impact Reporting**: Measure coordination outcomes

### Shared Types (`src/types/`)
- **Cause**: Hierarchical cause taxonomy with learning pathways
- **Contributor**: Profiles with skills, experience, availability
- **Initiative**: Projects/papers/orgs with impact metrics
- **Coordination**: Opportunities, relationships, outcomes
- **Pipeline**: Job processing and data flow types

## Development Phases

### Phase 1: MVP (AI Meetup Demo)
- Basic GitHub scraping and cause classification
- 3D visualization of ~2-3k repositories
- Simple coordination opportunity detection
- Manual validation workflow

### Phase 2: Coordination Platform
- User authentication and profiles
- Mentorship matching system
- Collaboration tools
- Community features
- Impact tracking

### Phase 3: Coordination Infrastructure
- Multi-source data ingestion
- Advanced matching algorithms
- Cross-cause collaboration
- Global coordination network
- API for third-party integrations

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in values
3. Install dependencies: `npm install`
4. Set up database: `npm run db:push`
5. Run development server: `npm run dev`
6. Run pipeline: `npm run pipeline:dev`

## Architecture Decisions

- **Next.js App Router**: Modern React framework with SSR/SSG
- **TypeScript**: Type safety across the entire stack
- **Prisma + PostgreSQL**: Type-safe database with migrations
- **Chroma**: Vector database for semantic search
- **BullMQ + Redis**: Reliable job queue for pipeline
- **Three.js**: 3D visualization capabilities
- **Tailwind + Radix UI**: Consistent, accessible UI components

## Future-Proofing

- Platform-agnostic data models (not just GitHub)
- Cause taxonomy designed for evolution
- Coordination patterns that work across domains
- Focus on relationships over projects
- Human agency preservation in AI systems