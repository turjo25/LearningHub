import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthProvider.jsx";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { GraduationCap, Phone, Lock, ArrowRight, Eye, EyeOff, BookOpen, Award, Users } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const values = {
      phone: e.target.phone.value.trim(),
      password: e.target.password.value,
    };
    if (!values.phone || !values.password) {
      toast.error('Please enter your phone number and password');
      setLoading(false);
      return;
    }
    try {
      await login(values);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: BookOpen, text: "10,000+ expert-led courses" },
    { icon: Award, text: "Industry-recognised certificates" },
    { icon: Users, text: "50,000+ global learners" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 relative z-20">

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #312e81 0%, #4c1d95 40%, #6d28d9 100%)" }}>
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Blob */}
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-3xl animate-blob"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl">Learning<span className="text-violet-300">Hub</span></span>
          </div>

          <h2 className="text-4xl font-display font-black text-white leading-tight mb-6">
            Your knowledge journey<br />continues here.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-12">
            Sign in to access your courses, track your progress, and earn certificates that open doors.
          </p>

          <div className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 backdrop-blur">
                  <Icon className="w-4 h-4 text-violet-300" />
                </div>
                <span className="text-white/80 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} LearningHub. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex items-center justify-center px-6 py-16 bg-white lg:bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Learning<span className="text-brand-500">Hub</span></span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-display font-black text-slate-900 mb-2 tracking-tight">Welcome back 👋</h1>
            <p className="text-slate-500 text-sm">Sign in to continue your learning journey.</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  required
                  className="glass-input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">Don't have an account?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link
            to="/register"
            id="go-to-register"
            className="btn-secondary w-full h-11 justify-center"
          >
            Create a free account
          </Link>

          <p className="text-center text-xs text-slate-400 mt-8">
            By signing in, you agree to our{' '}
            <span className="text-brand-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
            and{' '}
            <span className="text-brand-500 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
