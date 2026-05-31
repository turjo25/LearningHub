import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { Bell, Menu, User, LogOut, GraduationCap, X, BookOpen } from "lucide-react";
import api from "../../services/api";

function Navbar({ toggleSidebar }) {
  const { user, logout, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/notifications/")
        .then(res => {
          const data = res.data.results || res.data;
          setNotifications(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.is_read).length;

  const markAsRead = (id) => {
    api.patch(`/notifications/${id}/`, { is_read: true })
      .then(() => setNotifications(safeNotifications.map(n => n.id === id ? { ...n, is_read: true } : n)))
      .catch(() => {});
  };

  if (isAuthLoading) return null;

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  function getRoleLabel(role) {
    if (role === "teacher") return { label: "Teacher", color: "text-violet-600 bg-violet-50 border-violet-200" };
    if (role === "admin") return { label: "Admin", color: "text-red-600 bg-red-50 border-red-200" };
    return { label: "Student", color: "text-brand-600 bg-brand-50 border-brand-200" };
  }

  const roleInfo = user ? getRoleLabel(user.role) : null;

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 backdrop-blur-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border-b border-slate-200/60"
        : "bg-white/80 backdrop-blur-xl border-b border-slate-100/60"
    }`}>
      <div className="flex items-center justify-between px-3 sm:px-6 h-16 max-w-[1400px] mx-auto">

        {/* ── Left: Hamburger + Logo ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <button
              id="sidebar-toggle"
              onClick={toggleSidebar}
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-bold text-sm sm:text-base md:text-lg text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors duration-200">
              Learning<span className="text-brand-500">Hub</span>
            </span>
          </Link>
        </div>

        {/* ── Center: Guest Nav Links ── */}
        {!user && (
          <ul className="hidden md:flex items-center gap-1">
            {[{ to: "/", label: "Home" }, { to: "/courses", label: "Courses" }].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? "text-brand-600 bg-brand-50 font-semibold"
                      : "text-slate-600 hover:text-brand-600 hover:bg-brand-50/50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  id="notification-bell"
                  onClick={() => { setShowNotifications(p => !p); setShowDropdown(false); }}
                  className="relative p-2.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-red-500 border-2 border-white rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] py-2 z-50 max-h-96 overflow-y-auto animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="badge badge-brand">{unreadCount} new</span>
                      )}
                    </div>
                    {safeNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-sm text-slate-400 text-center flex flex-col items-center gap-2">
                        <Bell className="w-8 h-8 text-slate-200" />
                        No notifications yet
                      </div>
                    ) : (
                      safeNotifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.is_read ? "bg-brand-50/40" : ""}`}
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id);
                            if (n.link) { setShowNotifications(false); navigate(n.link); }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
                            <div className={!n.is_read ? "ml-0" : "ml-4"}>
                              <p className={`text-sm leading-snug ${!n.is_read ? "font-semibold text-slate-900" : "text-slate-600"}`}>{n.message}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="profile-dropdown-btn"
                  onClick={() => { setShowDropdown(p => !p); setShowNotifications(false); }}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
                  aria-label="User menu"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                      {(user.first_name || user.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.first_name || user.username}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.first_name || user.username}</p>
                      <span className={`badge mt-1 capitalize ${roleInfo?.color}`}>{roleInfo?.label}</span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors rounded-lg mx-1"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      to="/courses"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors rounded-lg mx-1"
                    >
                      <BookOpen className="w-4 h-4" /> Courses
                    </Link>
                    <div className="my-1 mx-4 border-t border-slate-100" />
                    <button
                      onClick={() => { setShowDropdown(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-xs sm:text-sm inline-flex shrink-0">Sign In</Link>
              <Link to="/register" className="btn-primary text-xs sm:text-sm shrink-0">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
