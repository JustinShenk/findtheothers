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
      type: 'repository',
      platform: 'github',
      externalId: 'climate-action-tracker-1',
      name: 'Climate Action Tracker',
      description: 'Open source tool for tracking climate commitments',
      url: 'https://github.com/climate-action-tracker',
      stars: 1234,
      forks: 567,
      languagesJson: JSON.stringify(['TypeScript', 'Python']),
      topicsJson: JSON.stringify(['climate', 'data-visualization']),
      causeId: causes[0].id,
    },
    {
      type: 'repository', 
      platform: 'github',
      externalId: 'ai-alignment-research-1',
      name: 'AI Alignment Research',
      description: 'Research tools for AI safety and alignment',
      url: 'https://github.com/ai-alignment-research',
      stars: 2345,
      forks: 890,
      languagesJson: JSON.stringify(['Python', 'Jupyter Notebook']),
      topicsJson: JSON.stringify(['ai-safety', 'research']),
      causeId: causes[1].id,
    },
    {
      type: 'repository',
      platform: 'github', 
      externalId: 'global-health-db-1',
      name: 'Global Health Database',
      description: 'Open database of global health interventions',
      url: 'https://github.com/global-health-db',
      stars: 987,
      forks: 234,
      languagesJson: JSON.stringify(['R', 'Python']),
      topicsJson: JSON.stringify(['health', 'data']),
      causeId: causes[2].id,
    },
  ];

  for (const init of initiatives) {
    await prisma.initiative.upsert({
      where: { 
        platform_externalId: {
          platform: init.platform,
          externalId: init.externalId
        }
      },
      update: {},
      create: init,
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