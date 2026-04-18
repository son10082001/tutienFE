import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tu Tien Kiem Hiep',
  description: 'Tu Tien Kiem Hiep Auth',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
