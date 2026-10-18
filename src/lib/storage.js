import { GRADE_POINTS } from "../data/gradeData.js";
import {
  DEFAULT_UNIVERSITY,
  UNIVERSITY_TYPES,
  getAcademicPeriods,
  getDefaultAcademicPeriod,
  isValidUniversity,
} from "../data/universityData.js";

const STORAGE_KEY = "gradepilot_state";
const STORAGE_VERSION = 2;

const PROFILE_FIELDS = [
  "subjects",
  "previousCGPA",
  "previousCredits",
  "targetCGPA",
  "remainingCredits",
];

const PERSISTED_FIELDS = [
  ...PROFILE_FIELDS,
  "university",
  "universityProfiles",
  "theme",
  "sidebarCollapsed",
];

function isValidNumber(value, min, max = Infinity) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max;
}

function normalizeNumber(value, min, max = Infinity) {
  return isValidNumber(value, min, max) ? String(value) : "";
}

function normalizePeriod(value, university) {
  const periods = getAcademicPeriods(university);

  if (periods.includes(value)) {
    return value;
  }

  if (university === UNIVERSITY_TYPES.NATIONAL) {
    const year = periods.find((period) =>
      String(value ?? "").startsWith(period),
    );

    if (year) {
      return year;
    }
  }

  return getDefaultAcademicPeriod(university);
}

function normalizeSubject(subject, university) {
  if (!subject || typeof subject !== "object" || Array.isArray(subject)) {
    return null;
  }

  const credit = Number(subject.credit);

  return {
    id:
      typeof subject.id === "string" && subject.id.trim()
        ? subject.id
        : crypto.randomUUID(),

    name: typeof subject.name === "string" ? subject.name.slice(0, 150) : "",

    credit: Number.isFinite(credit) && credit >= 0 && credit <= 30 ? credit : 3,

    grade: Object.hasOwn(GRADE_POINTS, subject.grade) ? subject.grade : "B+",

    yearSemester: normalizePeriod(subject.yearSemester, university),
  };
}

export function normalizeSubjects(subjects, university = DEFAULT_UNIVERSITY) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  const seenIds = new Set();

  return subjects.reduce((result, subject) => {
    const normalized = normalizeSubject(subject, university);

    if (!normalized) {
      return result;
    }

    if (seenIds.has(normalized.id)) {
      normalized.id = crypto.randomUUID();
    }

    seenIds.add(normalized.id);

    return [...result, normalized];
  }, []);
}

function normalizeProfile(profile, university, defaults) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return defaults;
  }

  return {
    subjects: Array.isArray(profile.subjects)
      ? normalizeSubjects(profile.subjects, university)
      : defaults.subjects,

    previousCGPA: normalizeNumber(profile.previousCGPA, 0, 4),

    previousCredits: normalizeNumber(profile.previousCredits, 0),

    targetCGPA: normalizeNumber(profile.targetCGPA, 0, 4),

    remainingCredits: normalizeNumber(profile.remainingCredits, 0),
  };
}

function getDefaultProfile(university) {
  return {
    subjects: [],
    previousCGPA: "",
    previousCredits: "",
    targetCGPA: "",
    remainingCredits: "",
    university,
  };
}

export function validateAcademicState(data, defaults) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return defaults;
  }

  const university = isValidUniversity(data.university)
    ? data.university
    : DEFAULT_UNIVERSITY;

  const currentProfile = normalizeProfile(data, university, defaults);

  const savedProfiles =
    data.universityProfiles &&
    typeof data.universityProfiles === "object" &&
    !Array.isArray(data.universityProfiles)
      ? data.universityProfiles
      : {};

  const universityProfiles = {};

  for (const type of Object.values(UNIVERSITY_TYPES)) {
    if (savedProfiles[type]) {
      universityProfiles[type] = normalizeProfile(
        savedProfiles[type],
        type,
        getDefaultProfile(type),
      );
    }
  }

  return {
    ...defaults,
    ...currentProfile,
    university,
    universityProfiles,

    theme: ["light", "dark"].includes(data.theme) ? data.theme : defaults.theme,

    sidebarCollapsed:
      typeof data.sidebarCollapsed === "boolean"
        ? data.sidebarCollapsed
        : defaults.sidebarCollapsed,

    aiInsights: null,
    aiLoading: false,
  };
}

export function loadAcademicState(defaults) {
  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaults;
    }

    const parsed = JSON.parse(saved);

    return validateAcademicState(parsed, defaults);
  } catch (error) {
    console.warn("Unable to load saved academic data:", error);

    return defaults;
  }
}

export function saveAcademicState(state) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const data = {};

    for (const field of PERSISTED_FIELDS) {
      data[field] = state[field];
    }

    data.storageVersion = STORAGE_VERSION;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return true;
  } catch (error) {
    console.warn("Unable to save academic data:", error);

    return false;
  }
}

export function clearAcademicState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
