'use client';

import { X, Users, Clock, MapPin } from 'lucide-react';
import { CoordinationOpportunity } from '@/types/coordination';

interface CoordinationPanelProps {
  opportunities?: CoordinationOpportunity[];
  onClose: () => void;
}

export function CoordinationPanel({ opportunities = [], onClose }: CoordinationPanelProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-xl z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Coordination Opportunities</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
        {opportunities.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No coordination opportunities found.
            </p>
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-sm">{opportunity.title}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {opportunity.type}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {opportunity.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{opportunity.participants?.length || 0} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-primary text-primary-foreground rounded-md py-2 px-3 text-sm font-medium hover:bg-primary/90">
                  Join
                </button>
                <button className="px-3 py-2 border rounded-md text-sm hover:bg-accent">
                  Learn More
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}