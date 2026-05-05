// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', style = {}, hover = false }) {
  return (
    <div
      className={`rounded-2xl p-5 ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      style={{ background: '#161B27', border: '1px solid #1E2535', ...style }}
    >
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = '#6C63FF', change }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: '#8B92A5' }}>{label}</p>
          <p className="text-2xl font-display font-bold" style={{ color: '#E8EAED' }}>{value}</p>
          {change !== undefined && (
            <p className="text-xs mt-1" style={{ color: change >= 0 ? '#00D4AA' : '#FF4D6A' }}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs last week
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22`, color }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, className = '', type = 'button'
}) {
  const base = 'font-display font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const variants = {
    primary:  { background: 'linear-gradient(135deg, #6C63FF, #5B53EE)', color: '#fff', boxShadow: '0 4px 15px rgba(108,99,255,0.3)' },
    accent:   { background: 'linear-gradient(135deg, #00D4AA, #00B890)', color: '#fff', boxShadow: '0 4px 15px rgba(0,212,170,0.3)' },
    ghost:    { background: 'transparent', color: '#8B92A5', border: '1px solid #1E2535' },
    danger:   { background: '#FF4D6A22', color: '#FF4D6A', border: '1px solid #FF4D6A44' },
    outline:  { background: 'transparent', color: '#6C63FF', border: '1px solid #6C63FF44' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${className}`}
      style={variants[variant]}
    >
      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium" style={{ color: '#8B92A5' }}>{label}</label>}
      <input
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-1"
        style={{
          background: '#0F1117',
          border: error ? '1px solid #FF4D6A' : '1px solid #1E2535',
          color: '#E8EAED',
          '--tw-ring-color': '#6C63FF',
        }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: '#FF4D6A' }}>{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium" style={{ color: '#8B92A5' }}>{label}</label>}
      <select
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: '#0F1117', border: '1px solid #1E2535', color: '#E8EAED' }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = '#6C63FF' }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium"
      style={{ background: `${color}22`, color }}>
      {children}
    </span>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, color = '#6C63FF', height = 8, showLabel = false }) {
  return (
    <div>
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: '#1E2535' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs mt-1" style={{ color: '#8B92A5' }}>{Math.round(value)}%</p>
      )}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{
        width: size, height: size,
        borderColor: '#1E2535',
        borderTopColor: '#6C63FF',
      }}
    />
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function Empty({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-display font-semibold text-lg mb-1" style={{ color: '#E8EAED' }}>{title}</p>
      <p className="text-sm mb-6" style={{ color: '#8B92A5' }}>{description}</p>
      {action}
    </div>
  );
}

// ── Difficulty Badge ──────────────────────────────────────────────────────────
export function DifficultyBadge({ level }) {
  const map = {
    beginner:     { color: '#00D4AA', label: 'Beginner'     },
    intermediate: { color: '#FFB800', label: 'Intermediate' },
    advanced:     { color: '#FF4D6A', label: 'Advanced'     },
    easy:         { color: '#00D4AA', label: 'Easy'         },
    medium:       { color: '#FFB800', label: 'Medium'       },
    hard:         { color: '#FF4D6A', label: 'Hard'         },
  };
  const { color, label } = map[level] || { color: '#8B92A5', label: level };
  return <Badge color={color}>{label}</Badge>;
}
