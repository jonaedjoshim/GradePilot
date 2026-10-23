const GRADE_POINTS = new Set([
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "D",
  "F",
]);

const UNIVERSITY_PERIODS = {
  national: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
  other: Array.from({ length: 12 }, (_, index) => `Semester ${index + 1}`),
};

const PROFILE_FIELDS = [
  "subjects",
  "previousCGPA",
  "previousCredits",
  "targetCGPA",
  "remainingCredits",
];

const MAX_SUBJECTS = 500;

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isValidNumber(value, minimum, maximum = Infinity) {
  if (value === "" || value === null || value === undefined) {
    return true;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }

  if (typeof value === "string" && !value.trim()) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= minimum && number <= maximum;
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return String(Number(value));
}

function validateSubject(subject, university) {
  if (!isPlainObject(subject)) {
    return null;
  }

  if (
    typeof subject.id !== "string" ||
    !subject.id.trim() ||
    subject.id.length > 150
  ) {
    return null;
  }

  if (typeof subject.name !== "string" || subject.name.length > 150) {
    return null;
  }

  if (!isValidNumber(subject.credit, 0, 30)) {
    return null;
  }

  if (
    subject.credit === "" ||
    subject.credit === null ||
    subject.credit === undefined
  ) {
    return null;
  }

  if (!GRADE_POINTS.has(subject.grade)) {
    return null;
  }

  if (!UNIVERSITY_PERIODS[university].includes(subject.yearSemester)) {
    return null;
  }

  return {
    id: subject.id,
    name: subject.name,
    credit: Number(subject.credit),
    grade: subject.grade,
    yearSemester: subject.yearSemester,
  };
}

function validateProfile(profile, university) {
  if (!isPlainObject(profile)) {
    return null;
  }

  if (
    !Array.isArray(profile.subjects) ||
    profile.subjects.length > MAX_SUBJECTS
  ) {
    return null;
  }

  const subjects = [];
  const subjectIds = new Set();

  for (const subject of profile.subjects) {
    const validated = validateSubject(subject, university);

    if (!validated || subjectIds.has(validated.id)) {
      return null;
    }

    subjectIds.add(validated.id);
    subjects.push(validated);
  }

  const numericFields = {
    previousCGPA: [0, 4],
    previousCredits: [0, 10000],
    targetCGPA: [0, 4],
    remainingCredits: [0, 10000],
  };

  const normalized = { subjects };

  for (const [field, [minimum, maximum]] of Object.entries(numericFields)) {
    if (!isValidNumber(profile[field], minimum, maximum)) {
      return null;
    }

    normalized[field] = normalizeNumber(profile[field]);
  }

  return normalized;
}

export function validateAcademicData(data) {
  if (!isPlainObject(data)) {
    return {
      valid: false,
      message: "Academic data must be a valid object",
    };
  }

  const university = data.university;

  if (!Object.hasOwn(UNIVERSITY_PERIODS, university)) {
    return {
      valid: false,
      message: "Invalid university type",
    };
  }

  const currentProfile = validateProfile(data, university);

  if (!currentProfile) {
    return {
      valid: false,
      message: "Invalid academic subjects or profile values",
    };
  }

  const savedProfiles = data.universityProfiles ?? {};

  if (!isPlainObject(savedProfiles)) {
    return {
      valid: false,
      message: "Invalid university profiles",
    };
  }

  const universityProfiles = {};

  for (const profileUniversity of Object.keys(savedProfiles)) {
    if (!Object.hasOwn(UNIVERSITY_PERIODS, profileUniversity)) {
      return {
        valid: false,
        message: "Unsupported university profile",
      };
    }

    const profile = validateProfile(
      savedProfiles[profileUniversity],
      profileUniversity,
    );

    if (!profile) {
      return {
        valid: false,
        message: `Invalid ${profileUniversity} university profile`,
      };
    }

    universityProfiles[profileUniversity] = profile;
  }

  if (
    data.theme !== undefined &&
    data.theme !== "light" &&
    data.theme !== "dark"
  ) {
    return {
      valid: false,
      message: "Invalid theme preference",
    };
  }

  if (
    data.sidebarCollapsed !== undefined &&
    typeof data.sidebarCollapsed !== "boolean"
  ) {
    return {
      valid: false,
      message: "Invalid sidebar preference",
    };
  }

  const normalized = {
    university,
    ...currentProfile,
    universityProfiles,
    theme: data.theme === "dark" ? "dark" : "light",
    sidebarCollapsed: data.sidebarCollapsed === true,
  };

  return {
    valid: true,
    data: normalized,
  };
}

export function getAcademicProfileFields() {
  return [...PROFILE_FIELDS];
}
