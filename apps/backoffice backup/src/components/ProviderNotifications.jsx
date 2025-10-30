import { useEffect, useState } from "react";

function ProviderNotifications({ providerId, apiRequest }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest(`/api/providers/${providerId}/notifications`);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [providerId]);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/api/providers/${providerId}/notifications/${id}/read`, {
        method: "POST",
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAll = async () => {
    try {
      await apiRequest(`/api/providers/${providerId}/notifications/read-all`, { method: "POST" });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0 }}>Notificaciones</h2>
          <p style={{ margin: 0, color: '#555' }}>Actualiza para ver nuevas alertas de solicitudes, documentos y sistema.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={loadNotifications} disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button type="button" onClick={markAll} disabled={loading || unreadCount === 0} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontWeight: 600, cursor: unreadCount === 0 ? 'default' : 'pointer', opacity: unreadCount === 0 ? 0.6 : 1 }}>
            Marcar todo como leido
          </button>
        </div>
      </div>
      {error && <span style={{ color: '#b91c1c' }}>{error}</span>}
      {notifications.length === 0 ? (
        <p style={{ color: '#777' }}>No hay notificaciones recientes.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {notifications.map((notif) => (
            <div key={notif.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, display: 'grid', gap: 6, background: notif.read ? '#f9fafb' : '#eff6ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong>{notif.title || 'Notificacion'}</strong>
                  <div style={{ fontSize: 13, color: '#555' }}>{notif.message}</div>
                </div>
                {!notif.read && (
                  <button type="button" onClick={() => markAsRead(notif.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer' }}>
                    Marcar como leida
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#777' }}>{new Date(notif.createdAt).toLocaleString('es-AR')}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 13, color: '#555' }}>Sin leer: {unreadCount}</div>
    </section>
  );
}

export default ProviderNotifications;
