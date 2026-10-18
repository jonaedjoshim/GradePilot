import { createContext, useContext, useReducer, useEffect } from "react";

import { DEFAULT_SUBJECT } from "../data/gradeData";
import { calculateCGPA } from "../lib/calculations";

const AcademicContext = createContext(null);

const initialState = {
  subjects: [DEFAULT_SUBJECT(), DEFAULT_SUBJECT(), DEFAULT_SUBJECT()],
  previousCGPA: "",
  previousCredits: "",
  targetCGPA: "",
  remainingCredits: "",
  theme: "light",
  sidebarCollapsed: false,
  aiInsights: null,
  aiLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SUBJECTS":
      return {
        ...state,
        subjects: action.payload,
      };

    case "ADD_SUBJECT":
      return {
        ...state,
        subjects: [...state.subjects, DEFAULT_SUBJECT()],
      };

    case "ADD_SUBJECT_WITH_DATA":
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };

    case "REMOVE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.filter(
          (subject) => subject.id !== action.payload,
        ),
      };

    case "UPDATE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.map((subject) =>
          subject.id === action.payload.id
            ? { ...subject, ...action.payload.data }
            : subject,
        ),
      };

    case "SET_PREVIOUS_CGPA":
      return {
        ...state,
        previousCGPA: action.payload,
      };

    case "SET_PREVIOUS_CREDITS":
      return {
        ...state,
        previousCredits: action.payload,
      };

    case "SET_TARGET_CGPA":
      return {
        ...state,
        targetCGPA: action.payload,
      };

    case "SET_REMAINING_CREDITS":
      return {
        ...state,
        remainingCredits: action.payload,
      };

    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };

    case "SET_AI_INSIGHTS":
      return {
        ...state,
        aiInsights: action.payload,
        aiLoading: false,
      };

    case "SET_AI_LOADING":
      return {
        ...state,
        aiLoading: action.payload,
      };

    case "LOAD_STATE":
      return {
        ...state,
        ...action.payload,
      };

    case "RESET":
      return {
        ...initialState,
        subjects: [DEFAULT_SUBJECT(), DEFAULT_SUBJECT(), DEFAULT_SUBJECT()],
        theme: state.theme,
      };

    default:
      return state;
  }
}

function migrateSubjects(subjects) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  return subjects.map((subject) => ({
    yearSemester: "1st Year - 1st Semester",
    ...subject,
  }));
}

function loadSavedState(initial) {
  try {
    const saved = localStorage.getItem("gradepilot_state");

    if (!saved) {
      return initial;
    }

    const parsed = JSON.parse(saved);

    return {
      ...initial,
      ...parsed,
      subjects: migrateSubjects(parsed.subjects ?? initial.subjects),
      aiInsights: null,
      aiLoading: false,
    };
  } catch {
    return initial;
  }
}

export function computeCGPA(subjects, previousCGPA = "", previousCredits = "") {
  return calculateCGPA(subjects, previousCGPA, previousCredits);
}

export function AcademicProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadSavedState);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  useEffect(() => {
    try {
      const { aiInsights, aiLoading, ...persistedState } = state;

      localStorage.setItem("gradepilot_state", JSON.stringify(persistedState));
    } catch (error) {
      console.error("Failed to save academic data:", error);
    }
  }, [state]);

  const computed = calculateCGPA(
    state.subjects,
    state.previousCGPA,
    state.previousCredits,
  );

  return (
    <AcademicContext.Provider value={{ state, dispatch, computed }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);

  if (!context) {
    throw new Error("useAcademic must be used inside AcademicProvider");
  }

  return context;
}
