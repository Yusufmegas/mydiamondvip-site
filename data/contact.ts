// TEK KAYNAK iletişim verisi — adres/telefon değişikliği yalnızca burada yapılır.
// Bileşenlerde telefon/adres HARD-CODE edilmez; her zaman bu dosyadan okunur.

export const contact = {
  companyName: 'MyDiamondVIP',
  legalName: 'MyDiamondVIP Araç Tasarım',

  // Sabit hat (işletme telefonu)
  phone: '+90 212 598 88 22',
  phoneDisplay: '0212 598 88 22',
  phoneE164: '+902125988822', // JSON-LD telephone alanı için boşluksuz biçim
  phoneHref: 'tel:+902125988822',

  // WhatsApp destek ve fiyat teklifi hattı
  whatsappDisplay: '0536 824 81 65',
  whatsappInternational: '+90 536 824 81 65',
  whatsappNumber: '905368248165',
  whatsappHref: 'https://wa.me/905368248165',

  email: 'info@mydiamondvip.com',
  emailHref: 'mailto:info@mydiamondvip.com',

  address: 'Fatih Mahallesi, Reşatbey Sokak No: 8/A',
  postalCode: '34325',
  district: 'Küçükçekmece',
  city: 'İstanbul',
  country: 'TR',

  // İşletmenin doğrudan Google Maps konum bağlantısı
  mapUrl: 'https://maps.app.goo.gl/jbExWTNTnbqPvnH2A',

  workHours: 'Pazartesi – Cumartesi, 09:00 – 19:00',
  siteUrl: 'https://mydiamondvip.com',

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
