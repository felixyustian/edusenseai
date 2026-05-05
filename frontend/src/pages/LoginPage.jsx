import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Brain, Zap, BarChart2 } from 'lucide-react';

const FEATURES = [
  { icon: <Brain size={20} />, text: 'AI-powered personalized tutor' },
  { icon: <Zap size={20} />,   text: 'Adaptive quiz generation'      },
  { icon: <BarChart2 size={20} />, text: 'Real-time learning analytics' },
];

export default function LoginPage() {
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]     = useState('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try { await demoLogin(); navigate('/dashboard'); }
    catch { setError('Demo login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F1117' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-12"
        style={{ background: '#0D1119', borderRight: '1px solid #1E2535' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: '#E8EAED' }}>EduSense AI</span>
        </div>

        <div>
          <h1 className="font-display font-bold text-4xl leading-tight mb-4" style={{ color: '#E8EAED' }}>
            Learn smarter with{' '}
            <span className="gradient-text">AI-powered</span>{' '}
            education
          </h1>
          <p className="text-base mb-8" style={{ color: '#8B92A5', lineHeight: 1.7 }}>
            An adaptive learning platform that combines AI tutoring, intelligent quizzes, and real-time analytics to maximize your potential.
          </p>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#6C63FF22', color: '#6C63FF' }}>
                  {f.icon}
                </div>
                <span className="text-sm" style={{ color: '#B8BFCC' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#4A5268' }}>
          © 2025 EduSense AI · Powered by Claude AI
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: '#E8EAED' }}>EduSense AI</span>
          </div>

          <div className="rounded-3xl p-8" style={{ background: '#161B27', border: '1px solid #1E2535' }}>
            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: '#0F1117' }}>
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all capitalize"
                  style={tab === t
                    ? { background: '#6C63FF', color: '#fff' }
                    : { background: 'transparent', color: '#8B92A5' }
                  }>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#8B92A5' }}>Full Name</label>
                  <input
                    type="text" value={form.name} onChange={set('name')} required placeholder="Alex Johnson"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B92A5' }}>Email</label>
                <input
                  type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B92A5' }}>Password</label>
                <input
                  type="password" value={form.password} onChange={set('password')} required placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }}
                />
              </div>

              {error && (
                <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: '#FF4D6A22', color: '#FF4D6A' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-display font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #5B53EE)', color: '#fff' }}>
                {loading ? 'Loading...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid #1E2535' }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs" style={{ background: '#161B27', color: '#4A5268' }}>or</span>
              </div>
            </div>

            <button onClick={handleDemo} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#00D4AA22', color: '#00D4AA', border: '1px solid #00D4AA44' }}>
              🚀 Try Demo Account
            </button>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: '#4A5268' }}>
            Demo credentials: student@edusenseai.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
