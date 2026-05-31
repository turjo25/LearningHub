import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider.jsx";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, User, Phone, Lock, ArrowRight, Eye, EyeOff, CheckCircle, BookOpen, Award } from "lucide-react";

const InputWrapper = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    {children}
  </div>
);

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const values = {
      username: e.target.userName.value.trim(),
      first_name: e.target.firstName.value.trim(),
      last_name: e.target.lastName.value.trim(),
      phone: e.target.phone.value.trim(),
      password: e.target.password.value,
      role,
    };
    if (!values.username || !values.first_name || !values.phone || !values.password) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }
    if (values.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    try {
      await register(values);
      toast.success("Account created successfully! 🎉");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.username?.[0] || data?.phone?.[0] || data?.detail || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "student",
      label: "Student",
      desc: "I want to learn new skills",
      icon: BookOpen,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    },
    {
      value: "teacher",
      label: "Instructor",
      desc: "I want to teach and share knowledge",
      icon: Award,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
  ];


  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 relative z-20">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-[-10%] right-[-20%] w-[70%] h-[70%] rounded-full opacity-10 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl">Learning<span className="text-violet-300">Hub</span></span>
          </div>

          <h2 className="text-4xl font-display font-black text-white leading-tight mb-6">
            Join thousands of<br />lifelong learners.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-12">
            Create your free account and unlock access to expert-led courses, progress tracking, and verified certificates.
          </p>

          <div className="space-y-4">
            {[
              "Free account — no credit card needed",
              "Earn certificates upon course completion",
              "Learn at your own pace, anytime",
              "Access 10,000+ courses instantly",
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-violet-300 shrink-0" />
                <span className="text-white/80 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} LearningHub. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-start justify-center px-6 py-12 bg-white lg:bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Learning<span className="text-brand-500">Hub</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-black text-slate-900 mb-2 tracking-tight">Create your account ✨</h1>
            <p className="text-slate-500 text-sm">Start your learning journey in under 60 seconds.</p>
          </div>

          <form id="register-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">I want to…</label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map(({ value, label, desc, icon: Icon, gradient }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      role === value
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{ background: gradient }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <InputWrapper label="First Name *">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-firstName" name="firstName" type="text" placeholder="John" required className="glass-input pl-10" />
                </div>
              </InputWrapper>
              <InputWrapper label="Last Name">
                <input id="reg-lastName" name="lastName" type="text" placeholder="Doe" className="glass-input" />
              </InputWrapper>
            </div>

            {/* Username */}
            <InputWrapper label="Username *">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                <input id="reg-username" name="userName" type="text" placeholder="johndoe_x" required className="glass-input pl-8" />
              </div>
            </InputWrapper>

            {/* Phone */}
            <InputWrapper label="Phone Number *">
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-phone" name="phone" type="tel" placeholder="+1 234 567 8900" required className="glass-input pl-10" />
              </div>
            </InputWrapper>

            {/* Password */}
            <InputWrapper label="Password *">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  required
                  className="glass-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </InputWrapper>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">Already a member?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link to="/login" id="go-to-login" className="btn-secondary w-full h-11 justify-center">
            Sign In Instead
          </Link>

          <p className="text-center text-xs text-slate-400 mt-6">
            By creating an account, you agree to our{" "}
            <span className="text-brand-500 cursor-pointer hover:underline">Terms of Service</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
