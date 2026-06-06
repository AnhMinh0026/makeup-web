import PortfolioGrid from '@/components/shared/PortfolioGrid';
import CinematicIntro from '@/components/shared/CinematicIntro';
import ScrollToTop from '@/components/shared/ScrollToTop';

export const metadata = {
  title: 'EMISA MAKEUP — Portfolio',
  description: 'High-fashion makeup artistry. Bridal, Editorial, Party & Daily looks.',
};

export default function Home() {
  return (
    <main className="bg-black min-h-screen flex flex-col" style={{ overflowX: 'clip' }}>
      <CinematicIntro />
      <ScrollToTop />
      <PortfolioGrid />
      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        color: '#888',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
        borderTop: '1px solid #1a1a1a',
      }}>
        Copyright &copy; All rights reserved.
      </footer>
    </main>
  );
}
