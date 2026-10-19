import { memo } from "react";
import { Trash2 } from "lucide-react";
import { GRADE_LIST, GRADE_POINTS } from "../../data/gradeData";
import { getAcademicPeriods } from "../../data/universityData";

function SubjectRow({
  subject,
  index,
  university,
  onUpdate,
  onRemove,
  canRemove = true,
}) {
  const periods = getAcademicPeriods(university);
  const inputId = `subject-${subject.id}`;

  const handleChange = (field) => (event) => {
    const value =
      field === "credit" ? Number(event.target.value) : event.target.value;

    onUpdate(subject.id, { [field]: value });
  };

  return (
    <div
      className="min-w-0 rounded-xl border p-3 sm:p-4"
      style={{
        background: "var(--gp-surface)",
        borderColor: "var(--gp-border)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
            style={{
              background: "var(--gp-surface-2)",
              color: "var(--gp-text-muted)",
            }}
          >
            {index + 1}
          </span>

          <span
            className="text-xs font-semibold"
            style={{ color: "var(--gp-text-secondary)" }}
          >
            Subject {index + 1}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(subject.id)}
          disabled={!canRemove}
          aria-label={`Remove subject ${index + 1}`}
          title="Remove subject"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-(--gp-danger-bg) disabled:opacity-30"
          style={{ color: "var(--gp-danger)" }}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_90px_140px_minmax(0,1fr)]">
        <div className="min-w-0">
          <label htmlFor={`${inputId}-name`} className="gp-label">
            Subject Name
          </label>

          <input
            id={`${inputId}-name`}
            type="text"
            value={subject.name ?? ""}
            onChange={handleChange("name")}
            placeholder="e.g. Mathematics"
            autoComplete="off"
            maxLength={150}
            className="gp-input"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor={`${inputId}-credit`} className="gp-label">
            Credits
          </label>

          <input
            id={`${inputId}-credit`}
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={subject.credit ?? ""}
            onChange={handleChange("credit")}
            className="gp-input"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor={`${inputId}-grade`} className="gp-label">
            Grade
          </label>

          <select
            id={`${inputId}-grade`}
            value={subject.grade}
            onChange={handleChange("grade")}
            className="gp-input cursor-pointer"
          >
            {GRADE_LIST.map((grade) => (
              <option key={grade} value={grade}>
                {grade} · {GRADE_POINTS[grade].toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor={`${inputId}-period`} className="gp-label">
            {university === "national" ? "Academic Year" : "Semester"}
          </label>

          <select
            id={`${inputId}-period`}
            value={subject.yearSemester}
            onChange={handleChange("yearSemester")}
            className="gp-input cursor-pointer"
          >
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default memo(SubjectRow);
