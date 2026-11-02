import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Compass, Sparkles, Navigation,
  ExternalLink, ArrowLeft, Bot, Layers, Info
} from 'lucide-react';
import { api } from '../../lib/api';
import { Place } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { InteractiveMap } from '../map/InteractiveMap';
import { AIGuideDrawer } from '../guide/AIGuideDrawer';
import { getPlaceImageUrl, handleImageError } from '../../lib/images';

export const PlaceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedPoiForGuide, setSelectedPoiForGuide] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get<Place>(`/places/${slug}/`)
      .then((res) => setPlace(res.data))
      .catch((err) => console.error('Failed to load place details', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-ink-muted gap-2">
        <Compass className="w-6 h-6 animate-spin text-forest-400" />
        <span>Loading destination details...</span>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel text-center space-y-4">
        <h2 className="text-lg font-bold text-ink-main">Destination Not Found</h2>
        <p className="text-xs text-ink-muted">
          The requested place could not be located in the heritage directory.
        </p>
        <Link to="/explore" className="btn-wine text-xs inline-block">
          Return to Explore
        </Link>
      </div>
    );
  }

  const handleVisitClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/visit/${place.slug}`);
    } else {
      navigate(`/visit/${place.slug}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="glass-panel py-2 px-3.5 rounded-xl text-xs text-ink-muted hover:text-ink-main flex items-center gap-1.5 transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Destinations</span>
      </button>

      {/* Hero Banner with Spatial Layout */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border-sage-300/20 bg-void">
        <div className="relative h-[360px] sm:h-[460px] w-full">
          <img
            src={getPlaceImageUrl(place.hero_image_url, place.category?.slug, place.slug)}
            alt={place.name}
            onError={(e) => handleImageError(e, place.category?.slug, place.slug)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-surface/60 to-transparent" />

          {/* Floating Hero Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-ink-main border"
                  style={{
                    backgroundColor: `${place.category?.theme_color}44`,
                    borderColor: place.category?.theme_color,
                  }}
                >
                  {place.category?.name}
                </span>

                {place.state && (
                  <span className="bg-surface/80 border border-sage-300/20 px-3 py-1 rounded-lg text-xs font-medium text-sage-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-royal-400" />
                    {place.state.name}
                  </span>
                )}

                <span className="bg-surface/80 border border-sage-300/20 px-3 py-1 rounded-lg text-xs font-medium text-ink-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-forest-400" />
                  Best Season: {place.best_season}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-main tracking-tight drop-shadow-md">
                {place.name}
              </h1>

              <p className="text-xs sm:text-sm text-ink-main/90 leading-relaxed font-light">
                {place.short_description}
              </p>
            </div>

            {/* Big Wine-Red Visit Button */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={handleVisitClick}
                className="btn-wine py-3.5 px-8 text-sm sm:text-base font-bold shadow-glow-wine group flex items-center justify-center gap-2.5"
              >
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                <span>Visit in 3D Walkthrough</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPoiForGuide(undefined);
                  setGuideOpen(true);
                }}
                className="btn-ghost py-2.5 px-5 text-xs font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-royal-400" />
                <span>Consult Heritage AI Guide</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details, Points of Interest, and Google Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): History & POIs */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI-Generated Overview Note */}
          {place.short_description_ai && (
            <div className="glass-panel p-6 border-royal-400/30 bg-surface/80 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-royal-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Groq AI Heritage Synthesis</span>
                </div>
                <span className="text-[10px] text-sage-300 bg-void/60 px-2 py-0.5 rounded border border-sage-300/20">
                  Verified Archive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-main leading-relaxed italic">
                &ldquo;{place.short_description_ai}&rdquo;
              </p>
            </div>
          )}

          {/* Historical & Cultural Archive */}
          <div className="glass-panel p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-ink-main flex items-center gap-2">
              <Info className="w-5 h-5 text-forest-400" />
              <span>Historical & Cultural Context</span>
            </h2>
            <div className="text-xs sm:text-sm text-ink-muted leading-relaxed space-y-3 whitespace-pre-line">
              {place.history_notes || 'This destination represents an invaluable chapter in Indian cultural history, renowned for its architectural grandeur, community traditions, and natural beauty.'}
            </div>
          </div>

          {/* Points of Interest (POIs) in 3D scene */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink-main flex items-center gap-2">
                <Layers className="w-5 h-5 text-royal-400" />
                <span>Points of Interest ({place.pois?.length || 0})</span>
              </h2>
              <span className="text-xs text-sage-300 font-medium">Explore within the 3D tour</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {place.pois?.map((poi) => (
                <div
                  key={poi.id}
                  className="glass-panel p-5 space-y-2 hover:border-royal-400/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-ink-main">{poi.title}</h3>
                    <button
                      onClick={() => {
                        setSelectedPoiForGuide(poi.title);
                        setGuideOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-sage-300 hover:text-ink-main hover:bg-surface transition-colors"
                      title="Ask AI guide about this point"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-royal-400" />
                    </button>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{poi.body}</p>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-sage-300">
                    <span>Coordinates: ({poi.pos_x}, {poi.pos_z})</span>
                    <span>Proximity radius: {poi.radius}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Google Map Integration & Coordinates */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-sm text-ink-main uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-forest-400" />
              <span>Location & Google Maps</span>
            </h3>

            {/* Embedded Spatial Map Component with Deep Link */}
            <InteractiveMap singlePlace={place} heightClass="h-[320px]" />

            <div className="space-y-2 text-xs text-ink-muted pt-2 border-t border-sage-300/10">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="font-mono text-ink-main">{Number(place.latitude).toFixed(6)}° N</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="font-mono text-ink-main">{Number(place.longitude).toFixed(6)}° E</span>
              </div>
              <div className="flex justify-between">
                <span>State / Region:</span>
                <span className="text-ink-main">{place.state?.name || 'India'}</span>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full text-xs py-2.5 justify-center gap-2"
            >
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Virtual Visit Quick Card */}
          <div className="glass-panel p-6 border-wine-600/30 bg-gradient-to-br from-surface to-wine-600/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-wine-400 uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Interactive Walkthrough</span>
            </div>
            <h4 className="font-bold text-base text-ink-main">Ready to explore {place.name}?</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Step directly onto the grounds, discover ancient stone architecture, and walk up to points of interest with responsive controls.
            </p>
            <button
              onClick={handleVisitClick}
              className="btn-wine w-full py-3 text-xs font-bold"
            >
              Launch 3D Explorer
            </button>
          </div>
        </div>
      </div>

      {/* AI Guide Drawer */}
      <AIGuideDrawer
        place={place}
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        currentPoiTitle={selectedPoiForGuide}
      />
    </div>
  );
};

