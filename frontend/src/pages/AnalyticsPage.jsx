import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../services/api';
import { Card, StatCard, ProgressBar, Spinner } from '../components/ui/index.jsx';
import { BarChart2, Trophy, Flame, Brain, Star, TrendingUp, Medal } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Cell
} from 'recharts';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data,        setData]        = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      analyticsApi.dashboard(user.id),
      analyticsApi.leaderboard(10)
    ]).then(([d, l]) => {
      setData(d.data);
      setLeaderboard(l.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={36} /></div>
  );

  // Radar chart data from subject performance
  const radarData = Object.entries(data?.subject_performance ?? {}).map(([subject, avg]) => ({
    subject: subject.replace(' & ', '/'),
    score: avg
  }));

  // Activity bar chart
  const activityData = Object.entries(data?.activity_map ?? {}).map(([day, count]) => ({ day, quizzes: count }));

  const myRank = leaderboard.findIndex(u => u.name === user.name) + 1;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8EAED' }}>Analytics</h1>
        <p className="text-sm" style={{ color: '#8B92A5' }}>Deep insights into your learning journey</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total XP"       value={`${data?.user?.xp ?? 0}`}           icon={<Star size={18}/>}      color="#FFB800" />
        <StatCard label="Current Level"  value={`Level ${data?.user?.level ?? 1}`}   icon={<Trophy size={18}/>}    color="#6C63FF" />
        <StatCard label="Day Streak"     value={`${data?.user?.streak ?? 0} 🔥`}     icon={<Flame size={18}/>}     color="#FF4D6A" />
        <StatCard label="AI Tutor Chats" value={data?.tutor?.total_chats ?? 0}       icon={<Brain size={18}/>}     color="#00D4AA" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score trend */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} style={{ color: '#6C63FF' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Quiz Score Trend</h3>
          </div>
          {(data?.score_trend?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.score_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="date" tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 12, color: '#E8EAED' }}
                  formatter={v => [`${v}%`, 'Score']} />
                <Line type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={2.5}
                  dot={{ fill: '#6C63FF', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#4A5268' }}>
              Take quizzes to see your trend
            </div>
          )}
        </Card>

        {/* Activity */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={18} style={{ color: '#00D4AA' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Daily Activity (Quizzes)</h3>
          </div>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="day" tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 12, color: '#E8EAED' }} />
                <Bar dataKey="quizzes" fill="#00D4AA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#4A5268' }}>
              No activity data yet
            </div>
          )}
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Star size={18} style={{ color: '#FFB800' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Subject Mastery</h3>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E2535" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B92A5', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#4A5268' }}>
              Complete quizzes across subjects
            </div>
          )}
        </Card>

        {/* Course progress */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={18} style={{ color: '#FF6B9D' }} />
            <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Course Overview</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Enrolled',  value: data?.courses?.enrolled  ?? 0, max: 10, color: '#6C63FF' },
              { label: 'Completed', value: data?.courses?.completed ?? 0, max: 10, color: '#00D4AA' },
              { label: 'Avg Progress', value: data?.courses?.avg_progress ?? 0, max: 100, color: '#FFB800', suffix: '%' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: '#B8BFCC' }}>{item.label}</span>
                  <span className="font-mono font-bold" style={{ color: item.color }}>
                    {item.value}{item.suffix ?? ''}
                  </span>
                </div>
                <ProgressBar value={(item.value / item.max) * 100} color={item.color} height={8} />
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #1E2535' }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { v: data?.courses?.enrolled  ?? 0, l: 'Enrolled'  },
                { v: data?.courses?.completed ?? 0, l: 'Done'      },
                { v: data?.quizzes?.total     ?? 0, l: 'Quizzes'   },
              ].map(i => (
                <div key={i.l} className="py-2 rounded-xl" style={{ background: '#0F1117' }}>
                  <p className="font-display font-black text-xl" style={{ color: '#E8EAED' }}>{i.v}</p>
                  <p className="text-xs" style={{ color: '#4A5268' }}>{i.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Medal size={18} style={{ color: '#FFB800' }} />
          <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Leaderboard</h3>
          {myRank > 0 && (
            <span className="ml-auto text-xs px-2 py-1 rounded-full font-mono"
              style={{ background: '#6C63FF22', color: '#6C63FF' }}>
              You're #{myRank}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {leaderboard.map((u, i) => {
            const isMe = u.name === user.name;
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isMe ? '#6C63FF18' : '#0F1117',
                  border: isMe ? '1px solid #6C63FF44' : '1px solid transparent'
                }}>
                <span className="w-6 text-center text-sm font-bold" style={{ color: '#8B92A5' }}>
                  {medals[i] ?? `#${i + 1}`}
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: isMe ? '#6C63FF' : '#1E2535', color: isMe ? '#fff' : '#E8EAED' }}>
                  {u.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#E8EAED' }}>
                    {u.name} {isMe && <span className="text-xs" style={{ color: '#6C63FF' }}>(you)</span>}
                  </p>
                  <p className="text-xs" style={{ color: '#4A5268' }}>Level {u.level} · {u.streak}🔥</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm" style={{ color: '#FFB800' }}>{u.xp.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: '#4A5268' }}>XP</p>
                </div>
              </div>
            );
          })}
          {leaderboard.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: '#4A5268' }}>No data yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
