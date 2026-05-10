import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Lightbulb, Activity } from 'lucide-react';

const RISK_CONFIG = {
  Low:    { color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', icon: CheckCircle,   label: 'Low Risk' },
  Medium: { color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: AlertTriangle, label: 'Medium Risk' },
  High:   { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: AlertTriangle, label: 'High Risk' },
};

export default function AIInsightCard({ insights, loading }) {
  if (loading) {
    return (
      <div className="gp-card p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#eef2ff' }}>
            <Brain size={24} color="#4f46e5" className="animate-pulse" />
          </div>
          <div className="space-y-2 w-full max-w-md">
            {[80, 60, 70].map((w, i) => (
              <div key={i} className="h-3 rounded-full animate-pulse" style={{ width: `${w}%`, background: 'var(--gp-surface-2)' }} />
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--gp-text-muted)' }}>Analyzing your academic profile…</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="gp-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#eef2ff' }}>
          <Brain size={28} color="#4f46e5" />
        </div>
        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--gp-text)' }}>No Analysis Yet</p>
        <p className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>
          Run AI Analysis to get personalized academic insights and recommendations.
        </p>
      </div>
    );
  }

  const risk = RISK_CONFIG[insights.riskLevel] || RISK_CONFIG.Low;
  const RiskIcon = risk.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gp-card overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Brain size={20} color="white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">AI Academic Analysis</p>
              <p className="text-xs text-indigo-200">Powered by Academic Intelligence Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto"
            style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
            <RiskIcon size={12} />
            {risk.label}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Stats Row - BUG FIX: grid-cols-3 was too cramped on small mobile */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Status', value: insights.status, icon: Activity, color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Required GPA', value: insights.requiredGPA?.toFixed(2) || '—', icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Risk Level', value: insights.riskLevel, icon: RiskIcon, color: risk.color, bg: risk.bg },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl p-2 sm:p-3 text-center" style={{ background: bg }}>
                <Icon size={14} color={color} className="mx-auto mb-1" />
                <p className="text-xs font-bold truncate" style={{ color }}>{value}</p>
                <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--gp-text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="rounded-xl p-4" style={{ background: 'var(--gp-surface-2)' }}>
            <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--gp-text)' }}>
              <CheckCircle size={13} color="#4f46e5" /> Verdict
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gp-text)' }}>{insights.verdict}</p>
          </div>

          {/* Weak Areas */}
          {insights.weakAreas?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--gp-text)' }}>
                <AlertTriangle size={13} color="#f59e0b" /> Weak Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {insights.weakAreas.map((area, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: '#fffbeb', color: '#92400e' }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {insights.suggestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--gp-text)' }}>
                <Lightbulb size={13} color="#4f46e5" /> Recommendations
              </p>
              <div className="space-y-2">
                {insights.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: 'var(--gp-text)' }}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                      style={{ background: '#eef2ff', color: '#4f46e5' }}>
                      {i + 1}
                    </span>
                    {s}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
