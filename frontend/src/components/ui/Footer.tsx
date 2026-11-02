import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-sage-300/15 bg-surface/40 backdrop-blur-md py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-600 flex items-center justify-center text-ink-main shadow-glow-forest">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-ink-main">
              Bharat Darshan <span className="text-royal-400">3D</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Experience India&apos;s sacred shrines, imperial monuments, tropical coastlines, and alpine trails directly from your browser.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-sage-300 pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Digital Personal Data Protection (DPDP) aligned</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-main uppercase tracking-wider mb-3">Categories</h4>
          <ul className="space-y-2 text-xs text-ink-muted">
            <li><Link to="/explore?category=temples-and-sacred-shrines" className="hover:text-sage-300 transition-colors">Temples & Sacred Shrines</Link></li>
            <li><Link to="/explore?category=monuments" className="hover:text-sage-300 transition-colors">Monuments & Forts</Link></li>
            <li><Link to="/explore?category=cultural-heritage" className="hover:text-sage-300 transition-colors">UNESCO Cultural Heritage</Link></li>
            <li><Link to="/explore?category=beach-resorts" className="hover:text-sage-300 transition-colors">Beach Resorts & Coasts</Link></li>
            <li><Link to="/explore?category=ecotourism-and-wildlife" className="hover:text-sage-300 transition-colors">Ecotourism & Tiger Reserves</Link></li>
            <li><Link to="/explore?category=trekking" className="hover:text-sage-300 transition-colors">Himalayan Trekking</Link></li>
            <li><Link to="/explore?category=water-sports" className="hover:text-sage-300 transition-colors">Coral Reefs & Water Sports</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-main uppercase tracking-wider mb-3">Pilot Destinations</h4>
          <ul className="space-y-2 text-xs text-ink-muted">
            <li><Link to="/place/konark-sun-temple" className="hover:text-sage-300 transition-colors">Konark Sun Temple (Odisha)</Link></li>
            <li><Link to="/place/taj-mahal" className="hover:text-sage-300 transition-colors">Taj Mahal (Uttar Pradesh)</Link></li>
            <li><Link to="/place/hampi" className="hover:text-sage-300 transition-colors">Hampi Boulder Kingdom (Karnataka)</Link></li>
            <li><Link to="/place/palolem-beach" className="hover:text-sage-300 transition-colors">Palolem Beach (Goa)</Link></li>
            <li><Link to="/place/triund-trek" className="hover:text-sage-300 transition-colors">Triund Ridge (Himachal Pradesh)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-main uppercase tracking-wider mb-3">Technology & AI</h4>
          <p className="text-xs text-ink-muted leading-relaxed mb-3">
            Powered by Three.js WebGL graphics, Groq AI ultra-fast inference for the in-world heritage guide, and Google Maps Platform.
          </p>
          <div className="p-3 rounded-xl bg-surface/80 border border-royal-600/30 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-royal-400" />
            <span className="text-xs text-ink-main font-medium">Groq Llama 3.3 Guided</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-sage-300/10 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
        <p>© 2026 Bharat Darshan 3D. Crafted with reverence for Indian heritage.</p>
        <p className="flex items-center gap-1.5">
          <span>Made for curious explorers worldwide</span>
          <Heart className="w-3.5 h-3.5 text-wine-400 fill-wine-400" />
        </p>
      </div>
    </footer>
  );
};

