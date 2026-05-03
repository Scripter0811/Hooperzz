import { useEffect, useState, useRef } from "react";
import { supabase, type Message, type Profile } from "../lib/supabase";

export default function PrivateChat({
  userId,
  clientId,
  label,
}: {
  userId: string;
  clientId?: string;
  label?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newMessage, setNewMessage] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(clientId || "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId) {
      supabase.from("profiles").select("*").neq("id", userId).then(({ data }) => setAllUsers(data || []));
    }
  }, [userId, clientId]);

  const chatPartnerId = clientId || selectedUser;

  useEffect(() => {
    if (!chatPartnerId) return;
    fetchMessages();

    const channel = supabase
      .channel(`private_chat_${[userId, chatPartnerId].sort().join("_")}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === userId && msg.receiver_id === chatPartnerId) ||
          (msg.sender_id === chatPartnerId && msg.receiver_id === userId)
        ) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatPartnerId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    const ids = [...new Set((data || []).flatMap((m: Message) => [m.sender_id, m.receiver_id]))];
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
      const map: Record<string, Profile> = {};
      (profs || []).forEach((p: Profile) => { map[p.id] = p; });
      setProfiles(map);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !chatPartnerId) return;

    await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: chatPartnerId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      <h1 className="text-white text-3xl font-black mb-2">Chat 💬</h1>
      {label && <p className="text-gray-400 mb-4">{label}</p>}

      {!clientId && (
        <div className="mb-4">
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
          >
            <option value="">Select a user to chat with...</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.username || u.email}</option>
            ))}
          </select>
        </div>
      )}

      {!chatPartnerId ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a user above to start chatting.
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-4 min-h-0">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">No messages yet. Say hi!</div>
            )}
            {messages.map(msg => {
              const isMine = msg.sender_id === userId;
              const sender = profiles[msg.sender_id];
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                    isMine ? "bg-orange-500 text-white rounded-br-sm" : "bg-white/10 text-white rounded-bl-sm"
                  }`}>
                    {!isMine && (
                      <div className="text-orange-400 text-xs font-bold mb-1">
                        {sender?.username || sender?.email || "User"}
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? "text-orange-200" : "text-gray-400"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex gap-3 mt-2">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-6 rounded-xl transition"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
