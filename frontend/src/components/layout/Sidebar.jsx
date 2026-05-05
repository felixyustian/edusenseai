import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Brain, BarChart2,
  Trophy, Settings, LogOut, Zap, GraduationCap, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/courses',    icon: BookOpen,        label: 'Courses'    },
  { to: '/tutor',      icon: Brain,           label: 'AI Tutor'   },
  { to: '/quiz',       icon: Zap,             label: 'Quiz'       },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics'  },
  { to: '/progress',   icon: Trophy,          label: 'Progress'   },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl glass"
        style={{ border: '1px solid #1E2535', color: '#E8EAED' }}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 w-64 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#0D1119', borderRight: '1px solid #1E2535' }}
      >
        {/* Logo */}
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <p className="font-display font-bold text-lg" style={{ color: '#E8EAED' }}>EduSense</p>
              <p className="text-xs font-mono" style={{ color: '#6C63FF' }}>AI Platform</p>
            </div>
          </div>
        </div>

        {/* User card */}
        {user && (
          <div className="mx-4 mb-6 p-3 rounded-2xl" style={{ background: '#161B27', border: '1px solid #1E2535' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, #6C63FF44, #00D4AA44)', color: '#E8EAED' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm truncate" style={{ color: '#E8EAED' }}>{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
                    style={{ background: '#6C63FF22', color: '#6C63FF' }}>
                    Lv.{user.level}
                  </span>
                  <span className="text-xs" style={{ color: '#8B92A5' }}>{user.xp} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, #6C63FF22, #00D4AA11)', color: '#E8EAED', border: '1px solid #6C63FF44' }
                : { color: '#8B92A5', border: '1px solid transparent' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ color: isActive ? '#6C63FF' : 'inherit' }} />
                  {label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#6C63FF' }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 space-y-1">
          <NavLink to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: '#8B92A5' }}
          >
            <Settings size={18} /> Settings
          </NavLink>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:text-white"
            style={{ color: '#FF4D6A', background: '#FF4D6A11' }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
