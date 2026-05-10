import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { GRADE_POINTS } from '../../data/gradeData';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16'];

export function GradeDistributionChart({ subjects }) {
  const gradeCount = {};
  subjects.filter(s => s.name && s.grade).forEach(s => {
    gradeCount[s.grade] = (gradeCount[s.grade] || 0) + 1;
  });
  const data = Object.entries(gradeCount).map(([grade, count]) => ({ grade, count }));

  if (data.length === 0) return <EmptyChart />;

  return (
    // BUG FIX: charts were overflowing on mobile — wrap in overflow-hidden container
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={75} label={({ grade }) => grade}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(val, name) => [`${val} subject(s)`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GPATrendChart({ subjects }) {
  const valid = subjects.filter(s => s.name && s.grade && s.credit > 0);
  let cumSum = 0, cumCredits = 0;
  const data = valid.map((s) => {
    const pts = GRADE_POINTS[s.grade] || 0;
    cumSum += pts * s.credit;
    cumCredits += Number(s.credit);
    return {
      name: s.name.length > 8 ? s.name.slice(0, 8) + '…' : s.name,
      gpa: pts,
      cgpa: parseFloat((cumSum / cumCredits).toFixed(2)),
    };
  });

  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gp-border)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--gp-text-muted)' }} />
        <YAxis domain={[0, 4]} tick={{ fontSize: 10, fill: 'var(--gp-text-muted)' }} />
        <Tooltip contentStyle={{ background: 'var(--gp-surface)', border: '1px solid var(--gp-border)', borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="gpa" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} name="Subject GPA" />
        <Line type="monotone" dataKey="cgpa" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="Running CGPA" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CreditAnalysisChart({ subjects }) {
  const valid = subjects.filter(s => s.name && s.credit > 0);
  const data = valid.map(s => ({
    name: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
    credits: Number(s.credit),
    gpa: GRADE_POINTS[s.grade] || 0,
  }));

  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gp-border)" />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--gp-text-muted)' }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--gp-text-muted)' }} />
        <Tooltip contentStyle={{ background: 'var(--gp-surface)', border: '1px solid var(--gp-border)', borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="credits" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Credits" />
        <Bar dataKey="gpa" fill="#10b981" radius={[4, 4, 0, 0]} name="GPA" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="h-52 flex items-center justify-center text-sm" style={{ color: 'var(--gp-text-muted)' }}>
      Add subjects with grades to see chart
    </div>
  );
}

export function YearSemesterChart({ subjects }) {
  const groupMap = {};
  subjects.filter(s => s.name && s.grade && s.credit > 0).forEach(s => {
    const key = s.yearSemester || 'Uncategorized';
    if (!groupMap[key]) groupMap[key] = { ws: 0, tc: 0 };
    groupMap[key].ws += (GRADE_POINTS[s.grade] || 0) * s.credit;
    groupMap[key].tc += Number(s.credit);
  });
  const data = Object.entries(groupMap).map(([name, { ws, tc }]) => ({
    name: name.replace('1st Year', 'Y1').replace('2nd Year', 'Y2').replace('3rd Year', 'Y3').replace('4th Year', 'Y4')
              .replace('1st Semester', 'S1').replace('2nd Semester', 'S2'),
    gpa: tc ? parseFloat((ws / tc).toFixed(2)) : 0,
    credits: tc,
  }));
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gp-border)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--gp-text-muted)' }} />
        <YAxis domain={[0, 4]} tick={{ fontSize: 10, fill: 'var(--gp-text-muted)' }} />
        <Tooltip contentStyle={{ background: 'var(--gp-surface)', border: '1px solid var(--gp-border)', borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="gpa" fill="#4f46e5" radius={[4, 4, 0, 0]} name="GPA" />
        <Bar dataKey="credits" fill="#10b981" radius={[4, 4, 0, 0]} name="Credits" />
      </BarChart>
    </ResponsiveContainer>
  );
}
