import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { updateUserProfile, uploadAvatar } from "../../services/authService";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);       // File object chosen by user
  const [avatarPreview, setAvatarPreview] = useState(null); // local blob URL for preview
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
    });
  }, [user]);

  // Clean up blob URL when component unmounts or file changes
  useEffect(() => {
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    try {
      setUploadingAvatar(true);
      await uploadAvatar(user.user_id, avatarFile);
      await loadUser(); // refresh context so navbar updates
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(user.user_id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
      await loadUser();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function getRoleIcon(role) {
    if (role === "teacher") return "👨‍🏫";
    if (role === "admin") return "🛡️";
    return "🎓";
  }

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  // Show local preview if a file is chosen, otherwise show the saved avatar
  const displayAvatar = avatarPreview || user.avatar_url;

  return (
    <div className="min-h-screen bg-[#f8f7ff] py-8 px-4 max-w-2xl mx-auto">

      {/* ── Header card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-5">

          {/* Avatar + upload trigger */}
          <div className="relative shrink-0 group">
            {/* Image or fallback icon */}
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#e8e6ff]"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center text-3xl shadow-lg">
                {getRoleIcon(user.role)}
              </div>
            )}

            {/* Camera overlay — click to open file picker */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change photo"
            >
              <span className="text-white text-xl">📷</span>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-display font-bold text-gray-900 truncate">{displayName}</h1>
            <p className="text-gray-500 text-sm">@{user.username}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 capitalize">
                {getRoleIcon(user.role)} {user.role}
              </span>
              {user.email && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full truncate max-w-[200px]">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Upload action — only shown when a new file is selected */}
        {avatarFile && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-200">
            <p className="text-sm text-gray-700 flex-1 truncate">
              <span className="text-brand-600 font-medium">{avatarFile.name}</span>
              <span className="text-gray-500 ml-2">({(avatarFile.size / 1024).toFixed(0)} KB)</span>
            </p>
            <button
              type="button"
              onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-2"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
              className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
            >
              {uploadingAvatar ? "Uploading…" : "Upload Photo"}
            </button>
          </div>
        )}

        {!avatarFile && (
          <p className="text-xs text-gray-400 mt-3">
            Hover over your photo and click 📷 to change it. JPEG, PNG, GIF, WebP · max 5 MB.
          </p>
        )}
      </div>

      {/* ── Edit Form ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-display font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span>✏️</span> Edit Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1.5 font-medium">First Name</label>
              <input type="text" value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="glass-input bg-gray-50 w-full text-sm" placeholder="First name" />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1.5 font-medium">Last Name</label>
              <input type="text" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="glass-input bg-gray-50 w-full text-sm" placeholder="Last name" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1.5 font-medium">Email Address</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="glass-input bg-gray-50 w-full text-sm" placeholder="your@email.com" />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1.5 font-medium">Username</label>
            <input type="text" value={user.username} disabled
              className="glass-input w-full text-sm bg-gray-100 opacity-60 cursor-not-allowed text-gray-600" />
            <p className="text-gray-400 text-xs mt-1">Username cannot be changed.</p>
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1.5 font-medium">Role</label>
            <div className="glass-input w-full flex items-center gap-2 bg-gray-100 opacity-60 cursor-not-allowed text-sm text-gray-600 border-gray-200 py-2.5 px-3.5 rounded-xl">
              <span>{getRoleIcon(user.role)}</span>
              <span className="capitalize">{user.role}</span>
              <span className="ml-auto text-xs text-gray-400">Read-only</span>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
