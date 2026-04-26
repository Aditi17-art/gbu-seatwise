import { createFileRoute } from "@tanstack/react-router";
import { adminLogin } from "@/lib/mock-auth";

export const Route = createFileRoute("/auth/admin-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { username?: string; password?: string };
          if (!body.username || !body.password) return Response.json({ error: "Invalid inputs" }, { status: 400 });
          return Response.json(adminLogin(body.username, body.password));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unauthorized admin access";
          return Response.json({ error: message }, { status: 401 });
        }
      },
    },
  },
});
