// Sayfa metinleri — ana sayfa bölümleri ve kurumsal içerik tek yerden yönetilir.

export const home = {
  hero: {
    title: 'VIP Araç Tasarımında Yeni Bir Seviye',
    subtitle:
      'MyDiamondVIP; VIP araç dizaynı, araç içi kaplama, deri döşeme, ambiyans aydınlatma ve özel araç dönüşüm hizmetleriyle aracınızı kişiye özel bir yaşam alanına dönüştürür.',
    primaryCta: { label: 'Randevu Talep Et', href: '/randevu-talebi' },
    secondaryCta: { label: 'WhatsApp ile Görüş', href: 'whatsapp' },
  },
  services: {
    kicker: 'Hizmetler',
    title: 'Aracınız İçin Uçtan Uca Tasarım',
    lead: 'İç mimariden koltuk sistemlerine, deri işçiliğinden akıllı kabin teknolojilerine kadar tüm dönüşüm tek ekip tarafından yönetilir.',
  },
  projects: {
    kicker: 'Projeler',
    title: 'Atölyeden Seçilmiş İşler',
    lead: 'Her proje, sahibinin kullanım senaryosuna göre sıfırdan kurgulanır; hiçbiri bir öncekinin kopyası değildir.',
  },
  quote: {
    kicker: 'Atölye',
    text: 'Bir araç, sahibinin imzasını taşıdığında tamamlanır.',
  },
  why: {
    kicker: 'Neden MyDiamondVIP?',
    title: 'Detay Odaklı İşçilik, Kişiye Özel Kabin Deneyimi',
    lead: 'Bizim için her proje bir sipariş değil, imzamızı taşıyacak bir iştir. Fark, kararların nerede verildiğindedir: katalogda değil, aracınızın içinde.',
    items: [
      {
        title: 'Araç modeline özel tasarım yaklaşımı',
        text: 'Hazır paket uygulanmaz; her panel ve kalıp, aracınızın gövdesine ve donanımına göre hazırlanır.',
      },
      {
        title: 'Premium malzeme ve yüzey seçimi',
        text: 'Deri, kaplama ve kumaş; fiziksel numunelerle, aracınızın kendi ışığında seçilir.',
      },
      {
        title: 'Konfor, mahremiyet ve kullanım amacına göre planlama',
        text: 'Privacy bölme, yalıtım ve ışık senaryoları; kabini kimin, nasıl kullanacağına göre kurgulanır.',
      },
      {
        title: 'Deri, kaplama, aydınlatma ve multimedya entegrasyonu',
        text: 'Bütün sistemler tek tasarım dili altında, birbiriyle konuşacak şekilde uygulanır.',
      },
      {
        title: 'Uygulama sonrası kontrol ve teslim süreci',
        text: 'Çok aşamalı kalite kontrol ve yol testi tamamlanmadan hiçbir araç teslim edilmez.',
      },
      {
        title: 'Satış sonrası destek yaklaşımı',
        text: 'Bakım takvimi, donanım dokümantasyonu ve açık destek hattı; teslimden sonra da projenizin arkasındayız.',
      },
    ],
  },
  process: {
    kicker: 'Tasarım Süreci',
    title: 'Dört Adımda Projeniz',
    lead: 'Sürecin tamamı planlıdır; hangi aşamada ne olacağını her zaman bilirsiniz.',
  },
  cta: {
    title: 'Aracınız İçin Özel Bir Tasarım Planlayalım',
    text: 'VIP araç dizaynı, deri döşeme, kaplama ve özel iç mekân çözümleri için aracınızı ve beklentinizi paylaşın; size kalem kalem yazılmış bir yol haritasıyla dönelim.',
  },
};

export const kurumsal = {
  title: 'MyDiamondVIP Hakkında',
  intro:
    'MyDiamondVIP, İstanbul’da VIP araç dizaynı, araç içi kaplama, deri döşeme, müzik sistemi, dış kaplama ve bakım-onarım alanlarında çalışan özel bir otomotiv tasarım atölyesidir. Her projede aracın kullanım amacı, sahibinin beklentisi ve premium kalite standartları birlikte ele alınır; hedef, her aracı estetik, konforlu ve kişiye özel bir deneyime dönüştürmektir.',
  sections: [
    {
      title: 'Tasarım Yaklaşımımız',
      text: 'Tasarım bizde görselle değil, soruyla başlar: bu aracı kim, hangi rotalarda, ne için kullanacak? Koltuk yerleşiminden ışık senaryosuna kadar her karar bu cevaptan türetilir. Kataloğa göre değil, kullanım senaryosuna göre tasarlarız; bu yüzden iki projemiz birbirine benzemez.',
      image: '/images/corporate/tasarim-yaklasimimiz.png',
    },
    {
      title: 'İşçilik ve Malzeme Standartlarımız',
      text: 'Kalite bizde son kontrol değil, ilk karardır. Nappa deriden fiber optiğe her malzeme, “beş yıl sonra nasıl görünecek?” sorusuyla seçilir. Airbag dikiş hatlarından CANBUS uyumlu elektrik beslemelerine kadar üretici standartları taban kabul edilir — hedef, o tabanın üzerine çıkmaktır.',
      image: '/images/corporate/iscilik-ve-malzeme-standartlarimiz.png',
    },
    {
      title: 'Atölye Süreci',
      text: 'Tüm uygulamalar kendi atölyemizde, tek sorumlu ekiple yürütülür. Söküm, imalat, döşeme ve elektrik entegrasyonu ayrı istasyonlarda ilerler; her aşama fotoğraflı ilerleme raporuyla belgelenir. Aracınıza ne olduğunu sormak zorunda kalmazsınız — biz gösteririz.',
      image: '/images/corporate/atolye-sureci.png',
    },
    {
      title: 'Satış Sonrası Destek',
      text: 'Teslim, ilişkinin bittiği değil olgunlaştığı andır. Her proje için bakım takvimi çıkarılır, donanım dokümantasyonu teslim edilir; döşeme ve sistem sorularınız için destek hattımız açık kalır.',
      image: '/images/corporate/satis-sonrasi-destek.png',
    },
  ],
};

export const whatsappMessages = {
  general: 'Merhaba, MyDiamondVIP hizmetleri hakkında bilgi almak istiyorum.',
  quote: 'Merhaba, aracım için teklif almak istiyorum.',
  appointment: 'Merhaba, randevu talep etmek istiyorum.',
};

/** CTA bandı başlık varyasyonları — sayfalar arasında dönüşümlü kullanılır */
export const ctaVariants = {
  default: {
    title: 'Aracınız İçin Özel Bir Tasarım Planlayalım',
    text: 'VIP araç dizaynı, deri döşeme, kaplama ve özel iç mekân çözümleri için MyDiamondVIP ile iletişime geçin.',
  },
  cabin: {
    title: 'VIP Kabin Deneyiminizi Birlikte Tasarlayalım',
    text: 'Kullanım senaryonuzu paylaşın; koltuk mimarisinden ışık senaryosuna kadar size özel bir kabin planlayalım.',
  },
  process: {
    title: 'Projeniz İçin Uygun Tasarım ve Uygulama Sürecini Belirleyelim',
    text: 'İlk görüşme ücretsizdir. Aracınızı analiz edelim, kapsamı ve takvimi birlikte netleştirelim.',
  },
};
