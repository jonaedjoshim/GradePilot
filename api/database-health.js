import { getDatabase } from "../server/db/mongodb.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");

    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const database = await getDatabase();

    await database.command({ ping: 1 });

    return response.status(200).json({
      success: true,
      service: "GradePilot Database",
      status: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return response.status(503).json({
      success: false,
      service: "GradePilot Database",
      status: "unavailable",
    });
  }
}
