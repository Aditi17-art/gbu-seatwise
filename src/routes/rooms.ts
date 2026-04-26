import { createFileRoute } from "@tanstack/react-router";
import { rooms } from "@/lib/exam-data";

export const Route = createFileRoute("/rooms")({
  server: {
    handlers: {
      GET: async () => Response.json({ rooms }),
    },
  },
});
