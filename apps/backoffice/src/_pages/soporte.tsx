import Head from "next/head";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";

export default function SoportePage() {
  return (
    <div>
      <Head>
        <title>Soporte Â· OficiosYa</title>
      </Head>
      <NavBar />
      <main
        style={{ maxWidth: 840, margin: "32px auto", padding: "0 16px 64px" }}
      >
        <h1>Centro de ayuda</h1>
        <p>
          Muy pronto verÃ¡s aquÃ­ nuestro centro de soporte con preguntas
          frecuentes, chat humano y seguimiento de reclamos.
        </p>
        <p>
          Si necesitas asistencia inmediata, envÃ­anos un correo a{" "}
          <a href="mailto:atencion.oficiosya@gmail.com">
            atencion.oficiosya@gmail.com
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
