'use client';

import { Users, Briefcase, BookOpen, MessageSquare } from 'lucide-react';

export default function CoordinationPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Coordination Opportunities</h1>
      <p className="text-muted-foreground mb-8">
        Find mentorship, collaboration, and learning opportunities aligned with your interests.
      </p>
      
      <div className="mb-6 flex gap-2">
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground">
          All
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-accent">
          Mentorship
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-accent">
          Collaboration
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-accent">
          Projects
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Climate Data Science Mentorship</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Looking for mentees interested in applying data science to climate problems
                </p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Open
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-secondary px-2 py-1 rounded">Climate Change</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">Data Science</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">Python</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>5 hrs/week</span>
              <span>•</span>
              <span>Intermediate level</span>
              <span>•</span>
              <span>By Sarah Chen</span>
            </div>
            <button className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Apply
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Safety Research Collaboration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Seeking researchers to collaborate on interpretability tools
                </p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Open
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-secondary px-2 py-1 rounded">AI Safety</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">Research</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">Machine Learning</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>10 hrs/week</span>
              <span>•</span>
              <span>Advanced level</span>
              <span>•</span>
              <span>By Marcus Johnson</span>
            </div>
            <button className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Join
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Vaccine Distribution Field Testing</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Need partners for field testing vaccine distribution algorithms
                </p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Open
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-secondary px-2 py-1 rounded">Global Health</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">Field Work</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">Public Health</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>20 hrs/week</span>
              <span>•</span>
              <span>Intermediate level</span>
              <span>•</span>
              <span>By Priya Patel</span>
            </div>
            <button className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}