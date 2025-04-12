import React, { useState } from "react";
import { Link, useLocation, NavLink } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  Package,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const AvatarPlaceholder: React.FC<{ fallback: string }> = ({ fallback }) => (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
    {fallback}
  </div>
);

const NavBar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home", icon: <Home className="mr-2 h-4 w-4" /> },
    {
      to: "/employees",
      label: "Employees",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      to: "/attendance",
      label: "Attendance",
      icon: <CalendarCheck className="mr-2 h-4 w-4" />,
    },
    {
      to: "/item-usage",
      label: "Items",
      icon: <Package className="mr-2 h-4 w-4" />,
    },
  ];
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return cn(
      "flex items-center text-sm font-medium transition-colors hover:text-primary",
      isActive
        ? "text-foreground dark:text-white font-semibold"
        : "text-muted-foreground"
    );
  };

  const getMobileNavLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }): string => {
    return cn(
      "flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
    );
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center px-4">
        {}
        <Link to="/" className="mr-8 flex items-center text-xl font-bold">
          {}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            EMS
          </span>
        </Link>

        {}
        {isAuthenticated && (
          <nav className="mx-6 hidden items-center space-x-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavLinkClass}
                end={item.to === "/"}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {}
        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {} {}
              <button
                onClick={handleLogout}
                title="Log out"
                className="hidden items-center justify-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground md:inline-flex"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className={getNavLinkClass}>
              Login
            </NavLink>
          )}

          {}
          {isAuthenticated && (
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring md:hidden"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {}
      {isAuthenticated && mobileMenuOpen && (
        <div className="border-t border-border/40 md:hidden" id="mobile-menu">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getMobileNavLinkClass}
                onClick={() => setMobileMenuOpen(false)}
                end={item.to === "/"}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
