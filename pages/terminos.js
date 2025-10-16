"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function fetchTerms() {
  const res = await fetch(`${API_BASE}/api/terms/content`);
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || 'No se pudo obtener el documento');
  return data.terms;
}

const wrapperStyle = {
  maxWidth: 840,
  margin: '24px auto',
  padding: '0 16px 48px',
};

const boxStyle = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid var(--border)',
  padding: '24px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
};

export default function TermsPage() {
  const { user, acceptTerms, getUserTerms } = useAuth();
  const [terms, setTerms] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTerms()
      .then((data) => setTerms(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    getUserTerms(user.id).then((data) => setStatus(data.latest));
  }, [user, getUserTerms]);

  const handleAccept = async () => {
    if (!user || !terms) {
      setMessage('Debes iniciar sesión para aceptar los términos.');
      return;
    }
    try {
      const signature = user.name || user.email;
      await acceptTerms({
        userId: user.id,
        contractType: 'GENERAL',
        version: terms.version,
        nameSigned: signature,
      });
      setMessage('Términos aceptados correctamente.');
      const refresh = await getUserTerms(user.id);
      setStatus(refresh.latest);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: '#c62828' }}>{error}</p>;
    if (!terms) return <p>No hay términos cargados.</p>;

    return (
      <div style={boxStyle}>
        <h1>{terms.title}</h1>
        <p style={{ color: '#555', marginBottom: 8 }}>
          Versión {terms.version} · Actualizado el {new Date(terms.updatedAt).toLocaleString('es-AR')}
        </p>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#333', marginBottom: 24 }}>
          {terms.content}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {status ? (
            <p style={{ color: '#2e7d32', fontWeight: 600 }}>
              Aceptado el {new Date(status.createdAt).toLocaleString('es-AR')} · Versión {status.version}
            </p>
          ) : (
            <p style={{ color: '#c62828' }}>Aún no aceptaste los términos vigentes.</p>
          )}
          <button
            onClick={handleAccept}
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-contrast)',
              border: 'none',
              borderRadius: 8,
              padding: '12px 18px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Aceptar términos
          </button>
          {message && <p>{message}</p>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Términos y condiciones · OficiosYa</title>
      </Head>
      <NavBar />
      <main style={wrapperStyle}>{renderContent()}</main>
      <Footer />
    </div>
  );
}

