import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/authService";
import { useAuth } from "../contexts/AuthProvider";

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    const form = e.target;
    try {
      await updateProfile({
        email: form.email?.value,
        first_name: form.first_name?.value,
        last_name: form.last_name?.value,
        phone: form.phone?.value || "",
      });
      setMessage("Profile updated.");
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please log in.</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-100 rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            className="border px-4 py-2 rounded-md w-full bg-gray-200"
            value={profile?.username ?? ""}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <input
            className="border px-4 py-2 rounded-md w-full bg-gray-200 capitalize"
            value={profile?.role ?? ""}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            name="email"
            className="border px-4 py-2 rounded-md w-full"
            type="email"
            defaultValue={profile?.email ?? ""}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            name="first_name"
            className="border px-4 py-2 rounded-md w-full"
            defaultValue={profile?.first_name ?? ""}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            name="last_name"
            className="border px-4 py-2 rounded-md w-full"
            defaultValue={profile?.last_name ?? ""}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            name="phone"
            className="border px-4 py-2 rounded-md w-full"
            defaultValue={profile?.phone ?? ""}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? "Saving..." : "Update profile"}
        </button>
      </form>
    </div>
  );
}
