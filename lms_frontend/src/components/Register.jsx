import React, { useState } from "react";
import { useAuth } from "../contexts/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const values = {
      username: e.target.userName.value.trim(),
      first_name: e.target.firstName.value.trim(),
      last_name: e.target.lastName.value.trim(),
      phone: e.target.phone.value.trim(),
      password: e.target.password.value,
    };

    // Validation
    if (
      !values.username ||
      !values.first_name ||
      !values.last_name ||
      !values.phone ||
      !values.password
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (values.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await register(values);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again.",
      );
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center bg-linear-to-br from-indigo-50 to-blue-100 px-4 ">
      {/* Left Side - Branding (hidden on mobile)
      <div className="absolute left-0 top-0 w-1/2 h-full bg-linear-to-r from-indigo-600 to-blue-600 hidden lg:flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-bold mb-4">Get Started</h1>
          <p className="text-xl text-indigo-100">
            Join our community of learners and begin your educational journey
          </p>
        </div>
      </div> */}

      {/* Right Side - Form */}
      <div className="w-full max-w-md mt-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join us to start learning and growing
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <span className="text-green-600 text-xl shrink-0">✓</span>
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 text-xl shrink-0">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                placeholder="John"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                placeholder="Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                name="userName"
                type="text"
                placeholder="johndoe123"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+880 123 456 7890"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">Already a member?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Login Link */}
          <a
            href="/login"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
          >
            Sign In
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}

export default Register;
