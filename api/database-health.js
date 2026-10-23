import { getAuth } from "../server/auth/auth.js";
import { getDatabase } from "../server/db/mongodb.js";

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

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") {
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const user = await getAuthenticatedUser(request);

    if (!user?.id) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const database = await getDatabase();

    await database.command({ ping: 1 });

    return response.status(200).json({
      success: true,
      service: "GradePilot Database",
      status: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return response.status(503).json({
      success: false,
      service: "GradePilot Database",
      status: "unavailable",
    });
  }
}
