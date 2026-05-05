import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import { Card, Button, Spinner, DifficultyBadge } from '../components/ui/index.jsx';
import { Zap, CheckCircle, XCircle, Trophy, RefreshCw, ChevronRight } from 'lucide-react';

const SUBJECTS = ['AI & ML', 'Mathematics', 'Programming', 'Computer Vision', 'Physics', 'Robotics', 'Chemistry', 'Biology'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const Q_COUNTS = [3, 5, 8, 10];

export default function QuizPage() {
  const { user } = useAuth();
  const [phase, setPhase]       = useState('setup');   // setup | loading | quiz | results
  const [config, setConfig]     = useState({ subject: 'AI & ML', topic: '', difficulty: 'medium', num_questions: 5 });
  const [quiz, setQuiz]         = useState(null);
  const [answers, setAnswers]   = useState({});
  const [current, setCurrent]   = useState(0);
  const [results, setResults]   = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [error, setError]       = useState('');

  const set = (k) => (e) => setConfig(c => ({ ...c, [k]: e.target.value }));

  const generate = async () => {
    if (!config.topic.trim()) { setError('Please enter a topic'); return; }
    setError(''); setPhase('loading');
    try {
      const { data } = await quizApi.generate(config);
      setQuiz(data);
      setAnswers({});
      setCurrent(0);
      setStartTime(Date.now());
      setPhase('quiz');
    } catch (err) {
      setError('Failed to generate quiz. Check your API key configuration.');
      setPhase('setup');
    }
  };

  const selectAnswer = (ans) => {
    setAnswers(a => ({ ...a, [current]: ans }));
  };

  const next = () => {
    if (current < quiz.questions.length - 1) setCurrent(c => c + 1);
  };

  const submit = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    try {
      const { data } = await quizApi.submit({
        quiz_id: quiz.quiz_id,
        user_id: user.id,
        answers,
        time_taken: timeTaken
      });
      setResults(data);
      setPhase('results');
    } catch {
      // Still show results locally
      setResults({ score: 0, grade: 'N/A', results: [] });
      setPhase('results');
    }
  };

  const reset = () => { setPhase('setup'); setQuiz(null); setResults(null); setAnswers({}); setCurrent(0); };

  // ── Setup ────────────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFB800, #FF8C00)' }}>
          <Zap size={20} color="#fff" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: '#E8EAED' }}>AI Quiz Generator</h1>
          <p className="text-xs" style={{ color: '#8B92A5' }}>Generate adaptive quizzes instantly with Claude AI</p>
        </div>
      </div>

      <Card>
        <div className="space-y-5">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#8B92A5' }}>Subject</label>
            <select value={config.subject} onChange={set('subject')}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8B92A5' }}>Topic</label>
            <input
              value={config.topic} onChange={set('topic')}
              placeholder="e.g. Neural Networks, Gradient Descent, CNNs..."
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#0F1117', border: error ? '1px solid #FF4D6A' : '1px solid #1E2535', color: '#E8EAED' }}
            />
            {error && <p className="text-xs mt-1" style={{ color: '#FF4D6A' }}>{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#8B92A5' }}>Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                    style={config.difficulty === d
                      ? { background: '#6C63FF', color: '#fff' }
                      : { background: '#0F1117', color: '#8B92A5', border: '1px solid #1E2535' }
                    }>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#8B92A5' }}>Questions</label>
              <div className="flex gap-2">
                {Q_COUNTS.map(n => (
                  <button key={n} onClick={() => setConfig(c => ({ ...c, num_questions: n }))}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={config.num_questions === n
                      ? { background: '#6C63FF', color: '#fff' }
                      : { background: '#0F1117', color: '#8B92A5', border: '1px solid #1E2535' }
                    }>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={generate}
            className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #FFB800, #FF8C00)', color: '#fff', boxShadow: '0 4px 15px rgba(255,184,0,0.3)' }}>
            <Zap size={16} /> Generate Quiz with AI
          </button>
        </div>
      </Card>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Spinner size={40} />
      <p className="font-display font-semibold" style={{ color: '#E8EAED' }}>Generating your quiz...</p>
      <p className="text-sm" style={{ color: '#8B92A5' }}>Claude AI is crafting your questions</p>
    </div>
  );

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  if (phase === 'quiz' && quiz) {
    const q = quiz.questions[current];
    const isLast = current === quiz.questions.length - 1;
    const answered = answers[current];
    const progress = ((current) / quiz.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold" style={{ color: '#E8EAED' }}>{quiz.title}</h2>
            <p className="text-xs" style={{ color: '#8B92A5' }}>{quiz.subject} · <DifficultyBadge level={quiz.difficulty} /></p>
          </div>
          <span className="font-mono font-bold text-sm" style={{ color: '#6C63FF' }}>
            {current + 1} / {quiz.questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full rounded-full mb-6" style={{ height: 4, background: '#1E2535' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6C63FF, #00D4AA)' }} />
        </div>

        {/* Question card */}
        <Card className="mb-4">
          <div className="flex items-start gap-3 mb-6">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#6C63FF22', color: '#6C63FF' }}>{current + 1}</span>
            <p className="font-display font-semibold text-base leading-snug" style={{ color: '#E8EAED' }}>{q.question}</p>
          </div>

          {/* Options */}
          {q.options && (
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <div key={i}
                  className={`quiz-option px-4 py-3 rounded-xl border text-sm transition-all ${answered === opt ? 'selected' : ''}`}
                  onClick={() => selectAnswer(opt)}
                  style={{
                    border: answered === opt ? '1px solid #6C63FF' : '1px solid #1E2535',
                    background: answered === opt ? '#6C63FF22' : '#0F1117',
                    color: answered === opt ? '#E8EAED' : '#B8BFCC',
                  }}>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Short answer */}
          {!q.options && (
            <input
              value={answers[current] || ''}
              onChange={e => selectAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }}
            />
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={reset} className="px-4 py-2.5 rounded-xl text-sm"
            style={{ background: '#161B27', color: '#8B92A5', border: '1px solid #1E2535' }}>
            ✕ Cancel
          </button>
          {isLast
            ? <button onClick={submit} disabled={!answered}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00D4AA, #00B890)', color: '#fff' }}>
                <Trophy size={16} /> Submit Quiz
              </button>
            : <button onClick={next} disabled={!answered}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #5B53EE)', color: '#fff' }}>
                Next <ChevronRight size={16} />
              </button>
          }
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────
  if (phase === 'results' && results) {
    const gradeColor = { A: '#00D4AA', B: '#6C63FF', C: '#FFB800', D: '#FF8C00', F: '#FF4D6A' };

    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        {/* Score card */}
        <Card className="text-center mb-6">
          <div className="py-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-display font-black mx-auto mb-3"
              style={{ background: `${gradeColor[results.grade] || '#6C63FF'}22`, color: gradeColor[results.grade] || '#6C63FF' }}>
              {results.grade}
            </div>
            <p className="font-display font-bold text-3xl mb-1" style={{ color: '#E8EAED' }}>{results.score}%</p>
            <p className="text-sm mb-2" style={{ color: '#8B92A5' }}>
              {results.earned_points} / {results.total_points} points
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: '#FFB80022', color: '#FFB800' }}>
              <Zap size={14} /> +{results.xp_earned} XP earned
            </div>
          </div>
        </Card>

        {/* Answer review */}
        <div className="space-y-4 mb-6">
          {results.results?.map((r, i) => (
            <Card key={i}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {r.is_correct
                    ? <CheckCircle size={20} style={{ color: '#00D4AA' }} />
                    : <XCircle size={20} style={{ color: '#FF4D6A' }} />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2" style={{ color: '#E8EAED' }}>
                    Q{i + 1}: {r.question}
                  </p>
                  <p className="text-xs mb-1" style={{ color: r.is_correct ? '#00D4AA' : '#FF4D6A' }}>
                    Your answer: {r.user_answer || '(no answer)'}
                  </p>
                  {!r.is_correct && (
                    <p className="text-xs mb-2" style={{ color: '#00D4AA' }}>
                      Correct: {r.correct_answer}
                    </p>
                  )}
                  {r.explanation && (
                    <p className="text-xs p-2 rounded-lg" style={{ background: '#0F1117', color: '#8B92A5' }}>
                      💡 {r.explanation}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={reset}
            className="flex-1 py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: '#161B27', color: '#6C63FF', border: '1px solid #6C63FF44' }}>
            <RefreshCw size={16} /> New Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
}
