import { Link } from "react-router-dom";
import { GraduationCap, Mail, ArrowRight } from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);



function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: "Browse Courses", to: "/courses" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "My Lessons", to: "/my-lessons" },
      { label: "Assignments", to: "/my-assignments" },
    ],
    Account: [
      { label: "Sign In", to: "/login" },
      { label: "Create Account", to: "/register" },
      { label: "My Profile", to: "/profile" },
    ],
  };

  const socials = [
    { href: "mailto:turjo@gmail.com", icon: Mail, label: "Email" },
    { href: "https://github.com/turjo25", icon: GithubIcon, label: "GitHub" },
    { href: "https://linkedin.com/in/turjo25", icon: LinkedinIcon, label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      {/* ── Top CTA bar ── */}
      <div className="border-b border-slate-100"
        style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-brand-600 mb-1">Ready to level up?</p>
            <h3 className="text-xl font-display font-black text-slate-900">Start learning for free today.</h3>
          </div>
          <Link to="/register" className="btn-primary shrink-0 px-6 py-3">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Main footer content ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900 font-display font-bold text-xl tracking-tight">
                Learning<span className="text-brand-500">Hub</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              A world-class learning platform empowering students and instructors alike. Learn, grow, and earn certificates — at your own pace.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2 mt-1">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-wide uppercase">{section}</h4>
              <nav className="flex flex-col gap-2.5">
                {items.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-sm text-slate-500 hover:text-brand-600 transition-colors w-fit hover:translate-x-0.5 transition-transform duration-150"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {year} <span className="text-slate-600 font-semibold">LearningHub</span>. Built with ❤️ by Turjo.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
