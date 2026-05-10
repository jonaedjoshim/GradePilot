import { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_SUBJECT, GRADE_POINTS } from '../data/gradeData';

const AcademicContext = createContext(null);

const initialState = {
  subjects: [DEFAULT_SUBJECT(), DEFAULT_SUBJECT(), DEFAULT_SUBJECT()],
  previousCGPA: '',
  previousCredits: '',
  targetCGPA: '',
  remainingCredits: '',
  theme: 'light',
  sidebarCollapsed: false,
  aiInsights: null,
  aiLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SUBJECTS': return { ...state, subjects: action.payload };
    case 'ADD_SUBJECT':  return { ...state, subjects: [...state.subjects, DEFAULT_SUBJECT()] };
    case 'ADD_SUBJECT_WITH_DATA': return { ...state, subjects: [...state.subjects, action.payload] };
    case 'REMOVE_SUBJECT': return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case 'UPDATE_SUBJECT': return {
      ...state,
      subjects: state.subjects.map(s => s.id === action.payload.id ? { ...s, ...action.payload.data } : s),
    };
    case 'SET_PREVIOUS_CGPA':     return { ...state, previousCGPA: action.payload };
    case 'SET_PREVIOUS_CREDITS':  return { ...state, previousCredits: action.payload };
    case 'SET_TARGET_CGPA':       return { ...state, targetCGPA: action.payload };
    case 'SET_REMAINING_CREDITS': return { ...state, remainingCredits: action.payload };
    case 'TOGGLE_THEME': {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      return { ...state, theme };
    }
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_AI_INSIGHTS': return { ...state, aiInsights: action.payload, aiLoading: false };
    case 'SET_AI_LOADING':  return { ...state, aiLoading: action.payload };
    case 'LOAD_STATE': return { ...state, ...action.payload };
    case 'RESET': return { ...initialState, theme: state.theme };
    default: return state;
  }
}

// Migrate old saved subjects to include yearSemester if missing
function migrateSubjects(subjects) {
  return subjects.map(s => ({
    yearSemester: '1st Year - 1st Semester',
    ...s,
  }));
}

export function computeCGPA(subjects, previousCGPA = '', previousCredits = '') {
  const valid = subjects.filter(s => s.name && s.grade && s.credit > 0);
  if (valid.length === 0) return { cgpa: 0, totalCredits: 0, weightedSum: 0 };

  let weightedSum = valid.reduce((sum, s) => sum + (GRADE_POINTS[s.grade] || 0) * s.credit, 0);
  let totalCredits = valid.reduce((sum, s) => sum + Number(s.credit), 0);

  const prevCGPA  = parseFloat(previousCGPA);
  const prevCreds = parseFloat(previousCredits);
  if (!isNaN(prevCGPA) && !isNaN(prevCreds) && prevCreds > 0) {
    weightedSum += prevCGPA * prevCreds;
    totalCredits += prevCreds;
  }

  const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  return { cgpa: parseFloat(cgpa.toFixed(2)), totalCredits, weightedSum };
}

export function AcademicProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('gradepilot_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        document.documentElement.setAttribute('data-theme', parsed.theme || 'light');
        return {
          ...init,
          ...parsed,
          subjects: migrateSubjects(parsed.subjects || init.subjects),
        };
      }
    } catch {}
    return init;
  });

  useEffect(() => {
    const { aiInsights, aiLoading, ...persist } = state;
    localStorage.setItem('gradepilot_state', JSON.stringify(persist));
  }, [state]);

  const computed = computeCGPA(state.subjects, state.previousCGPA, state.previousCredits);

  return (
    <AcademicContext.Provider value={{ state, dispatch, computed }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error('useAcademic must be used inside AcademicProvider');
  return ctx;
}
