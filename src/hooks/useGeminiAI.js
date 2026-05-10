import { useAcademic, computeCGPA } from '../context/AcademicContext';
import { GRADE_POINTS } from '../data/gradeData';
import toast from 'react-hot-toast';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are an Academic Decision Engine for GradePilot.
You are NOT a chatbot.
You ONLY analyze academic data.
Return ONLY structured JSON output with no markdown, no explanation, no preamble.
You must include: status, requiredGPA, riskLevel, weakAreas, suggestions, verdict.
No conversation. No explanation outside JSON.`;

export function useGeminiAI() {
  const { state, dispatch, computed } = useAcademic();

  async function analyzeAcademics() {
    const { subjects, targetCGPA, remainingCredits, previousCGPA, previousCredits } = state;
    const validSubjects = subjects.filter(s => s.name && s.grade);

    if (validSubjects.length === 0) {
      toast.error('Add at least one subject before analyzing');
      return;
    }

    dispatch({ type: 'SET_AI_LOADING', payload: true });

    const payload = {
      currentCGPA: computed.cgpa,
      targetCGPA: parseFloat(targetCGPA) || 3.5,
      completedCredits: computed.totalCredits,
      remainingCredits: parseFloat(remainingCredits) || 0,
      subjects: validSubjects.map(s => ({
        name: s.name,
        credit: s.credit,
        grade: s.grade,
        gpa: GRADE_POINTS[s.grade] || 0,
      })),
    };

    // If no API key, use a smart fallback engine
    if (!GEMINI_API_KEY) {
      const result = localAIEngine(payload);
      setTimeout(() => {
        dispatch({ type: 'SET_AI_INSIGHTS', payload: result });
        toast.success('Analysis complete!');
      }, 1200);
      return;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: SYSTEM_PROMPT + '\n\nInput Data:\n' + JSON.stringify(payload) },
                ],
              },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
          }),
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        dispatch({ type: 'SET_AI_INSIGHTS', payload: parsed });
        toast.success('AI analysis complete!');
      } else {
        throw new Error('Invalid AI response');
      }
    } catch {
      // Fallback to local engine
      const result = localAIEngine(payload);
      dispatch({ type: 'SET_AI_INSIGHTS', payload: result });
      toast.success('Analysis complete (local engine)!');
    }
  }

  return { analyzeAcademics };
}

// Local academic intelligence engine (no API required)
function localAIEngine({ currentCGPA, targetCGPA, completedCredits, remainingCredits, subjects }) {
  const weakAreas = subjects.filter(s => s.gpa < 2.75).map(s => s.name);
  const strongSubjects = subjects.filter(s => s.gpa >= 3.5).map(s => s.name);
  const hasF = subjects.some(s => s.grade === 'F');
  const avgGpa = subjects.reduce((a, b) => a + b.gpa, 0) / (subjects.length || 1);

  // Calculate required GPA for remaining credits
  let requiredGPA = 0;
  if (remainingCredits > 0 && targetCGPA > 0) {
    const totalFuture = completedCredits + remainingCredits;
    requiredGPA = (targetCGPA * totalFuture - currentCGPA * completedCredits) / remainingCredits;
    requiredGPA = Math.min(4.0, Math.max(0, requiredGPA));
  }

  let status = 'Easy';
  if (requiredGPA > 3.75) status = 'Very Hard';
  else if (requiredGPA > 3.5) status = 'Hard';
  else if (requiredGPA > 3.0) status = 'Moderate';

  let riskLevel = 'Low';
  if (hasF || currentCGPA < 2.0) riskLevel = 'High';
  else if (weakAreas.length >= 2 || currentCGPA < 2.75) riskLevel = 'Medium';

  const gap = targetCGPA - currentCGPA;
  const suggestions = [];
  if (hasF) suggestions.push('Retake failed subjects to recover GPA points immediately.');
  if (weakAreas.length > 0) suggestions.push(`Focus study time on: ${weakAreas.slice(0, 3).join(', ')}.`);
  if (gap > 0.5) suggestions.push('Consider enrolling in extra credit hours this semester.');
  if (strongSubjects.length > 0) suggestions.push(`Maintain performance in: ${strongSubjects.slice(0, 2).join(', ')}.`);
  if (avgGpa < 3.0) suggestions.push('Seek academic counseling for a personalized improvement plan.');
  suggestions.push('Set weekly study goals and track progress consistently.');

  const verdict =
    gap <= 0
      ? 'You have already achieved your target CGPA. Maintain consistency.'
      : status === 'Very Hard'
        ? 'Target is very ambitious. Significant improvement needed in remaining semesters.'
        : status === 'Hard'
          ? 'Target is achievable with consistent high performance.'
          : `Target is realistic. Stay focused and maintain discipline.`;

  return {
    status,
    requiredGPA: parseFloat(requiredGPA.toFixed(2)),
    riskLevel,
    weakAreas,
    suggestions,
    verdict,
  };
}
