import type { ReactNode } from 'react';
import { PublicShellFrame } from '@/components/public/public-shell-frame';

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <PublicShellFrame>{children}</PublicShellFrame>;
}
