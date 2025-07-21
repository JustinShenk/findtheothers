import { Matrix } from 'ml-matrix';
import { PCA } from 'ml-pca';
import { kmeans } from 'ml-kmeans';
import { VisualizationNode } from '@/types/visualization';

export interface AnalyticsResult {
  nodes: VisualizationNode[];
  clusters: ClusterResult[];
  pcaVariance: number[];
  embedding: number[][];
}

export interface ClusterResult {
  id: number;
  centroid: number[];
  color: string;
  size: number;
  nodes: string[];
  label: string;
}

export class DimensionReduction {
  private pca: PCA | null = null;
  private clusterColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
  ];

  /**
   * Extract feature vectors from nodes for PCA and clustering
   */
  private extractFeatures(nodes: VisualizationNode[]): number[][] {
    return nodes.map(node => {
      const features = [];
      
      // Node type encoding (one-hot)
      features.push(node.type === 'cause' ? 1 : 0);
      features.push(node.type === 'initiative' ? 1 : 0);
      features.push(node.type === 'contributor' ? 1 : 0);
      
      // Size and opacity
      features.push(node.size / 30); // Normalize size
      features.push(node.opacity);
      
      // Data-specific features
      if (node.data) {
        if (node.type === 'initiative') {
          features.push(Math.log10((node.data.stars || 0) + 1) / 5); // Log-normalized stars
          features.push(Math.log10((node.data.forks || 0) + 1) / 5); // Log-normalized forks
          features.push(node.data.languages?.length || 0); // Number of languages
          features.push(node.data.topics?.length || 0); // Number of topics
        } else if (node.type === 'cause') {
          features.push((node.data.impact || 0) / 100); // Normalized impact
          features.push(node.data.initiatives || 0); // Number of initiatives
        } else if (node.type === 'contributor') {
          features.push(1); // Binary: is contributor
          features.push(0); // Placeholder for additional contributor features
        }
      }
      
      // Pad features to consistent length
      while (features.length < 10) {
        features.push(0);
      }
      
      return features.slice(0, 10); // Ensure consistent feature vector length
    });
  }

  /**
   * Apply PCA to reduce dimensions and position nodes
   */
  public applyPCA(nodes: VisualizationNode[], targetDimensions: number = 3): AnalyticsResult {
    if (nodes.length < 2) {
      return {
        nodes,
        clusters: [],
        pcaVariance: [],
        embedding: [],
      };
    }

    const features = this.extractFeatures(nodes);
    const matrix = new Matrix(features);
    
    // Apply PCA with error handling for zero variance
    let transformed;
    let pcaVariance: number[] = [];
    
    try {
      this.pca = new PCA(matrix, { center: true, scale: true });
      transformed = this.pca.predict(matrix, { nComponents: targetDimensions });
      pcaVariance = this.pca.getExplainedVariance();
    } catch (error) {
      // If scaling fails due to zero variance, try without scaling
      console.warn('PCA with scaling failed, retrying without scaling:', error);
      try {
        this.pca = new PCA(matrix, { center: true, scale: false });
        transformed = this.pca.predict(matrix, { nComponents: targetDimensions });
        pcaVariance = this.pca.getExplainedVariance();
      } catch (fallbackError) {
        // If PCA still fails, use random positions as fallback
        console.error('PCA failed completely, using random positions:', fallbackError);
        const randomPositions = Matrix.rand(nodes.length, targetDimensions);
        transformed = randomPositions;
      }
    }
    
    // Detect and filter outliers using IQR method
    const coordsArray = transformed.to2DArray();
    const outlierIndices = this.detectOutliers(coordsArray);
    
    // Calculate spread factor to ensure good distribution
    const allCoords = coordsArray.filter((_, idx) => !outlierIndices.has(idx));
    let spreadFactor = 50; // Default spread
    
    if (allCoords.length > 0) {
      // Calculate the range of non-outlier coordinates
      const xCoords = allCoords.map(c => c[0]);
      const yCoords = allCoords.map(c => c[1]);
      const xRange = Math.max(...xCoords) - Math.min(...xCoords);
      const yRange = Math.max(...yCoords) - Math.min(...yCoords);
      const maxRange = Math.max(xRange, yRange);
      
      // Scale to achieve good spread (target range of ~200 units)
      if (maxRange > 0) {
        spreadFactor = 200 / maxRange;
      }
    }
    
    // Update node positions based on PCA, scaling outliers
    const updatedNodes = nodes.map((node, index) => {
      const coords = transformed.getRow(index);
      let x = (coords[0] || 0) * spreadFactor;
      let y = (coords[1] || 0) * spreadFactor;
      let z = targetDimensions > 2 ? ((coords[2] || 0) * spreadFactor) : 0;
      
      // If node is an outlier, scale its position to bring it closer
      if (outlierIndices.has(index)) {
        const outlierScale = 0.3; // Bring outliers 70% closer to center
        x *= outlierScale;
        y *= outlierScale;
        z *= outlierScale;
      }
      
      return {
        ...node,
        x,
        y,
        z,
        isOutlier: outlierIndices.has(index),
      };
    });

    // Perform clustering
    const clusters = this.performClustering(transformed.to2DArray(), updatedNodes);

    return {
      nodes: updatedNodes,
      clusters,
      pcaVariance,
      embedding: transformed.to2DArray(),
    };
  }

  /**
   * Perform k-means clustering on the transformed data
   */
  private performClustering(embedding: number[][], nodes: VisualizationNode[]): ClusterResult[] {
    const optimalK = Math.min(Math.max(2, Math.floor(Math.sqrt(nodes.length / 2))), 8);
    
    try {
      const result = kmeans(embedding, optimalK, {
        initialization: 'kmeans++',
        maxIterations: 100,
      });

      const clusters: ClusterResult[] = [];
      const clusterNodeMap = new Map<number, string[]>();
      
      // Group nodes by cluster
      result.clusters.forEach((clusterIndex, nodeIndex) => {
        if (!clusterNodeMap.has(clusterIndex)) {
          clusterNodeMap.set(clusterIndex, []);
        }
        clusterNodeMap.get(clusterIndex)!.push(nodes[nodeIndex].id);
      });

      // Create cluster results
      result.centroids.forEach((centroid, index) => {
        const nodeIds = clusterNodeMap.get(index) || [];
        const clusterNodes = nodes.filter(n => nodeIds.includes(n.id));
        
        // Determine cluster label based on dominant node types
        const typeCount = clusterNodes.reduce((acc, node) => {
          acc[node.type] = (acc[node.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
        
        clusters.push({
          id: index,
          centroid,
          color: this.clusterColors[index % this.clusterColors.length],
          size: nodeIds.length,
          nodes: nodeIds,
          label: this.generateClusterLabel(dominantType, clusterNodes),
        });
      });

      // Update node colors based on clusters
      nodes.forEach((node, index) => {
        const clusterIndex = result.clusters[index];
        const cluster = clusters[clusterIndex];
        if (cluster) {
          node.color = cluster.color;
          node.data = {
            ...node.data,
            clusterId: cluster.id,
            clusterLabel: cluster.label,
          };
        }
      });

      return clusters;
    } catch (error) {
      console.error('Clustering failed:', error);
      return [];
    }
  }

  /**
   * Generate meaningful cluster labels
   */
  private generateClusterLabel(dominantType: string, nodes: VisualizationNode[]): string {
    if (dominantType === 'cause') {
      return 'Cause Areas';
    } else if (dominantType === 'initiative') {
      // Find most common languages or topics
      const languages = new Set<string>();
      const topics = new Set<string>();
      
      nodes.forEach(node => {
        if (node.data?.languages) {
          node.data.languages.forEach((lang: string) => languages.add(lang));
        }
        if (node.data?.topics) {
          node.data.topics.forEach((topic: string) => topics.add(topic));
        }
      });
      
      if (languages.size > 0) {
        const topLang = Array.from(languages)[0];
        return `${topLang} Projects`;
      } else if (topics.size > 0) {
        const topTopic = Array.from(topics)[0];
        return `${topTopic} Initiatives`;
      }
      return 'Project Cluster';
    } else if (dominantType === 'contributor') {
      return 'Contributors';
    }
    return 'Mixed Cluster';
  }

  /**
   * Calculate silhouette score for clustering quality
   */
  public calculateSilhouetteScore(embedding: number[][], clusters: number[]): number {
    if (embedding.length < 2) return 0;
    
    const euclideanDistance = (a: number[], b: number[]) => {
      return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    };
    
    let totalScore = 0;
    
    embedding.forEach((point, i) => {
      const clusterIndex = clusters[i];
      const sameCluster = embedding.filter((_, j) => clusters[j] === clusterIndex && i !== j);
      const otherClusters = embedding.filter((_, j) => clusters[j] !== clusterIndex);
      
      if (sameCluster.length === 0) return;
      
      // Average distance to points in same cluster
      const a = sameCluster.reduce((sum, other) => sum + euclideanDistance(point, other), 0) / sameCluster.length;
      
      // Average distance to points in nearest other cluster
      const b = otherClusters.length > 0 
        ? Math.min(...otherClusters.map(other => euclideanDistance(point, other)))
        : 0;
      
      const silhouette = (b - a) / Math.max(a, b);
      totalScore += silhouette;
    });
    
    return totalScore / embedding.length;
  }

  /**
   * Get PCA loading vectors for feature importance
   */
  public getFeatureImportance(): number[][] | null {
    return this.pca?.getLoadings().to2DArray() || null;
  }

  /**
   * Detect outliers using IQR method on PCA coordinates
   */
  private detectOutliers(coordinates: number[][]): Set<number> {
    const outliers = new Set<number>();
    
    // Calculate distance from origin for each point
    const distances = coordinates.map(coord => 
      Math.sqrt(coord.reduce((sum, val) => sum + val * val, 0))
    );
    
    // Sort distances to calculate quartiles
    const sortedDistances = [...distances].sort((a, b) => a - b);
    const n = sortedDistances.length;
    
    // Calculate Q1, Q3, and IQR
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sortedDistances[q1Index];
    const q3 = sortedDistances[q3Index];
    const iqr = q3 - q1;
    
    // Define outlier thresholds (using 2.5 * IQR for more aggressive filtering)
    const lowerBound = q1 - 2.5 * iqr;
    const upperBound = q3 + 2.5 * iqr;
    
    // Mark points outside bounds as outliers
    distances.forEach((distance, index) => {
      if (distance < lowerBound || distance > upperBound) {
        outliers.add(index);
      }
    });
    
    console.log(`Detected ${outliers.size} outliers out of ${coordinates.length} nodes`);
    return outliers;
  }
}