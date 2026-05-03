import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Onboarding({ userId, email }: { userId: string; email: string }) {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      username,
      age: parseInt(age),
      skill_level: skillLevel,
      position,
      coach_badge: false,
    });

    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="text-5xl">🏀</span>
        <h1 className="text-white text-3xl font-black mt-2">Let's set up your profile</h1>
        <p className="text-gray-400 mt-1">Tell us a bit about yourself to get started.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              placeholder="e.g. BallerKing23"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              required
              min="8"
              max="100"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              placeholder="e.g. 19"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Position</label>
            <select
              value={position}
              onChange={e => setPosition(e.target.value)}
              required
              className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
            >
              <option value="">Select your position</option>
              <option value="PG">Point Guard (PG)</option>
              <option value="SG">Shooting Guard (SG)</option>
              <option value="SF">Small Forward (SF)</option>
              <option value="PF">Power Forward (PF)</option>
              <option value="C">Center (C)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Skill Level</label>
            <select
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value)}
              required
              className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
            >
              <option value="">Select your skill level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition mt-2"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
