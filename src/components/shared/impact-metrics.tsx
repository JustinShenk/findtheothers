import { TrendingUp, Users, GitFork, Star } from 'lucide-react';

interface ImpactMetricsProps {
  data?: {
    totalNodes: number;
    totalEdges: number;
    causes: number;
    initiatives: number;
    contributors: number;
  };
}

export function ImpactMetrics({ data }: ImpactMetricsProps) {
  if (!data) {
    return (
      <div className="rounded-lg bg-background/80 backdrop-blur border p-3">
        <div className="text-sm text-muted-foreground">Loading metrics...</div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Initiatives',
      value: data.initiatives,
      icon: GitFork,
      color: 'text-blue-500',
    },
    {
      label: 'Contributors',
      value: data.contributors,
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'Causes',
      value: data.causes,
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      label: 'Connections',
      value: data.totalEdges,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="rounded-lg bg-background/80 backdrop-blur border p-3 space-y-3">
      <h3 className="font-medium text-sm">Impact Metrics</h3>
      <div className="space-y-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-sm font-medium">{metric.value.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}