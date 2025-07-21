import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create causes
  const causes = await Promise.all([
    prisma.cause.create({
      data: {
        name: 'Climate Change',
        slug: 'climate-change',
        description: 'Addressing global warming and environmental sustainability',
        color: '#10b981',
        level: 0,
        impactScore: 95,
        keywordsJson: JSON.stringify(['climate', 'environment', 'sustainability', 'carbon', 'renewable']),
        metadataJson: JSON.stringify({
          urgency: 'critical',
          tractability: 'medium',
          neglectedness: 0.3,
          timeHorizon: 'immediate',
          geographicScope: 'global',
          requiredExpertise: ['Environmental Science', 'Policy', 'Engineering'],
          fundingAvailable: true,
          activeProjects: 1250,
        }),
      },
    }),
    prisma.cause.create({
      data: {
        name: 'AI Safety',
        slug: 'ai-safety',
        description: 'Ensuring artificial intelligence benefits humanity',
        color: '#3b82f6',
        level: 0,
        impactScore: 92,
        keywordsJson: JSON.stringify(['ai', 'safety', 'alignment', 'artificial intelligence', 'machine learning']),
        metadataJson: JSON.stringify({
          urgency: 'high',
          tractability: 'medium',
          neglectedness: 0.7,
          timeHorizon: 'medium',
          geographicScope: 'global',
          requiredExpertise: ['Machine Learning', 'Ethics', 'Computer Science'],
          fundingAvailable: true,
          activeProjects: 450,
        }),
      },
    }),
    prisma.cause.create({
      data: {
        name: 'Global Health',
        slug: 'global-health',
        description: 'Improving health outcomes worldwide',
        color: '#ef4444',
        level: 0,
        impactScore: 88,
        keywordsJson: JSON.stringify(['health', 'medicine', 'pandemic', 'vaccine', 'healthcare']),
        metadataJson: JSON.stringify({
          urgency: 'high',
          tractability: 'high',
          neglectedness: 0.4,
          timeHorizon: 'immediate',
          geographicScope: 'global',
          requiredExpertise: ['Medicine', 'Public Health', 'Epidemiology'],
          fundingAvailable: true,
          activeProjects: 2100,
        }),
      },
    }),
    prisma.cause.create({
      data: {
        name: 'Education Access',
        slug: 'education-access',
        description: 'Making quality education accessible to all',
        color: '#f59e0b',
        level: 0,
        impactScore: 85,
        keywordsJson: JSON.stringify(['education', 'learning', 'literacy', 'access', 'teaching']),
        metadataJson: JSON.stringify({
          urgency: 'medium',
          tractability: 'high',
          neglectedness: 0.5,
          timeHorizon: 'medium',
          geographicScope: 'global',
          requiredExpertise: ['Education', 'Technology', 'Social Work'],
          fundingAvailable: true,
          activeProjects: 890,
        }),
      },
    }),
    prisma.cause.create({
      data: {
        name: 'Poverty Alleviation',
        slug: 'poverty-alleviation',
        description: 'Reducing extreme poverty and economic inequality',
        color: '#8b5cf6',
        level: 0,
        impactScore: 90,
        keywordsJson: JSON.stringify(['poverty', 'economic', 'inequality', 'development', 'welfare']),
        metadataJson: JSON.stringify({
          urgency: 'high',
          tractability: 'medium',
          neglectedness: 0.3,
          timeHorizon: 'immediate',
          geographicScope: 'global',
          requiredExpertise: ['Economics', 'Development', 'Social Policy'],
          fundingAvailable: true,
          activeProjects: 1560,
        }),
      },
    }),
    prisma.cause.create({
      data: {
        name: 'Governance & Policy',
        slug: 'governance-policy',
        description: 'Improving governance and policy-making processes',
        color: '#06b6d4',
        level: 0,
        impactScore: 82,
        keywordsJson: JSON.stringify(['governance', 'policy', 'democracy', 'transparency', 'civic']),
        metadataJson: JSON.stringify({
          urgency: 'medium',
          tractability: 'low',
          neglectedness: 0.6,
          timeHorizon: 'long',
          geographicScope: 'global',
          requiredExpertise: ['Political Science', 'Law', 'Public Administration'],
          fundingAvailable: true,
          activeProjects: 340,
        }),
      },
    }),
  ]);

  console.log(`✅ Created ${causes.length} causes`);

  // Create sample contributors
  const contributors = await Promise.all([
    prisma.contributor.create({
      data: {
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        githubUsername: 'sarahchen',
        bio: 'Climate tech engineer focused on renewable energy solutions',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        socialLinksJson: JSON.stringify({
          twitter: '@sarahchen',
          linkedin: 'sarahchen',
        }),
        skillsJson: JSON.stringify([
          { name: 'Python', category: 'programming', level: 'expert', endorsements: 12 },
          { name: 'Climate Modeling', category: 'domain-specific', level: 'advanced', endorsements: 8 },
          { name: 'Data Science', category: 'programming', level: 'advanced', endorsements: 15 },
        ]),
        availabilityJson: JSON.stringify({
          status: 'available',
          hoursPerWeek: 10,
          coordinationTypes: ['mentorship', 'collaboration'],
          mentorshipCapacity: 2,
          currentMentees: 1,
        }),
      },
    }),
    prisma.contributor.create({
      data: {
        name: 'Marcus Johnson',
        email: 'marcus.j@example.com',
        githubUsername: 'marcusj',
        bio: 'AI safety researcher working on alignment problems',
        location: 'Oxford, UK',
        timezone: 'Europe/London',
        socialLinksJson: JSON.stringify({
          twitter: '@marcusj_ai',
          personalSite: 'marcusj.ai',
        }),
        skillsJson: JSON.stringify([
          { name: 'Machine Learning', category: 'programming', level: 'expert', endorsements: 25 },
          { name: 'AI Safety', category: 'domain-specific', level: 'expert', endorsements: 18 },
          { name: 'Research', category: 'research', level: 'expert', endorsements: 20 },
        ]),
        availabilityJson: JSON.stringify({
          status: 'limited',
          hoursPerWeek: 5,
          coordinationTypes: ['guidance', 'review'],
          mentorshipCapacity: 1,
          currentMentees: 1,
        }),
      },
    }),
    prisma.contributor.create({
      data: {
        name: 'Priya Patel',
        email: 'priya.p@example.com',
        githubUsername: 'priyap',
        bio: 'Public health specialist focused on vaccine distribution',
        location: 'New Delhi, India',
        timezone: 'Asia/Kolkata',
        socialLinksJson: JSON.stringify({
          linkedin: 'priyapatel-health',
        }),
        skillsJson: JSON.stringify([
          { name: 'Epidemiology', category: 'domain-specific', level: 'expert', endorsements: 22 },
          { name: 'Data Analysis', category: 'research', level: 'advanced', endorsements: 16 },
          { name: 'Public Health', category: 'domain-specific', level: 'expert', endorsements: 28 },
        ]),
        availabilityJson: JSON.stringify({
          status: 'available',
          hoursPerWeek: 15,
          coordinationTypes: ['mentorship', 'collaboration', 'project'],
          mentorshipCapacity: 3,
          currentMentees: 2,
        }),
      },
    }),
  ]);

  console.log(`✅ Created ${contributors.length} contributors`);

  // Create contributor-cause relationships
  await Promise.all([
    prisma.contributorCause.create({
      data: {
        contributorId: contributors[0].id,
        causeId: causes[0].id, // Climate Change
        experienceLevel: 'expert',
        contributionHours: 1200,
        projectsCompleted: 15,
        mentorshipGiven: 8,
        primaryFocus: true,
      },
    }),
    prisma.contributorCause.create({
      data: {
        contributorId: contributors[1].id,
        causeId: causes[1].id, // AI Safety
        experienceLevel: 'expert',
        contributionHours: 2000,
        projectsCompleted: 12,
        mentorshipGiven: 5,
        primaryFocus: true,
      },
    }),
    prisma.contributorCause.create({
      data: {
        contributorId: contributors[2].id,
        causeId: causes[2].id, // Global Health
        experienceLevel: 'expert',
        contributionHours: 1800,
        projectsCompleted: 20,
        mentorshipGiven: 12,
        primaryFocus: true,
      },
    }),
  ]);

  // Create sample initiatives
  const initiatives = await Promise.all([
    prisma.initiative.create({
      data: {
        type: 'repository',
        platform: 'github',
        externalId: 'carbon-tracker',
        name: 'Carbon Footprint Tracker',
        description: 'Open source tool for tracking and reducing personal carbon emissions',
        url: 'https://github.com/example/carbon-tracker',
        causeId: causes[0].id,
        stars: 1250,
        forks: 234,
        ownerJson: JSON.stringify({
          id: 'example-org',
          name: 'Climate Tech Collective',
          type: 'organization',
        }),
        activityJson: JSON.stringify({
          commits: 2340,
          issues: 156,
          pullRequests: 89,
          contributionFrequency: 'daily',
          growthRate: 15.5,
        }),
        impactJson: JSON.stringify({
          score: 85,
          reach: 'global',
          beneficiaries: 50000,
          communitySize: 234,
        }),
        tagsJson: JSON.stringify(['climate', 'carbon', 'tracking', 'sustainability']),
        languagesJson: JSON.stringify(['TypeScript', 'Python', 'React']),
        creatorId: contributors[0].id,
      },
    }),
    prisma.initiative.create({
      data: {
        type: 'repository',
        platform: 'github',
        externalId: 'ai-alignment-toolkit',
        name: 'AI Alignment Research Toolkit',
        description: 'Tools and frameworks for AI safety research and alignment experiments',
        url: 'https://github.com/example/ai-alignment-toolkit',
        causeId: causes[1].id,
        stars: 890,
        forks: 167,
        ownerJson: JSON.stringify({
          id: 'ai-safety-org',
          name: 'AI Safety Research Institute',
          type: 'organization',
        }),
        activityJson: JSON.stringify({
          commits: 1560,
          issues: 234,
          pullRequests: 123,
          contributionFrequency: 'weekly',
          growthRate: 22.3,
        }),
        impactJson: JSON.stringify({
          score: 92,
          reach: 'global',
          beneficiaries: 5000,
          communitySize: 156,
        }),
        tagsJson: JSON.stringify(['ai-safety', 'alignment', 'research', 'machine-learning']),
        languagesJson: JSON.stringify(['Python', 'Julia', 'Jupyter']),
        creatorId: contributors[1].id,
      },
    }),
    prisma.initiative.create({
      data: {
        type: 'repository',
        platform: 'github',
        externalId: 'vaccine-distribution',
        name: 'Vaccine Distribution Optimizer',
        description: 'Algorithm for optimizing vaccine distribution in resource-constrained settings',
        url: 'https://github.com/example/vaccine-distribution',
        causeId: causes[2].id,
        stars: 567,
        forks: 89,
        ownerJson: JSON.stringify({
          id: 'global-health-tech',
          name: 'Global Health Technology',
          type: 'organization',
        }),
        activityJson: JSON.stringify({
          commits: 890,
          issues: 67,
          pullRequests: 45,
          contributionFrequency: 'weekly',
          growthRate: 18.7,
        }),
        impactJson: JSON.stringify({
          score: 88,
          reach: 'global',
          beneficiaries: 250000,
          communitySize: 89,
        }),
        tagsJson: JSON.stringify(['health', 'vaccine', 'optimization', 'public-health']),
        languagesJson: JSON.stringify(['Python', 'R', 'JavaScript']),
        creatorId: contributors[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${initiatives.length} initiatives`);

  // Create coordination opportunities
  const coordinationOpportunities = await Promise.all([
    prisma.coordinationOpportunity.create({
      data: {
        type: 'mentorship',
        title: 'Climate Data Science Mentorship',
        description: 'Looking for mentees interested in applying data science to climate problems',
        causeId: causes[0].id,
        initiativeId: initiatives[0].id,
        createdById: contributors[0].id,
        status: 'open',
        requirementsJson: JSON.stringify({
          experienceLevel: 'intermediate',
          skills: ['Python', 'Data Science'],
          timeCommitment: '5 hours/week',
        }),
        tagsJson: JSON.stringify(['mentorship', 'data-science', 'climate']),
      },
    }),
    prisma.coordinationOpportunity.create({
      data: {
        type: 'collaboration',
        title: 'AI Safety Research Collaboration',
        description: 'Seeking researchers to collaborate on interpretability tools',
        causeId: causes[1].id,
        initiativeId: initiatives[1].id,
        createdById: contributors[1].id,
        status: 'open',
        requirementsJson: JSON.stringify({
          experienceLevel: 'advanced',
          skills: ['Machine Learning', 'Python', 'Research'],
          timeCommitment: '10 hours/week',
        }),
        tagsJson: JSON.stringify(['collaboration', 'research', 'ai-safety']),
      },
    }),
    prisma.coordinationOpportunity.create({
      data: {
        type: 'project',
        title: 'Vaccine Distribution Field Testing',
        description: 'Need partners for field testing vaccine distribution algorithms',
        causeId: causes[2].id,
        initiativeId: initiatives[2].id,
        createdById: contributors[2].id,
        status: 'open',
        requirementsJson: JSON.stringify({
          experienceLevel: 'intermediate',
          skills: ['Public Health', 'Field Work', 'Data Collection'],
          timeCommitment: '20 hours/week',
        }),
        tagsJson: JSON.stringify(['project', 'field-work', 'public-health']),
      },
    }),
  ]);

  console.log(`✅ Created ${coordinationOpportunities.length} coordination opportunities`);

  // Create learning pathways
  const learningPathways = await Promise.all([
    prisma.learningPathway.create({
      data: {
        causeId: causes[0].id,
        name: 'Climate Tech Engineering Path',
        description: 'Learn to build technology solutions for climate change',
        experienceLevel: 'beginner',
        estimatedDuration: '6 months',
        milestonesJson: JSON.stringify([
          { name: 'Climate Science Basics', skills: ['Climate Science'], order: 1 },
          { name: 'Data Analysis for Climate', skills: ['Python', 'Data Science'], order: 2 },
          { name: 'Building Climate Solutions', skills: ['Engineering', 'Product Development'], order: 3 },
        ]),
      },
    }),
    prisma.learningPathway.create({
      data: {
        causeId: causes[1].id,
        name: 'AI Safety Research Path',
        description: 'Develop expertise in AI alignment and safety research',
        experienceLevel: 'intermediate',
        estimatedDuration: '12 months',
        milestonesJson: JSON.stringify([
          { name: 'AI Safety Fundamentals', skills: ['AI Safety', 'Ethics'], order: 1 },
          { name: 'Technical AI Safety', skills: ['Machine Learning', 'Mathematics'], order: 2 },
          { name: 'Research Contributions', skills: ['Research', 'Writing'], order: 3 },
        ]),
      },
    }),
  ]);

  console.log(`✅ Created ${learningPathways.length} learning pathways`);

  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });