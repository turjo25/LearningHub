import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = e.target.email?.value?.trim();
    const password = e.target.password?.value;
    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }
    try {
      await login({
        email,
        password,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[70vh] flex flex-col justify-center items-center">
      <p className="text-2xl font-bold mb-6">Login</p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-100 rounded-2xl p-8 w-full max-w-md"
      >
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="border px-4 py-2 rounded-md"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          className="border px-4 py-2 rounded-md"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md cursor-pointer hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <Link
        to="/forgot-password"
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        Forgot password?
      </Link>
      <Link to="/register" className="mt-4 text-blue-600 hover:underline">
        Don&apos;t have an account? Register
      </Link>
    </div>
  );
}
