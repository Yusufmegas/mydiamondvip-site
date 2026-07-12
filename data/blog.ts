// Blog yazıları — SEO odaklı başlangıç içerikleri. body: başlık+paragraf blokları.

export interface BlogBlock {
  h?: string;
  p: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readMinutes: number;
  category: 'Rehber' | 'Uygulama' | 'Karşılaştırma' | 'Fiyatlandırma';
  image: string;
  keywords: string[];
  body: BlogBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'vip-arac-dizayni-nedir',
    title: 'VIP Araç Dizaynı Nedir?',
    excerpt:
      'VIP araç dizaynı; bir ticari van veya binek aracın, kişiye özel koltuk düzeni, döşeme, aydınlatma ve teknoloji donanımlarıyla özel bir yaşam alanına dönüştürülmesidir.',
    date: '2026-06-02',
    readMinutes: 5,
    category: 'Rehber',
    image: '/images/stills/f-0950.webp',
    keywords: ['VIP araç dizayn', 'VIP oto dizayn', 'VIP araç iç dizayn'],
    body: [
      {
        p: 'VIP araç dizaynı; Mercedes Vito, Sprinter, V-Class veya Volkswagen Transporter gibi araçların iç mekânının, kullanıcısının ihtiyaçlarına göre baştan tasarlanmasıdır. Standart bir yolcu taşıma aracı; doğru koltuk düzeni, premium döşeme, aydınlatma ve teknoloji katmanıyla hareket hâlinde bir ofise, aile salonuna veya VIP transfer kabinine dönüşür.',
      },
      {
        h: 'Bir VIP dönüşümün bileşenleri',
        p: 'Tipik bir proje beş ana katmandan oluşur: koltuk sistemi (elektrikli, masajlı, karşılıklı yerleşim), yüzeyler (deri döşeme, tavan, zemin, kaplamalar), aydınlatma (ambiyans hatları ve yıldız tavan), teknoloji (ekranlar, ses sistemi, kabin kontrolü) ve konfor altyapısı (yalıtım, iklimlendirme, privacy bölme).',
      },
      {
        h: 'Hazır paket mi, kişiye özel mi?',
        p: 'Piyasada hazır dönüşüm paketleri bulunur; ancak gerçek VIP deneyim, aracın kimin tarafından, hangi amaçla kullanılacağına göre kurgulanan kişiye özel projelerde ortaya çıkar. Aile kullanımıyla yönetici kullanımının koltuk planı da, aydınlatma senaryosu da birbirinden farklıdır.',
      },
      {
        h: 'Doğru atölye nasıl seçilir?',
        p: 'Malzeme kalitesini yerinde gösterebilen, geçmiş projelerini detaylı sunabilen, elektrik entegrasyonunu araç veri yoluna zarar vermeden yapan ve teslim sonrası destek veren atölyeler tercih edilmelidir. Fiyat kadar, sürecin şeffaflığı da belirleyicidir.',
      },
    ],
  },
  {
    slug: 'mercedes-vito-vip-dizayn-nasil-yapilir',
    title: 'Mercedes Vito VIP Dizayn Nasıl Yapılır?',
    excerpt:
      'Vito VIP dönüşümü; araç analizi, yerleşim planı, malzeme seçimi ve entegrasyon adımlarıyla ilerleyen 4-8 haftalık bir süreçtir. Adım adım anlatıyoruz.',
    date: '2026-06-09',
    readMinutes: 6,
    category: 'Uygulama',
    image: '/images/stills/f-0140.webp',
    keywords: ['Mercedes Vito VIP dizayn', 'Vito dönüşüm', 'Vito VIP nasıl yapılır'],
    body: [
      {
        p: 'Mercedes Vito, kompakt dış ölçülerine rağmen doğru planlamayla şaşırtıcı bir VIP kabin sunar. Dönüşüm, aracın gövde ve donanım analiziyle başlar: kasa uzunluğu, cam yapısı, klima altyapısı ve elektrik kapasitesi projenin sınırlarını belirler.',
      },
      {
        h: '1. Yerleşim planı',
        p: 'En kritik karar koltuk düzenidir. 4+1 karşılıklı oturma, yönetici kullanımının standardıdır; aile projelerinde ikinci sıra elektrikli koltuklar öne çıkar. Yerleşim, diz mesafesi ve yürüme koridoru milimetrik çizilir.',
      },
      {
        h: '2. Malzeme ve renk',
        p: 'Krem deri + antrasit kaplama, Vito kabininde en dengeli kombinasyondur; koyu tonlar kabini küçük gösterebilir. Deri örnekleri mutlaka araç içinde, gün ışığında değerlendirilmelidir.',
      },
      {
        h: '3. Teknoloji katmanı',
        p: 'Yıldız tavan, çevresel ambiyans, TV ve soundbar tipik donanımlardır. Tüm elektrik, sigortalı ayrı hat üzerinden ve CANBUS’a müdahale edilmeden döşenir — aracın garanti süreçleri açısından bu şarttır.',
      },
      {
        h: '4. Uygulama ve teslim',
        p: 'Söküm, panel imalatı, döşeme ve montaj tipik olarak 4-6 hafta sürer. Teslimde tüm fonksiyonlar birlikte test edilir; kullanım eğitimi ve bakım önerileriyle süreç tamamlanır.',
      },
    ],
  },
  {
    slug: 'mercedes-sprinter-vip-dizayn-kimler-icin-uygundur',
    title: 'Mercedes Sprinter VIP Dizayn Kimler İçin Uygundur?',
    excerpt:
      'Sprinter’ın geniş hacmi; yönetici ofisi, aile lounge’u, turizm ve VIP transfer projeleri için farklı senaryolara izin verir. Hangi kullanım kime uygun?',
    date: '2026-06-16',
    readMinutes: 5,
    category: 'Rehber',
    image: '/images/stills/f-0560.webp',
    keywords: ['Mercedes Sprinter VIP dizayn', 'Sprinter kimler için', 'VIP transfer aracı'],
    body: [
      {
        p: 'Sprinter, VIP dönüşüm dünyasının en esnek platformudur. Uzun şasi seçeneklerinde ayakta durulabilen iç yükseklik, Vito’da mümkün olmayan senaryoları açar: tam boy dolaplar, mutfak ünitesi, hatta tuvalet.',
      },
      {
        h: 'Yönetici kullanımı',
        p: 'Şehirler arası yoğun seyahat eden yöneticiler için Sprinter, uçak business class’ından fazlasını sunar: video konferans ekranı, çalışma masaları, yatar koltuklar ve tam ses yalıtımı. Yol süresi çalışma süresine dönüşür.',
      },
      {
        h: 'Turizm ve VIP transfer',
        p: 'Filo tarafında dayanıklılık öne çıkar: yoğun kullanıma uygun döşeme, kolay temizlenen zemin ve yolcu başına kişisel aydınlatma-şarj ünitesi. Doğru malzeme seçimi, filo araçlarında bakım maliyetini doğrudan düşürür.',
      },
      {
        h: 'Aile kullanımı',
        p: 'Geniş aileler için Sprinter; ikinci sırada VIP koltuklar, üçüncü sırada standart koltuklar ve geniş bagajıyla uzun yol konforunu tek araçta toplar.',
      },
    ],
  },
  {
    slug: 'vip-arac-dizayn-fiyatlari-neye-gore-degisir',
    title: 'VIP Araç Dizayn Fiyatları Neye Göre Değişir?',
    excerpt:
      'İki Vito dönüşümü arasında neden üç kata varan fiyat farkı olabilir? Fiyatı belirleyen altı ana kalemi şeffaf biçimde anlatıyoruz.',
    date: '2026-06-23',
    readMinutes: 6,
    category: 'Fiyatlandırma',
    image: '/images/stills/f-1420.webp',
    keywords: ['VIP araç dizayn fiyatları', 'Vito VIP fiyat', 'VIP dönüşüm maliyeti'],
    body: [
      {
        p: 'VIP dönüşüm fiyatları; kapsam, malzeme sınıfı ve işçilik derinliğine göre geniş bir aralıkta değişir. “Fiyat ne kadar?” sorusunun dürüst cevabı, projenin tanımlanmasından geçer.',
      },
      {
        h: '1. Koltuk sistemi',
        p: 'Bütçenin en büyük kalemi genellikle koltuklardır. Standart VIP koltukla; masajlı, havalandırmalı, elektrikli yatar koltuk arasında ciddi fark vardır.',
      },
      {
        h: '2. Malzeme sınıfı',
        p: 'Suni deri ile gerçek nappa arasında hem maliyet hem ömür farkı büyüktür. Gerçek ahşap ve karbon kaplamalar, folyo alternatiflerinden ayrışır.',
      },
      {
        h: '3. Teknoloji donanımı',
        p: 'Ekran sayısı, ses sistemi sınıfı, yıldız tavan yoğunluğu ve kabin kontrol sistemleri fiyatı katman katman etkiler.',
      },
      {
        h: '4. Kabin imalatı, yalıtım ve işçilik',
        p: 'Görünmeyen işçilik — panel altyapısı, yalıtım, kablolama düzeni — ucuz ve pahalı projeyi asıl ayıran yerdir. Teslim sonrası ilk yılda fark buradan çıkar.',
      },
      {
        p: 'Net fiyat için doğru yol: teklif formunda aracınızı ve beklentinizi paylaşın; araç analizi sonrasında kalem kalem yazılı teklif alın. Tek rakamlı, kalemsiz teklifler karşılaştırma yapmayı imkânsız kılar.',
      },
    ],
  },
  {
    slug: 'arac-ici-deri-doseme-secerken-nelere-dikkat-edilmeli',
    title: 'Araç İçi Deri Döşeme Seçerken Nelere Dikkat Edilmeli?',
    excerpt:
      'Deri sınıfı, dikiş kalitesi, airbag uyumluluğu ve renk seçimi: doğru deri döşeme kararı için pratik bir kontrol listesi.',
    date: '2026-06-30',
    readMinutes: 5,
    category: 'Rehber',
    image: '/images/stills/f-1080.webp',
    keywords: ['araç deri döşeme', 'binek araç deri döşeme', 'deri döşeme seçimi'],
    body: [
      {
        p: 'Deri döşeme, araç içinde her gün dokunduğunuz tek yüzeydir; yanlış seçim her gün hatırlatır. Karar verirken dört başlığa bakın.',
      },
      {
        h: '1. Deri sınıfı',
        p: 'Otomotiv sınıfı gerçek deri (nappa), suni alternatiflerden hem dokuda hem ömürde ayrışır. Numuneyi katlayın, koklayın, tırnak izine bakın — kaliteli deri izi geri toparlar.',
      },
      {
        h: '2. Dikiş ve desen',
        p: 'Baklava kapitone gösterişlidir ama her koltuğa uymaz; oturma yüzeyinde perfore panel, yazın konforu belirler. Çift iğne dikişin düzgünlüğü, atölyenin işçilik seviyesini ele verir.',
      },
      {
        h: '3. Airbag ve donanım uyumu',
        p: 'Yan airbagli koltuklarda dikiş hattı, patlama hattına uygun özel iplikle dikilmek zorundadır. Isıtma ve hafıza fonksiyonlarının korunacağını yazılı teyit edin.',
      },
      {
        h: '4. Renk kararı',
        p: 'Açık renkler kabini büyütür ama bakım ister; koyu renkler pratiktir ama sıcak tutar. Karar öncesi numuneyi kendi aracınızın ışığında görün.',
      },
    ],
  },
  {
    slug: 'ambiyans-aydinlatma-ve-yildiz-tavan-uygulamalari',
    title: 'Ambiyans Aydınlatma ve Yıldız Tavan Uygulamaları',
    excerpt:
      'Yıldız tavan nasıl uygulanır, araca zarar verir mi, ambiyans aydınlatma nasıl planlanır? Işık tasarımının teknik arka planı.',
    date: '2026-07-05',
    readMinutes: 5,
    category: 'Uygulama',
    image: '/images/stills/f-1150.webp',
    keywords: ['yıldız tavan', 'ambiyans aydınlatma', 'fiber optik tavan'],
    body: [
      {
        p: 'Kabinin duygusunu gündüz malzeme, gece ışık belirler. Ambiyans aydınlatma ve yıldız tavan, doğru uygulandığında lüksün en zarif ifadesidir; yanlış uygulandığında ucuz bir efekte dönüşür.',
      },
      {
        h: 'Yıldız tavan nasıl yapılır?',
        p: 'Fiber optik demetler, araç tavanına değil, ayrı hazırlanan bir panele tek tek işlenir. Panel alcantara ile kaplanır ve orijinal tavanın üzerine monte edilir — araç tavanı delinmez, geri dönüş her zaman mümkündür.',
      },
      {
        h: 'Kaç nokta, hangi efekt?',
        p: 'Vito sınıfı kabinde 600-900, Sprinter’da 1000-1500 nokta dengeli sonuç verir. Kayan yıldız efekti göz alıcıdır; ancak sürekli değil, senaryo olarak kullanılmalıdır.',
      },
      {
        h: 'Ambiyans hatlarının planı',
        p: 'İyi ambiyans, ışığın kendisini değil yüzeye vuruşunu gösterir. Hatlar; kapı kolu, konsol alt yüzü ve zemin çizgisi gibi dolaylı noktalara yerleştirilir. Tüm sistem CANBUS uyumlu kontrol ünitesiyle, araç elektroniğine müdahale etmeden beslenir.',
      },
    ],
  },
  {
    slug: 'vito-ve-sprinter-vip-dizayn-arasindaki-farklar',
    title: 'Vito ve Sprinter VIP Dizayn Arasındaki Farklar',
    excerpt:
      'Aynı marka, iki farklı dünya: ölçüler, kullanım senaryoları, donanım kapasitesi ve bütçe açısından Vito ile Sprinter karşılaştırması.',
    date: '2026-07-08',
    readMinutes: 6,
    category: 'Karşılaştırma',
    image: '/images/stills/f-0520.webp',
    keywords: ['Vito Sprinter fark', 'Vito mu Sprinter mı', 'VIP araç seçimi'],
    body: [
      {
        p: 'VIP dönüşüm planlayanların en sık sorduğu soru: Vito mu, Sprinter mı? Cevap kullanım senaryosunda gizli.',
      },
      {
        h: 'Ölçü ve sürüş',
        p: 'Vito; otoparka giren, şehir içinde binek gibi kullanılan bir gövde sunar. Sprinter ayakta durulabilen iç yükseklik ve iki katına yakın kabin hacmi sağlar, ancak şehir içi pratikliği azalır.',
      },
      {
        h: 'Kabin senaryoları',
        p: 'Vito’da 4+1 karşılıklı düzen ve kompakt VIP donanımlar standarttır. Sprinter; mutfak, tam boy dolap, geniş medya duvarı ve hatta tuvalet gibi senaryolara izin verir.',
      },
      {
        h: 'Bütçe',
        p: 'Aynı malzeme sınıfında Sprinter projesi, daha fazla yüzey ve panel imalatı gerektirdiği için tipik olarak %30-60 daha yüksek bütçe ister.',
      },
      {
        h: 'Karar rehberi',
        p: 'Günlük şehir kullanımı + zaman zaman uzun yol: Vito. Ağırlıklı şehirler arası seyahat, kalabalık ekip veya mobil ofis: Sprinter. Kararsızsanız, kullanım gününüzü saat saat yazın — araç kendini seçer.',
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
