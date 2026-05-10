import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Play, Target } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { useGeminiAI } from '../hooks/useGeminiAI';
import AIInsightCard from '../components/ui/AIInsightCard';
import { GPA_TO_DIFFICULTY, DIFFICULTY_COLOR } from '../data/gradeData';

export default function PredictionPage() {
  const { state, dispatch, computed } = useAcademic();
  const { analyzeAcademics } = useGeminiAI();
  const { cgpa, totalCredits } = computed;

  const [whatIfGPA, setWhatIfGPA] = useState(3.5);
  const [whatIfCredits, setWhatIfCredits] = useState(18);
  const [targetCGPA, setTargetCGPA] = useState(state.targetCGPA || '');
  const [remainingCredits, setRemainingCredits] = useState(state.remainingCredits || '');

  const predictedCGPA = (() => {
    const newWS = cgpa * totalCredits + whatIfGPA * whatIfCredits;
    const newTC = totalCredits + whatIfCredits;
    return newTC > 0 ? parseFloat((newWS / newTC).toFixed(2)) : cgpa;
  })();

  const requiredGPA = (() => {
    const tc = parseFloat(targetCGPA);
    const rc = parseFloat(remainingCredits);
    if (!tc || !rc || rc <= 0) return null;
    const req = (tc * (totalCredits + rc) - cgpa * totalCredits) / rc;
    return parseFloat(req.toFixed(2));
  })();

  const difficulty = requiredGPA !== null ? GPA_TO_DIFFICULTY(requiredGPA) : null;

  const handleAnalyze = () => {
    dispatch({ type: 'SET_TARGET_CGPA', payload: targetCGPA });
    dispatch({ type: 'SET_REMAINING_CREDITS', payload: remainingCredits });
    analyzeAcademics();
  };

  const inputStyle = {
    background: 'var(--gp-surface-2)',
    border: '1px solid var(--gp-border)',
    color: 'var(--gp-text)',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
          Prediction Engine
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gp-text-muted)' }}>
          Simulate future scenarios and check if your target CGPA is achievable.
        </p>
      </div>

      {/* BUG FIX: was lg:grid-cols-2, fine — but inner padding and overflow needed fixing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What If Simulator */}
        <div className="gp-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--gp-text)' }}>What-If Simulator</h3>
              <p className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>Predict CGPA after next semester</p>
            </div>
          </div>

          {/* GPA Slider */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--gp-text-muted)' }}>
              Expected GPA Next Semester:{' '}
              <strong style={{ color: 'var(--gp-text)' }}>{whatIfGPA.toFixed(2)}</strong>
            </label>
            <input
              type="range" min="0" max="4" step="0.25" value={whatIfGPA}
              onChange={(e) => setWhatIfGPA(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--gp-text-muted)' }}>
              <span>0.00</span><span>4.00</span>
            </div>
          </div>

          {/* Credit Slider */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: 'var(--gp-text-muted)' }}>
              Credits Next Semester:{' '}
              <strong style={{ color: 'var(--gp-text)' }}>{whatIfCredits}</strong>
            </label>
            <input
              type="range" min="3" max="24" step="3" value={whatIfCredits}
              onChange={(e) => setWhatIfCredits(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Result */}
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--gp-primary-bg)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--gp-text-muted)' }}>Predicted CGPA</p>
            <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#4f46e5' }}>
              {predictedCGPA.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--gp-text-muted)' }}>
              {predictedCGPA > cgpa
                ? `▲ +${(predictedCGPA - cgpa).toFixed(2)} improvement`
                : predictedCGPA < cgpa
                ? `▼ ${(predictedCGPA - cgpa).toFixed(2)} decrease`
                : 'No change'}
            </p>
          </div>
        </div>

        {/* Target CGPA */}
        <div className="gp-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Target size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--gp-text)' }}>Target CGPA Engine</h3>
              <p className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>Know the GPA you need to reach your goal</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--gp-text-muted)' }}>Target CGPA</label>
            <input
              type="number" step="0.01" min="0" max="4" placeholder="e.g. 3.50"
              value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--gp-border)')}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--gp-text-muted)' }}>Remaining Credits</label>
            <input
              type="number" min="0" placeholder="e.g. 60"
              value={remainingCredits} onChange={(e) => setRemainingCredits(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--gp-border)')}
            />
          </div>

          {requiredGPA !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 space-y-2" style={{ background: 'var(--gp-surface-2)' }}
            >
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>Required GPA</span>
                <span className="font-bold text-sm" style={{ color: requiredGPA > 4 ? '#ef4444' : '#4f46e5' }}>
                  {requiredGPA.toFixed(2)}
                </span>
              </div>
              {difficulty && requiredGPA <= 4 && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>Difficulty</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[difficulty]}`}>
                    {difficulty}
                  </span>
                </div>
              )}
              {requiredGPA > 4 && (
                <p className="text-xs" style={{ color: 'var(--gp-danger)' }}>
                  ⚠️ Target is not achievable with remaining credits.
                </p>
              )}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            <Play size={16} /> Run AI Analysis
          </motion.button>
        </div>
      </div>

      <AIInsightCard insights={state.aiInsights} loading={state.aiLoading} />
    </div>
  );
}
