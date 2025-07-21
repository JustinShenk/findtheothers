'use client';

import { useState } from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';

interface CauseFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MOCK_CAUSES = [
  { id: '1', name: 'Climate Change', color: '#10b981' },
  { id: '2', name: 'AI Safety', color: '#3b82f6' },
  { id: '3', name: 'Global Health', color: '#ef4444' },
  { id: '4', name: 'Education', color: '#f59e0b' },
  { id: '5', name: 'Poverty', color: '#8b5cf6' },
  { id: '6', name: 'Governance', color: '#06b6d4' },
];

export function CauseFilter({ selected, onChange }: CauseFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (causeId: string) => {
    if (selected.includes(causeId)) {
      onChange(selected.filter((id) => id !== causeId));
    } else {
      onChange([...selected, causeId]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Filter className="h-4 w-4" />
        <span>Causes ({selected.length})</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-popover p-1 shadow-lg z-50">
          {MOCK_CAUSES.map((cause) => (
            <button
              key={cause.id}
              onClick={() => handleToggle(cause.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cause.color }}
              />
              <span className="flex-1 text-left">{cause.name}</span>
              {selected.includes(cause.id) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
          <div className="mt-2 pt-2 border-t">
            <button
              onClick={() => onChange([])}
              className="w-full rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}