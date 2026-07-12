export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Kurumsal', href: '/kurumsal' },
  {
    label: 'Hizmetler',
    href: '/hizmetler',
    children: [
      { label: 'VIP Araç Dizaynı', href: '/hizmetler/vip-arac-dizayni' },
      { label: 'Mercedes Vito VIP Dizayn', href: '/hizmetler/mercedes-vito-vip-dizayn' },
      { label: 'Mercedes Sprinter VIP Dizayn', href: '/hizmetler/mercedes-sprinter-vip-dizayn' },
      { label: 'Mercedes V-Class VIP Dizayn', href: '/hizmetler/mercedes-v-class-vip-dizayn' },
      { label: 'Volkswagen VIP Dizayn', href: '/hizmetler/volkswagen-vip-dizayn' },
      { label: 'Binek Araç Deri Döşeme', href: '/hizmetler/binek-arac-deri-doseme' },
      { label: 'Araç İçi Kaplama', href: '/hizmetler/arac-ici-kaplama' },
      { label: 'Ambiyans Aydınlatma & Yıldız Tavan', href: '/hizmetler/ambiyans-aydinlatma-yildiz-tavan' },
      { label: 'Müzik ve Ses Sistemi', href: '/hizmetler/muzik-ses-sistemi' },
      { label: 'Dış Kaplama', href: '/hizmetler/dis-kaplama' },
      { label: 'Bakım & Onarım', href: '/hizmetler/bakim-onarim' },
    ],
  },
  { label: 'Projeler', href: '/projeler' },
  { label: 'Tasarım Süreci', href: '/tasarim-sureci' },
  { label: 'Blog', href: '/blog' },
  { label: 'İletişim', href: '/iletisim' },
];

export const footerNav = {
  kurumsal: [
    { label: 'Hakkımızda', href: '/kurumsal' },
    { label: 'Tasarım Süreci', href: '/tasarim-sureci' },
    { label: 'Malzeme & İşçilik', href: '/malzeme-iscilik' },
    { label: 'Blog', href: '/blog' },
  ],
  hizmetler: [
    { label: 'VIP Araç Dizaynı', href: '/hizmetler/vip-arac-dizayni' },
    { label: 'Mercedes Vito VIP Dizayn', href: '/hizmetler/mercedes-vito-vip-dizayn' },
    { label: 'Mercedes Sprinter VIP Dizayn', href: '/hizmetler/mercedes-sprinter-vip-dizayn' },
    { label: 'Deri Döşeme', href: '/hizmetler/binek-arac-deri-doseme' },
    { label: 'Yıldız Tavan & Ambiyans', href: '/hizmetler/ambiyans-aydinlatma-yildiz-tavan' },
    { label: 'Tüm Hizmetler', href: '/hizmetler' },
  ],
  destek: [
    { label: 'Teklif Formu', href: '/teklif-formu' },
    { label: 'Randevu Talebi', href: '/randevu-talebi' },
    { label: 'Projeler', href: '/projeler' },
    { label: 'İletişim', href: '/iletisim' },
  ],
};
