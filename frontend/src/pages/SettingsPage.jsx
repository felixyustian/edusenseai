import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/index.jsx';
import { User, Bell, Shield, Palette, Key, Save, Check } from 'lucide-react';

const TABS = [
  { id: 'profile',       icon: <User size={16}/>,    label: 'Profile'       },
  { id: 'notifications', icon: <Bell size={16}/>,    label: 'Notifications' },
  { id: 'appearance',    icon: <Palette size={16}/>, label: 'Appearance'    },
  { id: 'security',      icon: <Shield size={16}/>,  label: 'Security'      },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [tab,   setTab]   = useState('profile');
  const [saved, setSaved] = useState(false);
  const [form,  setForm]  = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    bio:   '',
    emailNotifications: true,
    quizReminders:      true,
    streakAlerts:       true,
    theme:              'dark',
    accentColor:        '#6C63FF',
    fontSize:           'medium',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8EAED' }}>Settings</h1>
        <p className="text-sm" style={{ color: '#8B92A5' }}>Manage your account preferences and configuration</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="sm:w-48 flex-shrink-0">
          <div className="rounded-2xl p-2 space-y-1" style={{ background: '#161B27', border: '1px solid #1E2535' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={tab === t.id
                  ? { background: '#6C63FF22', color: '#6C63FF', border: '1px solid #6C63FF33' }
                  : { color: '#8B92A5', border: '1px solid transparent' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* ── Profile ── */}
          {tab === 'profile' && (
            <Card>
              <h2 className="font-display font-semibold mb-5" style={{ color: '#E8EAED' }}>Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid #1E2535' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-black"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)', color: '#fff' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: '#E8EAED' }}>{user?.name}</p>
                  <p className="text-xs mb-2" style={{ color: '#8B92A5' }}>{user?.email}</p>
                  <span className="text-xs px-2 py-1 rounded-lg capitalize"
                    style={{ background: '#6C63FF22', color: '#6C63FF' }}>{user?.role}</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Full Name',    key: 'name',  type: 'text',  ph: 'Your full name'    },
                  { label: 'Email',        key: 'email', type: 'email', ph: 'you@example.com'   },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm mb-1.5" style={{ color: '#8B92A5' }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={set(f.key)} placeholder={f.ph}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#8B92A5' }}>Bio</label>
                  <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }} />
                </div>
              </div>
            </Card>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <Card>
              <h2 className="font-display font-semibold mb-5" style={{ color: '#E8EAED' }}>Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates and reports via email' },
                  { key: 'quizReminders',       label: 'Quiz Reminders',       desc: 'Get reminded to take daily quizzes'   },
                  { key: 'streakAlerts',         label: 'Streak Alerts',        desc: 'Alert when your streak is at risk'    },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: '#0F1117', border: '1px solid #1E2535' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#E8EAED' }}>{n.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#8B92A5' }}>{n.desc}</p>
                    </div>
                    <button onClick={toggle(n.key)}
                      className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
                      style={{ background: form[n.key] ? '#6C63FF' : '#1E2535' }}>
                      <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                        style={{ left: form[n.key] ? '24px' : '4px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Appearance ── */}
          {tab === 'appearance' && (
            <Card>
              <h2 className="font-display font-semibold mb-5" style={{ color: '#E8EAED' }}>Appearance</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm mb-3" style={{ color: '#8B92A5' }}>Theme</label>
                  <div className="flex gap-3">
                    {['dark', 'darker'].map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, theme: t }))}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all"
                        style={form.theme === t
                          ? { background: '#6C63FF', color: '#fff' }
                          : { background: '#0F1117', color: '#8B92A5', border: '1px solid #1E2535' }}>
                        {t === 'dark' ? '🌙 Dark' : '⬛ Darker'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-3" style={{ color: '#8B92A5' }}>Accent Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {['#6C63FF','#00D4AA','#FF6B9D','#FFB800','#00B4D8'].map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, accentColor: c }))}
                        className="w-10 h-10 rounded-xl transition-all"
                        style={{ background: c, border: form.accentColor === c ? '3px solid #fff' : '3px solid transparent',
                          boxShadow: form.accentColor === c ? `0 0 12px ${c}88` : 'none' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-3" style={{ color: '#8B92A5' }}>Font Size</label>
                  <div className="flex gap-3">
                    {['small','medium','large'].map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, fontSize: s }))}
                        className="flex-1 py-2.5 rounded-xl text-sm capitalize transition-all"
                        style={form.fontSize === s
                          ? { background: '#6C63FF', color: '#fff' }
                          : { background: '#0F1117', color: '#8B92A5', border: '1px solid #1E2535' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <Card>
              <h2 className="font-display font-semibold mb-5" style={{ color: '#E8EAED' }}>Security</h2>
              <div className="space-y-4">
                <div className="px-4 py-4 rounded-xl" style={{ background: '#0F1117', border: '1px solid #1E2535' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Key size={14} style={{ color: '#FFB800' }} />
                    <p className="text-sm font-semibold" style={{ color: '#E8EAED' }}>Change Password</p>
                  </div>
                  <p className="text-xs mb-3" style={{ color: '#8B92A5' }}>Use a strong password at least 8 characters long</p>
                  {['Current Password','New Password','Confirm New Password'].map(ph => (
                    <input key={ph} type="password" placeholder={ph}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
                      style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED' }} />
                  ))}
                  <button className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: '#6C63FF22', color: '#6C63FF' }}>
                    Update Password
                  </button>
                </div>
                <div className="px-4 py-4 rounded-xl" style={{ background: '#FF4D6A11', border: '1px solid #FF4D6A33' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#FF4D6A' }}>Danger Zone</p>
                  <p className="text-xs mb-3" style={{ color: '#8B92A5' }}>These actions are irreversible. Proceed with caution.</p>
                  <button className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: '#FF4D6A22', color: '#FF4D6A', border: '1px solid #FF4D6A44' }}>
                    Delete Account
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Save button */}
          <button onClick={save}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-display font-bold flex items-center gap-2 transition-all"
            style={{ background: saved ? '#00D4AA' : 'linear-gradient(135deg,#6C63FF,#5B53EE)', color: '#fff' }}>
            {saved ? <><Check size={15}/> Saved!</> : <><Save size={15}/> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
