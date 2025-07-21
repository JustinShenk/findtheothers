'use client';

import { useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { ExternalLink, Star, GitFork, Calendar } from 'lucide-react';

interface Initiative {
  id: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  cause: {
    name: string;
    color: string;
  };
  languagesJson: string;
  topicsJson: string;
  createdAt: string;
  lastActivityAt: string;
}

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('/api/initiatives');
      if (!response.ok) {
        throw new Error('Failed to fetch initiatives');
      }
      const data = await response.json();
      setInitiatives(data);
    } catch (err) {
      setError('Error loading initiatives');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading initiatives...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Real GitHub Initiatives</h1>
      <p className="text-muted-foreground mb-8">
        Explore {initiatives.length} real GitHub repositories working on humanity's most important challenges.
      </p>
      
      <div className="space-y-4">
        {initiatives.map((initiative) => {
          const languages = JSON.parse(initiative.languagesJson || '[]');
          const topics = JSON.parse(initiative.topicsJson || '[]');
          
          return (
            <div key={initiative.id} className="rounded-lg border p-6 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {initiative.name}
                    <a 
                      href={initiative.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {initiative.description || 'No description available'}
                  </p>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: initiative.cause.color + '20',
                    color: initiative.cause.color,
                  }}
                >
                  {initiative.cause.name}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {initiative.stars.toLocaleString()} stars
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  {initiative.forks.toLocaleString()} forks
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Active {new Date(initiative.lastActivityAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {languages.slice(0, 3).map((lang: string) => (
                  <span 
                    key={lang}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                  >
                    {lang}
                  </span>
                ))}
                {topics.slice(0, 3).map((topic: string) => (
                  <span 
                    key={topic}
                    className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {initiatives.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No initiatives found. Run <code>npm run scrape:github:limited</code> to collect data.
          </p>
        </div>
      )}
    </div>
  );
}