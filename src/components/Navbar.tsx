import { supabase, type Profile } from "../lib/supabase";

const NAV_ITEMS = [
  { label: "Dashboard", page: "dashboard", icon: "🏠" },
  { label: "Public Court", page: "publicChat", icon: "🏀" },
  { label: "Film Room", page: "uploads", icon: "🎥" },
  { label: "Drills", page: "lessons", icon: "📋" },
  { label: "Notes", page: "notes", icon: "📝" },
  { label: "DMs", page: "chat", icon: "💬" },
];

export default function Navbar({
  page,
  profile,
  onNavigate,
}: {
  page: string;
  profile: Profile | null;
  onNavigate: (page: string) => void;
}) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-gray-950 border-r border-white/10 flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="text-2xl">🏀</span>
          <span className="text-white text-xl font-black">Hooperz</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition w-full text-left ${
                page === item.page
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {profile?.coach_badge && (
            <button
              onClick={() => onNavigate("coachDashboard")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition w-full text-left ${
                page === "coachDashboard"
                  ? "bg-yellow-500 text-gray-900"
                  : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
              }`}
            >
              <span>🏅</span>
              Coach Dashboard
            </button>
          )}
        </nav>

        <div className="border-t border-white/10 pt-4">
          {profile && (
            <div className="px-2 mb-3">
              <div className="text-white text-sm font-semibold">{profile.username || "Hooper"}</div>
              <div className="text-gray-500 text-xs truncate">{profile.email}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm font-semibold px-2 py-2 rounded-xl hover:bg-red-500/10 transition w-full"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-white/10 flex z-50">
        {NAV_ITEMS.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition ${
              page === item.page ? "text-orange-500" : "text-gray-400"
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </button>
        ))}
        {profile?.coach_badge && (
          <button
            onClick={() => onNavigate("coachDashboard")}
            className={`flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition ${
              page === "coachDashboard" ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <span className="text-xl mb-0.5">🏅</span>
            Coach
          </button>
        )}
      </nav>
    </>
  );
}
