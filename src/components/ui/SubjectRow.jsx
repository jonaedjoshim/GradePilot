import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { GRADE_LIST, GRADE_MARKS } from '../../data/gradeData';

export default function SubjectRow({ subject, index, onUpdate, onRemove, canRemove }) {
  const handle = (field) => (e) =>
    onUpdate(subject.id, { [field]: e.target.value });

  const handleCredit = (e) =>
    onUpdate(subject.id, { credit: Number(e.target.value) });

  const inputStyle = {
    background: 'var(--gp-surface-2)',
    border: '1px solid var(--gp-border)',
    color: 'var(--gp-text)',
    outline: 'none',
    transition: 'border-color 0.2s',
    minWidth: 0,
    width: '100%',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: '28px',
    cursor: 'pointer',
  };

  const focusHandler = (e) => (e.target.style.borderColor = '#4f46e5');
  const blurHandler = (e) => (e.target.style.borderColor = 'var(--gp-border)');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className="flex flex-col sm:grid gap-2 items-start sm:items-center rounded-xl p-3 sm:p-0"
      style={{
        gridTemplateColumns: '28px 1fr 72px 90px 28px',
        background: 'transparent',
        border: 'none',
      }}
    >
      {/* Row */}
      <div className="sm:contents flex w-full items-center gap-2">
        {/* Index */}
        <div
          className="text-xs text-center w-7 h-7 rounded-lg flex items-center justify-center font-semibold shrink-0"
          style={{ background: 'var(--gp-surface-2)', color: 'var(--gp-text-muted)' }}
        >
          {index + 1}
        </div>

        {/* Subject Name */}
        <input
          value={subject.name}
          onChange={handle('name')}
          placeholder="Subject name…"
          className="flex-1 sm:w-full px-3 py-2 text-sm rounded-xl"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />

        {/* Credit */}
        <input
          type="number"
          value={subject.credit}
          onChange={handleCredit}
          min="1"
          max="6"
          className="sm:hidden w-14 text-center px-2 py-2 text-sm rounded-xl shrink-0"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />

        {/* Grade - mobile */}
        <div className="sm:hidden relative shrink-0" style={{ width: '80px' }}>
          <select
            value={subject.grade}
            onChange={handle('grade')}
            className="w-full px-2 py-2 text-sm rounded-xl"
            style={selectStyle}
            onFocus={focusHandler}
            onBlur={blurHandler}
          >
            {GRADE_LIST.map(g => (
              <option key={g} value={g}>{g} ({GRADE_MARKS[g]})</option>
            ))}
          </select>
        </div>

        {/* Remove (mobile: inline) */}
        <div className="flex sm:hidden justify-center shrink-0">
          {canRemove && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(subject.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={13} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Desktop: credit + grade */}
      <div className="hidden sm:contents">
        {/* Credit */}
        <input
          type="number"
          value={subject.credit}
          onChange={handleCredit}
          min="1"
          max="6"
          className="w-full text-center px-2 py-2 text-sm rounded-xl"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />

        {/* Grade */}
        <div className="relative w-full">
          <select
            value={subject.grade}
            onChange={handle('grade')}
            className="w-full px-2 py-2 text-sm rounded-xl"
            style={selectStyle}
            onFocus={focusHandler}
            onBlur={blurHandler}
          >
            {GRADE_LIST.map(g => (
              <option key={g} value={g}>{g} ({GRADE_MARKS[g]})</option>
            ))}
          </select>
        </div>

        {/* Remove (desktop) */}
        <div className="flex justify-center">
          {canRemove && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(subject.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={13} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
