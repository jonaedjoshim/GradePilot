import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import { useAcademic, computeCGPA } from '../context/AcademicContext';
import { GRADE_POINTS } from '../data/gradeData';

import toast from 'react-hot-toast';

// NU rule: max improvement grade is B (3.00)
const MAX_IMPROVEMENT_GPA = 3.0;
const MAX_IMPROVEMENT_GRADE = 'B';

export default function ImprovementPage() {
  const { state, computed } = useAcademic();

  const { subjects, previousCGPA, previousCredits } = state;

  const { cgpa } = computed;

  const validSubjects = subjects.filter(
    (s) => s.name && s.grade
  );

  const improvableSubjects = validSubjects.filter(
    (s) =>
      (GRADE_POINTS[s.grade] || 0) <
      MAX_IMPROVEMENT_GPA
  );

  const [selected, setSelected] = useState({});

  const toggle = (id) =>
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

  const improvedCGPA = useMemo(() => {
    const improved = subjects.map((s) => {
      if (selected[s.id]) {
        return {
          ...s,
          grade: MAX_IMPROVEMENT_GRADE,
        };
      }

      return s;
    });

    return computeCGPA(
      improved,
      previousCGPA,
      previousCredits
    ).cgpa;
  }, [
    selected,
    subjects,
    previousCGPA,
    previousCredits,
  ]);

  const cgpaDiff = parseFloat(
    (improvedCGPA - cgpa).toFixed(2)
  );

  const selectedCount = Object.values(selected).filter(
    Boolean
  ).length;

  const handleApplyAll = () => {
    const newSelection = {};

    improvableSubjects.forEach((s) => {
      newSelection[s.id] = true;
    });

    setSelected(newSelection);

    toast.success(
      `${improvableSubjects.length} subjects selected for improvement`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--gp-text)',
          }}
        >
          Improvement Exam
        </h1>

        <p
          className="text-sm mt-1"
          style={{ color: 'var(--gp-text-muted)' }}
        >
          Simulate NU improvement exam results.
          Maximum grade after improvement:{' '}
          <strong>B (3.00)</strong>
        </p>
      </div>

      {/* NU Rule Banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: 'var(--gp-warning-bg)',
          border: '1px solid #fde68a',
        }}
      >
        <AlertCircle
          size={18}
          style={{
            color: '#d97706',
            marginTop: 1,
          }}
        />

        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: '#92400e' }}
          >
            NU Improvement Rule
          </p>

          <p
            className="text-xs mt-0.5"
            style={{ color: '#78350f' }}
          >
            According to National University
            rules, the maximum grade achievable
            through improvement exam is{' '}
            <strong>B (GPA 3.00)</strong>.
            Subjects with grade B or above
            cannot be improved.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 gp-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-semibold text-sm"
              style={{ color: 'var(--gp-text)' }}
            >
              Improvable Subjects
            </h3>

            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-1 rounded-lg"
                style={{
                  background:
                    'var(--gp-warning-bg)',
                  color: '#92400e',
                }}
              >
                {improvableSubjects.length} eligible
              </span>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApplyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background:
                    'var(--gp-primary-bg)',
                  color: '#4f46e5',
                }}
              >
                <RefreshCw size={12} />
                Select All
              </motion.button>
            </div>
          </div>

          {improvableSubjects.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle
                size={32}
                className="mx-auto mb-2"
                style={{
                  color: 'var(--gp-success)',
                }}
              />

              <p
                className="text-sm font-medium"
                style={{ color: 'var(--gp-text)' }}
              >
                All subjects are at B or above!
              </p>

              <p
                className="text-xs mt-1"
                style={{
                  color: 'var(--gp-text-muted)',
                }}
              >
                No subjects are eligible for
                improvement.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {improvableSubjects.map(
                  (subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                      onClick={() =>
                        toggle(subject.id)
                      }
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border"
                      style={{
                        background: selected[
                          subject.id
                        ]
                          ? 'var(--gp-primary-bg)'
                          : 'var(--gp-surface-2)',

                        borderColor: selected[
                          subject.id
                        ]
                          ? '#818cf8'
                          : 'transparent',
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected[subject.id]
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                          }`}
                      >
                        {selected[
                          subject.id
                        ] && (
                            <CheckCircle
                              size={12}
                              color="white"
                            />
                          )}
                      </div>

                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color:
                              'var(--gp-text)',
                          }}
                        >
                          {subject.name}
                        </p>

                        <p
                          className="text-xs"
                          style={{
                            color:
                              'var(--gp-text-muted)',
                          }}
                        >
                          Credit:{' '}
                          {subject.credit} ·
                          Current:{' '}
                          {subject.grade} (
                          {GRADE_POINTS[
                            subject.grade
                          ]?.toFixed(2)}
                          )
                        </p>
                      </div>

                      {selected[subject.id] && (
                        <div className="text-right">
                          <p
                            className="text-xs font-semibold"
                            style={{
                              color: '#4f46e5',
                            }}
                          >
                            → B (3.00)
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {/* RESULT CARD */}
          <div className="gp-card p-6 text-center">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: '#ecfdf5',
                color: '#10b981',
              }}
            >
              <Lightbulb size={20} />
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{
                color: 'var(--gp-text-muted)',
              }}
            >
              CGPA After Improvement
            </p>

            <motion.p
              key={improvedCGPA}
              initial={{
                scale: 0.9,
                opacity: 0.5,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
              className="text-5xl font-bold mb-1"
              style={{
                fontFamily:
                  'var(--font-display)',
                color: '#10b981',
              }}
            >
              {improvedCGPA.toFixed(2)}
            </motion.p>

            {cgpaDiff !== 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${cgpaDiff > 0
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
                  }`}
              >
                {cgpaDiff > 0 ? '▲' : '▼'}{' '}
                {Math.abs(cgpaDiff).toFixed(2)}{' '}
                change
              </motion.div>
            )}
          </div>

          {/* IMPACT ANALYSIS */}
          <div className="gp-card p-5 space-y-3">
            <h4
              className="font-semibold text-sm"
              style={{ color: 'var(--gp-text)' }}
            >
              Impact Analysis
            </h4>

            {[
              [
                'Current CGPA',
                cgpa.toFixed(2),
              ],
              [
                'Improved CGPA',
                improvedCGPA.toFixed(2),
              ],
              [
                'Difference',
                `${cgpaDiff >= 0 ? '+' : ''
                }${cgpaDiff.toFixed(2)}`,
              ],
              [
                'Selected',
                `${selectedCount} subject${selectedCount !== 1
                  ? 's'
                  : ''
                }`,
              ],
            ].map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between text-sm"
              >
                <span
                  style={{
                    color:
                      'var(--gp-text-muted)',
                  }}
                >
                  {key}
                </span>

                <span
                  className="font-semibold"
                  style={{
                    color:
                      key === 'Difference'
                        ? cgpaDiff > 0
                          ? 'var(--gp-success)'
                          : cgpaDiff < 0
                            ? 'var(--gp-danger)'
                            : 'var(--gp-text)'
                        : 'var(--gp-text)',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}