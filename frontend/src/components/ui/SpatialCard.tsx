import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Sparkles, Eye } from 'lucide-react';
import { Place } from '../../types';
import { getPlaceImageUrl, handleImageError } from '../../lib/images';

interface SpatialCardProps {
  place: Place;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({ place }) => {
  return (
    <div className="group glass-panel glass-panel-hover overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:-translate-y-1.5">
      {/* Image Banner */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-void">
        <img
          src={getPlaceImageUrl(place.hero_image_url, place.category?.slug, place.slug)}
          alt={place.name}
          onError={(e) => handleImageError(e, place.category?.slug, place.slug)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90" />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-sage-300/20 text-xs font-medium text-sage-300">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: place.category?.theme_color || '#1F5C3F' }}
          />
          {place.category?.name}
        </div>

        {/* State Tag */}
        {place.state && (
          <div className="absolute top-3 right-3 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-sage-300/20 text-xs font-medium text-ink-muted flex items-center gap-1">
            <MapPin className="w-3 h-3 text-royal-400" />
            {place.state.name}
          </div>
        )}

        {/* 3D Scene Badge */}
        <div className="absolute bottom-3 right-3 bg-wine-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-ink-main tracking-wider uppercase flex items-center gap-1 shadow-glow-wine">
          <Sparkles className="w-3 h-3" />
          {place.scene_mode === '3d' ? '3D Walk' : '360° Pan'}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-ink-main group-hover:text-sage-300 transition-colors line-clamp-1">
            {place.name}
          </h3>
          <p className="mt-1.5 text-xs text-ink-muted line-clamp-2 leading-relaxed">
            {place.short_description}
          </p>
        </div>

        <div className="pt-3 border-t border-sage-300/10 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-forest-400" />
            <span>{place.best_season}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/place/${place.slug}`}
              className="p-2 rounded-xl text-ink-muted hover:text-ink-main hover:bg-surface/80 transition-colors"
              title="View place details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/visit/${place.slug}`}
              className="btn-wine text-xs py-1.5 px-3.5"
            >
              Visit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

