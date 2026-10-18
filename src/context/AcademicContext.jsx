import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { DEFAULT_SUBJECT } from "../data/gradeData";
import { calculateCGPA } from "../lib/calculations";

import {
  loadAcademicState,
  saveAcademicState,
  validateAcademicState,
} from "../lib/storage";

const AcademicContext = createContext(null);

function createInitialState() {
  return {
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
}

function academicReducer(state, action) {
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
            ? {
                ...subject,
                ...action.payload.data,
              }
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

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
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
      return validateAcademicState(action.payload, createInitialState());

    case "RESET":
      return {
        ...createInitialState(),
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      };

    default:
      return state;
  }
}

export function computeCGPA(subjects, previousCGPA = "", previousCredits = "") {
  return calculateCGPA(subjects, previousCGPA, previousCredits);
}

export function AcademicProvider({ children }) {
  const [state, dispatch] = useReducer(academicReducer, undefined, () =>
    loadAcademicState(createInitialState()),
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  useEffect(() => {
    saveAcademicState(state);
  }, [state]);

  const computed = useMemo(
    () =>
      calculateCGPA(state.subjects, state.previousCGPA, state.previousCredits),
    [state.subjects, state.previousCGPA, state.previousCredits],
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      computed,
    }),
    [state, computed],
  );

  return (
    <AcademicContext.Provider value={contextValue}>
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
