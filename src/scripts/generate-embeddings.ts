import { PrismaClient } from '@prisma/client';
import { EmbeddingGenerator } from '@/lib/embeddings/generator';
import { logger } from '@/lib/utils/logger';
import { PCA } from 'ml-pca';

const prisma = new PrismaClient();
const embeddingGenerator = new EmbeddingGenerator();

async function generateEmbeddings() {
  logger.info('Starting embedding generation...');
  
  try {
    // Get initiatives that don't have embeddings yet
    const initiatives = await prisma.initiative.findMany({
      where: {
        OR: [
          { embeddingJson: null },
          { embeddingJson: '' },
        ],
      },
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
    
    // Generate embeddings for causes that don't have them yet
    logger.info('Checking for causes needing embeddings...');
    const causes = await prisma.cause.findMany();
    
    const causesNeedingEmbeddings = causes.filter(cause => {
      const metadata = JSON.parse(cause.metadataJson || '{}');
      return !metadata.embedding;
    });
    
    logger.info(`Found ${causesNeedingEmbeddings.length} causes needing embeddings`);
    
    for (const cause of causesNeedingEmbeddings) {
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
    
    // Generate PCA components for initiatives
    logger.info('Starting PCA computation...');
    await generatePCAComponents();
    logger.info('✅ PCA computation complete!');
    
  } catch (error) {
    logger.error('Fatal error during embedding generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function generatePCAComponents() {
  try {
    // Clear existing PCA data
    await prisma.precomputedPCA.deleteMany({});
    logger.info('Cleared existing PCA data');
    
    // Get all initiatives with embeddings
    const initiatives = await prisma.initiative.findMany({
      where: {
        embeddingJson: {
          not: null,
        },
      },
      include: {
        cause: true,
      },
    });
    
    logger.info(`Found ${initiatives.length} initiatives with embeddings`);
    
    // Get all causes
    const causes = await prisma.cause.findMany();
    
    // Process global scope (all initiatives)
    logger.info('Computing PCA for global scope...');
    await computePCAForScope(initiatives, null);
    
    // Process each cause
    for (const cause of causes) {
      const causeInitiatives = initiatives.filter(i => i.causeId === cause.id);
      if (causeInitiatives.length > 1) { // Need at least 2 initiatives for PCA
        logger.info(`Computing PCA for cause: ${cause.name} (${causeInitiatives.length} initiatives)`);
        await computePCAForScope(causeInitiatives, cause.id);
      } else {
        logger.info(`Skipping cause ${cause.name}: insufficient initiatives (${causeInitiatives.length})`);
      }
    }
    
  } catch (error) {
    logger.error('Error in PCA generation:', error);
    throw error;
  }
}

async function computePCAForScope(initiatives: any[], causeId: string | null) {
  if (initiatives.length < 2) {
    logger.warn(`Insufficient initiatives for PCA: ${initiatives.length}`);
    return;
  }
  
  // Calculate appropriate number of components
  // Need at least 4x the dimensionality, minimum 2 components
  const maxComponents = Math.max(2, Math.min(16, Math.floor(initiatives.length / 4)));
  
  // Extract embeddings matrix
  const embeddings = initiatives.map(initiative => 
    JSON.parse(initiative.embeddingJson)
  );
  
  // Perform PCA
  const pca = new PCA(embeddings);
  const components = pca.predict(embeddings, { nComponents: maxComponents });
  const explainedVariance = pca.getExplainedVariance().slice(0, maxComponents);
  
  // Pad components to 16D with zeros if needed
  const paddedComponents = initiatives.map((initiative, index) => {
    const rowComponents = Array.from(components.getRow(index));
    while (rowComponents.length < 16) {
      rowComponents.push(0);
    }
    return rowComponents;
  });
  
  // Pad variance to 16D with zeros if needed
  const paddedVariance = [...explainedVariance];
  while (paddedVariance.length < 16) {
    paddedVariance.push(0);
  }
  
  // Store results for each initiative
  const pcaRecords = initiatives.map((initiative, index) => ({
    causeId,
    initiativeId: initiative.id,
    components: paddedComponents[index],
    variance: paddedVariance,
  }));
  
  // Batch insert PCA records
  await prisma.precomputedPCA.createMany({
    data: pcaRecords,
  });
  
  logger.info(`Stored PCA components for ${pcaRecords.length} initiatives (${maxComponents}D -> 16D)${causeId ? ` (cause: ${causeId})` : ' (global scope)'}`);
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