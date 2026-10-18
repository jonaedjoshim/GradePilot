export const UNIVERSITY_TYPES = {
  NATIONAL: "national",
  OTHER: "other",
};

export const UNIVERSITY_OPTIONS = [
  {
    value: UNIVERSITY_TYPES.NATIONAL,
    label: "National University",
    shortLabel: "NU",
    description: "Year-wise academic system",
    academicSystem: "year",
  },
  {
    value: UNIVERSITY_TYPES.OTHER,
    label: "Other Universities",
    shortLabel: "Other",
    description: "Semester-wise academic system",
    academicSystem: "semester",
  },
];

export const NATIONAL_UNIVERSITY_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

export const UNIVERSITY_SEMESTERS = Array.from(
  { length: 12 },
  (_, index) => `Semester ${index + 1}`,
);

export const DEFAULT_UNIVERSITY = UNIVERSITY_TYPES.NATIONAL;

export const DEFAULT_GRADING_SCALE = 4;

export function getUniversityConfig(type) {
  return (
    UNIVERSITY_OPTIONS.find((option) => option.value === type) ??
    UNIVERSITY_OPTIONS[0]
  );
}

export function getAcademicPeriods(type) {
  return type === UNIVERSITY_TYPES.OTHER
    ? UNIVERSITY_SEMESTERS
    : NATIONAL_UNIVERSITY_YEARS;
}

export function getDefaultAcademicPeriod(type) {
  return getAcademicPeriods(type)[0];
}

export function isValidUniversity(type) {
  return UNIVERSITY_OPTIONS.some((option) => option.value === type);
}
