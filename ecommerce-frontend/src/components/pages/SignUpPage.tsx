import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to create account');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-col justify-between bg-neutral-900 p-12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative z-10">
          <span className="text-2xl font-semibold text-white tracking-tight">
            Shop<span className="text-teal-400">AI</span>
          </span>
        </div>
        <div className="relative z-10">
          <p className="text-white/70 text-lg font-light leading-relaxed">
            Join thousands of shoppers who get personalised recommendations from our AI engine.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 text-center">
            <span className="text-2xl font-semibold tracking-tight">
              Shop<span className="text-teal-500">AI</span>
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Create account</h1>
          <p className="text-sm text-neutral-500 mb-8">Start your personalised shopping experience.</p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-neutral-700 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-neutral-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-neutral-700 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className="w-full h-10 border border-neutral-200 rounded-lg px-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-teal-600 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
