import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Calendar, Clock, Compass, Heart, MapPin, Eye } from 'lucide-react';
import { useAuth } from './AuthContext';
import { api } from '../../lib/api';
import { VisitSession, Place } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [visits, setVisits] = useState<VisitSession[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setBio(user.bio || '');

      api
        .get<VisitSession[]>('/visits/history/')
        .then((res) => setVisits(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.patch('/auth/me/', {
        display_name: displayName,
        bio: bio,
      });
      updateUser(res.data);
      setSuccessMsg('Profile updated successfully!');
    } catch {
      // error handling
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-ink-muted gap-2">
        <Compass className="w-6 h-6 animate-spin text-forest-400" />
        <span>Loading explorer profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Profile Header Card */}
      <div className="glass-panel p-6 sm:p-8 border-sage-300/20 bg-gradient-to-r from-surface via-[#13221b] to-surface flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-forest-600 to-royal-600 flex items-center justify-center text-ink-main text-2xl font-bold shadow-glow">
          {user.display_name ? user.display_name[0].toUpperCase() : 'U'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-ink-main">{user.display_name || 'Bharat Explorer'}</h1>
          <p className="text-xs text-ink-muted">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-sage-300 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-forest-400" />
              Member since {new Date(user.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-royal-400" />
              {visits.length} Virtual Tours Recorded
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Edit Profile */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-ink-main flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-forest-400" />
            <span>Edit Profile</span>
          </h2>

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-forest-600/30 border border-forest-400/40 text-xs text-forest-300">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-ink-muted">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-void/80 border border-sage-300/20 rounded-xl px-3 py-2 text-xs text-ink-main focus:outline-none focus:border-royal-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-ink-muted">Bio / Travel Interests</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Heritage lover passionate about ancient Indian architecture..."
                className="w-full bg-void/80 border border-sage-300/20 rounded-xl px-3 py-2 text-xs text-ink-main focus:outline-none focus:border-royal-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-forest w-full text-xs py-2 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Right Col: Virtual Visit History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-ink-main flex items-center gap-2">
            <Clock className="w-4 h-4 text-royal-400" />
            <span>Virtual Walkthrough History</span>
          </h2>

          {visits.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs text-ink-muted space-y-2">
              <Compass className="w-6 h-6 mx-auto text-sage-300" />
              <p>You haven&apos;t taken any 3D tours yet.</p>
              <Link to="/explore" className="btn-wine text-xs inline-block mt-2">
                Explore Destinations Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="glass-panel p-4 flex items-center justify-between gap-4 hover:border-royal-400/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-sage-300/20 flex items-center justify-center text-forest-400 flex-shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink-main">{v.place_detail?.name}</h4>
                      <p className="text-xs text-ink-muted">
                        {new Date(v.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        {v.duration_s > 0 && ` • Explored for ${v.duration_s}s`}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/visit/${v.place_detail?.slug}`}
                    className="btn-wine text-xs py-1.5 px-3 flex-shrink-0"
                  >
                    Revisit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

