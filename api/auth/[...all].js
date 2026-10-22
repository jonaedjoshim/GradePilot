import { toNodeHandler } from "better-auth/node";
import { getAuth } from "../../server/auth/auth.js";

export default async function handler(request, response) {
  try {
    const auth = await getAuth();

    return toNodeHandler(auth)(request, response);
  } catch (error) {
    console.error("Authentication API error:", error);

    return response.status(500).json({
      success: false,
      message: "Authentication service is temporarily unavailable",
    });
  }
}
