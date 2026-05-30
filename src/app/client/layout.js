import ClientLayoutClient from '@/components/client/ClientLayoutClient';

export const metadata = {
  title: { default: 'Client Portal', template: '%s | Client Portal — MASA Coders' },
};

export default function ClientLayout({ children }) {
  return <ClientLayoutClient>{children}</ClientLayoutClient>;
}
