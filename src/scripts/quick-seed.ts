#!/usr/bin/env tsx
/**
 * Quick seed script to populate database with real data
 * Run: npm run seed:quick
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...');

  // Create sample causes
  const causes = await Promise.all([
    prisma.cause.upsert({
      where: { slug: 'climate-change' },
      update: {},
      create: {
        name: 'Climate Change',
        slug: 'climate-change',
        description: 'Addressing global warming and environmental sustainability',
        color: '#10b981',
        level: 0,
      },
    }),
    prisma.cause.upsert({
      where: { slug: 'ai-safety' },
      update: {},
      create: {
        name: 'AI Safety',
        slug: 'ai-safety',
        description: 'Ensuring artificial intelligence remains beneficial and aligned',
        color: '#3b82f6',
        level: 0,
      },
    }),
    prisma.cause.upsert({
      where: { slug: 'global-health' },
      update: {},
      create: {
        name: 'Global Health',
        slug: 'global-health',
        description: 'Improving health outcomes worldwide',
        color: '#ef4444',
        level: 0,
      },
    }),
  ]);

  // Create sample initiatives
  const initiatives = [
    {
      name: 'Climate Action Tracker',
      description: 'Open source tool for tracking climate commitments',
      url: 'https://github.com/climate-action-tracker',
      platform: 'github',
      stars: 1234,
      forks: 567,
      languages: ['TypeScript', 'Python'],
      topics: ['climate', 'data-visualization'],
      causeId: causes[0].id,
    },
    {
      name: 'AI Alignment Research',
      description: 'Research tools for AI safety and alignment',
      url: 'https://github.com/ai-alignment-research',
      platform: 'github', 
      stars: 2345,
      forks: 890,
      languages: ['Python', 'Jupyter Notebook'],
      topics: ['ai-safety', 'research'],
      causeId: causes[1].id,
    },
    {
      name: 'Global Health Database',
      description: 'Open database of global health interventions',
      url: 'https://github.com/global-health-db',
      platform: 'github',
      stars: 987,
      forks: 234,
      languages: ['R', 'Python'],
      topics: ['health', 'data'],
      causeId: causes[2].id,
    },
  ];

  for (const init of initiatives) {
    await prisma.initiative.upsert({
      where: { url: init.url },
      update: {},
      create: {
        ...init,
        languages: JSON.stringify(init.languages),
        topics: JSON.stringify(init.topics),
      },
    });
  }

  console.log('✅ Seeding completed!');
  console.log(`Created ${causes.length} causes and ${initiatives.length} initiatives`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });