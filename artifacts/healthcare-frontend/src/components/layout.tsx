import { Show, UserButton, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  User,
  Building2,
  Users,
  FileText,
  Menu,
  X,
  HeartPulse,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Jobs", href: "/jobs", icon: Briefcase, public: true },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, public: false },
  { label: "My Profile", href: "/profile", icon: User, public: false },
  { label: "My Applications", href: "/my-applications", icon: FileText, public: false },
  { label: "Post Jobs", href: "/employers", icon: Building2, public: false },
  { label: "Candidates", href: "/candidates", icon: Users, public: false },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center group-hover:bg-teal-700 transition-colors">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Healthcare <span className="text-teal-600">Launchpad</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.filter((n) => n.public).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  )}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
              <Show when="signed-in">
                {navItems.filter((n) => !n.public).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location === item.href
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}
                    data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </Show>
            </nav>

            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" data-testid="button-sign-in">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-get-started">
                    Get Started
                  </Button>
                </Link>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
              <button
                className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
            {navItems.filter((n) => n.public).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location === item.href
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <Show when="signed-in">
              {navItems.filter((n) => !n.public).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </Show>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HeartPulse className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-white">Healthcare Launchpad</span>
              </div>
              <p className="text-sm max-w-xs">
                Connecting healthcare students with clinical opportunities across Long Island, NY.
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <div className="text-white font-medium mb-2">Platform</div>
                <div className="space-y-1">
                  <div><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></div>
                  <div><Link href="/sign-up" className="hover:text-white transition-colors">For Students</Link></div>
                  <div><Link href="/employers" className="hover:text-white transition-colors">For Employers</Link></div>
                </div>
              </div>
              <div>
                <div className="text-white font-medium mb-2">Specialties</div>
                <div className="space-y-1">
                  <div className="hover:text-white transition-colors cursor-pointer">Nursing</div>
                  <div className="hover:text-white transition-colors cursor-pointer">EMT / EMS</div>
                  <div className="hover:text-white transition-colors cursor-pointer">Radiology</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 text-xs text-center">
            2026 Healthcare Launchpad. All rights reserved. Long Island, NY.
          </div>
        </div>
      </footer>
    </div>
  );
}
