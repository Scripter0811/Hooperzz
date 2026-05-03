import { useEffect, useState } from "react";
import { supabase, type CoachingRequest, type Profile } from "../lib/supabase";
import PrivateChat from "./PrivateChat";

export default function CoachDashboard({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<(CoachingRequest & { player?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [chattingWith, setChattingWith] = useState<string | null>(null);
  const [chattingName, setChattingName] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  async function fetchRequests() {
    const { data } = await supabase
      .from("coaching_requests")
      .select("*")
      .eq("coach_id", userId)
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const playerIds = [...new Set(data.map(r => r.player_id))];
    const { data: players } = await supabase.from("profiles").select("*").in("id", playerIds);
    const playerMap: Record<string, Profile> = {};
    (players || []).forEach((p: Profile) => { playerMap[p.id] = p; });

    setRequests(data.map(r => ({ ...r, player: playerMap[r.player_id] })));
    setLoading(false);
  }

  async function updateStatus(id: string, status: "accepted" | "declined") {
    await supabase.from("coaching_requests").update({ status }).eq("id", id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  const pending = requests.filter(r => r.status === "pending");
  const accepted = requests.filter(r => r.status === "accepted");

  if (chattingWith) {
    return (
      <div>
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <button
            onClick={() => setChattingWith(null)}
            className="text-gray-400 hover:text-white transition mb-4 flex items-center gap-2"
          >
            ← Back to Coach Dashboard
          </button>
        </div>
        <PrivateChat userId={userId} clientId={chattingWith} label={`Chatting with ${chattingName}`} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-white text-3xl font-black">Coach Dashboard</h1>
        <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-sm font-bold px-3 py-1 rounded-full">🏅 Verified</span>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-20">Loading...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold">{pending.length}</div>
              <div className="text-gray-400 text-sm">Pending Requests</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold">{accepted.length}</div>
              <div className="text-gray-400 text-sm">Active Clients</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold">{requests.length}</div>
              <div className="text-gray-400 text-sm">Total Requests</div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-bold mb-4">Pending Coaching Requests</h2>
            {pending.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">No pending requests.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map(req => (
                  <div key={req.id} className="bg-white/5 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-bold">{req.player?.username || "Unknown Player"}</div>
                        <div className="text-gray-400 text-sm mb-2">{req.player?.position} · {req.player?.skill_level}</div>
                        <p className="text-gray-300 text-sm">{req.message}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => updateStatus(req.id, "accepted")}
                          className="bg-green-500/20 border border-green-500/40 text-green-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, "declined")}
                          className="bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Clients */}
          <div>
            <h2 className="text-white text-lg font-bold mb-4">Active Clients</h2>
            {accepted.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">No active clients yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {accepted.map(req => (
                  <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{req.player?.username || "Unknown"}</div>
                        <div className="text-gray-400 text-sm">{req.player?.position} · {req.player?.skill_level}</div>
                      </div>
                      <button
                        onClick={() => {
                          setChattingWith(req.player_id);
                          setChattingName(req.player?.username || req.player?.email || "Player");
                        }}
                        className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-500/30 transition"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
