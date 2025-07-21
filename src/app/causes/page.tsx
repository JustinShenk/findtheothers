export default function CausesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Causes</h1>
      <p className="text-muted-foreground mb-8">
        Discover the most important challenges humanity faces and find your community.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for cause cards */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-2">Climate Change</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Addressing global warming and environmental sustainability
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">95 Impact Score</span>
            <span className="text-muted-foreground">•</span>
            <span>1,250 Projects</span>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-2">AI Safety</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ensuring artificial intelligence benefits humanity
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600">92 Impact Score</span>
            <span className="text-muted-foreground">•</span>
            <span>450 Projects</span>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-2">Global Health</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Improving health outcomes worldwide
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-600">88 Impact Score</span>
            <span className="text-muted-foreground">•</span>
            <span>2,100 Projects</span>
          </div>
        </div>
      </div>
    </div>
  );
}