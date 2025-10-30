import Head from 'next/head';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function PoliticaPrivacidad() {
  return (
    <div>
      <Head>
        <title>Política de privacidad · OficiosYa</title>
      </Head>
      <NavBar />
      <main style={{ maxWidth: 840, margin: '32px auto', padding: '0 16px 64px' }}>
        <h1>Política de privacidad</h1>
        <p>Estamos redactando el detalle completo de la política de privacidad acorde a la legislación argentina (Ley 25.326). Lo verás aquí en cuanto esté listo.</p>
      </main>
      <Footer />
    </div>
  );
}

