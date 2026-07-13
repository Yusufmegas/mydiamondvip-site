import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Giriş',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="adm-login">
      <div className="adm-card adm-login-card">
        <p className="adm-login-title">
          MYDIAMOND<span style={{ color: '#c99b5f' }}>VIP</span> Yönetim Paneli
        </p>
        <p className="adm-login-sub">Yalnızca yetkili hesaplar giriş yapabilir. Kayıt alınmaz.</p>
        <LoginForm />
      </div>
    </div>
  );
}
