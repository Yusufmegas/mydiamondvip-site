// Teklif formundaki iki seviyeli hizmet seçimi — kategori/alt hizmet verisi
// component içine gömülmez, buradan yönetilir.

export interface QuoteServiceCategory {
  id: string;
  title: string;
  items: string[];
}

export const quoteServiceCategories: QuoteServiceCategory[] = [
  {
    id: 'komple-donusum',
    title: 'Komple VIP Araç Dönüşümü',
    items: [
      'Komple VIP İç Dizayn',
      'Yönetici Aracı Dönüşümü',
      'Turizm ve VIP Transfer Dönüşümü',
      'Özel Aile ve Seyahat Aracı Dönüşümü',
      'Kurumsal Filo Dönüşümü',
    ],
  },
  {
    id: 'koltuk-oturma',
    title: 'VIP Koltuk ve Oturma Sistemleri',
    items: [
      'Business Class VIP Koltuk',
      'Elektrikli Koltuk Sistemi',
      'Isıtmalı Koltuk',
      'Soğutmalı Koltuk',
      'Masajlı Koltuk',
      'Elektrikli Başlık',
      'Elektrikli Ayak Desteği',
      'Kapı Giriş Koltuğu',
      'Koltuk Altı Çekmece',
      'Kolçak İçi Masa',
      'Emniyet Kemeri Sistemi',
      'Özel Koltuk Döşemesi',
    ],
  },
  {
    id: 'ic-mimari',
    title: 'İç Mimari ve Kaplama',
    items: [
      'Nappa Deri Döşeme',
      'Alcantara Kaplama',
      'Ahşap ve Maun Kaplama',
      'Özel Yan Trim Tasarımı',
      'Şoför Kabini Kaplama',
      'Zemin Halısı',
      'Özel Zemin Kaplama',
      'Tasarım Ceplik ve Saklama Alanları',
      'Plastik Aksam Renk Değişimi',
      'Özel Üretim Mobilya ve Konsol',
    ],
  },
  {
    id: 'tavan-aydinlatma',
    title: 'Tavan ve Aydınlatma',
    items: [
      'Yıldız Tavan',
      'RGB Ambiyans Aydınlatma',
      'Şerit Aydınlatma',
      'RGB Havalandırma Menfezleri',
      'Dimmer ve Aydınlatma Kontrolü',
      'Makyaj Aynası Aydınlatması',
      'Özel Tavan Kaplama',
    ],
  },
  {
    id: 'ara-bolme',
    title: 'Ara Bölme ve Kabin Sistemleri',
    items: [
      'Şoför–Yolcu Ara Bölmesi',
      'TV Entegreli Ara Bölme',
      'Elektrikli Ara Bölme Sistemi',
      'Intercom İletişim Sistemi',
      'Özel Kabin Konsolu',
      'Gizlilik Bölmesi',
    ],
  },
  {
    id: 'multimedya',
    title: 'Multimedya ve Eğlence',
    items: [
      'Smart TV Sistemi',
      'Premium Ses Sistemi',
      'PlayStation / Oyun Sistemi',
      'Tablet ve iPad Kontrol Sistemi',
      'Araç İçi Akıllı Kontrol Paneli',
      'İnternet ve Bağlantı Sistemleri',
      'Multimedya Entegrasyonu',
    ],
  },
  {
    id: 'minibar-konfor',
    title: 'Minibar ve Konfor Donanımları',
    items: [
      'Buzdolabı',
      'Minibar',
      'Espresso / Kahve Makinesi',
      'Bardaklık ve Servis Alanı',
      'Özel Masa Sistemi',
      'Manuel Perde',
      'Elektrikli Perde',
      'Şemsiyelik',
      'Askılık',
      'Özel Saklama Alanları',
    ],
  },
  {
    id: 'elektrik-enerji',
    title: 'Elektrik, Şarj ve Enerji Sistemleri',
    items: [
      '12V–220V İnverter',
      '220V Priz Sistemi',
      'USB Şarj Alanları',
      'Type-C Şarj Alanları',
      'Kablosuz Telefon Şarjı',
      'Yedek Akü Sistemi',
      'Motor Kontrol Ünitesi',
      'Koltuk Kontrol Ünitesi',
      'Aydınlatma Kontrol Ünitesi',
    ],
  },
  {
    id: 'izolasyon-akustik',
    title: 'İzolasyon ve Akustik',
    items: [
      'Ses İzolasyonu',
      'Isı İzolasyonu',
      'Premium Akustik İzolasyon',
      'Yol Gürültüsü Yalıtımı',
      'Motor Gürültüsü Yalıtımı',
    ],
  },
  {
    id: 'ozel-uygulamalar',
    title: 'Diğer Özel Uygulamalar',
    items: [
      'Dış Tasarım ve Kaplama',
      'Özel Üretim Mobilya',
      'Kurumsal Filo Tasarımı',
      'Engelli Erişim Dönüşümü',
      'Diğer',
    ],
  },
];

export const chassisTypes = ['Standart', 'Uzun', 'Ekstra Uzun', 'Bilmiyorum', 'Diğer'] as const;

export const usagePurposes = [
  'Yönetici aracı',
  'VIP transfer',
  'Turizm',
  'Aile ve seyahat',
  'Kurumsal filo',
  'Özel kullanım',
  'Diğer',
] as const;
