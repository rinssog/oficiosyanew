"use client";

import { useState } from 'react';
import Head from 'next/head';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function AdminTermsPage() {
  const [form, setForm] = useState({ version: '', title: '', content: '', token: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': form.token || '',
        },
        body: JSON.stringify({ version: form.version, title: form.title, content: form.content }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Error al actualizar');
      setMessage('Términos actualizados correctamente.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Admin · Términos OficiosYa</title>
      </Head>
      <NavBar />
      <main style={{ maxWidth: 920, margin: '32px auto', padding: '0 16px 64px' }}>
        <h1>Editar términos y condiciones</h1>
        <p>Ingresá el token administrativo para modificar la versión vigente del documento.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          <label>
            Token administrativo
            <input
              type="password"
              name="token"
              value={form.token}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </label>
          <label>
            Versión
            <input
              type="text"
              name="version"
              value={form.version}
              onChange={handleChange}
              placeholder="Ej: 1.1.0"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </label>
          <label>
            Título
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Términos y condiciones"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </label>
          <label>
            Contenido
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={14}
              placeholder="Pegá aquí el contenido del documento"
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </label>
          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              background: 'var(--primary)',
              color: 'var(--primary-contrast)',
              border: 'none',
              borderRadius: 8,
              padding: '12px 20px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Guardar cambios
          </button>
        </form>
        {message && <p style={{ color: '#2e7d32', marginTop: 16 }}>{message}</p>}
        {error && <p style={{ color: '#c62828', marginTop: 16 }}>{error}</p>}
      </main>
      <Footer />
    </div>
  );
}

