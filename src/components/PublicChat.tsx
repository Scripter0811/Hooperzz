import { useEffect, useState, useRef } from "react";
import { supabase, type Profile } from "../lib/supabase";
import ProfileModal from "./ProfileModal";
import PrivateChat from "./PrivateChat";

type PublicMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
};

export default function PublicChat({
  userId,
  currentProfile,
}: {
  userId: string;
  currentProfile: Profile;
}) {
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [privateChatUser, setPrivateChatUser] = useState<{ id: string; name: string } | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("public_chat_room", {
        config: { presence: { key: userId } },
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "public_messages" }, (payload) => {
        const msg = payload.new as PublicMessage;
        setMessages(prev => [...prev, msg]);
        loadProfile(msg.user_id);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("public_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (!data) return;
    setMessages(data);

    const ids = [...new Set(data.map((m: PublicMessage) => m.user_id))];
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
      const map: Record<string, Profile> = {};
      (profs || []).forEach((p: Profile) => { map[p.id] = p; });
      setProfileMap(map);
    }
  }

  async function loadProfile(uid: string) {
    if (profileMap[uid]) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (data) setProfileMap(prev => ({ ...prev, [uid]: data }));
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from("public_messages").insert({
      user_id: userId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  }

  async function openProfile(uid: string) {
    if (profileMap[uid]) {
      setViewingProfile(profileMap[uid]);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (data) {
      setProfileMap(prev => ({ ...prev, [uid]: data }));
      setViewingProfile(data);
    }
  }

  if (privateChatUser) {
    return (
      <div>
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <button
            onClick={() => setPrivateChatUser(null)}
            className="text-gray-400 hover:text-white transition mb-4 flex items-center gap-2"
          >
            ← Back to Public Chat
          </button>
        </div>
        <PrivateChat
          userId={userId}
          clientId={privateChatUser.id}
          label={`Private chat with ${privateChatUser.name}`}
        />
      </div>
    );
  }

  // Group messages by sender for consecutive bubbles
  const grouped = messages.map((msg, i) => ({
    ...msg,
    isFirst: i === 0 || messages[i - 1].user_id !== msg.user_id,
    isLast: i === messages.length - 1 || messages[i + 1].user_id !== msg.user_id,
  }));

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-2xl font-black">Public Court 🏀</h1>
          <p className="text-gray-400 text-sm">Everyone can see these messages. Click a name to view profile.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          {onlineCount} online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 min-h-0 py-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <div className="text-4xl mb-2">🏀</div>
            No messages yet. Start the conversation!
          </div>
        )}

        {grouped.map((msg) => {
          const sender = profileMap[msg.user_id];
          const isMine = msg.user_id === userId;
          const avatar = (sender?.username || sender?.email || "?")[0].toUpperCase();

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""} ${msg.isFirst ? "mt-3" : "mt-0.5"}`}>
              {/* Avatar (only on last message in group) */}
              <div className="w-8 shrink-0 flex items-end justify-center">
                {msg.isLast && (
                  <button
                    onClick={() => openProfile(msg.user_id)}
                    className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-black hover:bg-orange-500/40 transition"
                    title={sender?.username || "View profile"}
                  >
                    {avatar}
                  </button>
                )}
              </div>

              <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-xs lg:max-w-md`}>
                {/* Name (only on first in group) */}
                {msg.isFirst && !isMine && (
                  <button
                    onClick={() => openProfile(msg.user_id)}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 mb-1 ml-1 transition"
                  >
                    {sender?.username || sender?.email || "Hooper"}
                    {sender?.coach_badge && " 🏅"}
                  </button>
                )}

                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-white/10 text-white rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>

                {msg.isLast && (
                  <span className="text-gray-600 text-xs mt-1 mx-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-3 mt-3">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
          placeholder="Say something to the court..."
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-5 rounded-xl transition"
        >
          Send
        </button>
      </form>

      {/* Profile Modal */}
      {viewingProfile && (
        <ProfileModal
          profile={viewingProfile}
          currentUserId={userId}
          onClose={() => setViewingProfile(null)}
          onOpenPrivateChat={(id, name) => {
            setViewingProfile(null);
            setPrivateChatUser({ id, name });
          }}
        />
      )}
    </div>
  );
}
