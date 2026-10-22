import { getAuth } from "../server/auth/auth.js";
import {
  createAcademicRecord,
  getAcademicRecord,
  updateAcademicRecord,
} from "../server/academic/academic-data.js";

const MAX_BODY_SIZE = 1024 * 1024;

function sendError(response, status, message) {
  return response.status(status).json({
    success: false,
    message,
  });
}

async function getAuthenticatedUser(request) {
  const auth = await getAuth();

  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const session = await auth.api.getSession({
    headers,
  });

  return session?.user || null;
}

function validateAcademicPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  if (
    !["national", "other"].includes(data.university) ||
    !Array.isArray(data.subjects)
  ) {
    return false;
  }

  if (data.subjects.length > 500) {
    return false;
  }

  return true;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Allow", "GET, POST, PUT");

  if (!["GET", "POST", "PUT"].includes(request.method)) {
    return sendError(response, 405, "Method not allowed");
  }

  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return sendError(response, 401, "Authentication required");
    }

    if (request.method === "GET") {
      const record = await getAcademicRecord(user.id);

      return response.status(200).json({
        success: true,
        exists: Boolean(record),
        record: record || null,
      });
    }

    const body = request.body;

    if (!body || typeof body !== "object") {
      return sendError(response, 400, "Invalid request body");
    }

    const serialized = JSON.stringify(body);

    if (Buffer.byteLength(serialized, "utf8") > MAX_BODY_SIZE) {
      return sendError(response, 413, "Academic data is too large");
    }

    if (!validateAcademicPayload(body.data)) {
      return sendError(response, 400, "Invalid academic data");
    }

    if (request.method === "POST") {
      const result = await createAcademicRecord(user.id, body.data);

      if (result.conflict) {
        return sendError(
          response,
          409,
          "Academic data already exists. Existing cloud data was not changed.",
        );
      }

      return response.status(201).json({
        success: true,
        message: "Academic data created successfully",
      });
    }

    if (
      typeof body.expectedUpdatedAt !== "string" ||
      Number.isNaN(Date.parse(body.expectedUpdatedAt))
    ) {
      return sendError(
        response,
        400,
        "A valid expectedUpdatedAt value is required",
      );
    }

    const result = await updateAcademicRecord(
      user.id,
      body.data,
      body.expectedUpdatedAt,
    );

    if (result.conflict) {
      return sendError(
        response,
        409,
        "Cloud data has changed. Reload before saving to avoid overwriting newer data.",
      );
    }

    return response.status(200).json({
      success: true,
      message: "Academic data updated successfully",
    });
  } catch (error) {
    console.error("Academic API error:", error);

    return sendError(
      response,
      500,
      "Academic data service is temporarily unavailable",
    );
  }
}
