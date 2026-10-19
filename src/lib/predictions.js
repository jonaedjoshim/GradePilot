export const MAX_GPA = 4;

function isValidNumber(value, min = 0, max = Infinity) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max;
}

export function predictCGPA({
  currentCGPA,
  completedCredits,
  expectedGPA,
  futureCredits,
}) {
  if (
    !isValidNumber(currentCGPA, 0, MAX_GPA) ||
    !isValidNumber(completedCredits) ||
    !isValidNumber(expectedGPA, 0, MAX_GPA) ||
    !isValidNumber(futureCredits, 0)
  ) {
    return null;
  }

  const current = Number(currentCGPA);
  const completed = Number(completedCredits);
  const expected = Number(expectedGPA);
  const future = Number(futureCredits);

  const totalCredits = completed + future;

  if (totalCredits <= 0) {
    return null;
  }

  const predicted = (current * completed + expected * future) / totalCredits;

  return {
    cgpa: predicted,
    change: predicted - current,
    totalCredits,
  };
}

export function calculateRequiredGPA({
  currentCGPA,
  completedCredits,
  targetCGPA,
  remainingCredits,
}) {
  if (
    !isValidNumber(currentCGPA, 0, MAX_GPA) ||
    !isValidNumber(completedCredits) ||
    !isValidNumber(targetCGPA, 0, MAX_GPA) ||
    !isValidNumber(remainingCredits, 0)
  ) {
    return null;
  }

  const current = Number(currentCGPA);
  const completed = Number(completedCredits);
  const target = Number(targetCGPA);
  const remaining = Number(remainingCredits);

  if (remaining <= 0) {
    return null;
  }

  const required =
    (target * (completed + remaining) - current * completed) / remaining;

  const maximumCGPA =
    (current * completed + MAX_GPA * remaining) / (completed + remaining);

  const minimumCGPA = (current * completed) / (completed + remaining);

  return {
    requiredGPA: required,
    maximumCGPA,
    minimumCGPA,
    achievable: required <= MAX_GPA,
    alreadySecured: required <= 0,
  };
}

export function getPredictionDifficulty(requiredGPA) {
  if (requiredGPA <= 0) {
    return {
      label: "Already secured",
      tone: "success",
    };
  }

  if (requiredGPA > MAX_GPA) {
    return {
      label: "Not achievable",
      tone: "danger",
    };
  }

  if (requiredGPA >= 3.75) {
    return {
      label: "Very challenging",
      tone: "danger",
    };
  }

  if (requiredGPA >= 3.25) {
    return {
      label: "Challenging",
      tone: "warning",
    };
  }

  if (requiredGPA >= 2.5) {
    return {
      label: "Moderate",
      tone: "primary",
    };
  }

  return {
    label: "Manageable",
    tone: "success",
  };
}
