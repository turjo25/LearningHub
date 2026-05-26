import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import {
  BookOpen, LayoutDashboard, Shield, PlayCircle,
  ClipboardList, PlusCircle, CheckSquare, GraduationCap, ChevronRight
} from "lucide-react";

export default function Sidebar({ isOpen }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading || !user) return null;

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const NavLink = ({ to, icon: Icon, label, title }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        title={title || label}
        className={`relative flex items-center ${
          isOpen ? "gap-3 px-3 py-2.5 mx-2" : "justify-center w-11 h-11 mx-auto"
        } mb-1 rounded-xl transition-all duration-200 group font-medium text-sm overflow-hidden ${
          active
            ? "text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
            : "text-slate-500 hover:bg-brand-50 hover:text-brand-600"
        }`}
        style={active ? { background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)" } : {}}
      >
        {/* Active glow effect */}
        {active && (
          <div className="absolute inset-0 rounded-xl opacity-20"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)" }} />
        )}
        <Icon className={`shrink-0 transition-transform duration-200 ${active ? "text-white" : "group-hover:scale-110"}`} style={{ width: "18px", height: "18px" }} />
        {isOpen && (
          <span className="truncate flex-1 text-[13px] leading-snug">{label}</span>
        )}
        {isOpen && active && (
          <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
        )}
      </Link>
    );
  };

  const SectionLabel = ({ children, isFirst }) =>
    isOpen ? (
      <div className="px-5 py-1 mt-4 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {children}
      </div>
    ) : isFirst ? null : (
      <div className="my-3 mx-4 border-t border-slate-100" />
    );

  return (
    <aside className={`relative flex-shrink-0 flex flex-col z-40 h-full transition-all duration-300 ease-out glass-sidebar ${
      isOpen ? "w-60" : "w-[68px]"
    }`}>
      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 flex flex-col overflow-y-auto overflow-x-hidden">
        <SectionLabel isFirst={true}>Menu</SectionLabel>
        <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavLink to="/courses" icon={BookOpen} label="Courses" />

        {/* Student links */}
        {user?.role === "student" && (
          <>
            <SectionLabel>My Learning</SectionLabel>
            <NavLink to="/my-lessons" icon={PlayCircle} label="My Lessons" />
            <NavLink to="/my-assignments" icon={ClipboardList} label="Assignments" />
          </>
        )}

        {/* Teacher links */}
        {user?.role === "teacher" && (
          <>
            <SectionLabel>Teaching</SectionLabel>
            <NavLink to="/courses/new" icon={PlusCircle} label="New Course" />
            <NavLink to="/add-lesson" icon={PlayCircle} label="Add Lesson" />
            <NavLink to="/grade" icon={CheckSquare} label="Grade Work" />
          </>
        )}

        {/* Admin links */}
        {user?.role === "admin" && (
          <>
            <SectionLabel>Administration</SectionLabel>
            <NavLink to="/admin" icon={Shield} label="Admin Hub" />
          </>
        )}
      </nav>

      {/* ── User card at bottom ── */}
      {isOpen && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
            {(user.first_name || user.username || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.first_name || user.username}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
