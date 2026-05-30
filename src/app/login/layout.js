import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Sign In' };

export default function LoginLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
