import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from './AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/explore';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo user for easy testing
  const fillDemo = () => {
    setEmail('admin@bharatdarshan.com');
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 space-y-6 border-sage-300/20 bg-surface/90 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-royal-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-forest-600 flex items-center justify-center text-ink-main shadow-glow-forest">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-ink-main">Welcome Back</h1>
          <p className="text-xs text-ink-muted">Sign in to experience 3D virtual walkthroughs and save favourites</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-wine-600/20 border border-wine-400/40 text-xs text-wine-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="explorer@bharat.com"
                className="w-full bg-void/80 border border-sage-300/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-main placeholder:text-ink-muted/50 focus:outline-none focus:border-royal-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                required
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
            className="btn-wine w-full py-3 text-xs font-bold mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Account Helper */}
        <div className="p-3 rounded-xl bg-surface border border-sage-300/15 flex items-center justify-between">
          <div className="text-[11px] text-ink-muted">
            <span className="font-semibold text-ink-main">Demo Admin Account</span>
            <p>admin@bharatdarshan.com</p>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="text-[11px] font-semibold text-sage-300 hover:text-ink-main bg-forest-600/30 px-2.5 py-1 rounded-lg border border-forest-400/30"
          >
            Auto Fill
          </button>
        </div>

        <div className="text-center text-xs text-ink-muted">
          <span>Don&apos;t have an account yet? </span>
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="text-sage-300 hover:text-ink-main font-semibold inline-flex items-center gap-1"
          >
            <span>Register Free</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

