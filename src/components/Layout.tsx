import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChartColumn, Layers, Library, Moon, PencilLine, Search, Sun, Waves } from "lucide-react";
import { useAppState } from "../context/AppState";
import { studyStats } from "../lib/stats";
import { SearchPalette } from "./SearchPalette";
import { TileMark } from "./TileMark";

const links = [
  { to: "/", label: "Today", icon: Waves },
  { to: "/subjects", label: "Subjects", icon: Library },
  { to: "/study", label: "Study", icon: Layers },
  { to: "/practice", label: "Practice", icon: PencilLine },
  { to: "/progress", label: "Progress", icon: ChartColumn },
];

export function Layout() {
  const { settings, setTheme, progress } = useAppState();
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const due = studyStats(progress).due.length;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const dark = settings.theme === "dark";
  const ThemeIcon = dark ? Sun : Moon;
  const toggleTheme = () => setTheme(dark ? "light" : "dark");

  return (
    <div className="min-h-screen bg-ground text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="rail sticky top-0 hidden h-screen flex-col px-3 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-3 px-3">
          <TileMark size={30} />
          <span className="pt text-[23px] leading-none">Português</span>
        </Link>
        <button type="button" onClick={() => setSearchOpen(true)} className="rail-search mt-8 cursor-pointer">
          <Search size={16} strokeWidth={1.7} />
          <span className="flex-1 text-left">Search</span>
          <span className="kbd">⌘K</span>
        </button>
        <nav aria-label="Main" className="mt-5 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `rail-item ${isActive ? "active" : ""}`}>
              <link.icon />
              {link.label}
              {link.to === "/study" && due ? <span className="rail-count num">{due}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <button type="button" onClick={toggleTheme} className="rail-item w-full cursor-pointer">
            <ThemeIcon />
            {dark ? "Day promenade" : "Night promenade"}
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="rail sticky top-0 z-20 flex h-14 items-center justify-between gap-2 px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <TileMark size={26} />
            <span className="pt text-[21px] leading-none">Português</span>
          </Link>
          <div className="flex items-center">
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} className="btn btn-ghost btn-icon !text-[var(--on-basalt)] hover:!bg-[var(--basalt-2)]">
              <Search size={19} strokeWidth={1.7} />
            </button>
            <button type="button" aria-label={dark ? "Use day theme" : "Use night theme"} onClick={toggleTheme} className="btn btn-ghost btn-icon !text-[var(--on-basalt)] hover:!bg-[var(--basalt-2)]">
              <ThemeIcon size={19} strokeWidth={1.7} />
            </button>
          </div>
        </header>
        <main className="px-4 pt-6 pb-32 sm:px-6 lg:px-12 lg:pt-10 lg:pb-16">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <nav aria-label="Main" className="tabbar fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}>
            <link.icon />
            {link.label}
            <span className="tab-dot" />
          </NavLink>
        ))}
      </nav>

      {searchOpen ? <SearchPalette onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}
