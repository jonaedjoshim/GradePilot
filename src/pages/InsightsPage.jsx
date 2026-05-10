import { motion } from 'framer-motion';
import { BarChart2, Brain, TrendingUp, AlertTriangle, Star, Play } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useGeminiAI } from '../hooks/useGeminiAI';
import AIInsightCard from '../components/ui/AIInsightCard';
import { GPATrendChart, GradeDistributionChart, CreditAnalysisChart, YearSemesterChart } from '../components/charts/AcademicCharts';
import { GRADE_POINTS } from '../data/gradeData';

export default function InsightsPage() {
  const { state, computed } = useAcademic();
  const { subjects, aiInsights, aiLoading } = state;
  const { cgpa, totalCredits } = computed;
  const { analyzeAcademics } = useGeminiAI();

  const validSubjects = subjects.filter(s => s.name && s.grade);
  const weakSubjects = validSubjects.filter(s => (GRADE_POINTS[s.grade] || 0) < 2.75);
  const strongSubjects = validSubjects.filter(s => (GRADE_POINTS[s.grade] || 0) >= 3.5);
  const failedSubjects = validSubjects.filter(s => s.grade === 'F');

  const performanceTrend = (() => {
    if (validSubjects.length < 2) return 'neutral';
    const first = GRADE_POINTS[validSubjects[0].grade] || 0;
    const last = GRADE_POINTS[validSubjects[validSubjects.length - 1].grade] || 0;
    return last > first ? 'improving' : last < first ? 'declining' : 'stable';
  })();

  const trendConfig = {
    improving: { color: '#10b981', bg: '#ecfdf5', label: 'Improving', icon: '📈' },
    declining: { color: '#ef4444', bg: '#fef2f2', label: 'Declining', icon: '📉' },
    stable: { color: '#f59e0b', bg: '#fffbeb', label: 'Stable', icon: '➡️' },
    neutral: { color: '#64748b', bg: 'var(--gp-surface-2)', label: 'Add More Data', icon: '⏳' },
  };
  const trend = trendConfig[performanceTrend];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
            Academic Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--gp-text-muted)' }}>
            Deep analysis of your academic performance and risk factors.
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={analyzeAcademics}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 self-start shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
          {aiLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play size={15} />}
          Run Analysis
        </motion.button>
      </div>

      {/* Quick Metrics - BUG FIX: was grid-cols-2 md:grid-cols-4, fine but keep consistent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '💪', label: 'Strong Subjects', value: strongSubjects.length, color: '#10b981', bg: '#ecfdf5' },
          { icon: '⚠️', label: 'Weak Subjects', value: weakSubjects.length, color: '#f59e0b', bg: '#fffbeb' },
          { icon: '❌', label: 'Failed', value: failedSubjects.length, color: '#ef4444', bg: '#fef2f2' },
          { icon: trend.icon, label: 'Trend', value: trend.label, color: trend.color, bg: trend.bg, text: true },
        ].map(({ icon, label, value, color, bg, text }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="gp-card p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl" style={{ background: bg }}>
              {icon}
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--gp-text-muted)' }}>{label}</p>
            <p className={`font-bold ${text ? 'text-sm' : 'text-2xl'}`} style={{ color, fontFamily: 'var(--font-display)' }}>
              {value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Subject Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="gp-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} style={{ color: '#10b981' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>Strong Subjects</h3>
          </div>
          {strongSubjects.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--gp-text-muted)' }}>No A- or above subjects yet</p>
          ) : strongSubjects.map(s => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: 'var(--gp-border)' }}>
              <span className="text-sm truncate mr-2" style={{ color: 'var(--gp-text)' }}>{s.name}</span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0"
                style={{ background: '#ecfdf5', color: '#065f46' }}>{s.grade}</span>
            </div>
          ))}
        </div>

        <div className="gp-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>Needs Attention</h3>
          </div>
          {weakSubjects.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--gp-text-muted)' }}>All subjects above B- 🎉</p>
          ) : weakSubjects.map(s => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: 'var(--gp-border)' }}>
              <span className="text-sm truncate mr-2" style={{ color: 'var(--gp-text)' }}>{s.name}</span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0"
                style={{ background: s.grade === 'F' ? '#fef2f2' : '#fffbeb', color: s.grade === 'F' ? '#991b1b' : '#92400e' }}>
                {s.grade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { label: 'GPA Trend', delay: 0.1, Chart: () => <GPATrendChart subjects={subjects} /> },
          { label: 'Grade Distribution', delay: 0.15, Chart: () => <GradeDistributionChart subjects={subjects} /> },
          { label: 'Credit Analysis', delay: 0.2, Chart: () => <CreditAnalysisChart subjects={subjects} /> },
          { label: 'Year-wise GPA', delay: 0.25, Chart: () => <YearSemesterChart subjects={subjects} /> },
        ].map(({ label, delay, Chart }) => (
          <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="gp-card p-5 min-w-0">
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--gp-text)' }}>{label}</h4>
            <div className="w-full overflow-hidden">
              <Chart />
            </div>
          </motion.div>
        ))}
      </div>

      <AIInsightCard insights={aiInsights} loading={aiLoading} />
    </div>
  );
}
