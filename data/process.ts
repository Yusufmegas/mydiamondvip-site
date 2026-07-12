// Tasarım süreci — ana sayfadaki 4 adımlık şerit ve /tasarim-sureci timeline'ı (7 adım).

export interface ProcessStep {
  title: string;
  description: string;
}

/** Ana sayfa süreç şeridi (4 adım) */
export const processSummary: ProcessStep[] = [
  {
    title: 'İhtiyaç Analizi',
    description: 'Aracın kullanım amacı, yolcu profili ve beklentiler; projenin ilk çizgisi burada çekilir.',
  },
  {
    title: 'Konsept ve Malzeme',
    description: 'Yerleşim planı ve fiziksel malzeme panosu onayınıza sunulur; hiçbir karar kataloğa bırakılmaz.',
  },
  {
    title: 'Uygulama ve Entegrasyon',
    description: 'Döşeme, kaplama, aydınlatma ve teknoloji; tek atölyede, tek sorumlulukla uygulanır.',
  },
  {
    title: 'Kontrol ve Teslim',
    description: 'Çok aşamalı kalite kontrol ve yol testi tamamlanmadan hiçbir araç teslim edilmez.',
  },
];

/** /tasarim-sureci timeline (7 adım) */
export const processSteps: ProcessStep[] = [
  {
    title: 'İlk Görüşme',
    description:
      'Telefon, WhatsApp veya atölyede yüz yüze; beklentinizi, kullanım senaryonuzu ve bütçe çerçevesini dinliyoruz. İlk görüşmede benzer projeler üzerinden konuşur, doğru soruları birlikte netleştiririz.',
  },
  {
    title: 'Araç ve Kullanım Analizi',
    description:
      'Aracınızın gövde tipi, donanımı ve mevcut durumu yerinde incelenir; kimlerin, hangi rotalarda, hangi amaçla kullanacağı projeye işlenir. Elektrik altyapısı ve uygulanabilirlik raporu bu aşamada çıkar.',
  },
  {
    title: 'Konsept Tasarım',
    description:
      'Koltuk yerleşimi, kabin akışı ve görsel dil; ölçekli plan ve referans görsellerle sunulur. Konsept, siz “tam olarak bu” diyene kadar revize edilir — üretim, onaysız başlamaz.',
  },
  {
    title: 'Malzeme Seçimi',
    description:
      'Deri, dikiş, kaplama ve aydınlatma; fiziksel numunelerle, aracınızın kendi ışığında seçilir. Renk kombinasyonları gündüz ve gece senaryosunda ayrı ayrı değerlendirilir.',
  },
  {
    title: 'Uygulama ve Entegrasyon',
    description:
      'Panel imalatı, döşeme, kaplama ve sistem entegrasyonu kendi atölyemizde, tek sorumlu ekiple yürütülür. Süreç boyunca fotoğraflı ilerleme raporu alırsınız; aracınıza ne olduğunu sormak zorunda kalmazsınız.',
  },
  {
    title: 'Kalite Kontrol',
    description:
      'Her fonksiyon tek tek test edilir: koltuk mekanizmaları, ışık senaryoları, ses sistemi, yalıtım. Yol testi yapılmadan hiçbir araç teslim programına alınmaz.',
  },
  {
    title: 'Teslim',
    description:
      'Araç; kullanım eğitimi, bakım takvimi ve donanım dokümantasyonuyla birlikte teslim edilir. Teslim, ilişkinin bittiği değil olgunlaştığı andır — destek hattımız projeniz için açık kalır.',
  },
];
