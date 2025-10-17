import Head from 'next/head';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function ContactoPage() {
  return (
    <div>
      <Head>
        <title>Contacto comercial · OficiosYa</title>
      </Head>
      <NavBar />
      <main style={{ maxWidth: 840, margin: '32px auto', padding: '0 16px 64px' }}>
        <h1>Contacto comercial</h1>
        <p>Si sos administrador de consorcios o querés integrar tus servicios a OficiosYa, escribinos a <a href="mailto:comercial@oficiosya.com">comercial@oficiosya.com</a> y un ejecutivo se pondrá en contacto.</p>
      </main>
      <Footer />
    </div>
  );
}

