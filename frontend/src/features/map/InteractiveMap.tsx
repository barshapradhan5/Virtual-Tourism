import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Compass, Layers } from 'lucide-react';
import { Place } from '../../types';

interface InteractiveMapProps {
  places?: Place[];
  singlePlace?: Place;
  zoom?: number;
  heightClass?: string;
  onSelectPlace?: (place: Place) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places = [],
  singlePlace,
  heightClass = 'h-[400px]',
  onSelectPlace,
}) => {
  const allPlaces = singlePlace ? [singlePlace] : places;
  const [selected, setSelected] = useState<Place | null>(singlePlace || allPlaces[0] || null);

  // Compute bounding box or center
  const centerLat = singlePlace ? Number(singlePlace.latitude) : 21.0;
  const centerLng = singlePlace ? Number(singlePlace.longitude) : 78.0;

  // Google Maps deep link
  const getGoogleMapsDeepLink = (place: Place) => {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden glass-panel border-sage-300/20 bg-[#070b09] select-none flex flex-col`}>
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sage-300/20 text-xs font-medium text-ink-main pointer-events-auto flex items-center gap-2 shadow-lg">
          <Compass className="w-4 h-4 text-royal-400 animate-spin-slow" />
          <span>{singlePlace ? singlePlace.name : `Exploration Map (${allPlaces.length} Destinations)`}</span>
        </div>

        {selected && (
          <a
            href={getGoogleMapsDeepLink(selected)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface/90 hover:bg-surface backdrop-blur-md px-3 py-1.5 rounded-xl border border-sage-300/20 text-xs font-medium text-sage-300 hover:text-ink-main pointer-events-auto flex items-center gap-1.5 shadow-lg transition-colors"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Spatial Map Canvas Representation */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#070c09] via-[#0d1612] to-[#121c17]">
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#8FBF9F_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* India Subcontinent Stylized Outline Indicator */}
        <div className="relative w-full max-w-xl h-full flex items-center justify-center p-6">
          <svg
            viewBox="65 5 35 32"
            className="w-full h-full max-h-[85%] filter drop-shadow-[0_0_20px_rgba(31,92,63,0.3)] opacity-40 transition-all duration-500"
          >
            {/* Stylized outline of India */}
            <path
              d="M74 35 L76 33 L78 31 L80 27 L82 25 L85 24 L88 26 L91 27 L93 25 L94 22 L92 20 L89 19 L87 17 L86 14 L84 12 L83 9 L81 7 L78 9 L76 12 L74 15 L72 17 L71 21 L71 24 L72 28 L73 31 Z"
              fill="rgba(31, 92, 63, 0.15)"
              stroke="rgba(143, 191, 159, 0.4)"
              strokeWidth="0.4"
            />
          </svg>

          {/* Interactive Place Pins */}
          {allPlaces.map((p) => {
            // Map lat/long to svg/box percentage
            // India roughly: Lat 8 to 36 (height 28), Long 68 to 96 (width 28)
            const lat = Number(p.latitude);
            const lng = Number(p.longitude);
            const topPct = Math.max(10, Math.min(90, ((36 - lat) / 28) * 100));
            const leftPct = Math.max(10, Math.min(90, ((lng - 68) / 28) * 100));

            const isSelected = selected?.id === p.id;

            return (
              <div
                key={p.id}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                onClick={() => {
                  setSelected(p);
                  if (onSelectPlace) onSelectPlace(p);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30"
              >
                {/* Pin Beacon */}
                <div className="relative flex items-center justify-center">
                  <span
                    className={`absolute w-7 h-7 rounded-full animate-ping opacity-75 ${
                      isSelected ? 'bg-wine-400' : 'bg-royal-400'
                    }`}
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-ink-main border-2 transition-transform duration-300 group-hover:scale-125 shadow-lg ${
                      isSelected
                        ? 'bg-wine-600 border-wine-300 scale-110 shadow-glow-wine'
                        : 'bg-forest-600 border-sage-300 shadow-glow-forest'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>

                {/* Pin Tooltip */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap bg-surface/95 border border-sage-300/30 text-ink-main pointer-events-none transition-all duration-200 shadow-xl ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                >
                  <p className="font-bold">{p.name}</p>
                  <p className="text-[10px] text-sage-300">{p.category?.name} • {p.state?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Location Card Banner at Bottom */}
      {selected && (
        <div className="p-3 bg-surface/90 border-t border-sage-300/20 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest-600/30 border border-forest-400/40 flex items-center justify-center text-forest-300">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-main">{selected.name}</h4>
              <p className="text-xs text-ink-muted">
                {selected.state?.name} • Coordinates: {Number(selected.latitude).toFixed(4)}° N, {Number(selected.longitude).toFixed(4)}° E
              </p>
            </div>
          </div>

          <a
            href={getGoogleMapsDeepLink(selected)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs py-1.5 px-3"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

