import { useAuth } from "../contexts/AuthProvider";
import { Link } from "react-router-dom";

function Home() {
  const { isAuthLoading, user } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Learning Hub</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Unlock your potential with our comprehensive online learning
            platform. Access courses from expert instructors and learn at your
            own pace.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/courses"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Courses
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 transition duration-200"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              to="/courses"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Courses
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-8 rounded-lg hover:shadow-lg transition duration-200">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                📚
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Expert Courses
              </h3>
              <p className="text-gray-600">
                Access high-quality courses created by industry experts and
                experienced instructors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-indigo-50 p-8 rounded-lg hover:shadow-lg transition duration-200">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                ⏰
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Learn at Your Pace
              </h3>
              <p className="text-gray-600">
                Study whenever you want, wherever you want. No fixed schedules
                or deadlines.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 p-8 rounded-lg hover:shadow-lg transition duration-200">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                🏆
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Certification
              </h3>
              <p className="text-gray-600">
                Earn recognized certificates upon completion to showcase your
                achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8">
            Join thousands of students already learning on our platform.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition duration-200"
            >
              Get Started Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
