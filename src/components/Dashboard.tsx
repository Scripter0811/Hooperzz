import { useEffect, useState } from "react";
import { supabase, type Profile, type Upload, ADMIN_USER_IDS } from "../lib/supabase";

export default function Dashboard({
  profile,
  userId,
  onNavigate,
}: {
  profile: Profile;
  userId: string;
  onNavigate: (page: string) => void;
}) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const isAdmin = ADMIN_USER_IDS.includes(userId);

  useEffect(() => {
    supabase
      .from("uploads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setUploads(data || []));

    if (isAdmin) {
      supabase
        .from("coach_applications")
        .select("*, profiles(username, email)")
        .eq("status", "pending")
        .then(({ data }) => setPendingApplications(data || []));
    }
  }, [userId, isAdmin]);

  async function approveApplication(appId: string, appUserId: string) {
    await supabase.from("coach_applications").update({ status: "approved" }).eq("id", appId);
    await supabase.from("profiles").update({ coach_badge: true }).eq("id", appUserId);
    setPendingApplications((prev) => prev.filter((a) => a.id !== appId));
  }

  async function denyApplication(appId: string) {
    await supabase.from("coach_applications").update({ status: "denied" }).eq("id", appId);
    setPendingApplications((prev) => prev.filter((a) => a.id !== appId));
  }

  const statCards = [
    { label: "Uploads", value: uploads.length, icon: "🎥" },
    { label: "Position", value: profile.position || "—", icon: "🏀" },
    { label: "Skill Level", value: profile.skill_level || "—", icon: "⚡" },
    { label: "Age", value: profile.age || "—", icon: "📅" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-3xl font-black">
            Welcome back, {profile.username || "Hooper"} 👋
          </h1>
          <p className="text-gray-400 mt-1">{profile.email}</p>
        </div>
        {profile.coach_badge ? (
          <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold px-4 py-2 rounded-full">
            <span>🏅</span> Coach Verified
          </div>
        ) : (
          <button
            onClick={() => onNavigate("coachApply")}
            className="bg-orange-500/20 border border-orange-500/40 text-orange-400 font-semibold px-4 py-2 rounded-full hover:bg-orange-500/30 transition text-sm"
          >
            Apply to be a Coach
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-white text-xl font-bold">{s.value}</div>
            <div className="text-gray-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Upload Film", page: "uploads", icon: "🎥" },
          { label: "Drills", page: "lessons", icon: "📋" },
          { label: "Notes", page: "notes", icon: "📝" },
          { label: "Chat", page: "chat", icon: "💬" },
        ].map((q) => (
          <button
            key={q.page}
            onClick={() => onNavigate(q.page)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition"
          >
            <div className="text-2xl mb-1">{q.icon}</div>
            <div className="text-white text-sm font-semibold">{q.label}</div>
          </button>
        ))}
      </div>

      {/* Recent Uploads */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-lg font-bold">Recent Uploads</h2>
          <button onClick={() => onNavigate("uploads")} className="text-orange-400 text-sm hover:text-orange-300 transition">
            View All →
          </button>
        </div>
        {uploads.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
            No uploads yet.{" "}
            <button onClick={() => onNavigate("uploads")} className="text-orange-400 hover:text-orange-300 transition">
              Upload your first video
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {uploads.map((u) => (
              <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-orange-500/20 text-orange-400 rounded-lg p-3 text-2xl">🎥</div>
                <div>
                  <div className="text-white font-semibold">{u.title || "Untitled Video"}</div>
                  <div className="text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Panel */}
      {isAdmin && pendingApplications.length > 0 && (
        <div>
          <h2 className="text-white text-lg font-bold mb-3">Pending Coach Applications</h2>
          <div className="flex flex-col gap-3">
            {pendingApplications.map((app) => (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-bold">{app.profiles?.username || "Unknown"}</div>
                    <div className="text-gray-400 text-sm mb-2">{app.profiles?.email}</div>
                    <div className="text-gray-300 text-sm">{app.bio}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => approveApplication(app.id, app.user_id)}
                      className="bg-green-500/20 border border-green-500/40 text-green-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => denyApplication(app.id)}
                      className="bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
