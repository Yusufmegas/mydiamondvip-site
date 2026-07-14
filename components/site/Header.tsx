'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mainNav } from '@/data/navigation';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';
import { brand } from '@/data/brand';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Rota değişince mobil menüyü kapat
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="header-logo" aria-label="MyDiamondVIP ana sayfa">
          <Image
            src={brand.logo}
            alt="MyDiamondVIP"
            width={brand.logoWidth}
            height={brand.logoHeight}
            priority
            className="header-logo-img"
          />
        </Link>

        <nav className="main-nav" aria-label="Ana menü">
          <ul>
            {mainNav.map((item) => (
              <li key={item.href} className={item.children ? 'has-children' : undefined}>
                <Link href={item.href} className={pathname === item.href ? 'active' : undefined}>
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="dropdown">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href}>{c.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a
            className="cta cta-small"
            href={whatsappLink(whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <Link className="cta cta-primary cta-small" href="/teklif-formu">
            Teklif Al
          </Link>
          <button
            className={`menu-toggle${open ? ' is-open' : ''}`}
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      <div className={`mobile-menu${open ? ' is-open' : ''}`}>
        <nav aria-label="Mobil menü">
          <ul>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
                {item.children && (
                  <ul>
                    {item.children.slice(0, 6).map((c) => (
                      <li key={c.href}>
                        <Link href={c.href}>{c.label}</Link>
                      </li>
                    ))}
                    <li>
                      <Link href="/hizmetler" className="see-all">Tüm hizmetler →</Link>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-cta">
          <Link className="cta cta-primary" href="/teklif-formu">Teklif Al</Link>
          <a className="cta" href={whatsappLink(whatsappMessages.general)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a className="mobile-phone" href={contact.phoneHref}>{contact.phoneDisplay}</a>
        </div>
      </div>
    </header>
  );
}
