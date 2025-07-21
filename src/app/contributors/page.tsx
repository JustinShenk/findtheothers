export default function ContributorsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Contributors</h1>
      <p className="text-muted-foreground mb-8">
        Connect with experts and collaborators across different cause areas.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for contributor cards */}
        <div className="rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold">Sarah Chen</h3>
              <p className="text-sm text-muted-foreground">
                Climate tech engineer
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs">
                  <span className="font-medium">Focus:</span> Climate Change
                </div>
                <div className="text-xs">
                  <span className="font-medium">Available:</span> 10 hrs/week
                </div>
                <div className="text-xs text-green-600">
                  Open for mentorship
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold">Marcus Johnson</h3>
              <p className="text-sm text-muted-foreground">
                AI safety researcher
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs">
                  <span className="font-medium">Focus:</span> AI Safety
                </div>
                <div className="text-xs">
                  <span className="font-medium">Available:</span> 5 hrs/week
                </div>
                <div className="text-xs text-amber-600">
                  Limited availability
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 to-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold">Priya Patel</h3>
              <p className="text-sm text-muted-foreground">
                Public health specialist
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs">
                  <span className="font-medium">Focus:</span> Global Health
                </div>
                <div className="text-xs">
                  <span className="font-medium">Available:</span> 15 hrs/week
                </div>
                <div className="text-xs text-green-600">
                  Open for collaboration
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}