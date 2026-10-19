export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");

    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  return response.status(200).json({
    success: true,
    service: "GradePilot API",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
}
