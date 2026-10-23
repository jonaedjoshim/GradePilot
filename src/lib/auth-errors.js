const AUTH_ERROR_MESSAGES = {
  invalid_credentials: "Incorrect email or password.",
  invalid_email: "Please enter a valid email address.",
  user_not_found: "No account was found with this email.",
  user_already_exists: "An account with this email already exists.",
  invalid_password: "Please check your password and try again.",
  email_not_verified: "Please verify your email before signing in.",
  account_not_linked:
    "This email is already associated with another sign-in method.",
  provider_not_found: "Google sign-in is currently unavailable.",
  access_denied: "Google sign-in was cancelled or denied.",
  state_mismatch: "Your sign-in session expired. Please try again.",
  invalid_code: "Google authentication failed. Please try again.",
  invalid_client: "Google authentication is temporarily unavailable.",
  oauth_error: "Unable to complete Google authentication.",
  too_many_requests: "Too many attempts. Please try again later.",
};

function normalizeErrorCode(value) {
  if (typeof value !== "string") return "";

  return value.trim().toLowerCase().replaceAll("-", "_");
}

export function getAuthErrorMessage(error, fallback) {
  if (!error) return fallback;

  const code = normalizeErrorCode(
    typeof error === "string" ? error : error.code,
  );

  if (AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  if (typeof error === "object" && error.status === 429) {
    return AUTH_ERROR_MESSAGES.too_many_requests;
  }

  if (typeof error === "object" && error.status >= 500) {
    return "Authentication service is temporarily unavailable.";
  }

  if (
    typeof error === "object" &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export function getOAuthError(search) {
  const params = new URLSearchParams(search);
  const error = params.get("error");

  if (!error) return null;

  return getAuthErrorMessage(
    error,
    "Unable to complete authentication. Please try again.",
  );
}
