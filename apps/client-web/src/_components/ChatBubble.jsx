'use client';

import { useState } from 'react';
import Link from 'next/link';

const fabStyle = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#111827',
  color: '#ffffff',
  borderRadius: 999,
  boxShadow: '0 14px 28px rgba(17,24,39,0.25)',
  cursor: 'pointer',
  zIndex: 1200,
};

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', color: '#fff', borderRadius: 16, width: 300, padding: 16, boxShadow: '0 14px 28px rgba(17,24,39,0.25)', zIndex: 1200 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>¿Necesitás ayuda?</strong>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
          Próximamente: chat en vivo. Mientras tanto, visitá el Centro de ayuda.
        </p>
        <Link href='/soporte' style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>Centro de ayuda</Link>
        <button type='button' onClick={() => setOpen(false)} style={{ float: 'right', background: 'transparent', color: 'rgba(255,255,255,0.85)', border: 'none', marginTop: 6, cursor: 'pointer' }}>Cerrar</button>
      </div>
    );
  }

  return (
    <button type='button' title='Centro de ayuda' aria-label='Centro de ayuda' onClick={() => setOpen(true)} style={fabStyle}>❔</button>
  );
}

