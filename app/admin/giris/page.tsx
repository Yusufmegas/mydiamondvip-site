import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/admin/LoginForm';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Giriş',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="adm-login">
      <div className="adm-card adm-login-card">
        <div className="adm-login-title">
          <Image
            src={brand.logo}
            alt="MyDiamondVIP"
            width={brand.logoWidth}
            height={brand.logoHeight}
            className="adm-login-logo"
          />
          <span>Yönetim Paneli</span>
        </div>
        <p className="adm-login-sub">Yalnızca yetkili hesaplar giriş yapabilir. Kayıt alınmaz.</p>
        <LoginForm />
      </div>
    </div>
  );
}
