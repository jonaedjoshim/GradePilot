export const GRADE_POINTS = {
  'A+': 4.00,
  'A':  3.75,
  'A-': 3.50,
  'B+': 3.25,
  'B':  3.00,
  'B-': 2.75,
  'C+': 2.50,
  'C':  2.25,
  'D':  2.00,
  'F':  0.00,
};

export const GRADE_MARKS = {
  'A+': '80-100',
  'A':  '75-79',
  'A-': '70-74',
  'B+': '65-69',
  'B':  '60-64',
  'B-': '55-59',
  'C+': '50-54',
  'C':  '45-49',
  'D':  '40-44',
  'F':  'Below 40',
};

export const GRADE_LIST = Object.keys(GRADE_POINTS);

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
export const SEMESTERS = ['1st Semester', '2nd Semester'];

export const YEAR_SEMESTER_OPTIONS = YEARS.flatMap(year =>
  SEMESTERS.map(sem => `${year} - ${sem}`)
);

export const GPA_TO_DIFFICULTY = (required) => {
  if (required <= 3.0) return 'Easy';
  if (required <= 3.5) return 'Moderate';
  if (required <= 3.75) return 'Hard';
  return 'Very Hard';
};

export const DIFFICULTY_COLOR = {
  'Easy': 'text-emerald-600 bg-emerald-50',
  'Moderate': 'text-amber-600 bg-amber-50',
  'Hard': 'text-orange-600 bg-orange-50',
  'Very Hard': 'text-red-600 bg-red-50',
};

export const RISK_COLOR = {
  'Low': { text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  'Medium': { text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
  'High': { text: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' },
};

export const DEFAULT_SUBJECT = () => ({
  id: crypto.randomUUID(),
  name: '',
  credit: 3,
  grade: 'B+',
  yearSemester: '1st Year - 1st Semester',
});
