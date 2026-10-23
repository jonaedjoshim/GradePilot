async function requestAcademicData(method, body) {
  let response;

  try {
    response = await fetch("/api/academic", {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    const error = new Error(
      "Unable to connect to cloud storage. Your local changes are preserved.",
    );

    error.status = 0;

    throw error;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      result?.message || "Unable to connect to academic cloud storage",
    );

    error.status = response.status;

    throw error;
  }

  return result;
}

export const academicApi = {
  get() {
    return requestAcademicData("GET");
  },

  create(data) {
    return requestAcademicData("POST", { data });
  },

  update(data, expectedRevision) {
    return requestAcademicData("PUT", {
      data,
      expectedRevision,
    });
  },
};
