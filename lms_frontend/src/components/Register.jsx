import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const values = {
      email: e.target.email.value.trim(),
      password: e.target.password.value,
      username: e.target.email.value.trim().split("@")[0] + "_" + Date.now(),
      role: "student",
    };
    if (!values.email || !values.password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }
    try {
      await register(values);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        err.message ||
        "Registration failed";
      setError(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col justify-center items-center">
      <p className="text-2xl font-bold mb-6">Register</p>
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
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md cursor-pointer hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <Link to="/login" className="mt-4 text-blue-600 hover:underline">
        Already have an account? Login
      </Link>
    </div>
  );
}
