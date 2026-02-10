import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Courses from "./components/Courses.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Admin from "./components/Admin.jsx";
import CourseDetails from "./components/CourseDetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 mb-4">
                        404
                      </h1>
                      <p className="text-2xl text-gray-600 mb-8">
                        Page Not Found
                      </p>
                      <a
                        href="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
