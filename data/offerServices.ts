// Firma teklif hazırlama paneli (teklif-demo) hizmet kataloğu.
// DİKKAT: Bu yapıda FİYAT ALANI YOKTUR ve eklenmeyecektir — toplam fiyat
// teklifte tek alan olarak yetkili tarafından elle girilir.

export interface OfferServiceItem {
  id: string;
  title: string;
  description: string;
  defaultQuantity: number;
}

export interface OfferServiceCategory {
  id: string;
  title: string;
  items: OfferServiceItem[];
}

export const offerServiceCategories: OfferServiceCategory[] = [
  {
    id: 'koltuk',
    title: 'VIP Koltuk ve Oturma Sistemleri',
    items: [
      {
        id: 'business-class-koltuk',
        title: 'Business Class Koltuk',
        description:
          'Isıtma, soğutma, masaj, ileri-geri hareket, yatar sırt, elektrikli başlık ve ayak desteği özelliklerine sahip VIP koltuk.',
        defaultQuantity: 2,
      },
      {
        id: 'kapi-giris-koltuklari',
        title: 'Elektrikli Kapı Giriş Koltukları',
        description: 'İleri-geri hareket ve elektrikli başlık özelliklerine sahip giriş koltuğu.',
        defaultQuantity: 2,
      },
      {
        id: 'emniyet-kemeri',
        title: 'Emniyet Kemeri',
        description: '3 nokta omuz kemeri sistemi.',
        defaultQuantity: 4,
      },
      {
        id: 'koltuk-salteri',
        title: 'V-Class Araç Koltuk Şalteri',
        description: 'Koltuk hareketlerini kontrol etmek için kullanılan şalter.',
        defaultQuantity: 4,
      },
      {
        id: 'koltuk-alti-cekmece',
        title: 'Koltuk Altı Çekmece ve Mekanizması',
        description: 'Koltuk altına entegre çekmece ve hareket mekanizması.',
        defaultQuantity: 2,
      },
      {
        id: 'tekli-motor-kontrol',
        title: 'Tekli Motor Kontrol Ünitesi',
        description: 'Koltuk hareketlerini kontrol eden tekli motor kontrol ünitesi.',
        defaultQuantity: 2,
      },
      {
        id: 'kolcak-ici-masa',
        title: 'Kolçak İçi Manuel Masa',
        description: 'Kolçak içine entegre manuel açılır masa.',
        defaultQuantity: 2,
      },
    ],
  },
  {
    id: 'ic-mimari',
    title: 'İç Mimari ve Kaplama',
    items: [
      {
        id: 'sol-yan-trim',
        title: 'Sol Yan Trim',
        description: 'Araç iç konseptine uygun özel imalat sol yan trim.',
        defaultQuantity: 1,
      },
      {
        id: 'sag-yan-trim',
        title: 'Sağ Yan Trim',
        description: 'Araç iç konseptine uygun özel imalat sağ yan trim.',
        defaultQuantity: 1,
      },
      {
        id: 'maun-ahsap-kaplama',
        title: 'Maun ve Ahşap Kaplama',
        description: 'Ahşap parçaların şekillendirilmesi, kalıp imalatı ve maun kaplama uygulaması.',
        defaultQuantity: 1,
      },
      {
        id: 'bentley-nappa-deri',
        title: 'Orijinal Bentley Nappa Deri',
        description:
          'Araç içerisinde belirlenen alanların pürüzsüz orijinal Nappa deri ile kaplanması.',
        defaultQuantity: 1,
      },
      {
        id: 'alcantara-kaplama',
        title: 'Alcantara Kaplama',
        description: 'Araç içerisinde belirlenen alanların orijinal Alcantara ile kaplanması.',
        defaultQuantity: 1,
      },
      {
        id: 'sofor-kabini-kaplama',
        title: 'Şoför Kabini Kaplama',
        description: 'Şoför kabinindeki belirlenen alanların Alcantara, deri ve maun ile kaplanması.',
        defaultQuantity: 1,
      },
      {
        id: 'boya-renk-degistirme',
        title: 'Boya ile Renk Değiştirme',
        description:
          'Araç içerisindeki plastik aksamların iç konsepte uygun renge dönüştürülmesi.',
        defaultQuantity: 1,
      },
      {
        id: 'zemin-halisi',
        title: 'Zemin Halısı',
        description: 'Araç zemininin otomobil tipi halı ile kaplanması.',
        defaultQuantity: 1,
      },
      {
        id: 'tasarim-ceplikler',
        title: 'Tasarım Ceplikler',
        description: 'İç konsepte uygun, çok amaçlı özel tasarım ceplikler.',
        defaultQuantity: 3,
      },
      {
        id: 'sarf-malzemeleri',
        title: 'İç Dizayn Sarf Malzemeleri',
        description: 'İç dizayn uygulamasında kullanılacak tüm gerekli sarf malzemeleri.',
        defaultQuantity: 1,
      },
    ],
  },
  {
    id: 'ara-bolme',
    title: 'Ara Bölme ve Kabin Sistemleri',
    items: [
      {
        id: 'ara-bolme-imalati',
        title: 'Ara Bölme İmalatı ve Mekanizması',
        description:
          'Smart TV entegrasyonuna uygun çelik konstrüksiyon ara bölme ve mekanizma imalatı.',
        defaultQuantity: 1,
      },
      {
        id: 'motor-kontrol-unitesi',
        title: 'Motor Kontrol Ünitesi',
        description: 'Araç içerisindeki elektrikli motor sistemlerini kontrol eden merkezi ünite.',
        defaultQuantity: 1,
      },
      {
        id: 'intercom',
        title: 'Intercom',
        description: 'VIP kabin ile şoför kabini arasında iletişim sağlayan bas-konuş sistemi.',
        defaultQuantity: 1,
      },
    ],
  },
  {
    id: 'multimedya',
    title: 'Multimedya ve Eğlence',
    items: [
      {
        id: 'samsung-smart-tv',
        title: '40 İnç Samsung Smart TV',
        description: 'Ara bölmeye entegre 40 inç Samsung Smart TV.',
        defaultQuantity: 1,
      },
      {
        id: 'ipad-kontrol',
        title: 'iPad Kontrol Sistemi',
        description: 'Araç içi sistemlerin kontrol uygulaması için kullanılan tablet.',
        defaultQuantity: 1,
      },
      {
        id: 'playstation-5',
        title: 'PlayStation 5',
        description: 'Araç içi eğlence sistemine entegre PlayStation 5.',
        defaultQuantity: 1,
      },
      {
        id: 'hertz-ses-sistemi',
        title: 'HERTZ Premium Ses Sistemi',
        description: 'Yüksek standartlı, EISA ödüllü premium araç içi ses sistemi.',
        defaultQuantity: 1,
      },
    ],
  },
  {
    id: 'tavan-aydinlatma',
    title: 'Tavan ve Aydınlatma',
    items: [
      {
        id: 'rgb-ambiyans',
        title: 'RGB Ambiyans Aydınlatma',
        description: 'Araç içi aydınlatma sisteminin farklı renk seçenekleriyle çalışması.',
        defaultQuantity: 1,
      },
      {
        id: 'starlight-yildiz-tavan',
        title: 'Starlight Yıldız Tavan',
        description: 'Starlight yıldız tavan ve iki adet şerit aydınlatma uygulaması.',
        defaultQuantity: 1,
      },
      {
        id: 'rgb-menfez',
        title: 'RGB Menfez',
        description: 'Orijinal RGB S-Class tarzı havalandırma menfezi.',
        defaultQuantity: 4,
      },
      {
        id: 'dimmer-unitesi',
        title: 'Dimmer Ünitesi',
        description:
          'RGB ve tavan aydınlatmalarının ışık şiddetini azaltıp artıran kontrol ünitesi.',
        defaultQuantity: 1,
      },
      {
        id: 'makyaj-aynasi',
        title: 'Makyaj Aynası',
        description: 'Araç içi konsepte uygun makyaj aynası.',
        defaultQuantity: 2,
      },
    ],
  },
  {
    id: 'minibar-konfor',
    title: 'Minibar ve Konfor Donanımları',
    items: [
      {
        id: 'krom-bardaklik',
        title: 'Krom Bardaklık',
        description: 'VIP iç konsepte uygun krom bardaklık.',
        defaultQuantity: 5,
      },
      {
        id: 'buzdolabi',
        title: 'Buzdolabı ve Mekanizması',
        description: '15 litre elektrikli buzdolabı ve özel entegrasyon mekanizması.',
        defaultQuantity: 1,
      },
      {
        id: 'espresso-makinesi',
        title: 'Espresso Makinesi ve Mekanizması',
        description: 'İleri-geri hareketli mekanizmaya entegre espresso kahve makinesi.',
        defaultQuantity: 1,
      },
      {
        id: 'perde',
        title: 'Perde',
        description: 'Özel imalat manuel pileli kumaş perde.',
        defaultQuantity: 1,
      },
      {
        id: 'semsiyelik',
        title: 'Şemsiyelik',
        description: 'Araç içi konsepte uygun özel şemsiyelik kalıp imalatı.',
        defaultQuantity: 1,
      },
      {
        id: 'askilik',
        title: 'Askılık',
        description: 'Araç içi konsepte uygun askılık.',
        defaultQuantity: 1,
      },
    ],
  },
  {
    id: 'elektrik-enerji',
    title: 'Elektrik, Şarj ve Enerji',
    items: [
      {
        id: 'inverter',
        title: '12V–220V İnverter',
        description:
          'TV, PlayStation, espresso makinesi ve benzeri cihazlar için 12V–220V dönüştürücü.',
        defaultQuantity: 1,
      },
      {
        id: 'soket-alani',
        title: '12V–220V Soket Alanı',
        description: 'USB, Type-C ve 220V bağlantılarına sahip özel soket alanı.',
        defaultQuantity: 1,
      },
      {
        id: 'kablosuz-sarj',
        title: 'Kablosuz Şarj',
        description: 'Uyumlu telefonlar için temassız kablosuz şarj sistemi.',
        defaultQuantity: 2,
      },
      {
        id: 'yedek-aku',
        title: 'Yedek Akü',
        description: 'Araç içi ek elektrik sistemlerini destekleyen yedek akü.',
        defaultQuantity: 1,
      },
    ],
  },
  {
    id: 'izolasyon',
    title: 'İzolasyon',
    items: [
      {
        id: 'ses-isi-izolasyonu',
        title: 'Premium Ses ve Isı İzolasyonu',
        description: 'Ses ve ısı izolasyonu sağlayan premium Akumat izolasyon uygulaması.',
        defaultQuantity: 1,
      },
    ],
  },
];

/** Toplam hizmet sayısı — 40 olmalı (build sırasında tip/veri bütünlüğü kontrolü için) */
export const OFFER_SERVICE_COUNT = offerServiceCategories.reduce(
  (sum, c) => sum + c.items.length,
  0,
);
