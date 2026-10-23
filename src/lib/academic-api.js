const REQUEST_TIMEOUT = 20000;

async function requestAcademicData(method, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch("/api/academic", {
      method,
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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
  } catch (error) {
    if (typeof error.status === "number") {
      throw error;
    }

    const message =
      error.name === "AbortError"
        ? "Cloud request timed out. Your local changes are preserved."
        : "Unable to connect to cloud storage. Your local changes are preserved.";

    const networkError = new Error(message);
    networkError.status = 0;

    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
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
