'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/home', label: 'Insight Deck' },
  { href: '/settings', label: 'Impostazioni' }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 20px', display: 'flex', gap: 12 }}>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                background: active ? '#e0f2fe' : 'transparent',
                color: active ? '#1d4ed8' : '#111827',
                fontWeight: active ? 700 : 500,
                textDecoration: 'none'
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default TopNav;
