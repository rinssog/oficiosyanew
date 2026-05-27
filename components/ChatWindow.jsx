import { useState, useEffect, useRef } from "react";

const F = "#0D3B1F", V = "#16A34A";

export default function ChatWindow({ requestId, currentUserId, otherUserName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  useEffect(() => {
    if (!requestId) return;
    fetch(`${API_BASE}/api/chat/${requestId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    })
      .then((r) => r.ok ? r.json() : { messages: [] })
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ body: text.trim() }),
      });
      const data = await res.json();
      if (data.message) setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: `1.5px solid #D4E0D6`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", height: 340 }}>
      <div style={{ background: F, color: "#fff", padding: "10px 16px", fontWeight: 700, fontSize: 14 }}>
        Chat con {otherUserName || "el prestador"}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, background: "#F7F9F5" }}>
        {messages.length === 0 && (
          <p style={{ color: "#6B7C6E", fontSize: 13, textAlign: "center", marginTop: 40 }}>Sin mensajes aún. ¡Iniciá la conversación!</p>
        )}
        {messages.map((m, i) => {
          const mine = m.fromId === currentUserId;
          return (
            <div key={i} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <div style={{ background: mine ? V : "#fff", color: mine ? "#fff" : F, borderRadius: 12, padding: "8px 12px", fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                {m.body}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, textAlign: mine ? "right" : "left" }}>
                {m.createdAt ? new Date(m.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : ""}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ display: "flex", borderTop: "1px solid #D4E0D6", padding: 10, gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí tu mensaje..."
          style={{ flex: 1, border: "1px solid #D4E0D6", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none" }}
        />
        <button type="submit" disabled={loading || !text.trim()} style={{ background: V, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          {loading ? "…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
