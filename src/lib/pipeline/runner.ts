import { Queue, Worker, QueueEvents } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { githubScraper } from './scrapers/github';
import { classifyInitiative } from './classifiers/llm';
import { generateEmbedding } from './embeddings/generator';
import { calculateImpact } from './analyzers/impact';
import { findCoordinationOpportunities } from './matchers/coordination';
import { config } from '@/config/pipeline';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const queues = {
  scraping: new Queue('scraping', { connection }),
  classification: new Queue('classification', { connection }),
  embedding: new Queue('embedding', { connection }),
  impact: new Queue('impact', { connection }),
  coordination: new Queue('coordination', { connection }),
};

const workers = {
  scraping: new Worker(
    'scraping',
    async (job) => {
      logger.info(`Processing scraping job ${job.id}`);
      const initiatives = await githubScraper.scrape(job.data);
      
      for (const initiative of initiatives) {
        await queues.classification.add('classify', {
          initiative,
          modelVersion: config.llm.model,
        });
      }
      
      return { count: initiatives.length };
    },
    { connection, concurrency: config.pipeline.concurrentJobs }
  ),

  classification: new Worker(
    'classification',
    async (job) => {
      logger.info(`Processing classification job ${job.id}`);
      const { initiative, modelVersion } = job.data;
      
      const classification = await classifyInitiative(initiative, modelVersion);
      
      await prisma.initiative.create({
        data: {
          ...initiative,
          causeId: classification.primaryCause,
          secondaryCauses: classification.secondaryCauses,
          classification: {
            create: classification,
          },
        },
      });
      
      await queues.embedding.add('generate', {
        initiativeId: initiative.id,
        text: `${initiative.name} ${initiative.description}`,
      });
      
      return classification;
    },
    { connection, concurrency: config.pipeline.concurrentJobs }
  ),

  embedding: new Worker(
    'embedding',
    async (job) => {
      logger.info(`Processing embedding job ${job.id}`);
      const { initiativeId, text } = job.data;
      
      const embedding = await generateEmbedding(text);
      
      await prisma.initiative.update({
        where: { id: initiativeId },
        data: { embedding },
      });
      
      await queues.impact.add('calculate', { initiativeId });
      
      return { embedded: true };
    },
    { connection, concurrency: config.pipeline.concurrentJobs }
  ),

  impact: new Worker(
    'impact',
    async (job) => {
      logger.info(`Processing impact job ${job.id}`);
      const { initiativeId } = job.data;
      
      const impact = await calculateImpact(initiativeId);
      
      await prisma.initiative.update({
        where: { id: initiativeId },
        data: { impact },
      });
      
      await queues.coordination.add('match', { initiativeId });
      
      return impact;
    },
    { connection, concurrency: config.pipeline.concurrentJobs }
  ),

  coordination: new Worker(
    'coordination',
    async (job) => {
      logger.info(`Processing coordination job ${job.id}`);
      const { initiativeId } = job.data;
      
      const opportunities = await findCoordinationOpportunities(initiativeId);
      
      for (const opportunity of opportunities) {
        await prisma.coordinationOpportunity.create({
          data: opportunity,
        });
      }
      
      return { count: opportunities.length };
    },
    { connection, concurrency: config.pipeline.concurrentJobs }
  ),
};

Object.values(workers).forEach((worker) => {
  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });
});

export async function startPipeline() {
  logger.info('Starting data pipeline...');
  
  await queues.scraping.add('initial', {
    query: 'topic:climate-change stars:>10',
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });
  
  await queues.scraping.add('initial', {
    query: 'topic:ai-safety stars:>10',
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });
}

if (require.main === module) {
  startPipeline().catch(console.error);
}