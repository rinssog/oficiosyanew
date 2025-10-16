'use client';

import { useState } from 'react';
import Link from 'next/link';
import NavBar from '../../components/NavBar';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Eres un asistente útil para OficiosYa.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const userMessages = messages.filter(m => m.role !== 'system');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data?.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data?.error || 'desconocido'}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error de red/servidor' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 820, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Chat con el Asistente</h1>
        <Link href="/">Volver</Link>
      </div>
      <div style={{ border: '1px solid #cbe7d6', borderRadius: 12, padding: 16, background: '#fff' }}>
        <div style={{ height: 420, overflowY: 'auto', padding: '8px 4px', background: '#f9fff6', borderRadius: 8 }}>
          {userMessages.length === 0 && (
            <p style={{ color: '#777' }}>Escribe tu consulta para comenzar…</p>
          )}
          {userMessages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              margin: '8px 0',
            }}>
              <div style={{
                background: m.role === 'user' ? '#217a3c' : '#ffffff',
                color: m.role === 'user' ? '#fff' : '#222',
                border: m.role === 'user' ? 'none' : '1px solid #cbe7d6',
                padding: '8px 12px',
                borderRadius: 8,
                maxWidth: '80%'
              }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje"
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbe7d6' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#217a3c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', minWidth: 96 }}
          >
            {loading ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
