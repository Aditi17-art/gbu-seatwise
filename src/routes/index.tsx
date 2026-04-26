import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  MapPin,
  Printer,
  RefreshCcw,
  Shuffle,
  UserRound,
  UsersRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { GbuBrand } from "@/components/GbuBrand";
import {
  departments,
  exams,
  generateSeatingAllocation,
  getStudentsByDepartment,
  mockStudents,
  rooms,
  type SeatingResponse,
} from "@/lib/exam-data";
import type { AuthUser } from "@/lib/mock-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Exam Seating Allocation System | GBU" },
      {
        name: "description",
        content: "Gautam Buddha University exam seating allocation portal for students and authorized administrators.",
      },
      { property: "og:title", content: "Exam Seating Allocation System | GBU" },
      {
        property: "og:description",
        content: "Professional academic ERP for exam room allocation, seat grids, summaries, and print layouts.",
      },
    ],
  }),
  component: Index,
});

type Tab = "student-login" | "student-signup" | "admin-login";
type Session = { token: string; user: AuthUser };

type LoginResponse = { token: string; user: AuthUser; error?: string };
const studentCountOptions = [40, 50, 60, 80, 100, 120];

function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("gbu-exam-session");
    if (saved) setSession(JSON.parse(saved));
  }, []);

  const saveSession = (next: Session) => {
    window.localStorage.setItem("gbu-exam-session", JSON.stringify(next));
    setSession(next);
  };

  const logout = () => {
    window.localStorage.removeItem("gbu-exam-session");
    setSession(null);
    toast.info("Logged out successfully");
  };

  return (
    <>
      <ToastContainer position="top-right" theme="colored" newestOnTop />
      {!session ? (
        <AuthScreen onAuthenticated={saveSession} />
      ) : session.user.role === "admin" ? (
        <AdminDashboard session={session} onLogout={logout} />
      ) : (
        <StudentDashboard session={session as Session & { user: Extract<AuthUser, { role: "student" }> }} onLogout={logout} />
      )}
    </>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [tab, setTab] = useState<Tab>("student-login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    identifier: "235/UCS/001",
    password: "student123",
    fullName: "",
    rollNumber: "",
    email: "",
    confirmPassword: "",
    adminUsername: "gbu-admin",
    adminPassword: "admin123",
  });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint = tab === "student-login" ? "/auth/student-login" : tab === "student-signup" ? "/auth/student-signup" : "/auth/admin-login";
      const payload =
        tab === "student-login"
          ? { username: form.identifier, password: form.password }
          : tab === "student-signup"
            ? { fullName: form.fullName, rollNumber: form.rollNumber, email: form.email, password: form.password, confirmPassword: form.confirmPassword }
            : { username: form.adminUsername, password: form.adminPassword };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as LoginResponse;
      if (!response.ok || data.error) throw new Error(data.error || "Authentication failed");
      onAuthenticated({ token: data.token, user: data.user });
      toast.success(tab === "admin-login" ? "Admin authenticated" : "Student portal opened");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <img src="/gbu/campus-hero.jpg" alt="Gautam Buddha University campus aerial view" className="absolute inset-0 h-full w-full object-cover" />
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute inset-x-0 top-0 z-10 border-b bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <GbuBrand />
          <div className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow md:block">Exam Cell Portal</div>
        </div>
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 pb-10 pt-32 lg:grid-cols-[1fr_460px] lg:px-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-2xl text-primary-foreground">
          <p className="mb-4 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-accent-foreground shadow">Gautam Buddha University</p>
          <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Exam Seating Allocation System</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-primary-foreground/90">
            Secure student access, authorized admin controls, randomized seat generation, capacity indicators, and printable A4 seating layouts for academic examinations.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              [GraduationCap, "Student Login"],
              [Building2, "Room Planning"],
              [Printer, "Print Ready"],
            ].map(([Icon, label]) => (
              <div key={String(label)} className="glass-panel rounded-lg border border-primary-foreground/20 p-4 text-sm font-semibold">
                <Icon className="mb-3 h-5 w-5 text-accent" /> {String(label)}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.form onSubmit={submit} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.1 }} className="glass-panel rounded-xl border border-primary-foreground/20 p-5 sm:p-6">
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-lg bg-background/70 p-1 text-xs font-bold sm:text-sm">
            {[
              ["student-login", "Student Login"],
              ["student-signup", "Student Sign Up"],
              ["admin-login", "Admin Login"],
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setTab(value as Tab)} className={`rounded-md px-2 py-3 transition ${tab === value ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">{tab === "admin-login" ? "Admin Authentication" : tab === "student-signup" ? "Student Registration" : "Student Login"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use demo admin: gbu-admin / admin123</p>
          </div>

          <div className="space-y-4">
            {tab === "student-signup" && (
              <>
                <TextField label="Full Name" value={form.fullName} onChange={(value) => update("fullName", value)} required />
                <TextField label="Roll Number" placeholder="235/UCS/030" value={form.rollNumber} onChange={(value) => update("rollNumber", value)} required />
                <TextField label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
              </>
            )}
            {tab === "student-login" && <TextField label="Username OR Roll Number" value={form.identifier} onChange={(value) => update("identifier", value)} required />}
            {tab === "admin-login" && <TextField label="Admin ID / Username" value={form.adminUsername} onChange={(value) => update("adminUsername", value)} required />}
            <PasswordField
              label="Password"
              value={tab === "admin-login" ? form.adminPassword : form.password}
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              onChange={(value) => update(tab === "admin-login" ? "adminPassword" : "password", value)}
            />
            {tab === "student-signup" && <PasswordField label="Confirm Password" value={form.confirmPassword} show={showPassword} onToggle={() => setShowPassword((prev) => !prev)} onChange={(value) => update("confirmPassword", value)} />}
          </div>

          <Button type="submit" variant="institutional" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {tab === "admin-login" ? "Authenticate Admin" : tab === "student-signup" ? "Create Student Account" : "Login to Dashboard"}
          </Button>
        </motion.form>
      </section>
    </main>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="mt-2 h-11 w-full rounded-md border bg-background/80 px-3 text-foreground outline-none transition focus:ring-2 focus:ring-ring" />
    </label>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <span className="mt-2 flex h-11 items-center rounded-md border bg-background/80 pr-2 focus-within:ring-2 focus-within:ring-ring">
        <input type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} required className="h-full min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none" />
        <button type="button" onClick={onToggle} className="rounded-md p-2 text-muted-foreground hover:bg-secondary" aria-label="Show or hide password">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function StudentDashboard({ session, onLogout }: { session: Session & { user: Extract<AuthUser, { role: "student" }> }; onLogout: () => void }) {
  const allocation = useMemo(() => generateSeatingAllocation({ examName: "End Semester", roomId: "IL101", department: session.user.department, studentList: getStudentsByDepartment(session.user.department).slice(0, 32), alternateSeating: false }), [session.user.department]);
  const seat = allocation.seatingMatrix.find((item) => item.student?.rollNumber === session.user.rollNumber) ?? allocation.seatingMatrix.find((item) => item.student);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader user={session.user} onLogout={onLogout} title="Exam Seating Allocation" />
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 shadow-[var(--shadow-institutional)]">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground"><UserRound /></div>
            <h2 className="text-2xl font-bold">{session.user.name}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <InfoRow label="Roll Number" value={session.user.rollNumber} />
              <InfoRow label="Course" value={session.user.course} />
              <InfoRow label="Semester" value={session.user.semester} />
              <InfoRow label="Department" value={session.user.department} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl border bg-card p-6 shadow-[var(--shadow-institutional)]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Your Seat Allocation</p>
            <h2 className="mt-2 text-3xl font-bold">You are allotted Seat {seat?.seatNumber ?? "A12"} in {allocation.room.name}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Metric icon={<CalendarDays />} label="Exam Name" value={allocation.examName} />
              <Metric icon={<MapPin />} label="Location" value={`${allocation.room.floor}, ${allocation.room.building}`} />
              <Metric icon={<Building2 />} label="Room" value={allocation.room.name} />
            </div>
            <SeatGrid allocation={allocation} highlightRoll={session.user.rollNumber} compact />
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [examName, setExamName] = useState("Mid Term");
  const [roomId, setRoomId] = useState("IL101");
  const [department, setDepartment] = useState("SOICT");
  const [studentCount, setStudentCount] = useState("40");
  const [alternateSeating, setAlternateSeating] = useState(false);
  const [allocation, setAllocation] = useState<SeatingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const students = useMemo(() => getStudentsByDepartment(department), [department]);
  const selectedStudentCount = Number(studentCount);
  const selectedStudents = useMemo(() => students.slice(0, selectedStudentCount), [students, selectedStudentCount]);
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  const usableCapacity = alternateSeating ? Math.ceil(room.capacity / 2) : room.capacity;
  const overflow = selectedStudents.length > usableCapacity;

  const generate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/generate-seating", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ examName, roomId, department, studentCount: selectedStudentCount, studentList: selectedStudents, alternateSeating }),
      });
      const data = (await response.json()) as SeatingResponse & { error?: string };
      if (!response.ok || data.error) throw new Error(data.error || "Unable to generate seating");
      setAllocation(data);
      toast.success("Seating generated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAllocation(null);
    toast.warning("Allocation reset. Regenerate to randomize seats.");
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader user={session.user} onLogout={onLogout} title="GBU Admin Panel" />
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="no-print mb-6 rounded-xl border bg-card p-5 shadow-[var(--shadow-institutional)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SelectField label="Select Exam" value={examName} onChange={setExamName} options={exams.map((item) => ({ value: item, label: item }))} />
            <SelectField label="Select Room" value={roomId} onChange={setRoomId} options={rooms.map((item) => ({ value: item.id, label: `${item.name} (Capacity ${item.capacity})` }))} />
            <SelectField label="Select Department" value={department} onChange={setDepartment} options={departments.map((item) => ({ value: item, label: item }))} />
            <SelectField label="Select Student Count" value={studentCount} onChange={setStudentCount} options={studentCountOptions.map((count) => ({ value: String(count), label: `${count} Students` }))} />
            <label className="flex items-center justify-between rounded-lg border bg-background/70 p-4 text-sm font-semibold">
              Enable Alternate Seating
              <input type="checkbox" checked={alternateSeating} onChange={(event) => setAlternateSeating(event.target.checked)} className="h-5 w-5 accent-[var(--primary)]" />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="institutional" onClick={generate} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Shuffle />} Generate Seating</Button>
            <Button variant="outline" onClick={reset}><RefreshCcw /> Reset Allocation</Button>
            <Button variant="gold" onClick={() => window.print()} disabled={!allocation}><Printer /> Print Layout</Button>
          </div>
        </div>

        <div className="no-print mb-6 grid gap-4 md:grid-cols-3">
          <Metric icon={<UsersRound />} label="Student Count" value={String(selectedStudents.length)} tone={overflow ? "danger" : "success"} />
          <Metric icon={<Building2 />} label="Room Capacity" value={`${usableCapacity} usable / ${room.capacity} total`} tone={overflow ? "danger" : "success"} />
          <Metric icon={<CheckCircle2 />} label="Capacity Indicator" value={overflow ? "Overflow" : "Capacity okay"} tone={overflow ? "danger" : "success"} />
        </div>

        <div className="print-a4 rounded-xl border bg-card p-5 shadow-[var(--shadow-institutional)]">
          <div className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <GbuBrand compact />
            <div className="text-left sm:text-right">
              <h2 className="text-2xl font-bold">Printable Seating Layout</h2>
              <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString("en-IN")}</p>
            </div>
          </div>
          {allocation ? (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-4">
                <InfoRow label="Exam Name" value={allocation.examName} />
                <InfoRow label="Room Name" value={allocation.room.name} />
                <InfoRow label="Department" value={allocation.department} />
                <InfoRow label="Pattern" value={allocation.pattern} />
              </div>
              <SeatGrid allocation={allocation} />
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <Metric label="Total Allocated" value={String(allocation.totalAllocated)} />
                <Metric label="Room Used" value={allocation.room.name} />
                <Metric label="Seating Pattern" value={allocation.pattern} />
                <Metric label="Empty Seats" value={String(allocation.remainingSeats)} />
              </div>
            </>
          ) : (
            <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-lg border border-dashed bg-secondary/50 p-8 text-center">
              <Building2 className="mb-4 h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">No seating generated yet</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Select exam, room, department, and generate a seating matrix. Reset and regenerate to randomize allotment.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>;
}

function Metric({ icon, label, value, tone }: { icon?: React.ReactNode; label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div className={`rounded-xl border bg-card p-4 shadow-sm ${tone === "success" ? "border-chart-3" : tone === "danger" ? "border-destructive" : ""}`}>
      <div className="mb-3 flex items-center gap-2 text-primary">{icon}<span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span></div>
      <p className={`text-xl font-bold ${tone === "success" ? "text-chart-3" : tone === "danger" ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function SeatGrid({ allocation, highlightRoll, compact = false }: { allocation: SeatingResponse; highlightRoll?: string; compact?: boolean }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <div className={`grid min-w-[520px] gap-2 print-grid`} style={{ gridTemplateColumns: `repeat(${allocation.room.columns}, minmax(0, 1fr))` }}>
        {allocation.seatingMatrix.map((seat) => {
          const highlighted = seat.student?.rollNumber === highlightRoll;
          return (
            <div key={seat.seatNumber} className={`safe-print-break min-h-16 rounded-md border p-2 text-xs transition ${seat.skipped ? "bg-muted text-muted-foreground opacity-60" : highlighted ? "bg-accent text-accent-foreground ring-2 ring-ring" : seat.student ? "bg-card hover:-translate-y-0.5 hover:shadow-md" : "bg-secondary/60 text-muted-foreground"}`}>
              <p className="font-bold">{seat.seatNumber}</p>
              {!compact && <p className="mt-1 break-words">{seat.skipped ? "Skipped" : seat.student?.rollNumber ?? "Empty"}</p>}
              {compact && <p className="mt-1 truncate">{seat.skipped ? "—" : seat.student ? "Filled" : "Empty"}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
