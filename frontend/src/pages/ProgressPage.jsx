import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { progressApi, quizApi } from '../services/api';
import { Card, ProgressBar, Spinner } from '../components/ui/index.jsx';
import { Trophy, Zap, Flame, Star, Clock, CheckCircle } from 'lucide-react';

const RARITY_COLORS = { common: '#8B92A5', rare: '#00D4AA', epic: '#6C63FF', legendary: '#FFB800' };

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress,  setProgress]  = useState(null);
  const [badges,    setBadges]    = useState([]);
  const [attempts,  setAttempts]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      progressApi.get(user.id),
      progressApi.badges(user.id),
      quizApi.attempts(user.id),
    ]).then(([p, b, a]) => {
      setProgress(p.data);
      setBadges(b.data);
      setAttempts(a.data.slice(0, 10));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={36} /></div>
  );

  const p = progress;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8EAED' }}>My Progress</h1>
        <p className="text-sm" style={{ color: '#8B92A5' }}>Your achievements, badges, and learning history</p>
      </div>

      {/* Level card */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6C63FF22, #00D4AA11)', border: '1px solid #6C63FF33' }}>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6C63FF, transparent)', transform: 'translate(30%, -30%)' }} />

        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-black text-3xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)', color: '#fff', boxShadow: '0 8px 30px rgba(108,99,255,0.4)' }}>
            {p?.level ?? 1}
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-2xl mb-0.5" style={{ color: '#E8EAED' }}>
              Level {p?.level ?? 1} Learner
            </p>
            <p className="text-sm mb-3" style={{ color: '#8B92A5' }}>
              {p?.xp ?? 0} XP total · {p?.xp_to_next_level ?? 500} XP to next level
            </p>
            <ProgressBar value={p?.level_progress_pct ?? 0} color="#6C63FF" height={10} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Flame size={18}/>,       label: 'Day Streak',       value: `${p?.streak ?? 0}`,           color: '#FF4D6A' },
          { icon: <Star size={18}/>,        label: 'Best Quiz Score',  value: `${p?.best_score ?? 0}%`,      color: '#FFB800' },
          { icon: <CheckCircle size={18}/>, label: 'Courses Done',     value: p?.courses_completed ?? 0,      color: '#00D4AA' },
          { icon: <Zap size={18}/>,         label: 'Quizzes Taken',    value: p?.quizzes_taken ?? 0,          color: '#6C63FF' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
              <p className="font-display font-black text-2xl" style={{ color: '#E8EAED' }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#8B92A5' }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={18} style={{ color: '#FFB800' }} />
          <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>
            Badges Earned
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: '#FFB80022', color: '#FFB800' }}>
              {badges.length}
            </span>
          </h3>
        </div>
        {badges.length === 0 ? (
          <div className="text-center py-10" style={{ color: '#4A5268' }}>
            <Trophy size={36} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold mb-1" style={{ color: '#8B92A5' }}>No badges yet</p>
            <p className="text-sm">Complete activities to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((b, i) => (
              <div key={i}
                className="flex flex-col items-center text-center p-4 rounded-2xl card-hover"
                style={{ background: '#0F1117', border: `1px solid ${RARITY_COLORS[b.rarity]}33` }}>
                <div className="text-4xl mb-2">{b.icon}</div>
                <p className="font-display font-bold text-sm mb-1" style={{ color: '#E8EAED' }}>{b.name}</p>
                <p className="text-xs mb-2" style={{ color: '#8B92A5', lineHeight: 1.4 }}>{b.description}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono capitalize"
                  style={{ background: `${RARITY_COLORS[b.rarity]}22`, color: RARITY_COLORS[b.rarity] }}>
                  {b.rarity}
                </span>
                <p className="text-xs mt-2" style={{ color: '#4A5268' }}>
                  {new Date(b.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quiz history */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Clock size={18} style={{ color: '#6C63FF' }} />
          <h3 className="font-display font-semibold" style={{ color: '#E8EAED' }}>Recent Quiz History</h3>
        </div>
        {attempts.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: '#4A5268' }}>
            No quiz history yet
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a, i) => {
              const gradeColor = a.score >= 90 ? '#00D4AA' : a.score >= 70 ? '#FFB800' : '#FF4D6A';
              return (
                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ background: '#0F1117', border: '1px solid #1E2535' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
                    style={{ background: `${gradeColor}22`, color: gradeColor }}>
                    {a.score >= 90 ? 'A' : a.score >= 80 ? 'B' : a.score >= 70 ? 'C' : a.score >= 60 ? 'D' : 'F'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#E8EAED' }}>{a.quiz_title}</p>
                    <p className="text-xs" style={{ color: '#4A5268' }}>
                      {a.subject} · {new Date(a.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-sm" style={{ color: gradeColor }}>{a.score}%</p>
                    <p className="text-xs" style={{ color: '#FFB800' }}>+{a.xp_earned} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
