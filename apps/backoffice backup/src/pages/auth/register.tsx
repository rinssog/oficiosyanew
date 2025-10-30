"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const wrapperStyle = {
  maxWidth: 520,
  margin: '32px auto',
  padding: '0 16px 64px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid var(--border)',
};

const buttonStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--primary)',
  color: 'var(--primary-contrast)',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 16,
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      await login({ email: form.email, password: form.password });
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Crear cuenta · OficiosYa</title>
      </Head>
      <NavBar />
      <main style={wrapperStyle}>
        <h1>Creá tu cuenta</h1>
        <p>Elegí si vas a usar la plataforma como cliente o como prestador.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            Rol
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ ...inputStyle, padding: '12px' }}
            >
              <option value="CLIENT">Cliente</option>
              <option value="PROVIDER">Prestador</option>
            </select>
          </label>
          {error && <p style={{ color: '#c62828' }}>{error}</p>}
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

