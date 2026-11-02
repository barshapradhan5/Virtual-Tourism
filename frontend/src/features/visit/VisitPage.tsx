import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Place } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { VirtualWorld } from './VirtualWorld';
import { AIGuideDrawer } from '../guide/AIGuideDrawer';

export const VisitPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guidePoiTitle, setGuidePoiTitle] = useState<string | undefined>(undefined);

  // Authentication Guard as required by PRD Section 6 & 10
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=/visit/${slug}`);
    }
  }, [authLoading, isAuthenticated, navigate, slug]);

  // Fetch Place Details
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get<Place>(`/places/${slug}/`)
      .then((res) => setPlace(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (authLoading || loading) {
    return (
      <div className="w-full h-screen bg-void flex flex-col items-center justify-center text-ink-main gap-3">
        <Compass className="w-10 h-10 animate-spin text-forest-400" />
        <h3 className="font-bold text-base">Initializing 3D Virtual World...</h3>
        <p className="text-xs text-ink-muted">Loading terrain, architectural monuments, and collision boundaries</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="w-full h-screen bg-void flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-wine-400" />
        <h3 className="font-bold text-base text-ink-main">Destination Scene Unavailable</h3>
        <p className="text-xs text-ink-muted max-w-sm">
          Could not load the scene manifest for this location.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="btn-wine text-xs py-2 px-5"
        >
          Return to Destinations
        </button>
      </div>
    );
  }

  const handleOpenGuide = (poiTitle?: string) => {
    setGuidePoiTitle(poiTitle);
    setGuideOpen(true);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-void relative">
      {/* 3D World Viewport */}
      <VirtualWorld place={place} onOpenGuide={handleOpenGuide} />

      {/* Slide-out AI Guide Drawer */}
      <AIGuideDrawer
        place={place}
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        currentPoiTitle={guidePoiTitle}
      />
    </div>
  );
};

