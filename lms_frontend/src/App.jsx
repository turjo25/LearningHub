import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./components/home/Home.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import Courses from "./components/courses/Courses.jsx";
import AuthProvider, { useAuth } from "./contexts/AuthProvider.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Footer from "./components/layout/Footer.jsx";
import Admin from "./components/dashboard/Admin.jsx";
import CourseDetails from "./components/courses/CourseDetails.jsx";
import StudentDashboard from "./components/dashboard/StudentDashboard.jsx";
import TeacherDashboard from "./components/dashboard/TeacherDashboard.jsx";
import LessonViewer from "./components/lessons/LessonViewer.jsx";
import AssignmentDetails from "./components/assignments/AssignmentDetails.jsx";
import Profile from "./components/auth/Profile.jsx";
import CourseBuilder from "./components/courses/CourseBuilder.jsx";
import Certificate from "./components/courses/Certificate.jsx";
import MyLessons from "./components/lessons/MyLessons.jsx";
import MyAssignments from "./components/assignments/MyAssignments.jsx";
import AddLesson from "./components/lessons/AddLesson.jsx";
import GradeWork from "./components/assignments/GradeWork.jsx";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";

// Smart dashboard that routes by role
function Dashboard() {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "teacher") return <TeacherDashboard />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <StudentDashboard />;
}

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const { user, isAuthLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Close sidebar on route change for mobile screens
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Adjust sidebar state when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  if (isAuthLoading) return null;

  if (user) {
    // Logged-in Layout: Navbar (Top) + Sidebar + Main Content
    return (
      <div className="flex flex-col h-screen bg-transparent relative overflow-hidden">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex flex-1 overflow-hidden relative z-10">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          {/* Backdrop overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="md:hidden absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto scroll-smooth">
            <main className="grow p-2 sm:p-6 lg:p-8">
              <div key={location.pathname} className="page-transition">
                {children}
              </div>
            </main>
            {isHome && <Footer />}
          </div>
        </div>
      </div>
    );
  }

  // Guest Layout: Navbar + Main Content
  return (
    <div className="flex flex-col h-screen bg-transparent relative overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <main className="grow z-10 flex flex-col min-h-full">
          <div className="grow">
            <div key={location.pathname} className="page-transition">
              {children}
            </div>
          </div>
          {isHome && <Footer />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '10px' } }} />
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
            
            {/* Student Sidebar aliases */}
            <Route path="/my-lessons" element={<PrivateRoute><MyLessons /></PrivateRoute>} />
            <Route path="/my-assignments" element={<PrivateRoute><MyAssignments /></PrivateRoute>} />

            {/* Teacher Sidebar aliases */}
            <Route path="/add-lesson" element={<PrivateRoute><AddLesson /></PrivateRoute>} />
            <Route path="/grade" element={<PrivateRoute><GradeWork /></PrivateRoute>} />

            {/* Teacher course builder — must be before /courses/:id */}
            <Route path="/courses/new" element={<PrivateRoute><CourseBuilder /></PrivateRoute>} />
            <Route path="/courses/:courseId/manage" element={<PrivateRoute><CourseBuilder /></PrivateRoute>} />
            
            {/* Course consumption routes */}
            <Route path="/courses/:id" element={<PrivateRoute><CourseDetails /></PrivateRoute>} />
            <Route path="/courses/:courseId/lessons" element={<PrivateRoute><LessonViewer /></PrivateRoute>} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<PrivateRoute><LessonViewer /></PrivateRoute>} />
            
            <Route path="/assignments/:id" element={<PrivateRoute><AssignmentDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-[80vh] flex items-center justify-center">
                  <div className="text-center glass-panel p-12 max-w-lg mx-auto transform animate-float">
                    <h1 className="text-7xl font-display font-bold text-transparent bg-clip-text bg-linear-to-r from-brand-400 to-accent-400 mb-4">
                      404
                    </h1>
                    <p className="text-2xl text-gray-300 mb-8 font-light">Lost in cyberspace</p>
                    <a href="/" className="btn-primary">Return Home</a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
