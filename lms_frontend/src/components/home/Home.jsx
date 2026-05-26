import React from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api, { unwrap } from "../../services/api";
import { ArrowRight, Star, Users, BookOpen, Award, Zap, Shield, TrendingUp, Play, CheckCircle } from "lucide-react";

/* ── Reusable Components ── */
function StatBadge({ value, label, icon: Icon, gradient }) {
  return (
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: gradient }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-display font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />
      ))}
      <span className="text-xs font-semibold text-amber-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function CourseCard({ course }) {
  const levelColors = {
    beginner: "badge-green",
    intermediate: "badge-yellow",
    advanced: "badge-red",
  };
  return (
    <div className="course-card group">
      <div className="relative h-44 bg-gradient-to-br from-brand-100 to-accent-100 overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500">📖</div>
        )}
        {course.level && (
          <div className="absolute top-3 left-3">
            <span className={`badge capitalize ${levelColors[course.level] || "badge-gray"}`}>{course.level}</span>
          </div>
        )}
        {course.price !== undefined && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
            {parseFloat(course.price) === 0 ? "Free" : `$${course.price}`}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">{course.category_name || "General"}</p>
        <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors leading-snug">{course.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
            {course.teacher_name ? course.teacher_name.charAt(0).toUpperCase() : "T"}
          </div>
          <span className="text-xs text-slate-500 font-medium truncate">{course.teacher_name || "Instructor"}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <StarRating rating={course.average_rating} />
          {course.lesson_count !== undefined && (
            <span className="text-xs text-slate-400 font-medium">{course.lesson_count} lessons</span>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, gradient }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] group">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: gradient }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Home() {
  const { isAuthLoading, user } = useAuth();

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["featuredCourses"],
    queryFn: async () => {
      const res = await api.get("/course/");
      return unwrap(res.data).slice(0, 3);
    },
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const res = await api.get("/teacher/");
      return unwrap(res.data).slice(0, 4);
    },
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-hidden">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full opacity-[0.07] blur-3xl animate-blob"
            style={{ background: "radial-gradient(circle, #6366f1, #8b5cf6)" }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full opacity-[0.06] blur-3xl animate-blob"
            style={{ background: "radial-gradient(circle, #8b5cf6, #a78bfa)", animationDelay: "3s" }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-7 animate-slide-up">
            <div className="section-label">
              <Zap className="w-3.5 h-3.5" /> Welcome to LearningHub
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-slate-900 leading-[1.06] tracking-tight">
              Learn, Grow &amp;{" "}
              <span className="relative inline-block">
                <span className="gradient-text">Succeed</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9 Q75 2 150 9 Q225 16 298 9" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
                </svg>
              </span>
              <br/>
              <span className="text-slate-400 font-light text-4xl sm:text-5xl lg:text-6xl">Online.</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
              A world-class Learning Management System. Study at your own pace with expert-led courses across every discipline.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {!user ? (
                <>
                  <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                    Start Learning Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/courses" className="flex items-center gap-2.5 text-slate-700 hover:text-brand-600 font-semibold transition-colors group">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center group-hover:border-brand-300 transition-colors">
                      <Play className="w-3.5 h-3.5 text-brand-600 fill-brand-600 ml-0.5" />
                    </div>
                    Browse Courses
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex -space-x-2">
                {["#6366f1","#8b5cf6","#a78bfa","#c4b5fd"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: c }}>
                    {["A","B","C","D"][i]}
                  </div>
                ))}
              </div>
              <div className="flex flex-col pl-1">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-xs text-slate-400">50,000+ happy learners</span>
              </div>
            </div>
          </div>

          {/* Right stats */}
          <div className="relative hidden lg:flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-sm space-y-4">
              <StatBadge value="10,000+" label="Active Courses" icon={BookOpen} gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
              <StatBadge value="50,000+" label="Enrolled Students" icon={Users} gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
              <StatBadge value="300+" label="Expert Instructors" icon={Award} gradient="linear-gradient(135deg, #10b981, #059669)" />
              <StatBadge value="4.9 / 5" label="Average Rating" icon={Star} gradient="linear-gradient(135deg, #f59e0b, #f97316)" />
            </div>

            {/* Floating checkmarks */}
            <div className="absolute -right-8 top-12 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-slate-100 px-4 py-3 flex items-center gap-2.5 animate-float">
              <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
              <span className="text-sm font-semibold text-slate-800">Certificate Ready</span>
            </div>
            <div className="absolute -left-8 bottom-12 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-slate-100 px-4 py-3 flex items-center gap-2.5 animate-float" style={{ animationDelay: "2s" }}>
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <span className="text-sm font-semibold text-slate-800">Track Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MARQUEE BANNER ═══════════════ */}
      <div className="w-full overflow-hidden py-4 my-2" style={{ background: "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)" }}>
        <div className="flex whitespace-nowrap animate-marquee select-none">
          {["Design", "Develop", "Deploy", "Learn", "Grow", "Succeed", "Innovate", "Create"].flatMap((w, i) => [
            <span key={`a-${i}`} className="inline-block text-white/90 font-display font-bold text-xl mx-8">✦ {w}</span>
          ])}
          {["Design", "Develop", "Deploy", "Learn", "Grow", "Succeed", "Innovate", "Create"].flatMap((w, i) => [
            <span key={`b-${i}`} className="inline-block text-white/90 font-display font-bold text-xl mx-8">✦ {w}</span>
          ])}
        </div>
      </div>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <div className="section-label justify-center">
            <Shield className="w-3.5 h-3.5" /> Why Choose Us
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-900 mb-4">
            Everything you need to <span className="gradient-text">excel</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            From expert-led content to real-time progress tracking — we've built the complete learning experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={BookOpen} title="Expert Content" desc="Curated courses by industry-leading professionals with real-world experience." gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
          <FeatureCard icon={TrendingUp} title="Track Progress" desc="Visualize your learning journey with detailed progress indicators and insights." gradient="linear-gradient(135deg, #10b981, #059669)" />
          <FeatureCard icon={Award} title="Earn Certificates" desc="Get recognized with verifiable certificates upon completing your courses." gradient="linear-gradient(135deg, #f59e0b, #f97316)" />
          <FeatureCard icon={Users} title="Learn Together" desc="Join a thriving community of students and mentors from around the world." gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
        </div>
      </section>

      {/* ═══════════════ FEATURED COURSES ═══════════════ */}
      <section className="py-24 w-full" style={{ background: "linear-gradient(180deg, #f8f9ff 0%, #eef2ff 100%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <div className="section-label"><Zap className="w-3.5 h-3.5" /> Featured</div>
              <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-900">
                Trending <span className="gradient-text">Courses</span>
              </h2>
            </div>
            <Link to="/courses" className="btn-secondary shrink-0">
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                  <div className="h-44 shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 shimmer rounded-full w-1/3" />
                    <div className="h-5 shimmer rounded-full w-4/5" />
                    <div className="h-4 shimmer rounded-full w-2/3" />
                    <div className="h-10 shimmer rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <div className="text-5xl mb-3">📚</div>
              <p className="text-slate-500">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {courses.map(course => (
                <Link key={course.id} to={`/courses/${course.id}`} className="block">
                  <CourseCard course={course} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ MENTORS ═══════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-14">
          <div className="section-label justify-center"><Users className="w-3.5 h-3.5" /> Expert Mentors</div>
          <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-900">
            Learn from the <span className="gradient-text">best</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mt-3">
            Our instructors are seasoned professionals committed to your success.
          </p>
        </div>

        {teachersLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full shimmer" />
                <div className="h-4 shimmer rounded-full w-32" />
                <div className="h-3 shimmer rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher, i) => {
              const gradients = [
                "linear-gradient(135deg, #6366f1, #8b5cf6)",
                "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                "linear-gradient(135deg, #10b981, #059669)",
                "linear-gradient(135deg, #f59e0b, #f97316)",
              ];
              return (
                <div key={teacher.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] transition-all duration-300 text-center group">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ background: gradients[i % 4] }}>
                    {teacher.name ? teacher.name.charAt(0).toUpperCase() : "T"}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{teacher.name}</h3>
                  <p className="text-sm text-brand-500 font-medium mt-0.5">{teacher.subject || "Expert Instructor"}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      {!user && (
        <section className="py-20 mx-6 mb-16 rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #7c3aed 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px, 30px 30px" }} />
          <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4 leading-tight">
              Ready to start your learning journey?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join thousands of learners already growing with LearningHub. Free to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="bg-white text-brand-700 font-bold py-3.5 px-8 rounded-full hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/courses" className="text-white/90 hover:text-white font-semibold py-3.5 px-8 rounded-full border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-200 inline-flex items-center gap-2">
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default Home;
