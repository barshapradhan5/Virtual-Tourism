import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useAuth } from './AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/explore';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName);
      navigate(redirect);
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure it is running on http://127.0.0.1:8000');
      } else {
        const data = err.response.data;
        setError(
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.display_name?.[0] ||
          data?.non_field_errors?.[0] ||
          data?.detail ||
          (typeof data === 'string' ? data : 'Registration failed. Please check your details and try again.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 space-y-6 border-sage-300/20 bg-surface/90 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-forest-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-forest-600 to-royal-600 flex items-center justify-center text-ink-main shadow-glow-forest">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-ink-main">Create Your Account</h1>
          <p className="text-xs text-ink-muted">Join Bharat Darshan 3D to explore India&apos;s heritage sites</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-wine-600/20 border border-wine-400/40 text-xs text-wine-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Display Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-void/80 border border-sage-300/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-main placeholder:text-ink-muted/50 focus:outline-none focus:border-royal-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@bharat.com"
                className="w-full bg-void/80 border border-sage-300/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-main placeholder:text-ink-muted/50 focus:outline-none focus:border-royal-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Password (min 8 characters)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-void/80 border border-sage-300/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-main placeholder:text-ink-muted/50 focus:outline-none focus:border-royal-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-wine w-full py-3 text-xs font-bold mt-2 shadow-glow-wine"
          >
            {loading ? 'Creating Explorer Account...' : 'Register & Start Exploring'}
          </button>
        </form>

        <div className="text-center text-xs text-ink-muted">
          <span>Already registered? </span>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-sage-300 hover:text-ink-main font-semibold inline-flex items-center gap-1"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

