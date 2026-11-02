import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, MapPin, Sparkles, ArrowRight, Shield, Globe,
  Eye, Landmark, Church, Trees, Mountain, Palmtree, Waves
} from 'lucide-react';
import { api } from '../../lib/api';
import { Category, Place } from '../../types';
import { SpatialCard } from '../../components/ui/SpatialCard';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, placeRes] = await Promise.all([
          api.get<Category[]>('/places/categories/'),
          api.get<Place[]>('/places/'),
        ]);
        setCategories(catRes.data);
        setFeaturedPlaces(placeRes.data);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('temple')) return <Church className="w-5 h-5" />;
    if (slug.includes('monument')) return <Landmark className="w-5 h-5" />;
    if (slug.includes('beach')) return <Palmtree className="w-5 h-5" />;
    if (slug.includes('cultural')) return <Globe className="w-5 h-5" />;
    if (slug.includes('ecotourism')) return <Trees className="w-5 h-5" />;
    if (slug.includes('trekking')) return <Mountain className="w-5 h-5" />;
    if (slug.includes('water')) return <Waves className="w-5 h-5" />;
    return <Compass className="w-5 h-5" />;
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section with Spatial Glow */}
      <section className="relative px-4 sm:px-8 pt-12 sm:pt-20 max-w-7xl mx-auto text-center">
        {/* Background glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-forest-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 bg-surface/80 border border-royal-400/30 px-4 py-1.5 rounded-full text-xs font-semibold text-sage-300 mb-6 shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-royal-400" />
          <span>Next-Generation Virtual Tourism of India</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-ink-main max-w-5xl mx-auto leading-[1.15]">
          Walk Through India&apos;s <br />
          <span className="bg-gradient-to-r from-forest-300 via-sage-300 to-royal-300 bg-clip-text text-transparent">
            Timeless Heritage in 3D
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Step into sacred temples, imperial monuments, sun-drenched beaches, and high Himalayan ridges.
          Walk around freely as a virtual character with an intelligent AI heritage guide.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/explore" className="btn-wine py-3.5 px-8 text-sm w-full sm:w-auto shadow-glow-wine">
            <Compass className="w-4 h-4" />
            <span>Explore Destinations</span>
          </Link>
          <Link to="/place/konark-sun-temple" className="btn-ghost py-3.5 px-8 text-sm w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-1 text-royal-400" />
            <span>Sample 3D Tour (Konark)</span>
          </Link>
        </div>

        {/* Quick Stats Pill */}
        <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-ink-main">7</div>
            <div className="text-[11px] text-sage-300 mt-1 uppercase tracking-wider font-medium">Unique Categories</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-ink-main">100%</div>
            <div className="text-[11px] text-sage-300 mt-1 uppercase tracking-wider font-medium">Browser WebGL</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-ink-main">Groq</div>
            <div className="text-[11px] text-sage-300 mt-1 uppercase tracking-wider font-medium">Ultra-Fast AI Guide</div>
          </div>
          <div className="glass-panel p-4">
            <div className="text-2xl font-bold text-ink-main">360°</div>
            <div className="text-[11px] text-sage-300 mt-1 uppercase tracking-wider font-medium">Full Spatial Freedom</div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-main">Explore by Category</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">Discover India across spirituality, architecture, and wilderness</p>
          </div>
          <Link to="/explore" className="text-xs text-sage-300 hover:text-ink-main flex items-center gap-1 font-semibold">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="glass-panel glass-panel-hover p-5 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-main shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${cat.theme_color}33`, borderColor: cat.theme_color, borderWidth: 1 }}
                >
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className="text-[11px] font-semibold text-sage-300 bg-void/60 px-2 py-0.5 rounded-md">
                  {cat.places_count} {cat.places_count === 1 ? 'place' : 'places'}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-sm text-ink-main group-hover:text-sage-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-ink-muted line-clamp-2 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Pilot Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-royal-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pilot Destinations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-main">Signature 3D Walkthroughs</h2>
          </div>
          <Link to="/explore" className="text-xs text-sage-300 hover:text-ink-main flex items-center gap-1 font-semibold">
            <span>Explore Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPlaces.slice(0, 6).map((place) => (
            <SpatialCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      {/* In-World AI Guide Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="glass-panel p-8 sm:p-12 border-sage-300/20 bg-gradient-to-r from-surface via-[#111f18] to-surface relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-royal-600/10 blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-royal-600/30 border border-royal-400/40 px-3 py-1 rounded-full text-xs font-semibold text-royal-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Heritage Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-ink-main">
              Your Personal In-World Scholar & Guide
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              As you walk through sacred sanctums or coral beaches, ask any question about architecture, history, mythology, or flora. Our Groq-powered AI guide draws directly from verified archaeological archives to enrich your exploration.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link to="/explore" className="btn-wine text-xs py-2.5 px-5">
                Try the AI Guide
              </Link>
              <div className="flex items-center gap-2 text-xs text-sage-300">
                <Shield className="w-4 h-4" />
                <span>Zero Hallucination Grounding</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

