import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GRADE_POINTS } from "../../data/gradeData";

const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
];

const tooltipStyle = {
  background: "var(--gp-surface)",
  border: "1px solid var(--gp-border)",
  borderRadius: 12,
  color: "var(--gp-text)",
  fontSize: 12,
  boxShadow: "var(--gp-shadow-card)",
};

function getValidSubjects(subjects) {
  if (!Array.isArray(subjects)) return [];

  return subjects.filter(
    (subject) =>
      subject?.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );
}

function shortenLabel(value, length = 12) {
  const text = String(value || "");

  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function EmptyChart({
  message = "Add subjects with grades to view analytics.",
}) {
  return (
    <div
      className="flex h-65 items-center justify-center rounded-xl border border-dashed px-5 text-center text-xs sm:text-sm"
      style={{
        borderColor: "var(--gp-border)",
        color: "var(--gp-text-muted)",
      }}
    >
      {message}
    </div>
  );
}

export function GradeDistributionChart({ subjects }) {
  const validSubjects = getValidSubjects(subjects);

  const gradeCount = validSubjects.reduce((result, subject) => {
    return {
      ...result,
      [subject.grade]: (result[subject.grade] || 0) + 1,
    };
  }, {});

  const data = Object.entries(gradeCount)
    .map(([grade, count]) => ({
      grade,
      count,
    }))
    .sort(
      (a, b) => (GRADE_POINTS[b.grade] ?? 0) - (GRADE_POINTS[a.grade] ?? 0),
    );

  if (data.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="h-65 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="grade"
            cx="50%"
            cy="47%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.grade} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value} subjects`, "Count"]}
          />

          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GPATrendChart({ subjects }) {
  const validSubjects = getValidSubjects(subjects);

  const data = validSubjects.reduce(
    (result, subject, index) => {
      const credits = Number(subject.credit);
      const gradePoint = GRADE_POINTS[subject.grade];

      const weightedPoints = result.weightedPoints + gradePoint * credits;

      const accumulatedCredits = result.accumulatedCredits + credits;

      const row = {
        name: `#${index + 1}`,
        subject: subject.name,
        gpa: gradePoint,
        runningGpa: Number((weightedPoints / accumulatedCredits).toFixed(2)),
      };

      return {
        weightedPoints,
        accumulatedCredits,
        rows: [...result.rows, row],
      };
    },
    {
      weightedPoints: 0,
      accumulatedCredits: 0,
      rows: [],
    },
  ).rows;

  if (data.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="h-65 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 15,
            left: -15,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--gp-border)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 11,
              fill: "var(--gp-text-muted)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{
              fontSize: 11,
              fill: "var(--gp-text-muted)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label, payload) =>
              payload?.[0]?.payload?.subject || label
            }
          />

          <Legend wrapperStyle={{ fontSize: 11 }} />

          <Line
            type="monotone"
            dataKey="gpa"
            name="Subject GPA"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3 }}
          />

          <Line
            type="monotone"
            dataKey="runningGpa"
            name="Running GPA"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CreditAnalysisChart({ subjects }) {
  const validSubjects = getValidSubjects(subjects);

  const data = validSubjects.map((subject) => ({
    name: shortenLabel(subject.name),
    fullName: subject.name,
    credits: Number(subject.credit),
  }));

  if (data.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="h-65 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -15,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--gp-border)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 10,
              fill: "var(--gp-text-muted)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            allowDecimals={false}
            tick={{
              fontSize: 11,
              fill: "var(--gp-text-muted)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip contentStyle={tooltipStyle} />

          <Bar
            dataKey="credits"
            name="Credits"
            fill="#4f46e5"
            radius={[5, 5, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YearSemesterChart({ subjects }) {
  const validSubjects = getValidSubjects(subjects);

  const groups = validSubjects.reduce((result, subject) => {
    const period = subject.yearSemester || "Uncategorized";

    const previous = result[period] || {
      weightedPoints: 0,
      credits: 0,
    };

    const credits = Number(subject.credit);

    return {
      ...result,
      [period]: {
        weightedPoints:
          previous.weightedPoints + GRADE_POINTS[subject.grade] * credits,
        credits: previous.credits + credits,
      },
    };
  }, {});

  const data = Object.entries(groups).map(([name, values]) => ({
    name: name
      .replace("1st Year", "Y1")
      .replace("2nd Year", "Y2")
      .replace("3rd Year", "Y3")
      .replace("4th Year", "Y4")
      .replace("1st Semester", "S1")
      .replace("2nd Semester", "S2"),
    fullName: name,
    gpa: Number((values.weightedPoints / values.credits).toFixed(2)),
    credits: values.credits,
  }));

  if (data.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="h-65 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -15,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--gp-border)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 11,
              fill: "var(--gp-text-muted)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{
              fontSize: 11,
              fill: "var(--gp-text-muted)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label, payload) =>
              payload?.[0]?.payload?.fullName || label
            }
            formatter={(value, name, item) => [
              `${Number(value).toFixed(2)} / 4.00 (${item.payload.credits} credits)`,
              name,
            ]}
          />

          <Bar
            dataKey="gpa"
            name="Period GPA"
            fill="#4f46e5"
            radius={[5, 5, 0, 0]}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
