import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { GRADE_POINTS } from "../data/gradeData";

const COLORS = {
  primary: [79, 70, 229],
  primaryLight: [238, 242, 255],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  border: [226, 232, 240],
  surface: [248, 250, 252],
  white: [255, 255, 255],
  success: [16, 185, 129],
  danger: [239, 68, 68],
};

const PAGE = {
  width: 210,
  height: 297,
  margin: 16,
  contentWidth: 178,
  footerStart: 279,
};

function setColor(doc, color, type = "text") {
  if (type === "fill") {
    doc.setFillColor(...color);
  } else if (type === "draw") {
    doc.setDrawColor(...color);
  } else {
    doc.setTextColor(...color);
  }
}

function formatNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function getValidSubjects(subjects) {
  if (!Array.isArray(subjects)) return [];

  return subjects.filter(
    (subject) =>
      typeof subject?.name === "string" &&
      subject.name.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );
}

function getGroupedSubjects(subjects) {
  const groups = new Map();

  for (const subject of subjects) {
    const period = subject.yearSemester || "Other Subjects";

    if (!groups.has(period)) {
      groups.set(period, []);
    }

    groups.get(period).push(subject);
  }

  return [...groups.entries()].sort(([first], [second]) =>
    first.localeCompare(second, undefined, { numeric: true }),
  );
}

function getGroupStats(subjects) {
  const credits = subjects.reduce(
    (total, subject) => total + Number(subject.credit),
    0,
  );

  const weightedPoints = subjects.reduce(
    (total, subject) =>
      total + GRADE_POINTS[subject.grade] * Number(subject.credit),
    0,
  );

  return {
    credits,
    gpa: credits > 0 ? weightedPoints / credits : 0,
  };
}

function drawPageHeader(doc, subtitle = "Academic Performance Report") {
  setColor(doc, COLORS.primary, "fill");
  doc.rect(0, 0, PAGE.width, 39, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  setColor(doc, COLORS.white);
  doc.text("GradePilot", PAGE.margin, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(subtitle, PAGE.margin, 25);

  doc.setFontSize(8);
  doc.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    PAGE.margin,
    32,
  );
}

function addPage(doc) {
  doc.addPage();
  drawPageHeader(doc);

  return 48;
}

function ensureSpace(doc, y, requiredHeight) {
  if (y + requiredHeight > PAGE.footerStart - 7) {
    return addPage(doc);
  }

  return y;
}

function drawSummary(doc, cgpa, totalCredits, subjects, y) {
  const passed = subjects.filter((subject) => subject.grade !== "F").length;

  setColor(doc, COLORS.primaryLight, "fill");
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 31, 3, 3, "F");

  const metrics = [
    {
      label: "Current CGPA",
      value: formatNumber(cgpa),
    },
    {
      label: "Total Credits",
      value: String(totalCredits),
    },
    {
      label: "Subjects",
      value: String(subjects.length),
    },
    {
      label: "Passed",
      value: String(passed),
    },
  ];

  const columnWidth = PAGE.contentWidth / metrics.length;

  metrics.forEach((metric, index) => {
    const x = PAGE.margin + columnWidth * index + columnWidth / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    setColor(doc, COLORS.primary);
    doc.text(metric.value, x, y + 14, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(doc, COLORS.muted);
    doc.text(metric.label, x, y + 23, { align: "center" });
  });

  return y + 42;
}

function drawSectionTitle(doc, title, y) {
  y = ensureSpace(doc, y, 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, COLORS.text);
  doc.text(title, PAGE.margin, y + 5);

  return y + 12;
}

function drawTableHeader(doc, y) {
  setColor(doc, COLORS.primaryLight, "fill");
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setColor(doc, COLORS.primary);

  doc.text("Subject", PAGE.margin + 4, y + 6);
  doc.text("Credits", 123, y + 6);
  doc.text("Grade", 149, y + 6);
  doc.text("Points", 174, y + 6);

  return y + 9;
}

function drawSubjectRow(doc, subject, index, y) {
  const name = subject.name.trim();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const nameLines = doc.splitTextToSize(name, 98);
  const visibleLines = nameLines.slice(0, 2);

  const rowHeight = Math.max(9, visibleLines.length * 4.5 + 3);

  if (index % 2 === 0) {
    setColor(doc, COLORS.surface, "fill");
    doc.rect(PAGE.margin, y, PAGE.contentWidth, rowHeight, "F");
  }

  setColor(doc, COLORS.text);

  doc.text(visibleLines, PAGE.margin + 4, y + 5.5);
  doc.text(String(subject.credit), 123, y + 5.5);
  doc.text(subject.grade, 149, y + 5.5);
  doc.text(formatNumber(GRADE_POINTS[subject.grade]), 174, y + 5.5);

  return y + rowHeight;
}

function drawSubjectGroups(doc, subjects, y) {
  const groups = getGroupedSubjects(subjects);

  for (const [period, periodSubjects] of groups) {
    y = ensureSpace(doc, y, 24);

    const stats = getGroupStats(periodSubjects);

    setColor(doc, COLORS.primary, "fill");
    doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 10, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, COLORS.white);

    const periodName = doc.splitTextToSize(period, 95)[0];

    doc.text(periodName, PAGE.margin + 4, y + 6.5);

    doc.setFontSize(8);
    doc.text(
      `GPA ${formatNumber(stats.gpa)}  |  ${stats.credits} Credits`,
      PAGE.width - PAGE.margin - 4,
      y + 6.5,
      { align: "right" },
    );

    y += 12;
    y = drawTableHeader(doc, y);

    periodSubjects.forEach((subject, index) => {
      const estimatedHeight = subject.name.length > 45 ? 13 : 9;

      if (y + estimatedHeight > PAGE.footerStart - 7) {
        y = addPage(doc);
        y = drawTableHeader(doc, y);
      }

      y = drawSubjectRow(doc, subject, index, y);
    });

    y += 9;
  }

  return y;
}

function drawInsights(doc, insights, y) {
  if (!insights || typeof insights !== "object") {
    return y;
  }

  y = drawSectionTitle(doc, "Academic Insights", y);

  const details = [
    ["Risk Level", insights.riskLevel],
    ["Academic Status", insights.status],
    ["Required GPA", insights.requiredGPA],
  ].filter(([, value]) => value !== undefined && value !== null);

  doc.setFontSize(8.5);

  for (const [label, value] of details) {
    y = ensureSpace(doc, y, 8);

    doc.setFont("helvetica", "bold");
    setColor(doc, COLORS.text);
    doc.text(`${label}:`, PAGE.margin, y);

    doc.setFont("helvetica", "normal");
    setColor(doc, COLORS.muted);
    doc.text(String(value), PAGE.margin + 34, y);

    y += 7;
  }

  if (typeof insights.verdict === "string" && insights.verdict.trim()) {
    y += 3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const lines = doc.splitTextToSize(insights.verdict, PAGE.contentWidth);

    for (const line of lines) {
      y = ensureSpace(doc, y, 6);
      setColor(doc, COLORS.text);
      doc.text(line, PAGE.margin, y);
      y += 5;
    }

    y += 5;
  }

  if (Array.isArray(insights.suggestions) && insights.suggestions.length) {
    y = drawSectionTitle(doc, "Academic Suggestions", y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    for (const suggestion of insights.suggestions.slice(0, 10)) {
      const lines = doc.splitTextToSize(
        `- ${String(suggestion)}`,
        PAGE.contentWidth - 5,
      );

      for (const line of lines) {
        y = ensureSpace(doc, y, 6);
        setColor(doc, COLORS.text);
        doc.text(line, PAGE.margin + 2, y);
        y += 5;
      }

      y += 3;
    }
  }

  return y;
}

function drawFooter(doc) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    setColor(doc, COLORS.border, "draw");
    doc.line(
      PAGE.margin,
      PAGE.footerStart,
      PAGE.width - PAGE.margin,
      PAGE.footerStart,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(doc, COLORS.muted);

    doc.text(
      "Generated by GradePilot | Academic Performance Report",
      PAGE.margin,
      286,
    );

    doc.text(`${page} / ${pageCount}`, PAGE.width - PAGE.margin, 286, {
      align: "right",
    });
  }
}

export async function exportToPDF({
  cgpa,
  totalCredits,
  subjects,
  aiInsights,
}) {
  const validSubjects = getValidSubjects(subjects);

  if (!validSubjects.length && Number(totalCredits) <= 0) {
    throw new Error("No academic results available for export");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawPageHeader(doc);

  let y = 49;

  y = drawSummary(doc, cgpa, totalCredits, validSubjects, y);

  if (validSubjects.length) {
    y = drawSectionTitle(doc, "Subject Performance", y);
    y = drawSubjectGroups(doc, validSubjects, y);
  }

  y = drawInsights(doc, aiInsights, y);

  y = ensureSpace(doc, y + 5, 18);

  setColor(doc, COLORS.primaryLight, "fill");

  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 18, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);

  doc.text(
    "This report is a calculation-based academic summary.",
    PAGE.margin + 5,
    y + 7,
  );

  doc.text(
    "It is not an official university transcript or result certificate.",
    PAGE.margin + 5,
    y + 13,
  );

  drawFooter(doc);

  doc.save(`GradePilot_Report_${Date.now()}.pdf`);
}

export async function exportToImage() {
  const element = document.getElementById("gradepilot-export-root");

  if (!element) {
    throw new Error("Academic result container not found");
  }

  const computedStyle = getComputedStyle(document.documentElement);

  const backgroundColor =
    computedStyle.getPropertyValue("--gp-bg").trim() || "#f8fafc";

  const canvas = await html2canvas(element, {
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    useCORS: true,
    allowTaint: false,
    backgroundColor,
    logging: false,
    imageTimeout: 5000,
    removeContainer: true,
    foreignObjectRendering: false,
    onclone: (clonedDocument) => {
      const sourceRoot = document.documentElement;
      const clonedRoot = clonedDocument.documentElement;

      const variables = [
        "--gp-bg",
        "--gp-surface",
        "--gp-surface-2",
        "--gp-border",
        "--gp-border-strong",
        "--gp-text",
        "--gp-text-secondary",
        "--gp-text-muted",
        "--gp-primary",
        "--gp-primary-bg",
        "--gp-success",
        "--gp-success-bg",
        "--gp-warning",
        "--gp-warning-bg",
        "--gp-danger",
        "--gp-danger-bg",
      ];

      const sourceStyles = getComputedStyle(sourceRoot);

      for (const variable of variables) {
        clonedRoot.style.setProperty(
          variable,
          sourceStyles.getPropertyValue(variable),
        );
      }

      clonedRoot.setAttribute(
        "data-theme",
        sourceRoot.getAttribute("data-theme") || "light",
      );
    },
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to generate PNG image"));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `GradePilot_Result_${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      resolve();
    }, "image/png");
  });
}
