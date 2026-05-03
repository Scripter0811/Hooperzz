import { useEffect, useState } from "react";
import { supabase, type Profile } from "./lib/supabase";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import Uploads from "./components/Uploads";
import Lessons from "./components/Lessons";
import Notes from "./components/Notes";
import PrivateChat from "./components/PrivateChat";
import CoachApplicationPage from "./components/CoachApplication";
import CoachDashboard from "./components/CoachDashboard";
import PublicChat from "./components/PublicChat";
import Navbar from "./components/Navbar";

type Page =
  | "landing"
  | "login"
  | "onboarding"
  | "dashboard"
  | "uploads"
  | "lessons"
  | "notes"
  | "chat"
  | "publicChat"
  | "coachApply"
  | "coachDashboard";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        loadProfile(session.user.id);
      } else {
        setUserId(null);
        setProfile(null);
        setPage("landing");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (data) {
      setProfile(data);
      setPage("dashboard");
    } else {
      setPage("onboarding");
    }
    setLoading(false);
  }

  function navigate(p: string) {
    setPage(p as Page);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl animate-bounce">🏀</span>
          <span className="text-white text-lg font-bold">Loading Hooperz...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated pages
  if (!userId) {
    if (page === "login") return <Login onNavigate={navigate} />;
    return <Landing onNavigate={navigate} />;
  }

  // Onboarding (no profile yet)
  if (page === "onboarding" || !profile) {
    return (
      <Onboarding
        userId={userId}
        email={userEmail}
      />
    );
  }

  // Authenticated app shell
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar page={page} profile={profile} onNavigate={navigate} />

      {/* Content area offset for desktop sidebar */}
      <main className="md:ml-56 pb-20 md:pb-0">
        {page === "dashboard" && (
          <Dashboard profile={profile} userId={userId} onNavigate={navigate} />
        )}
        {page === "uploads" && <Uploads userId={userId} />}
        {page === "lessons" && <Lessons userId={userId} />}
        {page === "notes" && <Notes userId={userId} />}
        {page === "publicChat" && <PublicChat userId={userId} currentProfile={profile} />}
        {page === "chat" && <PrivateChat userId={userId} />}
        {page === "coachApply" && <CoachApplicationPage userId={userId} />}
        {page === "coachDashboard" && profile.coach_badge && (
          <CoachDashboard userId={userId} />
        )}
        {page === "coachDashboard" && !profile.coach_badge && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-white text-xl font-bold mb-2">Coach Access Required</h2>
              <p className="text-gray-400 mb-4">You need a coach badge to access this page.</p>
              <button
                onClick={() => navigate("coachApply")}
                className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-400 transition"
              >
                Apply to be a Coach
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
