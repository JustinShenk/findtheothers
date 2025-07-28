'use client';

import Link from 'next/link';
import { Search, Menu, User, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';

interface SearchResult {
  initiatives: any[];
  causes: any[];
  contributors: any[];
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleResultClick = (type: string, id: string) => {
    setShowResults(false);
    setSearchQuery('');
    
    // Navigate based on result type
    switch (type) {
      case 'initiative':
        router.push(`/initiatives/${id}`);
        break;
      case 'cause':
        router.push(`/causes/${id}`);
        break;
      case 'contributor':
        router.push(`/contributors/${id}`);
        break;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Find the Others
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/causes" className="text-foreground/60 hover:text-foreground">
              Causes
            </Link>
            <Link href="/initiatives" className="text-foreground/60 hover:text-foreground">
              Initiatives
            </Link>
            <Link href="/contributors" className="text-foreground/60 hover:text-foreground">
              Contributors
            </Link>
            <Link href="/coordination" className="text-foreground/60 hover:text-foreground">
              Coordination
            </Link>
          </nav>
        </div>
        <button className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search initiatives, causes, or contributors..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[300px] lg:w-[400px]"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                    setShowResults(false);
                  }}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && searchResults && (
                <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-lg max-h-96 overflow-y-auto">
                  {searchResults.causes.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Causes</div>
                      {searchResults.causes.map((cause) => (
                        <button
                          key={cause.id}
                          onClick={() => handleResultClick('cause', cause.id)}
                          className="w-full text-left px-2 py-1.5 hover:bg-accent rounded-sm flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cause.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{cause.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {cause._count.initiatives} initiatives
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.initiatives.length > 0 && (
                    <div className="p-2 border-t">
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Initiatives</div>
                      {searchResults.initiatives.map((initiative) => (
                        <button
                          key={initiative.id}
                          onClick={() => handleResultClick('initiative', initiative.id)}
                          className="w-full text-left px-2 py-1.5 hover:bg-accent rounded-sm"
                        >
                          <div className="font-medium text-sm truncate">{initiative.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span style={{ color: initiative.cause.color }}>
                              {initiative.cause.name}
                            </span>
                            <span>•</span>
                            <span>⭐ {initiative.stars}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.contributors.length > 0 && (
                    <div className="p-2 border-t">
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Contributors</div>
                      {searchResults.contributors.map((contributor) => (
                        <button
                          key={contributor.id}
                          onClick={() => handleResultClick('contributor', contributor.id)}
                          className="w-full text-left px-2 py-1.5 hover:bg-accent rounded-sm"
                        >
                          <div className="font-medium text-sm">{contributor.name || contributor.githubUsername}</div>
                          {contributor.causes.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {contributor.causes.map((c: any) => c.cause.name).join(', ')}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.causes.length === 0 && 
                   searchResults.initiatives.length === 0 && 
                   searchResults.contributors.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <nav className="flex items-center">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}