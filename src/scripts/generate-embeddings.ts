import { PrismaClient } from '@prisma/client';
import { EmbeddingGenerator } from '@/lib/embeddings/generator';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();
const embeddingGenerator = new EmbeddingGenerator();

async function generateEmbeddings() {
  logger.info('Starting embedding generation...');
  
  try {
    // Get all initiatives
    const initiatives = await prisma.initiative.findMany({
      include: {
        cause: true,
      },
    });
    
    logger.info(`Found ${initiatives.length} initiatives to process`);
    
    // Process initiatives in batches
    const batchSize = 10;
    let processed = 0;
    
    for (let i = 0; i < initiatives.length; i += batchSize) {
      const batch = initiatives.slice(i, i + batchSize);
      
      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(initiatives.length / batchSize)}`);
      
      for (const initiative of batch) {
        try {
          // Create initiative object with proper structure
          const initiativeData = {
            id: initiative.id,
            name: initiative.name,
            description: initiative.description,
            platform: initiative.platform,
            stars: initiative.stars,
            forks: initiative.forks,
            languages: JSON.parse(initiative.languagesJson || '[]'),
            topics: JSON.parse(initiative.topicsJson || '[]'),
            tags: JSON.parse(initiative.tagsJson || '[]'),
          };
          
          // Generate embedding
          const embeddingResult = await embeddingGenerator.generateInitiativeEmbedding(initiativeData as any);
          
          // Update database with embedding
          await prisma.initiative.update({
            where: { id: initiative.id },
            data: {
              embeddingJson: JSON.stringify(embeddingResult.embedding),
            },
          });
          
          processed++;
          
          if (processed % 10 === 0) {
            logger.info(`  Progress: ${processed}/${initiatives.length} initiatives processed`);
          }
          
        } catch (error) {
          logger.error(`Error processing initiative ${initiative.id}:`, error);
        }
      }
      
      // Rate limiting - wait between batches
      if (i + batchSize < initiatives.length) {
        logger.info('  Waiting 2 seconds (rate limiting)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    logger.info(`✅ Embedding generation complete! Processed ${processed} initiatives`);
    
    // Generate embeddings for causes
    logger.info('Generating cause embeddings...');
    const causes = await prisma.cause.findMany();
    
    for (const cause of causes) {
      try {
        const causeData = {
          id: cause.id,
          name: cause.name,
          description: cause.description,
          impactScore: cause.impactScore,
          keywords: JSON.parse(cause.keywordsJson || '[]'),
          metadata: JSON.parse(cause.metadataJson || '{}'),
        };
        
        const embeddingResult = await embeddingGenerator.generateCauseEmbedding(causeData as any);
        
        // For causes, we can store the embedding in metadata
        const metadata = JSON.parse(cause.metadataJson || '{}');
        metadata.embedding = embeddingResult.embedding;
        
        await prisma.cause.update({
          where: { id: cause.id },
          data: {
            metadataJson: JSON.stringify(metadata),
          },
        });
        
        logger.info(`Generated embedding for cause: ${cause.name}`);
        
      } catch (error) {
        logger.error(`Error processing cause ${cause.id}:`, error);
      }
    }
    
    logger.info('✅ All embeddings generated successfully!');
    
  } catch (error) {
    logger.error('Fatal error during embedding generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the embedding generator
if (require.main === module) {
  generateEmbeddings()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}