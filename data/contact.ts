// TEK KAYNAK iletişim verisi — adres/telefon değişikliği yalnızca burada yapılır.
// Eski kaynaklarda farklı adresler göründüğü için adres tek yerden yönetilir.

export const contact = {
  companyName: 'MyDiamondVIP',
  legalName: 'MyDiamondVIP Araç Tasarım',
  phone: '+90 532 543 69 69',
  phoneHref: 'tel:+905325436969',
  whatsappNumber: '905325436969',
  whatsappHref: 'https://wa.me/905325436969',
  email: 'info@mydiamondvip.com',
  emailHref: 'mailto:info@mydiamondvip.com',
  // TODO: Kesin adres onaylandığında yalnızca bu iki satırı güncelleyin.
  address: 'Hadımköy, Akpınar Sanayi Bölgesi',
  city: 'İstanbul',
  country: 'TR',
  mapUrl: 'https://maps.google.com/?q=MyDiamondVIP',
  workHours: 'Pazartesi – Cumartesi, 09:00 – 19:00',
  siteUrl: 'https://www.mydiamondvip.com',
  // TODO: Gerçek sosyal medya hesap linkleriyle doğrulayın.
  social: {
    instagram: 'https://www.instagram.com/mydiamondvip',
    youtube: 'https://www.youtube.com/@mydiamondvip',
  },
  shortDescription:
    'İstanbul merkezli VIP araç dizaynı, araç içi kaplama, deri döşeme, ambiyans aydınlatma, ses sistemi ve özel araç dönüşüm atölyesi.',
};

export function whatsappLink(message: string): string {
  return `${contact.whatsappHref}?text=${encodeURIComponent(message)}`;
}
