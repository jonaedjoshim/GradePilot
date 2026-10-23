async function requestAcademicData(method, body) {
  const response = await fetch("/api/academic", {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

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

  update(data, expectedUpdatedAt) {
    return requestAcademicData("PUT", {
      data,
      expectedUpdatedAt,
    });
  },
};
