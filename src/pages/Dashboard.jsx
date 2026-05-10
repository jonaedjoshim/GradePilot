import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import StatCard from '../components/ui/StatCard';
import { GRADE_POINTS } from '../data/gradeData';

export default function Dashboard() {
  const { state, computed } = useAcademic();

  const { cgpa, totalCredits } = computed;
  const { subjects } = state;

  const validSubjects = Array.isArray(subjects)
    ? subjects.filter(s => s?.name && s?.grade)
    : [];

  const avgGpa =
    validSubjects.length > 0
      ? validSubjects.reduce(
        (acc, s) => acc + (GRADE_POINTS?.[s.grade] ?? 0),
        0
      ) / validSubjects.length
      : 0;

  return (
    // BUG FIX: was grid-cols-2 md:grid-cols-4, on small screens 2-col was too cramped
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={<GraduationCap size={22} />}
        label="Current CGPA"
        value={cgpa}
        decimals={2}
        color="#4f46e5"
        bg="#eef2ff"
        delay={0}
      />
      <StatCard
        icon={<BookOpen size={22} />}
        label="Total Credits"
        value={totalCredits}
        color="#10b981"
        bg="#ecfdf5"
        delay={0.05}
      />
      <StatCard
        icon={<Target size={22} />}
        label="Subjects"
        value={validSubjects.length}
        color="#f59e0b"
        bg="#fffbeb"
        delay={0.1}
      />
      <StatCard
        icon={<TrendingUp size={22} />}
        label="Avg GPA"
        value={avgGpa}
        decimals={2}
        color="#8b5cf6"
        bg="#f3e8ff"
        delay={0.15}
      />
    </div>
  );
}
