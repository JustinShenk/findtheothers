import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">About Find the Others</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl text-muted-foreground mb-8">
          Discover and connect with people working on humanity&apos;s most important challenges.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p>
            Find the Others is a platform designed to help passionate individuals discover 
            communities of people working on similar causes. Whether you&apos;re focused on 
            climate change, AI safety, global health, education, poverty, or governance, 
            we help you find your tribe.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Discover Initiatives:</strong> Browse through thousands of projects 
              categorized by cause and impact
            </li>
            <li>
              <strong>Find Contributors:</strong> Connect with developers, researchers, 
              and advocates working in your field
            </li>
            <li>
              <strong>Visualize Impact:</strong> See the landscape of efforts through 
              our interactive visualization
            </li>
            <li>
              <strong>Coordinate Efforts:</strong> Find opportunities to collaborate 
              and amplify your impact
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔍 Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Search across initiatives, causes, and contributors to find exactly 
                what you&apos;re looking for.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🌐 Interactive Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Explore the ecosystem of causes through our dynamic 3D visualization.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🤝 Coordination Tools</h3>
              <p className="text-sm text-muted-foreground">
                Find mentorship opportunities and collaboration possibilities.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Impact Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Track and measure the collective impact of initiatives.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p>
            Ready to find your community? Start by exploring our{' '}
            <Link href="/" className="text-primary hover:underline">
              interactive visualization
            </Link>{' '}
            or browse{' '}
            <Link href="/causes" className="text-primary hover:underline">
              causes
            </Link>{' '}
            that matter to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Open Source</h2>
          <p>
            Find the Others is open source and welcomes contributions. Visit our{' '}
            <a 
              href="https://github.com/JustinShenk/findtheothers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub repository
            </a>{' '}
            to learn more about contributing to the project.
          </p>
        </section>
      </div>
    </div>
  );
}