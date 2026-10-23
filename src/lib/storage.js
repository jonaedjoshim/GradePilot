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

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidNumber(value, min, max = Infinity) {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    typeof value === "boolean"
  ) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max;
}

function normalizeNumber(value, min, max = Infinity) {
  if (!isValidNumber(value, min, max)) {
    return "";
  }

  return String(Number(value));
}

function normalizePeriod(value, university) {
  const periods = getAcademicPeriods(university);

  if (periods.includes(value)) {
    return value;
  }

  if (university === UNIVERSITY_TYPES.NATIONAL && typeof value === "string") {
    const matchingYear = periods.find((period) =>
      value.startsWith(`${period} -`),
    );

    if (matchingYear) {
      return matchingYear;
    }
  }

  return getDefaultAcademicPeriod(university);
}

function createSubjectId() {
  return crypto.randomUUID();
}

function normalizeSubject(subject, university) {
  if (!isPlainObject(subject)) {
    return null;
  }

  const credit = Number(subject.credit);

  const validCredit =
    subject.credit !== null &&
    subject.credit !== undefined &&
    subject.credit !== "" &&
    typeof subject.credit !== "boolean" &&
    Number.isFinite(credit) &&
    credit >= 0 &&
    credit <= 30;

  return {
    id:
      typeof subject.id === "string" && subject.id.trim()
        ? subject.id
        : createSubjectId(),

    name: typeof subject.name === "string" ? subject.name.slice(0, 150) : "",

    credit: validCredit ? credit : 3,

    grade: Object.hasOwn(GRADE_POINTS, subject.grade) ? subject.grade : "B+",

    yearSemester: normalizePeriod(subject.yearSemester, university),
  };
}

export function normalizeSubjects(subjects, university = DEFAULT_UNIVERSITY) {
  if (!Array.isArray(subjects)) {
    return [];
  }

  const normalizedSubjects = [];
  const seenIds = new Set();

  for (const subject of subjects) {
    const normalized = normalizeSubject(subject, university);

    if (!normalized) {
      continue;
    }

    if (seenIds.has(normalized.id)) {
      normalized.id = createSubjectId();
    }

    seenIds.add(normalized.id);
    normalizedSubjects.push(normalized);
  }

  return normalizedSubjects;
}

function getDefaultProfile() {
  return {
    subjects: [],
    previousCGPA: "",
    previousCredits: "",
    targetCGPA: "",
    remainingCredits: "",
  };
}

function normalizeProfile(profile, university, defaults) {
  if (!isPlainObject(profile)) {
    return defaults;
  }

  const fallback = defaults ?? getDefaultProfile();

  return {
    subjects: Array.isArray(profile.subjects)
      ? normalizeSubjects(profile.subjects, university)
      : fallback.subjects,

    previousCGPA: normalizeNumber(profile.previousCGPA, 0, 4),

    previousCredits: normalizeNumber(profile.previousCredits, 0),

    targetCGPA: normalizeNumber(profile.targetCGPA, 0, 4),

    remainingCredits: normalizeNumber(profile.remainingCredits, 0),
  };
}

function normalizeUniversityProfiles(savedProfiles) {
  if (!isPlainObject(savedProfiles)) {
    return {};
  }

  const profiles = {};

  for (const university of Object.values(UNIVERSITY_TYPES)) {
    if (!isPlainObject(savedProfiles[university])) {
      continue;
    }

    profiles[university] = normalizeProfile(
      savedProfiles[university],
      university,
      getDefaultProfile(),
    );
  }

  return profiles;
}

export function validateAcademicState(data, defaults) {
  if (!isPlainObject(data)) {
    return defaults;
  }

  const university = isValidUniversity(data.university)
    ? data.university
    : DEFAULT_UNIVERSITY;

  const defaultProfile = {
    subjects: defaults.subjects,
    previousCGPA: defaults.previousCGPA,
    previousCredits: defaults.previousCredits,
    targetCGPA: defaults.targetCGPA,
    remainingCredits: defaults.remainingCredits,
  };

  const currentProfile = normalizeProfile(data, university, defaultProfile);

  return {
    ...defaults,
    ...currentProfile,

    university,

    universityProfiles: normalizeUniversityProfiles(data.universityProfiles),

    theme:
      data.theme === "light" || data.theme === "dark"
        ? data.theme
        : defaults.theme,

    sidebarCollapsed:
      typeof data.sidebarCollapsed === "boolean"
        ? data.sidebarCollapsed
        : defaults.sidebarCollapsed,

    aiInsights: null,
    aiLoading: false,
  };
}

export function getAcademicStorageKey(userId = null) {
  return userId ? `gradepilot_user_${encodeURIComponent(userId)}` : STORAGE_KEY;
}

export function hasSavedAcademicState(userId = null) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(getAcademicStorageKey(userId)) !== null;
  } catch {
    return false;
  }
}

export function loadAcademicState(defaults, userId = null) {
  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const saved = window.localStorage.getItem(getAcademicStorageKey(userId));

    if (!saved) {
      return defaults;
    }

    return validateAcademicState(JSON.parse(saved), defaults);
  } catch (error) {
    console.warn("Unable to load saved academic data:", error);

    return defaults;
  }
}

export function saveAcademicState(state, userId = null) {
  if (typeof window === "undefined" || !isPlainObject(state)) {
    return false;
  }

  try {
    const data = {};

    for (const field of PERSISTED_FIELDS) {
      data[field] = state[field];
    }

    data.storageVersion = STORAGE_VERSION;

    window.localStorage.setItem(
      getAcademicStorageKey(userId),
      JSON.stringify(data),
    );

    return true;
  } catch (error) {
    console.warn("Unable to save academic data:", error);

    return false;
  }
}

export function clearAcademicState(userId = null) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(getAcademicStorageKey(userId));

    return true;
  } catch {
    return false;
  }
}
