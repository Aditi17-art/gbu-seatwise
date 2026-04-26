import { createFileRoute } from "@tanstack/react-router";
import { generateSeatingAllocation, mockStudents, type Student } from "@/lib/exam-data";
import { isAdminToken } from "@/lib/mock-auth";

type GenerateBody = {
  examName?: string;
  roomId?: string;
  department?: string;
  studentList?: Student[];
  studentCount?: number;
  alternateSeating?: boolean;
};

export const Route = createFileRoute("/generate-seating")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminToken(request.headers.get("authorization"))) {
          return Response.json({ error: "Unauthorized admin access" }, { status: 401 });
        }

        try {
          const body = (await request.json()) as GenerateBody;
          if (!body.examName || !body.roomId || !body.department) {
            return Response.json({ error: "Invalid inputs" }, { status: 400 });
          }
          const requestedCount = Number.isFinite(body.studentCount) ? Number(body.studentCount) : undefined;
          const studentList = Array.isArray(body.studentList) && body.studentList.length
            ? body.studentList
            : mockStudents.filter((student) => student.department === body.department);
          const result = generateSeatingAllocation({
            examName: body.examName,
            roomId: body.roomId,
            department: body.department,
            studentList: requestedCount ? studentList.slice(0, requestedCount) : studentList,
            alternateSeating: Boolean(body.alternateSeating),
          });
          return Response.json(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Server error";
          const status = message.includes("Capacity exceeded") ? 409 : 500;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
