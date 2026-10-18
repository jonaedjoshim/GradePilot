import { useEffect, useMemo, useReducer } from "react";
import { DEFAULT_SUBJECT } from "../data/gradeData";
import {
  DEFAULT_UNIVERSITY,
  getDefaultAcademicPeriod,
  isValidUniversity,
} from "../data/universityData";
import { calculateCGPA } from "../lib/calculations";
import { AcademicContext } from "./academicContextInstance";
import {
  loadAcademicState,
  saveAcademicState,
  validateAcademicState,
} from "../lib/storage";

function createSubject(university) {
  return {
    ...DEFAULT_SUBJECT(),
    yearSemester: getDefaultAcademicPeriod(university),
  };
}

function createInitialState() {
  return {
    university: DEFAULT_UNIVERSITY,
    subjects: [
      createSubject(DEFAULT_UNIVERSITY),
      createSubject(DEFAULT_UNIVERSITY),
      createSubject(DEFAULT_UNIVERSITY),
    ],
    previousCGPA: "",
    previousCredits: "",
    targetCGPA: "",
    remainingCredits: "",
    universityProfiles: {},
    theme: "light",
    sidebarCollapsed: false,
    aiInsights: null,
    aiLoading: false,
  };
}

function getCurrentProfile(state) {
  return {
    subjects: state.subjects,
    previousCGPA: state.previousCGPA,
    previousCredits: state.previousCredits,
    targetCGPA: state.targetCGPA,
    remainingCredits: state.remainingCredits,
  };
}

function createEmptyProfile(university) {
  return {
    subjects: [
      createSubject(university),
      createSubject(university),
      createSubject(university),
    ],
    previousCGPA: "",
    previousCredits: "",
    targetCGPA: "",
    remainingCredits: "",
  };
}

function academicReducer(state, action) {
  switch (action.type) {
    case "SET_UNIVERSITY": {
      const nextUniversity = action.payload;

      if (
        !isValidUniversity(nextUniversity) ||
        nextUniversity === state.university
      ) {
        return state;
      }

      const profiles = {
        ...state.universityProfiles,
        [state.university]: getCurrentProfile(state),
      };

      const nextProfile =
        profiles[nextUniversity] ?? createEmptyProfile(nextUniversity);

      return {
        ...state,
        ...nextProfile,
        university: nextUniversity,
        universityProfiles: profiles,
        aiInsights: null,
        aiLoading: false,
      };
    }

    case "SET_SUBJECTS":
      return {
        ...state,
        subjects: action.payload,
      };

    case "ADD_SUBJECT":
      return {
        ...state,
        subjects: [...state.subjects, createSubject(state.university)],
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
        ...state,
        ...createEmptyProfile(state.university),
        aiInsights: null,
        aiLoading: false,
      };

    default:
      return state;
  }
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
