"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "../../_components/NavBar";
import Footer from "../../_components/Footer";
import { useAuth } from "../../contexts/AuthContext";

const wrapperStyle = {
  maxWidth: 480,
  margin: "32px auto",
  padding: "0 16px 64px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const buttonStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "var(--primary)",
  color: "var(--primary-contrast)",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 12,
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Ingresar · OficiosYa</title>
      </Head>
      <NavBar />
      <main style={wrapperStyle}>
        <h1>Ingresar</h1>
        <p>Accedé con tu email y contraseña.</p>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 16,
          }}
        >
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
          {error && <p style={{ color: "#c62828" }}>{error}</p>}
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
