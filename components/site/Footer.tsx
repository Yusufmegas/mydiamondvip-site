import Link from 'next/link';
import { footerNav } from '@/data/navigation';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-mark">MYDIAMOND<span>VIP</span></div>
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
            <li><a href={contact.phoneHref}>{contact.phone}</a></li>
            <li><a href={contact.emailHref}>{contact.email}</a></li>
            <li>{contact.address}, {contact.city}</li>
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
