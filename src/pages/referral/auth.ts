import jwtDecode from "jwt-decode";

export type JwtToken = {
  userId?: string;
  role?: "master" | "admin" | "user";
};

export const getCurrentRole = (): "master" | "admin" | "user" => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "user";
    const decoded = jwtDecode<JwtToken>(token);
    if (decoded.role === "master" || decoded.role === "admin" || decoded.role === "user") {
      return decoded.role;
    }
  } catch {
    // no-op
  }
  return "user";
};

export const getCurrentUserId = (): string => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const decoded = jwtDecode<JwtToken>(token);
    return decoded.userId || "";
  } catch {
    return "";
  }
};
