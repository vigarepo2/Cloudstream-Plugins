export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

export function createJsonResponse(data, statusCode = 200) {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}

export function createHtmlResponse(htmlContent) {
  return new Response(htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      ...CORS_HEADERS
    }
  });
}

export function createErrorResponse(message, statusCode = 500) {
  return createJsonResponse({ status: "error", message: message }, statusCode);
}
