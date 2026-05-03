import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DRILLS = [
  { id: "d1", name: "Mikan Drill", category: "Post", description: "Develop touch and footwork around the basket with continuous layups.", icon: "🏀" },
  { id: "d2", name: "3-Man Weave", category: "Passing", description: "Improve ball movement and teamwork on the fast break.", icon: "🔄" },
  { id: "d3", name: "Form Shooting", category: "Shooting", description: "Build proper shooting mechanics from close range.", icon: "🎯" },
  { id: "d4", name: "Cone Dribbling", category: "Handles", description: "Weave through cones to sharpen dribbling control and speed.", icon: "🚦" },
  { id: "d5", name: "2-Ball Dribbling", category: "Handles", description: "Enhance weak-hand coordination with two-ball dribbling drills.", icon: "✌️" },
  { id: "d6", name: "Defensive Slides", category: "Defense", description: "Build lateral quickness and defensive positioning with slide drills.", icon: "🛡️" },
  { id: "d7", name: "Free Throw Routine", category: "Shooting", description: "Develop a consistent pre-shot routine for clutch free throws.", icon: "🎰" },
  { id: "d8", name: "Wing Attack Combos", category: "Offense", description: "Practice off-the-dribble attack moves from wing positions.", icon: "⚡" },
  { id: "d9", name: "Shell Defense Drill", category: "Defense", description: "Master help-side defense and rotations in a 4-on-4 shell.", icon: "🔒" },
  { id: "d10", name: "Elbow Jumper", category: "Shooting", description: "Perfect mid-range consistency from both elbows.", icon: "📐" },
];

const CATEGORIES = ["All", "Shooting", "Handles", "Defense", "Offense", "Post", "Passing"];

export default function Lessons({ userId }: { userId: string }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("drill_progress")
      .select("drill_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        setCompleted(new Set((data || []).map((d: any) => d.drill_id)));
        setLoading(false);
      });
  }, [userId]);

  async function toggleDrill(drillId: string) {
    if (completed.has(drillId)) {
      await supabase.from("drill_progress").delete().eq("user_id", userId).eq("drill_id", drillId);
      setCompleted(prev => { const n = new Set(prev); n.delete(drillId); return n; });
    } else {
      await supabase.from("drill_progress").insert({ user_id: userId, drill_id: drillId });
      setCompleted(prev => new Set([...prev, drillId]));
    }
  }

  const filtered = filter === "All" ? DRILLS : DRILLS.filter(d => d.category === filter);
  const progress = Math.round((completed.size / DRILLS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-white text-3xl font-black mb-2">Drill Library 📋</h1>
      <p className="text-gray-400 mb-6">Complete drills to track your training progress.</p>

      {/* Progress Bar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">Overall Progress</span>
          <span className="text-orange-400 font-bold">{completed.size}/{DRILLS.length}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === cat
                ? "bg-orange-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drills */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading drills...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(drill => (
            <div key={drill.id} className={`bg-white/5 border rounded-xl p-4 flex items-center gap-4 transition ${
              completed.has(drill.id) ? "border-orange-500/40 bg-orange-500/5" : "border-white/10"
            }`}>
              <div className="text-3xl">{drill.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{drill.name}</span>
                  <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{drill.category}</span>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{drill.description}</p>
              </div>
              <button
                onClick={() => toggleDrill(drill.id)}
                className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                  completed.has(drill.id)
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-white/30 text-transparent hover:border-orange-400"
                }`}
              >
                ✓
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
