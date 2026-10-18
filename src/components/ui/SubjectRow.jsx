import { memo } from "react";
import { Trash2 } from "lucide-react";
import { GRADE_LIST, GRADE_MARKS } from "../../data/gradeData";

function SubjectRow({ subject, index, onUpdate, onRemove, canRemove = true }) {
  const handleChange = (field) => (event) => {
    const value =
      field === "credit" ? Number(event.target.value) : event.target.value;

    onUpdate(subject.id, { [field]: value });
  };

  const inputId = `subject-${subject.id}`;

  return (
    <div
      className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-[32px_minmax(0,1fr)_88px_112px_36px] sm:items-center sm:gap-2 sm:border-transparent sm:px-2 sm:py-2"
      style={{
        background: "var(--gp-surface)",
        borderColor: "var(--gp-border)",
      }}
    >
      <div className="flex items-center justify-between sm:justify-center">
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
          className="text-[11px] font-medium sm:hidden"
          style={{ color: "var(--gp-text-muted)" }}
        >
          Subject {index + 1}
        </span>
      </div>

      <div className="min-w-0">
        <label htmlFor={`${inputId}-name`} className="gp-label sm:sr-only">
          Subject Name
        </label>

        <input
          id={`${inputId}-name`}
          type="text"
          value={subject.name ?? ""}
          onChange={handleChange("name")}
          placeholder="e.g. Mathematics"
          className="gp-input"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:contents">
        <div className="min-w-0">
          <label htmlFor={`${inputId}-credit`} className="gp-label sm:sr-only">
            Credits
          </label>

          <input
            id={`${inputId}-credit`}
            type="number"
            min="0"
            max="10"
            step="0.5"
            value={subject.credit ?? ""}
            onChange={handleChange("credit")}
            className="gp-input text-center"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor={`${inputId}-grade`} className="gp-label sm:sr-only">
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
                {grade} ({GRADE_MARKS[grade]})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end sm:justify-center">
        <button
          type="button"
          onClick={() => onRemove(subject.id)}
          disabled={!canRemove}
          aria-label={`Remove subject ${index + 1}`}
          title="Remove subject"
          className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-(--gp-danger-bg) disabled:opacity-30"
          style={{ color: "var(--gp-danger)" }}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

export default memo(SubjectRow);
