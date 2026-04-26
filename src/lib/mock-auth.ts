import { findStudent, mockStudents, type Student } from "./exam-data";

export type AuthRole = "student" | "admin";
export type AuthUser = Student & { role: "student" } | { id: string; name: string; username: string; role: "admin" };

function encodeToken(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() })).replace(/=/g, "");
  const signature = btoa(`gbu-${payload.role}-${payload.sub}`).replace(/=/g, "");
  return `${header}.${body}.${signature}`;
}

export function studentLogin(identifier: string, password: string) {
  if (password.trim().length < 4) throw new Error("Password must be at least 4 characters");
  const student = findStudent(identifier) ?? mockStudents[0];
  return { token: encodeToken({ role: "student", sub: student.id }), user: { ...student, role: "student" as const } };
}

export function studentSignup(input: { fullName: string; rollNumber: string; email: string; password: string }) {
  if (!input.fullName.trim() || !input.rollNumber.trim() || !input.email.includes("@")). {
    throw new Error("Enter valid student details");
  }
  if (input.password.length < 6) throw new Error("Password must be at least 6 characters");
  const student: Student = {
    id: `signup-${Date.now()}`,
    name: input.fullName.trim(),
    rollNumber: input.rollNumber.trim(),
    email: input.email.trim(),
    course: "B.Tech CSE",
    semester: "5",
    department: "SOICT",
  };
  return { token: encodeToken({ role: "student", sub: student.id }), user: { ...student, role: "student" as const } };
}

export function adminLogin(username: string, password: string) {
  const valid = ["admin", "gbu-admin", "exam-admin"].includes(username.trim().toLowerCase()) && password === "admin123";
  if (!valid) throw new Error("Unauthorized admin access");
  const user = { id: "admin-1", name: "GBU Examination Admin", username: "gbu-admin", role: "admin" as const };
  return { token: encodeToken({ role: "admin", sub: user.id }), user };
}

export function isAdminToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    const [, body] = token.split(".");
    if (!body) return false;
    const decoded = JSON.parse(atob(body));
    return decoded.role === "admin";
  } catch {
    return false;
  }
}
