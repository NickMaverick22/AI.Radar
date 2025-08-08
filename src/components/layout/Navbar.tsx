import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/rankings", label: "Rankings" },
  { to: "/compare", label: "Compare" },
  { to: "/updates", label: "Updates" },
  { to: "/admin", label: "Admin" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)))" }} />
          <span className="font-semibold tracking-tight">AI Market Radar</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/rankings">
            <Button size="sm">Explore Rankings</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
