const base64UrlDecode = (str: string) => {
  // Convert base64url to base64
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '='
  while (s.length % 4 !== 0) s += "=";
  return atob(s);
};

export const verifyToken = () => {
  const token = sessionStorage.getItem("github_token");
  if (!token) {
    console.log("No token found");
    return null;
  }

  // If token doesn't look like a JWT (no two dots), treat as raw access token
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn("Token does not look like a JWT, treating as raw access token");
    return { token, isRaw: true };
  }

  try {
    // Decode JWT payload using base64url-safe decoder
    const payload = base64UrlDecode(parts[1]);
    const decoded = JSON.parse(payload);
    console.log("Decoded token:", decoded);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log("Token expired");
      sessionStorage.clear();
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token decode error:", error);
    // Fallback: return raw token so the user stays logged in and we can fetch profile later
    return { token, isRaw: true };
  }
};
