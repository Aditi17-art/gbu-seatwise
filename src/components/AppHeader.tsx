import { LogOut, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GbuBrand } from "./GbuBrand";
import type { AuthUser } from "@/lib/mock-auth";

export function AppHeader({ user, onLogout, title }: { user: AuthUser; onLogout: () => void; title: string }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-5">
          <GbuBrand compact />
          <div className="hidden h-10 w-px bg-border sm:block" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{user.role === "admin" ? "Authorized Access" : "Student Portal"}</p>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2 rounded-md border bg-background/70 px-3 py-2 text-sm">
            {user.role === "admin" ? <Shield className="h-4 w-4 text-primary" /> : <UserRound className="h-4 w-4 text-primary" />}
            <span className="max-w-[11rem] truncate font-medium">{user.name}</span>
          </div>
          <Button variant="glass" size="sm" onClick={onLogout}>
            <LogOut /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
