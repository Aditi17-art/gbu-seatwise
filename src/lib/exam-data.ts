export type Room = {
  id: string;
  name: string;
  capacity: number;
  building: string;
  floor: string;
  columns: number;
};

export type Student = {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  course: string;
  semester: string;
  department: string;
};

export type SeatAllocation = {
  seatNumber: string;
  row: string;
  col: number;
  student: Pick<Student, "name" | "rollNumber"> | null;
  skipped: boolean;
};

export type SeatingResponse = {
  seatingMatrix: SeatAllocation[];
  totalAllocated: number;
  remainingSeats: number;
  room: Room;
  pattern: "Alternate" | "Sequential";
  examName: string;
  department: string;
  generatedAt: string;
};

export const rooms: Room[] = [
  { id: "IL101", name: "Room IL101", capacity: 40, building: "Information Library Block", floor: "Ground Floor", columns: 8 },
  { id: "IL102", name: "Room IL102", capacity: 50, building: "Information Library Block", floor: "Ground Floor", columns: 10 },
  { id: "IL200", name: "Room IL200", capacity: 60, building: "Information Library Block", floor: "Second Floor", columns: 10 },
  { id: "IL201", name: "Room IL201", capacity: 45, building: "Information Library Block", floor: "Second Floor", columns: 9 },
  { id: "IL202", name: "Room IL202", capacity: 70, building: "Information Library Block", floor: "Second Floor", columns: 10 },
  { id: "IL203", name: "Room IL203", capacity: 80, building: "Information Library Block", floor: "Second Floor", columns: 10 },
];

export const departments = ["SOICT", "SOBT", "SOV", "SOE"] as const;
export const exams = ["Mid Term", "End Semester", "Practical Exam"] as const;

const names = [
  "Aarav Sharma", "Diya Singh", "Vivaan Gupta", "Ananya Verma", "Aditya Mishra", "Ishita Yadav",
  "Krishna Patel", "Meera Khan", "Arjun Chauhan", "Riya Saxena", "Kabir Tiwari", "Naina Joshi",
  "Dev Kumar", "Sanya Bansal", "Om Prakash", "Avni Rai", "Reyansh Saini", "Myra Srivastava",
  "Atharv Pandey", "Kiara Malik", "Harsh Vardhan", "Aisha Ali", "Nikhil Bhatia", "Tanya Gaur",
];

export const mockStudents: Student[] = Array.from({ length: 480 }, (_, index) => {
  const departmentIndex = Math.floor(index / 120) % departments.length;
  const department = departments[departmentIndex];
  const departmentRoll = (index % 120) + 1;
  const course = department === "SOICT" ? "B.Tech CSE" : department === "SOBT" ? "B.Sc Biotechnology" : department === "SOV" ? "B.Arch" : "B.Tech Civil";
  return {
    id: `stu-${index + 1}`,
    name: names[index % names.length],
    rollNumber: `${235 + (departmentRoll % 3)}/${department === "SOICT" ? "UCS" : department}/${String(departmentRoll).padStart(3, "0")}`,
    email: `student${index + 1}@gbu.ac.in`,
    course,
    semester: `${(index % 8) + 1}`,
    department,
  };
});

export function getStudentsByDepartment(department: string) {
  return mockStudents.filter((student) => student.department === department);
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateSeatingAllocation(input: {
  examName: string;
  roomId: string;
  department: string;
  studentList?: Student[];
  alternateSeating: boolean;
}): SeatingResponse {
  const room = rooms.find((item) => item.id === input.roomId);
  if (!room) throw new Error("Invalid room selected");
  if (!exams.includes(input.examName as (typeof exams)[number])) throw new Error("Invalid exam selected");
  if (!departments.includes(input.department as (typeof departments)[number])) throw new Error("Invalid department selected");

  const students = shuffle(input.studentList?.length ? input.studentList : getStudentsByDepartment(input.department));
  const usableSeats = input.alternateSeating ? Math.ceil(room.capacity / 2) : room.capacity;
  if (students.length > usableSeats) {
    throw new Error(`Capacity exceeded: ${students.length} students cannot fit in ${usableSeats} usable seats`);
  }

  let studentIndex = 0;
  const seatingMatrix = Array.from({ length: room.capacity }, (_, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / room.columns));
    const col = (index % room.columns) + 1;
    const skipped = input.alternateSeating && index % 2 === 1;
    const student = !skipped && studentIndex < students.length ? students[studentIndex++] : null;
    return {
      seatNumber: `${row}${col}`,
      row,
      col,
      student: student ? { name: student.name, rollNumber: student.rollNumber } : null,
      skipped,
    };
  });

  return {
    seatingMatrix,
    totalAllocated: studentIndex,
    remainingSeats: room.capacity - studentIndex,
    room,
    pattern: input.alternateSeating ? "Alternate" : "Sequential",
    examName: input.examName,
    department: input.department,
    generatedAt: new Date().toISOString(),
  };
}

export function findStudent(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return mockStudents.find(
    (student) =>
      student.rollNumber.toLowerCase() === normalized ||
      student.email.toLowerCase() === normalized ||
      student.name.toLowerCase().replace(/\s+/g, ".") === normalized,
  );
}
