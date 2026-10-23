import { getAuth } from "../server/auth/auth.js";
import {
  createAcademicRecord,
  getAcademicRecord,
  updateAcademicRecord,
} from "../server/academic/academic-data.js";
import { validateAcademicData } from "../server/academic/academic-validation.js";

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

function parseRequestBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  return request.body;
}

function validateRequestSize(request, body) {
  const rawLength = request.headers["content-length"];

  if (rawLength !== undefined) {
    const contentLength = Number(rawLength);

    if (
      !Number.isSafeInteger(contentLength) ||
      contentLength < 0 ||
      contentLength > MAX_BODY_SIZE
    ) {
      return false;
    }
  }

  const serialized = JSON.stringify(body);

  if (!serialized) {
    return false;
  }

  return Buffer.byteLength(serialized, "utf8") <= MAX_BODY_SIZE;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Allow", "GET, POST, PUT");

  if (!["GET", "POST", "PUT"].includes(request.method)) {
    return sendError(response, 405, "Method not allowed");
  }

  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
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

    let body;

    try {
      body = parseRequestBody(request);
    } catch {
      return sendError(response, 400, "Invalid JSON request body");
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return sendError(response, 400, "Invalid request body");
    }

    if (!validateRequestSize(request, body)) {
      return sendError(response, 413, "Academic data exceeds the size limit");
    }

    const validation = validateAcademicData(body.data);

    if (!validation.valid) {
      return sendError(response, 400, validation.message);
    }

    if (request.method === "POST") {
      const result = await createAcademicRecord(user.id, validation.data);

      if (result.conflict) {
        return sendError(
          response,
          409,
          "Cloud data already exists. Review your records before continuing.",
        );
      }

      const record = await getAcademicRecord(user.id);

      return response.status(201).json({
        success: true,
        message: "Academic data created successfully",
        record,
      });
    }

    const expectedRevision = body.expectedRevision;

    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
      return sendError(response, 400, "A valid expectedRevision is required");
    }

    const result = await updateAcademicRecord(
      user.id,
      validation.data,
      expectedRevision,
    );

    if (result.conflict) {
      return sendError(
        response,
        409,
        "Cloud data has changed. Review the latest version before saving.",
      );
    }

    const record = await getAcademicRecord(user.id);

    return response.status(200).json({
      success: true,
      message: "Academic data updated successfully",
      record,
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
