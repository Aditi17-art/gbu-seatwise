import { createFileRoute } from "@tanstack/react-router";
import { studentLogin } from "@/lib/mock-auth";

export const Route = createFileRoute("/auth/student-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { username?: string; rollNumber?: string; password?: string };
          const identifier = body.username || body.rollNumber || "";
          if (!identifier.trim() || !body.password) return Response.json({ error: "Invalid inputs" }, { status: 400 });
          return Response.json(studentLogin(identifier, body.password));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Server error";
          return Response.json({ error: message }, { status: 401 });
        }
      },
    },
  },
});
