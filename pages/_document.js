/**
 * pages/_document.js
 * HTML base — meta tags PWA para iOS y Android, SEO, Service Worker
 */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es-AR">
      <Head>
        {/* ─── PWA MANIFEST ─────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />

        {/* ─── THEME COLOR ──────────────────────────────────────────── */}
        <meta name="theme-color" content="#0D3B1F" />
        <meta name="background-color" content="#F7F9F5" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ─── iOS ESPECÍFICO ───────────────────────────────────────── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OficiosYa" />
        {/* Splash screens iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        {/* Splash screens para distintos iPhone/iPad */}
        <link rel="apple-touch-startup-image" media="(device-width: 320px)"  href="/splash/splash-640x1136.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 375px)"  href="/splash/splash-750x1334.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 414px)"  href="/splash/splash-1242x2208.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 390px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1170x2532.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 428px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1284x2778.png" />

        {/* ─── SEO BASE ─────────────────────────────────────────────── */}
        <meta name="description" content="Plataforma argentina de servicios y oficios. Prestadores verificados, pago protegido y garantía de 30 días." />
        <meta name="keywords" content="plomero, electricista, cerrajero, pintor, gasista, CABA, Buenos Aires, servicios del hogar, oficio" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OficiosYa" />

        {/* ─── OPEN GRAPH ───────────────────────────────────────────── */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="OficiosYa" />
        <meta property="og:title"       content="OficiosYa — El profesional que necesitás, ya." />
        <meta property="og:description" content="Prestadores verificados, pago protegido y garantía 30 días." />
        <meta property="og:image"       content="/og-image.png" />
        <meta property="og:url"         content="https://oficiosya.com.ar" />
        <meta property="og:locale"      content="es_AR" />

        {/* ─── TWITTER CARD ─────────────────────────────────────────── */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="OficiosYa" />
        <meta name="twitter:description" content="Prestadores verificados, pago protegido y garantía 30 días." />
        <meta name="twitter:image"       content="/og-image.png" />

        {/* ─── FAVICON ──────────────────────────────────────────────── */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" />
        <link rel="icon" href="/icons/icon-16x16.png" type="image/png" />

        {/* ─── FUENTES (system font — sin CDN externo) ──────────────── */}
        <style>{`
          * { -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
          body { touch-action: manipulation; }
          input, textarea, select { font-size: 16px !important; } /* evita zoom en iOS */
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('[SW] Registrado:', reg.scope); })
                .catch(function(err) { console.log('[SW] Error:', err); });
            });
          }
        ` }} />
      </body>
    </Html>
  );
}
