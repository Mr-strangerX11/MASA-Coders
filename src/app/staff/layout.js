import StaffLayoutClient from '@/components/staff/StaffLayoutClient';

export const metadata = {
  title: { default: 'Staff Portal', template: '%s | Staff — MASA Coders' },
};

export default function StaffLayout({ children }) {
  return <StaffLayoutClient>{children}</StaffLayoutClient>;
}
