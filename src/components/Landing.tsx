import { supabase } from "../lib/supabase";

export default function Landing({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏀</span>
          <span className="text-white text-2xl font-black tracking-tight">Hooperz</span>
        </div>
        <button
          onClick={() => onNavigate("login")}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2 rounded-lg transition"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block bg-orange-500/20 border border-orange-500/40 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          The #1 Basketball Training Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          Train Smarter.<br />
          <span className="text-orange-500">Hoop Better.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
          Upload your game film, track your drills, connect with certified coaches, and level up your basketball IQ — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate("login")}
            className="bg-orange-500 hover:bg-orange-400 text-white text-lg font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-orange-500/30"
          >
            Get Started Free
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="border border-white/20 text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition"
          >
            Watch Demo
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 pb-20">
        {[
          { icon: "🎥", title: "Film Analysis", desc: "Upload your game videos and get reviewed by verified coaches." },
          { icon: "📋", title: "Drill Library", desc: "Access hundreds of drills and track your progress over time." },
          { icon: "🏅", title: "Coach Verified", desc: "Apply to become a certified coach and build your client roster." },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-white text-lg font-bold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
