'use client';

// Site footer'ı — logo + dört kolon scroll'da sırayla reveal olur
// (once:true, reduced-motion'da animasyon yok). Link hover'ları ve hafif
// grain dokusu globals.css'te tanımlıdır.

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { footerNav } from '@/data/navigation';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';
import { brand } from '@/data/brand';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Footer() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(scope);
      const cols = q('.footer-grid > *');
      gsap.fromTo(
        cols,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: scope.current, start: 'top 88%', once: true },
          onComplete() {
            gsap.set(cols, { clearProps: 'transform,willChange,opacity' });
          },
        },
      );
    },
    { scope },
  );

  return (
    <footer className="site-footer" ref={scope}>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image
            src={brand.logo}
            alt="MyDiamondVIP"
            width={brand.logoWidth}
            height={brand.logoHeight}
            className="footer-logo-img"
          />
          <p>{contact.shortDescription}</p>
          <a
            className="cta cta-small"
            href={whatsappLink(whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ile Yazın
          </a>
          <div className="footer-social">
            <a href={contact.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={contact.social.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>

        <nav aria-label="Kurumsal">
          <h3>Kurumsal</h3>
          <ul>
            {footerNav.kurumsal.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Hizmetler">
          <h3>Hizmetler</h3>
          <ul>
            {footerNav.hizmetler.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h3>İletişim</h3>
          <ul className="footer-contact">
            <li><a href={contact.phoneHref}>{contact.phoneDisplay}</a></li>
            <li>
              <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp: {contact.whatsappDisplay}
              </a>
            </li>
            <li><a href={contact.emailHref}>{contact.email}</a></li>
            <li>{contact.address}, {contact.postalCode} {contact.district} / {contact.city}</li>
            <li>{contact.workHours}</li>
          </ul>
          <ul className="footer-links">
            {footerNav.destek.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {contact.companyName}. Tüm hakları saklıdır.</span>
        <span>{contact.city} · VIP Araç Dizayn Atölyesi</span>
      </div>
    </footer>
  );
}
