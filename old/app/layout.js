import '../styles/globals.css';
import { Providers } from './providers';
import ChatBubble from '../components/ChatBubble';

export const metadata = { title: 'OficiosYa' };

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body>
        <Providers>
          {children}
          <ChatBubble />
        </Providers>
      </body>
    </html>
  );
}
