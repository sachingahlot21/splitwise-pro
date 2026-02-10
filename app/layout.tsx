import type { Metadata } from 'next';
import '../styles/globals.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'SplitWise Pro - Expense Manager',
  description: 'Modern expense and invoice management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}