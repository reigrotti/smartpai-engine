import './globals.css';
import { Inter, Montserrat } from 'next/font/google';
import { EstabelecimentoProvider } from '@/contexts/estabelecimento-context';

const inter = Inter({ subsets: ['latin'] });
const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '900'], 
  variable: '--font-montserrat' 
});

export const metadata = {
  title: 'Plinia / RoutIQ | Financial Orchestration & Routing Engine',
  description: 'Smart Routing & Silent Recovery Engine',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`dark ${montserrat.variable}`}>
      <body className={`${inter.className} font-sans antialiased bg-background text-foreground`}>
        <EstabelecimentoProvider>
          {children}
        </EstabelecimentoProvider>
      </body>
    </html>
  );
}