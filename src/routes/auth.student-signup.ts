import { createFileRoute } from "@tanstack/react-router";
import { studentSignup } from "@/lib/mock-auth";

export const Route = createFileRoute("/auth/student-signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { fullName?: string; rollNumber?: string; email?: string; password?: string; confirmPassword?: string };
          if (!body.fullName || !body.rollNumber || !body.email || !body.password) {
            return Response.json({ error: "Invalid inputs" }, { status: 400 });
          }
          if (body.password !== body.confirmPassword) {
            return Response.json({ error: "Passwords do not match" }, { status: 400 });
          }
          return Response.json(studentSignup({ fullName: body.fullName, rollNumber: body.rollNumber, email: body.email, password: body.password }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Server error";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
