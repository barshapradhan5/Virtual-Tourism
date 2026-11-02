import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut, Menu, X, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 py-3 sm:px-8">
      <nav className="max-w-7xl mx-auto glass-panel px-5 py-3 flex items-center justify-between border-sage-300/20 bg-surface/80">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-royal-600 flex items-center justify-center text-ink-main shadow-glow-forest group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-ink-main group-hover:text-sage-300 transition-colors">
              Bharat Darshan <span className="text-royal-400 font-extrabold text-sm ml-0.5">3D</span>
            </span>
            <p className="text-[10px] text-ink-muted -mt-1 hidden sm:block tracking-wider uppercase font-semibold">
              Virtual Explorer of India
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link to="/" className="text-ink-muted hover:text-ink-main transition-colors">
            Home
          </Link>
          <Link to="/explore" className="text-ink-muted hover:text-ink-main transition-colors flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-forest-400" />
            Explore Places
          </Link>
          <Link to="/explore?mode=map" className="text-ink-muted hover:text-ink-main transition-colors">
            Interactive Map
          </Link>
        </div>

        {/* User Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-2 border-sage-300/30"
              >
                <div className="w-6 h-6 rounded-full bg-royal-600 flex items-center justify-center text-xs font-bold">
                  {user?.display_name ? user.display_name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-medium max-w-[120px] truncate">{user?.display_name || user?.email}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-xl text-ink-muted hover:text-wine-400 hover:bg-wine-600/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-xs py-2 px-4">
                Sign In
              </Link>
              <Link to="/register" className="btn-wine text-xs py-2 px-4">
                <Sparkles className="w-3.5 h-3.5" />
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-ink-muted hover:text-ink-main p-1.5"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-panel p-5 space-y-4 max-w-7xl mx-auto border-sage-300/20">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-muted hover:text-ink-main"
          >
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-muted hover:text-ink-main"
          >
            Explore Places
          </Link>
          <Link
            to="/explore?mode=map"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-muted hover:text-ink-main"
          >
            Interactive Map
          </Link>
          <div className="pt-3 border-t border-sage-300/15 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-ghost text-sm justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile ({user?.display_name || user?.email})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="btn-ghost text-sm text-wine-400 justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-ghost text-sm text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-wine text-sm text-center"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

