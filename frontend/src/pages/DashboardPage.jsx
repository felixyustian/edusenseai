import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, coursesApi } from '../services/api';
import { Card, StatCard, ProgressBar, Spinner, DifficultyBadge } from '../components/ui/index.jsx';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Brain, Zap, Trophy, Flame, TrendingUp,
  Star, ArrowRight, GraduationCap
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      analyticsApi.dashboard(user.id),
      coursesApi.enrollments(user.id)
    ]).then(([dash, enr]) => {
      setData(dash.data);
      setEnrollments(enr.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={36} /></div>
  );

  const xpForNext = (user.level) * 500;
  const xpProgress = user.xp - (user.level - 1) * 500;
  const xpNeeded = 500;
  const lvlPct = Math.min(100, (xpProgress / xpNeeded) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: '#E8EAED' }}>
            Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8B92A5' }}>
            Here's your learning overview for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: '#FF4D6A11', border: '1px solid #FF4D6A22' }}>
            <Flame size={16} style={{ color: '#FF4D6A' }} />
            <span className="font-mono font-bold text-sm" style={{ color: '#FF4D6A' }}>
              {user.streak} day streak
            </span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)', color: '#fff' }}>
              {user.level}
            </div>
            <div>
              <p className="font-display font-semibold" style={{ color: '#E8EAED' }}>Level {user.level}</p>
              <p className="text-xs" style={{ color: '#8B92A5' }}>{user.xp} XP total</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#8B92A5' }}>To Level {user.level + 1}</p>
            <p className="font-mono font-bold text-sm" style={{ color: '#6C63FF' }}>
              {xpNeeded - xpProgress} XP
            </p>
          </div>
        </div>
        <ProgressBar value={lvlPct} color="#6C63FF" height={10} />
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Courses Enrolled"  value={data?.courses?.enrolled  ?? 0} icon={<BookOpen size={18}/>}   color="#6C63FF" />
        <StatCard label="Quizzes Taken"     value={data?.quizzes?.total     ?? 0} icon={<Zap size={18}/>}        color="#FFB800" />
        <StatCard label="Avg Quiz Score"    value={`${data?.quizzes?.avg_score ?? 0}%`} icon={<Star size={18}/>} color="#00D4AA" />
        <StatCard label="Tutor Sessions"    value={data?.tutor?.total_chats ?? 0} icon={<Brain size={18}/>}      color="#FF6B9D" />
      </div>

      {/* Score trend & Subject performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score trend */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} style={{ color: '#6C63FF' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Score Trend</h3>
          </div>
          {data?.score_trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.score_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="date" tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 12, color: '#E8EAED' }}
                  formatter={(v) => [`${v}%`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={2.5}
                  dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: '#4A5268' }}>
              Take some quizzes to see your trend
            </div>
          )}
        </Card>

        {/* Subject performance */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={18} style={{ color: '#FFB800' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Subject Performance</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(data?.subject_performance ?? {}).length > 0
              ? Object.entries(data.subject_performance).map(([subject, avg]) => (
                <div key={subject}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: '#B8BFCC' }}>{subject}</span>
                    <span className="font-mono font-bold" style={{ color: '#E8EAED' }}>{avg}%</span>
                  </div>
                  <ProgressBar
                    value={avg}
                    color={avg >= 80 ? '#00D4AA' : avg >= 60 ? '#FFB800' : '#FF4D6A'}
                    height={6}
                  />
                </div>
              ))
              : <div className="py-12 text-center text-sm" style={{ color: '#4A5268' }}>No quiz data yet</div>
            }
          </div>
        </Card>
      </div>

      {/* Enrolled courses & Badges */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My courses */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} style={{ color: '#00D4AA' }} />
              <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>My Courses</h3>
            </div>
            <button onClick={() => navigate('/courses')}
              className="text-xs flex items-center gap-1 hover:text-white transition-colors"
              style={{ color: '#6C63FF' }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {enrollments.slice(0, 3).map(e => (
              <div key={e.enrollment_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#6C63FF22' }}>
                  <BookOpen size={14} style={{ color: '#6C63FF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#E8EAED' }}>{e.course.title}</p>
                  <ProgressBar value={e.progress} color="#6C63FF" height={4} />
                </div>
                <span className="text-xs font-mono" style={{ color: '#8B92A5' }}>{e.progress}%</span>
              </div>
            ))}
            {enrollments.length === 0 && (
              <div className="py-8 text-center text-sm" style={{ color: '#4A5268' }}>
                No courses yet.{' '}
                <button onClick={() => navigate('/courses')} style={{ color: '#6C63FF' }}>Browse courses →</button>
              </div>
            )}
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} style={{ color: '#FFB800' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Badges Earned</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(data?.badges ?? []).map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                style={{ background: '#0F1117', border: '1px solid #1E2535' }}>
                <span className="text-2xl">{b.icon}</span>
                <p className="text-xs text-center font-medium" style={{ color: '#B8BFCC' }}>{b.name}</p>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                  background: rarityColor(b.rarity) + '22',
                  color: rarityColor(b.rarity)
                }}>{b.rarity}</span>
              </div>
            ))}
            {(data?.badges ?? []).length === 0 && (
              <div className="col-span-3 py-8 text-center text-sm" style={{ color: '#4A5268' }}>
                Complete activities to earn badges
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Chat with AI',   icon: '🤖', to: '/tutor',     color: '#6C63FF' },
          { label: 'Take a Quiz',    icon: '⚡', to: '/quiz',      color: '#FFB800' },
          { label: 'Browse Courses', icon: '📚', to: '/courses',   color: '#00D4AA' },
          { label: 'View Progress',  icon: '🏆', to: '/progress',  color: '#FF6B9D' },
        ].map(a => (
          <button key={a.to} onClick={() => navigate(a.to)}
            className="p-4 rounded-2xl text-left transition-all card-hover"
            style={{ background: '#161B27', border: '1px solid #1E2535' }}>
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-sm font-display font-semibold" style={{ color: a.color }}>{a.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function rarityColor(r) {
  return { common: '#8B92A5', rare: '#00D4AA', epic: '#6C63FF', legendary: '#FFB800' }[r] || '#8B92A5';
}
