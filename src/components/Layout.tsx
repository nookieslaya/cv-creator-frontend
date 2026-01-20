import { NavLink, Outlet } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

const navItems = [
  { label: "Profile", path: "/profile" },
  { label: "Skills", path: "/skills" },
  { label: "Projects", path: "/projects" },
  { label: "Experience", path: "/experience" },
  { label: "Education", path: "/education" },
  { label: "Languages", path: "/languages" },
  { label: "CV Generator", path: "/cv" },
];

export default function Layout() {
  return (
    <div className="min-h-screen text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-6 py-8">
        <aside className="w-60 shrink-0">
          <div className="rounded-2xl bg-white p-5 shadow-panel">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate">Dashboard</p>
                <h1 className="text-lg font-semibold text-ink">CV Manager</h1>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
            <nav className="flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 font-medium ${
                      isActive ? "bg-accent-light text-accent" : "text-slate hover:text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
