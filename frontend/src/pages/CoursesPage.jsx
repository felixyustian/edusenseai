import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesApi } from '../services/api';
import { Card, Spinner, DifficultyBadge, ProgressBar, Button } from '../components/ui/index.jsx';
import { BookOpen, Clock, Users, Search, Filter, CheckCircle } from 'lucide-react';

const SUBJECTS_FILTER = ['All', 'AI & ML', 'Programming', 'Computer Vision', 'Robotics'];
const DIFF_FILTER     = ['All', 'beginner', 'intermediate', 'advanced'];

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses,     setCourses]     = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [subject,     setSubject]     = useState('All');
  const [diff,        setDiff]        = useState('All');
  const [enrolling,   setEnrolling]   = useState(null);
  const [toast,       setToast]       = useState('');

  useEffect(() => {
    Promise.all([
      coursesApi.list(),
      user ? coursesApi.enrollments(user.id) : Promise.resolve({ data: [] })
    ]).then(([c, e]) => {
      setCourses(c.data);
      setEnrollments(e.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const enrolledIds = new Set(enrollments.map(e => e.course.id));
  const progressOf  = (id) => enrollments.find(e => e.course.id === id)?.progress ?? 0;

  const filtered = courses.filter(c => {
    const matchSearch  = c.title.toLowerCase().includes(search.toLowerCase()) ||
                         c.description.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subject === 'All' || c.subject === subject;
    const matchDiff    = diff   === 'All' || c.difficulty === diff;
    return matchSearch && matchSubject && matchDiff;
  });

  const handleEnroll = async (courseId) => {
    if (!user) return;
    setEnrolling(courseId);
    try {
      await coursesApi.enroll(courseId, user.id);
      const { data } = await coursesApi.enrollments(user.id);
      setEnrollments(data);
      setToast('✅ Enrolled successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('❌ Enrollment failed'); setTimeout(() => setToast(''), 3000); }
    finally   { setEnrolling(null); }
  };

  const subjectIcon = (s) => ({ 'AI & ML': '🤖', 'Programming': '💻', 'Computer Vision': '👁️', 'Robotics': '🦾', 'Data Science': '📊' }[s] || '📚');

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={36} /></div>
  );

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold animate-slide-up"
          style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8EAED' }}>Courses</h1>
        <p className="text-sm" style={{ color: '#8B92A5' }}>
          {courses.length} courses available · {enrollments.length} enrolled
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B92A5' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED' }}
          />
        </div>
        <select value={subject} onChange={e => setSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED' }}>
          {SUBJECTS_FILTER.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={diff} onChange={e => setDiff(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#161B27', border: '1px solid #1E2535', color: '#E8EAED' }}>
          {DIFF_FILTER.map(d => <option key={d} value={d}>{d === 'All' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#4A5268' }}>
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display font-semibold mb-1" style={{ color: '#8B92A5' }}>No courses found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(course => {
            const isEnrolled = enrolledIds.has(course.id);
            const progress   = progressOf(course.id);
            return (
              <div key={course.id}
                className="rounded-2xl overflow-hidden card-hover"
                style={{ background: '#161B27', border: '1px solid #1E2535' }}>
                {/* Thumbnail */}
                <div className="h-36 flex items-center justify-center text-5xl relative"
                  style={{ background: 'linear-gradient(135deg, #6C63FF18, #00D4AA11)' }}>
                  {subjectIcon(course.subject)}
                  {isEnrolled && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                      style={{ background: '#00D4AA22', color: '#00D4AA' }}>
                      <CheckCircle size={12} /> Enrolled
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display font-bold text-sm leading-snug flex-1"
                      style={{ color: '#E8EAED' }}>{course.title}</h3>
                    <DifficultyBadge level={course.difficulty} />
                  </div>

                  <p className="text-xs mb-3 line-clamp-2" style={{ color: '#8B92A5', lineHeight: 1.6 }}>
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs mb-4" style={{ color: '#4A5268' }}>
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {course.total_lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {course.duration_hrs}h
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: '#1E2535', color: '#8B92A5' }}>{course.subject}</span>
                  </div>

                  {isEnrolled ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: '#8B92A5' }}>Progress</span>
                        <span className="font-mono" style={{ color: '#6C63FF' }}>{progress}%</span>
                      </div>
                      <ProgressBar value={progress} color="#6C63FF" height={6} />
                      <button className="w-full mt-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: '#6C63FF22', color: '#6C63FF', border: '1px solid #6C63FF44' }}>
                        Continue Learning →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="w-full py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #6C63FF, #5B53EE)', color: '#fff' }}>
                      {enrolling === course.id ? 'Enrolling...' : 'Enroll Free'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
