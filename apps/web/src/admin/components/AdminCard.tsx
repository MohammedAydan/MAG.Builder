import React, { type ReactNode } from 'react';

type AdminCardProps = {
  title: string;
  children: ReactNode;
};

export function AdminCard({ title, children }: AdminCardProps) {
  return (
    <section style={{ border: '1px solid #d1d5db', borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      {children}
    </section>
  );
}
