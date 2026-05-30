import Navbar from '@/components/layout/Navbar';

export const metadata = { title: 'Create Account' };

export default function SignupLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
