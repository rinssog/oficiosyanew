/**
 * pages/_app.js
 * Wrapper global — envuelve toda la app con AuthProvider
 */
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
