import { useEffect, useState, useCallback } from "react";
import { getCourses } from "../../services/courseService";
import { getCategories } from "../../services/categoryService";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Star, BookOpen, Users, X } from "lucide-react";

const LEVELS = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function StarRating({ rating, count }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= full
              ? "fill-amber-400 text-amber-400"
              : star === full + 1 && half
              ? "fill-amber-200 text-amber-200"
              : "fill-slate-100 text-slate-200"
          }`}
        />
      ))}
      <span className="text-xs font-semibold text-amber-600 ml-0.5">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
}

function LevelBadge({ level }) {
  if (!level) return null;
  const map = {
    beginner:     "badge-green",
    intermediate: "badge-yellow",
    advanced:     "badge-red",
  };
  return (
    <span className={`badge capitalize ${map[level] || "badge-gray"}`}>{level}</span>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-48 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-3 shimmer rounded-full w-1/4" />
        <div className="h-5 shimmer rounded-full w-3/4" />
        <div className="h-4 shimmer rounded-full w-full" />
        <div className="h-4 shimmer rounded-full w-2/3" />
        <div className="flex justify-between items-center pt-3">
          <div className="h-6 shimmer rounded-full w-24" />
          <div className="h-6 shimmer rounded-full w-16" />
        </div>
        <div className="h-10 shimmer rounded-full mt-2" />
      </div>
    </div>
  );
}

function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      const cs = await getCourses(params);
      setCourses(cs || []);
    } catch {
      setError("Failed to load courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedLevel]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const hasFilters = debouncedSearch || selectedCategory || selectedLevel;
  const clearAll = () => { setSearchTerm(""); setSelectedCategory(""); setSelectedLevel(""); };

  return (
    <div className="min-h-screen py-10 px-4 page-enter">
      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="section-label">
            <BookOpen className="w-3.5 h-3.5" /> Course Catalog
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 mb-3">
            Explore <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Discover knowledge across every discipline. Learn from industry experts at your own pace.
          </p>
        </div>

        {/* ── Search + Filters bar ── */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="course-search"
                type="text"
                placeholder="Search courses or instructors…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10 h-11"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Level select */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="level-filter"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="glass-input pl-10 h-11 appearance-none pr-10 min-w-[160px] cursor-pointer"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  !selectedCategory
                    ? "bg-brand-600 border-brand-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                    : "bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? "bg-brand-600 border-brand-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                      : "bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600"
                  }`}
                >
                  <span>{cat.icon}</span>{cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Results bar ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
                Searching…
              </span>
            ) : (
              <>
                <span className="font-bold text-slate-900">{courses.length}</span>{" "}
                course{courses.length !== 1 ? "s" : ""} found
                {hasFilters && <span className="text-slate-400"> (filtered)</span>}
              </>
            )}
          </p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-full hover:bg-brand-50 transition-all border border-brand-200"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* ── Course Grid ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">
              {hasFilters ? "No courses match your filters" : "No courses yet"}
            </h2>
            <p className="text-slate-500 mb-6">
              {hasFilters ? "Try adjusting your search terms or filters." : "Check back soon for new content."}
            </p>
            {hasFilters && (
              <button onClick={clearAll} className="btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="course-card group block"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)" }}>
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-brand-200" />
                    </div>
                  )}
                  {/* Badges overlay */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {course.level && <LevelBadge level={course.level} />}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
                    {parseFloat(course.price) === 0 ? "Free" : `$${course.price}`}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1.5">
                    {course.category_name || "General"}
                  </p>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-3 group-hover:text-brand-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4 flex-grow leading-relaxed">
                    {course.description}
                  </p>

                  {/* Instructor row */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        {course.teacher_name ? course.teacher_name.charAt(0).toUpperCase() : "T"}
                      </div>
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[110px]">
                        {course.teacher_name || "Instructor"}
                      </span>
                    </div>
                    {course.lesson_count !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.lesson_count} lesson{course.lesson_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Rating + Students */}
                  <div className="flex items-center justify-between">
                    {course.average_rating ? (
                      <StarRating rating={course.average_rating} count={course.review_count} />
                    ) : (
                      <span className="text-xs text-slate-400 italic">No reviews yet</span>
                    )}
                  </div>

                  {/* CTA */}
                  <div
                    className="mt-4 w-full text-center py-2.5 rounded-full border-2 border-brand-500 text-brand-600 font-bold text-sm group-hover:bg-brand-600 group-hover:text-white transition-all duration-200"
                  >
                    View Course →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
