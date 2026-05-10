import { AnimatePresence, motion } from 'framer-motion';
import { Plus, RotateCcw, Download, Calculator, Image, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAcademic } from '../context/AcademicContext';
import SubjectRow from '../components/ui/SubjectRow';
import { GRADE_POINTS, YEAR_SEMESTER_OPTIONS, DEFAULT_SUBJECT } from '../data/gradeData';
import { exportToPDF, exportToImage } from '../utils/exportPDF';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const YEAR_GROUPS = [
  { label: '1st Year', semesters: ['1st Year - 1st Semester', '1st Year - 2nd Semester'] },
  { label: '2nd Year', semesters: ['2nd Year - 1st Semester', '2nd Year - 2nd Semester'] },
  { label: '3rd Year', semesters: ['3rd Year - 1st Semester', '3rd Year - 2nd Semester'] },
  { label: '4th Year', semesters: ['4th Year - 1st Semester', '4th Year - 2nd Semester'] },
];

export default function CalculatorPage() {
  const { state, dispatch, computed } = useAcademic();
  const { subjects, previousCGPA, previousCredits } = state;
  const { cgpa, totalCredits } = computed;

  const [viewMode, setViewMode] = useState('list');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  // Track which year-group is "active" (expanded) in year view
  const [activeYear, setActiveYear] = useState('1st Year');

  const handleUpdate = (id, data) =>
    dispatch({ type: 'UPDATE_SUBJECT', payload: { id, data } });

  const handleRemove = (id) =>
    dispatch({ type: 'REMOVE_SUBJECT', payload: id });

  const handleAdd = () => {
    dispatch({ type: 'ADD_SUBJECT' });
    toast.success('Subject added');
  };

  // Add subject to a specific semester
  const handleAddToSemester = (yearSemester) => {
    const newSubject = { ...DEFAULT_SUBJECT(), yearSemester };
    dispatch({ type: 'ADD_SUBJECT_WITH_DATA', payload: newSubject });
    toast.success('Subject added');
  };

  const handleReset = async () => {
    const res = await Swal.fire({
      title: 'Reset all data?',
      text: 'This will clear all subjects and settings.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, reset',
    });
    if (res.isConfirmed) {
      dispatch({ type: 'RESET' });
      toast.success('Data reset');
    }
  };

  const toggleGroup = (key) =>
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  // Group subjects by semester
  const groupedBySemester = useMemo(() => {
    const groups = {};
    subjects.forEach(s => {
      const key = s.yearSemester || '1st Year - 1st Semester';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return YEAR_SEMESTER_OPTIONS
      .filter(opt => groups[opt])
      .map(opt => ({ label: opt, subjects: groups[opt] }));
  }, [subjects]);

  // Year-wise aggregated stats
  const yearStats = useMemo(() => {
    return YEAR_GROUPS.map(yr => {
      const yrSubjects = subjects.filter(s =>
        yr.semesters.includes(s.yearSemester || '1st Year - 1st Semester')
      );
      const valid = yrSubjects.filter(s => s.name && s.grade);
      const ws = valid.reduce((sum, s) => sum + (GRADE_POINTS[s.grade] || 0) * s.credit, 0);
      const tc = valid.reduce((sum, s) => sum + Number(s.credit), 0);
      return {
        label: yr.label,
        semesters: yr.semesters,
        subjects: yrSubjects,
        gpa: tc ? parseFloat((ws / tc).toFixed(2)) : 0,
        credits: tc,
        count: valid.length,
      };
    }).filter(yr => yr.subjects.length > 0 || yr.label === activeYear);
  }, [subjects, activeYear]);

  const semesterStats = (semSubs) => {
    const valid = semSubs.filter(s => s.name && s.grade);
    if (!valid.length) return { gpa: 0, credits: 0 };
    const ws = valid.reduce((sum, s) => sum + (GRADE_POINTS[s.grade] || 0) * s.credit, 0);
    const tc = valid.reduce((sum, s) => sum + Number(s.credit), 0);
    return { gpa: tc ? parseFloat((ws / tc).toFixed(2)) : 0, credits: tc };
  };

  const cgpaColor =
    cgpa >= 3.5 ? '#10b981' :
    cgpa >= 3.0 ? '#4f46e5' :
    cgpa >= 2.5 ? '#f59e0b' : '#ef4444';

  const handleExportPDF = () =>
    toast.promise(
      exportToPDF({ cgpa, totalCredits, subjects, aiInsights: state.aiInsights }),
      { loading: 'Generating PDF…', success: 'PDF exported!', error: 'Export failed' }
    );

  const handleExportImage = () =>
    toast.promise(
      exportToImage(),
      { loading: 'Capturing screenshot…', success: 'Image saved!', error: 'Capture failed — try PDF instead' }
    );

  const gpaColor = (gpa) =>
    gpa >= 3.5 ? '#10b981' : gpa >= 3.0 ? '#4f46e5' : gpa >= 2.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6" id="gradepilot-export-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
            CGPA Calculator
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--gp-text-muted)' }}>
            Add your subjects to calculate your CGPA in real-time.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1.5 p-1 rounded-xl self-start" style={{ background: 'var(--gp-surface-2)' }}>
          {[
            { mode: 'list', icon: Calculator, label: 'List' },
            { mode: 'year', icon: Layers, label: 'Year-wise' },
          ].map(({ mode, icon: Icon, label }) => (
            <motion.button
              key={mode}
              whileTap={{ scale: 0.96 }}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={viewMode === mode
                ? { background: 'var(--gp-surface)', color: '#4f46e5', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--gp-text-muted)' }
              }
            >
              <Icon size={13} />
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobile CGPA card */}
      <div className="lg:hidden gp-card p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gp-text-muted)' }}>
          Current CGPA
        </p>
        <motion.p
          key={cgpa}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-5xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: cgpaColor }}
        >
          {cgpa.toFixed(2)}
        </motion.p>
        <p className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>out of 4.00</p>
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--gp-surface-2)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${cgpaColor}, ${cgpaColor}88)` }}
            animate={{ width: `${(cgpa / 4) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="lg:col-span-2 space-y-4">
          {/* Previous Result */}
          <div className="gp-card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--gp-text)' }}>
              Previous Result <span style={{ color: 'var(--gp-text-muted)', fontWeight: 400 }}>(Optional)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Previous CGPA', key: 'SET_PREVIOUS_CGPA', val: previousCGPA, ph: 'e.g. 3.25', type: 'number', step: '0.01', max: '4' },
                { label: 'Credits Completed', key: 'SET_PREVIOUS_CREDITS', val: previousCredits, ph: 'e.g. 60', type: 'number' },
              ].map(({ label, key, val, ph, type, step, max }) => (
                <div key={key}>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--gp-text-muted)' }}>{label}</label>
                  <input
                    type={type} step={step} min="0" max={max} placeholder={ph} value={val}
                    onChange={e => dispatch({ type: key, payload: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border outline-none transition-colors"
                    style={{ background: 'var(--gp-surface-2)', border: '1px solid var(--gp-border)', color: 'var(--gp-text)' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = 'var(--gp-border)'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="gp-card p-4 sm:p-5">
            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>Current Subjects</h3>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--gp-primary-bg)', color: '#4f46e5' }}>
                    {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Column headers - desktop only */}
                <div
                  className="hidden sm:grid gap-2 mb-3 text-xs font-semibold"
                  style={{ gridTemplateColumns: '28px 1fr 72px 90px 28px', color: 'var(--gp-text-muted)' }}
                >
                  <div className="text-center">#</div>
                  <div>Subject Name</div>
                  <div className="text-center">Credit</div>
                  <div>Grade</div>
                  <div />
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {subjects.map((s, i) => (
                      <SubjectRow
                        key={s.id} subject={s} index={i}
                        onUpdate={handleUpdate} onRemove={handleRemove}
                        canRemove={subjects.length > 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--gp-primary-bg)', color: '#4f46e5', border: '1px dashed #818cf8' }}
                  >
                    <Plus size={15} /> Add Subject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--gp-surface-2)', color: 'var(--gp-text-muted)', border: '1px solid var(--gp-border)' }}
                  >
                    <RotateCcw size={13} /> Reset
                  </motion.button>
                </div>
              </>
            )}

            {/* YEAR-WISE VIEW */}
            {viewMode === 'year' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>Year-wise Subjects</h3>
                </div>

                {/* Year tabs */}
                <div className="flex gap-1 mb-4 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--gp-surface-2)' }}>
                  {YEAR_GROUPS.map(yr => {
                    const yrSubjects = subjects.filter(s =>
                      yr.semesters.includes(s.yearSemester || '1st Year - 1st Semester')
                    );
                    const isActive = activeYear === yr.label;
                    return (
                      <motion.button
                        key={yr.label}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setActiveYear(yr.label)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                        style={isActive
                          ? { background: 'var(--gp-surface)', color: '#4f46e5', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                          : { color: 'var(--gp-text-muted)' }
                        }
                      >
                        {yr.label}
                        {yrSubjects.filter(s => s.name).length > 0 && (
                          <span className="ml-1 opacity-60">({yrSubjects.filter(s => s.name).length})</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Semesters for active year */}
                {YEAR_GROUPS.filter(yr => yr.label === activeYear).map(yr => (
                  <div key={yr.label} className="space-y-4">
                    {yr.semesters.map(sem => {
                      const semSubjects = subjects.filter(s =>
                        (s.yearSemester || '1st Year - 1st Semester') === sem
                      );
                      const stats = semesterStats(semSubjects);
                      const isCollapsed = collapsedGroups[sem];
                      const semLabel = sem.replace(/^\w+ Year - /, ''); // "1st Semester"

                      return (
                        <div key={sem} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gp-border)' }}>
                          <button
                            onClick={() => toggleGroup(sem)}
                            className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                            style={{ background: 'var(--gp-surface-2)' }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isCollapsed ? <ChevronRight size={14} color="#4f46e5" /> : <ChevronDown size={14} color="#4f46e5" />}
                              <span className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>{semLabel}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--gp-primary-bg)', color: '#4f46e5' }}>
                                {semSubjects.length} subj
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs shrink-0" style={{ color: 'var(--gp-text-muted)' }}>
                              <span className="hidden sm:inline">{stats.credits} credits</span>
                              <span className="font-bold text-sm" style={{ color: gpaColor(stats.gpa) }}>GPA {stats.gpa.toFixed(2)}</span>
                            </div>
                          </button>

                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 space-y-2" style={{ background: 'var(--gp-surface)' }}>
                                  {/* Column headers - desktop only */}
                                  {semSubjects.length > 0 && (
                                    <div
                                      className="hidden sm:grid gap-2 mb-2 px-1 text-xs font-semibold"
                                      style={{ gridTemplateColumns: '28px 1fr 72px 90px 28px', color: 'var(--gp-text-muted)' }}
                                    >
                                      <div className="text-center">#</div>
                                      <div>Subject Name</div>
                                      <div className="text-center">Credit</div>
                                      <div>Grade</div>
                                      <div />
                                    </div>
                                  )}

                                  {semSubjects.length === 0 && (
                                    <p className="text-center text-sm py-3" style={{ color: 'var(--gp-text-muted)' }}>
                                      No subjects yet for this semester.
                                    </p>
                                  )}

                                  {semSubjects.map((s, i) => (
                                    <SubjectRow
                                      key={s.id} subject={s} index={i}
                                      onUpdate={handleUpdate} onRemove={handleRemove}
                                      canRemove={subjects.length > 1}
                                    />
                                  ))}

                                  {/* Add to this semester */}
                                  <motion.button
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAddToSemester(sem)}
                                    className="flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs font-medium w-full sm:w-auto"
                                    style={{ background: 'var(--gp-primary-bg)', color: '#4f46e5', border: '1px dashed #818cf8' }}
                                  >
                                    <Plus size={13} /> Add to {semLabel}
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Reset at bottom */}
                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--gp-surface-2)', color: 'var(--gp-text-muted)', border: '1px solid var(--gp-border)' }}
                  >
                    <RotateCcw size={13} /> Reset All
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - desktop only */}
        <div className="hidden lg:flex flex-col space-y-4">
          {/* CGPA CARD */}
          <div className="gp-card p-6 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Calculator size={24} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gp-text-muted)' }}>
              Current CGPA
            </p>
            <motion.p
              key={cgpa}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-6xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-display)', color: cgpaColor }}
            >
              {cgpa.toFixed(2)}
            </motion.p>
            <p className="text-xs" style={{ color: 'var(--gp-text-muted)' }}>out of 4.00</p>
            <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--gp-surface-2)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${cgpaColor}, ${cgpaColor}88)` }}
                animate={{ width: `${(cgpa / 4) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* SUMMARY */}
          <div className="gp-card p-5 space-y-3">
            <h4 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>Summary</h4>
            {[
              ['Total Credits', totalCredits],
              ['Subjects', subjects.filter(s => s.name).length],
              ['Failed', subjects.filter(s => s.grade === 'F' && s.name).length],
              ['Avg GPA', (() => {
                const v = subjects.filter(s => s.name && s.grade);
                return v.length ? (v.reduce((a, s) => a + (GRADE_POINTS[s.grade] || 0), 0) / v.length).toFixed(2) : '—';
              })()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: 'var(--gp-text-muted)' }}>{k}</span>
                <span className="font-semibold" style={{ color: k === 'Failed' && v > 0 ? '#ef4444' : 'var(--gp-text)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Year-wise GPA breakdown when in year mode */}
          {viewMode === 'year' && (
            <div className="gp-card p-5 space-y-3">
              <h4 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>All Years GPA</h4>
              {YEAR_GROUPS.map(yr => {
                const yrSubjects = subjects.filter(s =>
                  yr.semesters.includes(s.yearSemester || '1st Year - 1st Semester')
                );
                const valid = yrSubjects.filter(s => s.name && s.grade);
                if (!valid.length) return null;
                const ws = valid.reduce((sum, s) => sum + (GRADE_POINTS[s.grade] || 0) * s.credit, 0);
                const tc = valid.reduce((sum, s) => sum + Number(s.credit), 0);
                const gpa = tc ? parseFloat((ws / tc).toFixed(2)) : 0;
                const color = gpaColor(gpa);
                return (
                  <div key={yr.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--gp-text-muted)' }}>{yr.label}</span>
                      <span className="font-bold" style={{ color }}>{gpa.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gp-surface-2)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        animate={{ width: `${(gpa / 4) * 100}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EXPORT BUTTONS */}
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
            >
              <Download size={15} />
              Export PDF Report
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportImage}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm"
              style={{ background: 'var(--gp-surface-2)', color: 'var(--gp-text)', border: '1px solid var(--gp-border)' }}
            >
              <Image size={15} />
              Export as Image (PNG)
            </motion.button>
          </div>
        </div>

        {/* Mobile: summary + export */}
        <div className="lg:hidden space-y-3">
          <div className="gp-card p-4 space-y-3">
            <h4 className="font-semibold text-sm" style={{ color: 'var(--gp-text)' }}>Summary</h4>
            <div className="grid grid-cols-2 gap-y-2">
              {[
                ['Total Credits', totalCredits],
                ['Subjects', subjects.filter(s => s.name).length],
                ['Failed', subjects.filter(s => s.grade === 'F' && s.name).length],
                ['Avg GPA', (() => {
                  const v = subjects.filter(s => s.name && s.grade);
                  return v.length ? (v.reduce((a, s) => a + (GRADE_POINTS[s.grade] || 0), 0) / v.length).toFixed(2) : '—';
                })()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--gp-text-muted)' }}>{k}</span>
                  <span className="font-semibold ml-2" style={{ color: k === 'Failed' && v > 0 ? '#ef4444' : 'var(--gp-text)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
            >
              <Download size={15} /> PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportImage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm"
              style={{ background: 'var(--gp-surface-2)', color: 'var(--gp-text)', border: '1px solid var(--gp-border)' }}
            >
              <Image size={15} /> Image
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
