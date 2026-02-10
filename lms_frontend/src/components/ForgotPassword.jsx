import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col justify-center items-center p-4">
        <p className="text-green-600 font-medium">
          If an account exists with this email, you will receive a reset link.
        </p>
        <Link to="/login" className="mt-4 text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[50vh] flex flex-col justify-center items-center">
      <p className="text-2xl font-bold mb-6">Forgot Password</p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-100 rounded-2xl p-8 w-full max-w-md"
      >
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="border px-4 py-2 rounded-md"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link to="/login" className="mt-4 text-blue-600 hover:underline">
        Back to Login
      </Link>
    </div>
  );
}
