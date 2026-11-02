import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, LayoutGrid, Map as MapIcon, X, Compass } from 'lucide-react';
import { api } from '../../lib/api';
import { Place, Category } from '../../types';
import { SpatialCard } from '../../components/ui/SpatialCard';
import { InteractiveMap } from '../map/InteractiveMap';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialMode = searchParams.get('mode') === 'map' ? 'map' : 'grid';

  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(initialMode);
  const [loading, setLoading] = useState(true);

  // Sync category param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    api.get<Category[]>('/places/categories/').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Fetch filtered places
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());

    api
      .get<Place[]>(`/places/?${params.toString()}`)
      .then((res) => setPlaces(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const handleCategoryClick = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory('');
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSelectedCategory(slug);
      searchParams.set('category', slug);
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-main">Explore Destinations</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Pick a destination, inspect it on the map, and embark on a virtual 3D tour.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="glass-panel p-1 flex items-center gap-1 border-sage-300/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-forest-600 text-ink-main shadow-glow-forest'
                  : 'text-ink-muted hover:text-ink-main'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-royal-600 text-ink-main shadow-glow'
                  : 'text-ink-muted hover:text-ink-main'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by monument name, state (Odisha, Goa, UP), or keyword..."
            className="w-full bg-surface/80 border border-sage-300/20 rounded-xl pl-11 pr-10 py-3 text-xs sm:text-sm text-ink-main placeholder:text-ink-muted/60 focus:outline-none focus:border-royal-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-main"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              !selectedCategory
                ? 'bg-forest-600 border-forest-400 text-ink-main shadow-glow-forest'
                : 'glass-panel text-ink-muted hover:text-ink-main'
            }`}
          >
            All Categories ({places.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-royal-600 border-royal-400 text-ink-main shadow-glow'
                  : 'glass-panel text-ink-muted hover:text-ink-main'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.theme_color }}
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <InteractiveMap places={places} heightClass="h-[520px]" />
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="py-20 text-center text-xs text-ink-muted flex items-center justify-center gap-2">
              <Compass className="w-5 h-5 animate-spin text-forest-400" />
              <span>Fetching places...</span>
            </div>
          ) : places.length === 0 ? (
            <div className="py-20 text-center glass-panel p-8 max-w-md mx-auto space-y-3">
              <Compass className="w-8 h-8 mx-auto text-ink-muted" />
              <h3 className="font-bold text-sm text-ink-main">No destinations found</h3>
              <p className="text-xs text-ink-muted">
                Try clearing your search query or choosing another category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchQuery('');
                }}
                className="btn-ghost text-xs mx-auto"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <SpatialCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

