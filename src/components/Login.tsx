import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col items-center justify-center px-4">
      <button onClick={() => onNavigate("landing")} className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition">
        <span className="text-2xl">🏀</span>
        <span className="text-2xl font-black text-white">Hooperz</span>
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-white text-2xl font-bold mb-1">{isSignUp ? "Create Account" : "Welcome back"}</h2>
        <p className="text-gray-400 text-sm mb-6">{isSignUp ? "Join the court." : "Sign in to your account."}</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition mt-2"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-orange-400 hover:text-orange-300 font-semibold transition">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
