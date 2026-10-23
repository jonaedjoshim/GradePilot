import { jsPDF } from "jspdf";
import { GRADE_POINTS } from "../data/gradeData";

const COLORS = {
  primary: [79, 70, 229],
  primaryLight: [238, 242, 255],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  border: [226, 232, 240],
  surface: [248, 250, 252],
  white: [255, 255, 255],
};

const PAGE = {
  width: 210,
  height: 297,
  margin: 16,
  contentWidth: 178,
  footerStart: 279,
};

const IMAGE = {
  width: 1200,
  margin: 60,
  headerHeight: 210,
  summaryTop: 250,
  summaryHeight: 160,
  contentTop: 465,
  footerHeight: 145,
  rowMinHeight: 70,
  rowLineHeight: 27,
  rowPadding: 22,
  subjectWidth: 640,
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

    if (!groups.has(period)) groups.set(period, []);

    groups.get(period).push(subject);
  }

  return [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
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
  return y + requiredHeight > PAGE.footerStart - 7 ? addPage(doc) : y;
}

function drawSummary(doc, cgpa, totalCredits, subjects, y) {
  const passed = subjects.filter((subject) => subject.grade !== "F").length;

  setColor(doc, COLORS.primaryLight, "fill");
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 31, 3, 3, "F");

  const metrics = [
    ["Current CGPA", formatNumber(cgpa)],
    ["Total Credits", String(totalCredits)],
    ["Subjects", String(subjects.length)],
    ["Passed", String(passed)],
  ];

  const columnWidth = PAGE.contentWidth / metrics.length;

  metrics.forEach(([label, value], index) => {
    const x = PAGE.margin + columnWidth * index + columnWidth / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    setColor(doc, COLORS.primary);
    doc.text(value, x, y + 14, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(doc, COLORS.muted);
    doc.text(label, x, y + 23, { align: "center" });
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
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const lines = doc.splitTextToSize(subject.name.trim(), 98).slice(0, 2);
  const rowHeight = Math.max(9, lines.length * 4.5 + 3);

  if (index % 2 === 0) {
    setColor(doc, COLORS.surface, "fill");
    doc.rect(PAGE.margin, y, PAGE.contentWidth, rowHeight, "F");
  }

  setColor(doc, COLORS.text);
  doc.text(lines, PAGE.margin + 4, y + 5.5);
  doc.text(String(subject.credit), 123, y + 5.5);
  doc.text(subject.grade, 149, y + 5.5);
  doc.text(formatNumber(GRADE_POINTS[subject.grade]), 174, y + 5.5);

  return y + rowHeight;
}

function drawSubjectGroups(doc, subjects, y) {
  for (const [period, periodSubjects] of getGroupedSubjects(subjects)) {
    y = ensureSpace(doc, y, 24);

    const stats = getGroupStats(periodSubjects);

    setColor(doc, COLORS.primary, "fill");
    doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 10, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, COLORS.white);
    doc.text(doc.splitTextToSize(period, 95)[0], PAGE.margin + 4, y + 6.5);

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
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(subject.name.trim(), 98).slice(0, 2);
      const rowHeight = Math.max(9, lines.length * 4.5 + 3);

      if (y + rowHeight > PAGE.footerStart - 7) {
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
  if (!insights || typeof insights !== "object") return y;

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

    for (const line of doc.splitTextToSize(
      insights.verdict,
      PAGE.contentWidth,
    )) {
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

  let y = drawSummary(doc, cgpa, totalCredits, validSubjects, 49);

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

function drawRoundedRect(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function drawCanvasText(ctx, text, x, y, options = {}) {
  const {
    size = 24,
    color = "#1e293b",
    weight = 400,
    align = "left",
  } = options;

  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(String(text), x, y);
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
      line = "";
    }

    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }

    let segment = "";

    for (const character of word) {
      if (segment && ctx.measureText(segment + character).width > maxWidth) {
        lines.push(segment);
        segment = character;
      } else {
        segment += character;
      }
    }

    line = segment;
  }

  if (line) lines.push(line);

  return lines.length ? lines : [""];
}

function prepareImageGroups(ctx, subjects) {
  return getGroupedSubjects(subjects).map(([period, periodSubjects]) => {
    const rows = periodSubjects.map((subject) => {
      ctx.font = "400 20px Inter, Arial, sans-serif";

      const lines = wrapCanvasText(
        ctx,
        subject.name.trim(),
        IMAGE.subjectWidth,
      );

      return {
        subject,
        lines,
        height: Math.max(
          IMAGE.rowMinHeight,
          lines.length * IMAGE.rowLineHeight + IMAGE.rowPadding * 2,
        ),
      };
    });

    return {
      period,
      stats: getGroupStats(periodSubjects),
      rows,
    };
  });
}

function calculateImageHeight(groups) {
  let height = IMAGE.contentTop;

  if (groups.length) {
    height += 55;

    for (const group of groups) {
      height += 72;
      height += 50;

      for (const row of group.rows) {
        height += row.height;
      }

      height += 35;
    }
  }

  return Math.max(900, height + IMAGE.footerHeight);
}

function createAcademicCanvas({ cgpa, totalCredits, subjects }) {
  const validSubjects = getValidSubjects(subjects);

  if (!validSubjects.length && Number(totalCredits) <= 0) {
    throw new Error("No academic results available for export");
  }

  const canvas = document.createElement("canvas");
  canvas.width = IMAGE.width;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas rendering is unavailable");
  }

  const groups = prepareImageGroups(ctx, validSubjects);

  canvas.height = calculateImageHeight(groups);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(0, 0, IMAGE.width, IMAGE.headerHeight);

  drawCanvasText(ctx, "GradePilot", 72, 72, {
    size: 48,
    weight: 700,
    color: "#ffffff",
  });

  drawCanvasText(ctx, "ACADEMIC PERFORMANCE REPORT", 74, 123, {
    size: 19,
    weight: 600,
    color: "#e0e7ff",
  });

  drawCanvasText(
    ctx,
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    74,
    163,
    {
      size: 18,
      color: "#e0e7ff",
    },
  );

  drawRoundedRect(
    ctx,
    IMAGE.margin,
    IMAGE.summaryTop,
    IMAGE.width - IMAGE.margin * 2,
    IMAGE.summaryHeight,
    20,
    "#eef2ff",
  );

  const passed = validSubjects.filter(
    (subject) => subject.grade !== "F",
  ).length;

  const metrics = [
    ["Current CGPA", formatNumber(cgpa)],
    ["Total Credits", String(totalCredits)],
    ["Subjects", String(validSubjects.length)],
    ["Passed", String(passed)],
  ];

  metrics.forEach(([label, value], index) => {
    const centerX = 195 + index * 270;

    drawCanvasText(ctx, value, centerX, 310, {
      size: 38,
      weight: 700,
      color: "#4f46e5",
      align: "center",
    });

    drawCanvasText(ctx, label, centerX, 360, {
      size: 17,
      color: "#64748b",
      align: "center",
    });
  });

  let y = IMAGE.contentTop;

  if (groups.length) {
    drawCanvasText(ctx, "Subject Performance", 70, y, {
      size: 29,
      weight: 700,
    });

    y += 55;

    for (const group of groups) {
      drawRoundedRect(ctx, 60, y, 1080, 58, 12, "#4f46e5");

      drawCanvasText(ctx, group.period, 82, y + 29, {
        size: 21,
        weight: 600,
        color: "#ffffff",
      });

      drawCanvasText(
        ctx,
        `GPA ${formatNumber(group.stats.gpa)}  |  ${group.stats.credits} Credits`,
        1110,
        y + 29,
        {
          size: 19,
          weight: 500,
          color: "#ffffff",
          align: "right",
        },
      );

      y += 72;

      drawRoundedRect(ctx, 60, y, 1080, 50, 8, "#e0e7ff");

      drawCanvasText(ctx, "Subject", 82, y + 25, {
        size: 19,
        weight: 600,
        color: "#4338ca",
      });

      drawCanvasText(ctx, "Credits", 780, y + 25, {
        size: 19,
        weight: 600,
        color: "#4338ca",
      });

      drawCanvasText(ctx, "Grade", 950, y + 25, {
        size: 19,
        weight: 600,
        color: "#4338ca",
      });

      y += 50;

      group.rows.forEach(({ subject, lines, height }, index) => {
        if (index % 2 === 0) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(60, y, 1080, height);
        }

        const textBlockHeight = lines.length * IMAGE.rowLineHeight;
        const textStartY =
          y + (height - textBlockHeight) / 2 + IMAGE.rowLineHeight / 2;

        lines.forEach((line, lineIndex) => {
          drawCanvasText(
            ctx,
            line,
            82,
            textStartY + lineIndex * IMAGE.rowLineHeight,
            {
              size: 20,
              color: "#334155",
            },
          );
        });

        drawCanvasText(ctx, subject.credit, 780, y + height / 2, {
          size: 20,
        });

        drawCanvasText(ctx, subject.grade, 950, y + height / 2, {
          size: 20,
          weight: 600,
          color: "#4f46e5",
        });

        y += height;
      });

      y += 35;
    }
  }

  const footerY = canvas.height - 110;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, footerY);
  ctx.lineTo(1140, footerY);
  ctx.stroke();

  drawCanvasText(
    ctx,
    "Generated by GradePilot | Academic Performance Analytics",
    60,
    footerY + 40,
    {
      size: 17,
      color: "#64748b",
    },
  );

  drawCanvasText(
    ctx,
    "Not an official university transcript.",
    60,
    footerY + 72,
    {
      size: 15,
      color: "#94a3b8",
    },
  );

  return canvas;
}

export async function exportToImage(data) {
  const canvas = createAcademicCanvas(data);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("Unable to generate PNG image"));
        return;
      }

      resolve(result);
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `GradePilot_Result_${Date.now()}.png`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
