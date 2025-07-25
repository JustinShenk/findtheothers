'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, Filter, Loader2 } from 'lucide-react';

interface CauseFilterProps {
  selected: string;
  onChange: (selected: string) => void;
}

interface Cause {
  id: string;
  name: string;
  color: string;
  description: string;
  impactScore: number;
  _count: {
    initiatives: number;
    contributors: number;
  };
}

export function CauseFilter({ selected, onChange }: CauseFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCauses() {
      try {
        const response = await fetch('/api/causes');
        if (response.ok) {
          const data = await response.json();
          setCauses(data);
        }
      } catch (error) {
        console.error('Failed to fetch causes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCauses();
  }, []);

  const handleSelect = (causeId: string) => {
    onChange(selected === causeId ? '' : causeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Filter className="h-4 w-4" />
        )}
        <span>Causes {selected ? '(1)' : ''}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && !loading && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border bg-popover p-1 shadow-lg z-50">
          {causes.map((cause) => (
            <button
              key={cause.id}
              onClick={() => handleSelect(cause.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cause.color }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium">{cause.name}</div>
                <div className="text-xs text-muted-foreground">
                  {cause._count.initiatives} projects
                </div>
              </div>
              {selected === cause.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
          <div className="mt-2 pt-2 border-t">
            <button
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              Clear filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}