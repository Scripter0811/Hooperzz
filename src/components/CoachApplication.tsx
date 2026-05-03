import { useEffect, useState } from "react";
import { supabase, type CoachApplication } from "../lib/supabase";

export default function CoachApplicationPage({ userId }: { userId: string }) {
  const [existing, setExisting] = useState<CoachApplication | null>(null);
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase
      .from("coach_applications")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setExisting(data);
        setLoading(false);
      });
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { error } = await supabase.from("coach_applications").insert({
      user_id: userId,
      experience,
      certifications,
      bio,
      status: "pending",
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  }

  if (loading) return <div className="text-center text-gray-400 py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-black mb-2">Become a Coach 🏅</h1>
        <p className="text-gray-400">Apply to join our certified coach program and start working with players.</p>
      </div>

      {existing ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          {existing.status === "pending" && (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-white text-xl font-bold mb-2">Application Under Review</h2>
              <p className="text-gray-400">Your application has been submitted and is being reviewed by our team. We'll notify you soon.</p>
            </>
          )}
          {existing.status === "approved" && (
            <>
              <div className="text-5xl mb-4">🏅</div>
              <h2 className="text-white text-xl font-bold mb-2">You're a Verified Coach!</h2>
              <p className="text-gray-400">Congratulations! Your coach badge has been activated.</p>
            </>
          )}
          {existing.status === "denied" && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-white text-xl font-bold mb-2">Application Not Approved</h2>
              <p className="text-gray-400">Unfortunately, your application was not approved at this time.</p>
            </>
          )}

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 text-left">
            <div className="grid gap-3">
              <div>
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Experience</div>
                <div className="text-white text-sm">{existing.experience}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Certifications</div>
                <div className="text-white text-sm">{existing.certifications}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Bio</div>
                <div className="text-white text-sm">{existing.bio}</div>
              </div>
            </div>
          </div>
        </div>
      ) : success ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-white text-xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-gray-400">We'll review your application and get back to you. Check your dashboard for updates.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Coaching Experience</label>
              <textarea
                value={experience}
                onChange={e => setExperience(e.target.value)}
                required
                rows={3}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition resize-none"
                placeholder="Describe your coaching background, years of experience, teams coached, etc."
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Certifications</label>
              <input
                value={certifications}
                onChange={e => setCertifications(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                placeholder="e.g. USA Basketball License, NFHS Certified, etc."
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                required
                rows={4}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition resize-none"
                placeholder="Tell players about yourself — your philosophy, specialties, and what makes you a great coach."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
