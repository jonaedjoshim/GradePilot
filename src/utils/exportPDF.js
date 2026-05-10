import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const GRADE_POINTS_MAP = {
  'A+':4,'A':3.75,'A-':3.5,'B+':3.25,'B':3,'B-':2.75,'C+':2.5,'C':2.25,'D':2,'F':0
};

// ───── PDF Export ─────
export async function exportToPDF({ cgpa, totalCredits, subjects, aiInsights }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 20;

  // Header gradient
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, W, 44, 'F');
  doc.setFillColor(99, 102, 241);
  doc.rect(W - 60, 0, 60, 44, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GradePilot', 18, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Academic Performance Report', 18, 27);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 18, 35);
  y = 56;

  // Summary Box
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, y, W - 28, 28, 4, 4, 'F');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(cgpa.toFixed(2), 35, y + 17);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Current CGPA', 28, y + 23);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(String(totalCredits), W - 65, y + 17);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Credits', W - 73, y + 23);

  const validSubjects = subjects.filter(s => s.name);
  const passCount = validSubjects.filter(s => s.grade !== 'F').length;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text(String(validSubjects.length), W / 2 - 10, y + 17);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`${passCount} Passed`, W / 2 - 13, y + 23);
  y += 38;

  // Group by Year-Semester
  const groups = {};
  validSubjects.forEach(s => {
    const key = s.yearSemester || 'Uncategorized';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

  for (const [groupName, groupSubjects] of sortedGroups) {
    if (y > 240) { doc.addPage(); y = 18; }

    // Group header
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(groupName, 18, y + 5.5);

    // Group CGPA
    const gWS = groupSubjects.reduce((s, sub) => s + (GRADE_POINTS_MAP[sub.grade] || 0) * sub.credit, 0);
    const gTC = groupSubjects.reduce((s, sub) => s + Number(sub.credit), 0);
    const gCGPA = gTC > 0 ? (gWS / gTC).toFixed(2) : '—';
    doc.text(`GPA: ${gCGPA}  |  Credits: ${gTC}`, W - 60, y + 5.5);
    y += 10;

    // Table header
    doc.setFillColor(238, 242, 255);
    doc.rect(14, y, W - 28, 7, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(8);
    doc.text('Subject', 18, y + 5);
    doc.text('Credit', 114, y + 5);
    doc.text('Grade', 140, y + 5);
    doc.text('GPA Pts', 166, y + 5);
    y += 7;

    groupSubjects.forEach((s, i) => {
      if (y > 270) { doc.addPage(); y = 18; }
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 252);
        doc.rect(14, y, W - 28, 7, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(s.name.substring(0, 38), 18, y + 5);
      doc.text(String(s.credit), 114, y + 5);
      doc.text(s.grade, 140, y + 5);
      const pts = GRADE_POINTS_MAP[s.grade] || 0;
      doc.text(pts.toFixed(2), 166, y + 5);
      y += 7;
    });

    y += 6;
  }

  // AI Insights
  if (aiInsights) {
    if (y > 220) { doc.addPage(); y = 18; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('AI Academic Insights', 18, y);
    y += 8;

    const riskColors = { Low: [16,185,129], Medium: [245,158,11], High: [239,68,68] };
    const [r, g, b] = riskColors[aiInsights.riskLevel] || [100,116,139];
    doc.setFillColor(r, g, b);
    doc.circle(21, y + 3, 3, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Risk: ${aiInsights.riskLevel}  |  Status: ${aiInsights.status}  |  Required GPA: ${aiInsights.requiredGPA}`, 27, y + 4.5);
    y += 11;

    doc.setFont('helvetica', 'bold');
    doc.text('Verdict:', 18, y);
    doc.setFont('helvetica', 'normal');
    const vLines = doc.splitTextToSize(aiInsights.verdict || '', W - 38);
    doc.text(vLines, 18, y + 6);
    y += 6 + vLines.length * 5 + 3;

    if (aiInsights.suggestions?.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations:', 18, y);
      y += 6;
      aiInsights.suggestions.forEach(s => {
        if (y > 272) { doc.addPage(); y = 18; }
        const lines = doc.splitTextToSize(`• ${s}`, W - 40);
        doc.setFont('helvetica', 'normal');
        doc.text(lines, 23, y);
        y += lines.length * 5 + 2;
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 249, 252);
    doc.rect(0, 282, W, 15, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Generated by GradePilot • Academic Intelligence Dashboard', W / 2, 289, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, W / 2, 294, { align: 'center' });
  }

  doc.save(`GradePilot_Report_${Date.now()}.pdf`);
}

// ───── Image (PNG) Export ─────
export async function exportToImage() {
  // Use html2canvas on body with a targeted clip
  const el = document.getElementById('gradepilot-export-root');
  if (!el) throw new Error('Export element not found.');

  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--gp-bg').trim() || '#f8f9fc';

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: bgColor || '#f8f9fc',
    logging: false,
    removeContainer: true,
    foreignObjectRendering: false,
    imageTimeout: 5000,
    onclone: (clonedDoc) => {
      // Copy CSS vars to cloned document root so styles render correctly
      const vars = [
        '--gp-bg','--gp-surface','--gp-surface-2','--gp-border',
        '--gp-text','--gp-text-muted','--gp-primary','--gp-primary-bg',
      ];
      const root = document.documentElement;
      const cloneRoot = clonedDoc.documentElement;
      vars.forEach(v => {
        cloneRoot.style.setProperty(v, getComputedStyle(root).getPropertyValue(v));
      });
      // Also copy data-theme attribute
      cloneRoot.setAttribute('data-theme', root.getAttribute('data-theme') || 'light');
    },
  });

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas blob failed')); return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `GradePilot_${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}
