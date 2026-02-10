import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const t = token.trim() || tokenFromUrl;
    if (!t || !password) {
      setError("Token and new password are required.");
      setLoading(false);
      return;
    }
    try {
      await resetPassword(t, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col justify-center items-center p-4">
        <p className="text-green-600 font-medium">
          Password reset successful. You can log in now.
        </p>
        <Link to="/login" className="mt-4 text-blue-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[50vh] flex flex-col justify-center items-center">
      <p className="text-2xl font-bold mb-6">Reset Password</p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-100 rounded-2xl p-8 w-full max-w-md"
      >
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="border px-4 py-2 rounded-md"
          type="text"
          placeholder="Reset token (or use link from email)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <input
          className="border px-4 py-2 rounded-md"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
      <Link to="/login" className="mt-4 text-blue-600 hover:underline">
        Back to Login
      </Link>
    </div>
  );
}
