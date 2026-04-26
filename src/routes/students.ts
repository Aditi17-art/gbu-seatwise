import { createFileRoute } from "@tanstack/react-router";
import { mockStudents } from "@/lib/exam-data";

export const Route = createFileRoute("/students")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const department = url.searchParams.get("department");
        const students = department
          ? mockStudents.filter((student) => student.department === department)
          : mockStudents;
        return Response.json({ students });
      },
    },
  },
});
