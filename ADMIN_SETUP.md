# MyDiamondVIP — Admin Panel Kurulum ve İşletme Kılavuzu

Bu belge, proje yönetim panelinin (PostgreSQL + Prisma + Better Auth + S3 uyumlu
storage) kurulumunu, Railway üzerinde canlıya alınmasını ve günlük işletimini
anlatır. **Bu dosyada gerçek şifre/token/bağlantı değeri YOKTUR ve asla
yazılmamalıdır** — gerçek değerler yalnızca `.env` (local) ve Railway
Variables (production) içinde tutulur.

Tüm komutlar Windows PowerShell ile uyumludur.

---

## 1. Mimari Özet

| Katman | Teknoloji |
| --- | --- |
| Veritabanı | PostgreSQL (Railway Postgres önerilir) |
| ORM | Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg` driver adapter) |
| Kimlik doğrulama | Better Auth (e-posta/şifre, public signup KAPALI, tek rol: OWNER) |
| Görsel depolama | S3 uyumlu object storage (Cloudflare R2 / MinIO / Railway bucket) |
| Görsel işleme | sharp (gerçek içerik doğrulama + WebP optimizasyon + EXIF temizleme) |
| Panel rotaları | `/admin/giris`, `/admin`, `/admin/projeler`, `/admin/projeler/yeni`, `/admin/projeler/[id]`, `/admin/projeler/[id]/onizleme` |
| Route koruması | `proxy.ts` (session cookie kontrolü) + her sayfada/action'da sunucu tarafı `requireAdmin` |

Veri kaynağı kuralı:

- `DATABASE_URL` tanımlıysa → **her zaman veritabanı**.
- `DATABASE_URL` yoksa → yalnızca **development** ve **build aşamasında**
  `data/projects.ts` statik verisine düşülür.
- Production çalışma zamanında `DATABASE_URL` yoksa site sessizce statik
  veriye düşmez; açık bir yapılandırma hatası üretilir (`DbConfigurationError`).

---

## 2. Gerekli Environment Değişkenleri

İsimler `.env.example` dosyasında da listelidir:

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `DATABASE_URL` | Evet (prod) | PostgreSQL bağlantı adresi |
| `AUTH_SECRET` | Evet (prod) | 32+ karakter rastgele gizli değer |
| `AUTH_URL` | Evet (prod) | Sitenin tam adresi (örn. `https://www.mydiamondvip.com`) |
| `S3_ENDPOINT` | Görsel yüklemek için | S3 uyumlu endpoint |
| `S3_REGION` | Görsel yüklemek için | Bölge (R2 için `auto`) |
| `S3_BUCKET` | Görsel yüklemek için | Bucket adı |
| `S3_ACCESS_KEY_ID` | Görsel yüklemek için | Erişim anahtarı |
| `S3_SECRET_ACCESS_KEY` | Görsel yüklemek için | Gizli anahtar |
| `S3_PUBLIC_BASE_URL` | Görsel yüklemek için | Yüklenen dosyaların public URL tabanı |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Yalnızca `admin:create` sırasında | Geçici; iş bitince kaldırın |

`AUTH_SECRET` üretmek için (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

> Storage değişkenleri tanımlı değilse panel çalışır ancak yeni görsel
> yükleme açık bir hata mesajıyla reddedilir (uydurma değer KULLANMAYIN).

---

## 3. Railway'de PostgreSQL Ekleme

1. Railway dashboard → projeniz → **+ New** → **Database** → **PostgreSQL**.
2. Postgres servisi oluşunca **Variables** sekmesinden `DATABASE_URL`
   değerini kopyalayın (Railway `DATABASE_URL` ve dahili
   `DATABASE_PRIVATE_URL` sağlar — web servisi aynı projede ise private URL
   daha hızlı ve ücretsizdir).
3. Web servisinizin (site) **Variables** sekmesine ekleyin:
   - `DATABASE_URL` → Postgres bağlantı adresi
   - `AUTH_SECRET` → yukarıdaki komutla ürettiğiniz değer
   - `AUTH_URL` → production site adresi

---

## 4. Migration Stratejisi (Railway)

Şu anda repoda migration dosyası yoktur (ilk migration, gerçek bir
`DATABASE_URL` gerektirdiği için bilinçli olarak üretilmedi). İlk kurulum:

### Adım 1 — İlk migration'ı local'den üretin

Local makinede `.env` dosyasına **production olmayan** bir Postgres adresi
koyun (local Postgres veya Railway'de ayrı bir "dev" veritabanı):

```powershell
# .env içinde DATABASE_URL tanımlıyken:
npm run db:migrate
# İstenince migration adı verin, örn: init
```

Bu, `prisma/migrations/…_init/` klasörünü üretir. **Bu klasörü commit'leyin.**

### Adım 2 — Production'a uygulayın

Production veritabanına şema, `migrate dev` ile DEĞİL, yalnızca
`migrate deploy` ile uygulanır:

```powershell
# Railway CLI ile (railway link yapılmış olmalı):
railway run npm run db:deploy

# veya geçici olarak local ortam değişkeniyle:
$env:DATABASE_URL = "<railway-postgres-url>"
npm run db:deploy
Remove-Item Env:DATABASE_URL
```

### Adım 3 — Sonraki şema değişiklikleri

1. Şemayı değiştir → local `npm run db:migrate` → migration commit'le.
2. Deploy sonrası `railway run npm run db:deploy`.

İsterseniz Railway servisinin **Custom Start Command** alanına
`npx prisma migrate deploy && npm run start` yazarak migration'ı her
deploy'da otomatikleştirebilirsiniz (tek replika için güvenlidir).

> `npm run build` komutu `prisma generate && next build` çalıştırır;
> **generate** için veritabanı bağlantısı GEREKMEZ. Build sırasında gerçek DB
> bağlantısı zorunlu değildir.

---

## 5. Seed — Mevcut Projeleri Veritabanına Taşıma

`data/projects.ts` içindeki mevcut projeler (iki Vito projesi dahil,
Matterport turlarıyla birlikte) idempotent seed ile taşınır:

```powershell
$env:DATABASE_URL = "<postgres-url>"
npm run db:seed
Remove-Item Env:DATABASE_URL
```

Kurallar:

- Var olan slug **atlanır** — panelden düzenlenmiş veri asla ezilmez.
- Statik veriden zorla yeniden yazmak için: `npm run db:seed -- --force`
  (o slug'ın medyası dahil statik hâline döner — dikkatli kullanın).
- Seed edilen medya kayıtları mevcut `public/images/...` yollarını kullanır;
  object storage'a taşınmaları gerekmez. Panelden yüklenen YENİ görseller
  S3'e gider.

---

## 6. İlk OWNER Hesabını Oluşturma

Public kayıt tamamen kapalıdır; kullanıcı YALNIZCA bu komutla oluşturulur:

```powershell
$env:DATABASE_URL = "<postgres-url>"
$env:AUTH_SECRET  = "<auth-secret>"
$env:ADMIN_EMAIL  = "yonetici@ornek.com"
$env:ADMIN_PASSWORD = "en-az-10-karakter-guclu-sifre"
$env:ADMIN_NAME   = "Yönetici"

npm run admin:create

# Bitince geçici değişkenleri temizleyin:
Remove-Item Env:DATABASE_URL, Env:AUTH_SECRET, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD, Env:ADMIN_NAME
```

Güvenlik kuralları:

- Şifre komut satırı argümanı olarak yazılmaz (shell geçmişine düşmesin).
- Şifre hiçbir yerde loglanmaz; Better Auth scrypt hash'iyle saklanır.
- Aynı e-posta zaten kayıtlıysa komut ikinci kullanıcı oluşturmadan durur.
- Minimum şifre uzunluğu 10 karakterdir.

---

## 7. Object Storage (S3 Uyumlu) Kurulumu

Cloudflare R2 örneği (Railway bucket veya MinIO da aynı şekilde çalışır):

1. R2'de bucket oluşturun (örn. `mydiamondvip-media`).
2. Bucket'a **public erişim** verin veya önüne bir custom domain bağlayın —
   bu adres `S3_PUBLIC_BASE_URL` olur.
3. "Account API Token" ile S3 kimlik bilgileri üretin
   (`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`).
4. `S3_ENDPOINT` = hesabınızın R2 S3 endpoint'i, `S3_REGION` = `auto`.
5. Beş değişkeni Railway Variables'a ekleyin, redeploy edin.

Yükleme davranışı:

- Yalnızca JPEG/PNG/WebP kabul edilir; içerik türü sharp ile **gerçek
  içerikten** doğrulanır (uzantı sahteciliği reddedilir, SVG kabul edilmez).
- Maksimum dosya boyutu 20 MB, maksimum piksel alanı 64 MP.
- Ana görsel ≤2400px WebP q86, thumbnail ≤1000px WebP q82 üretilir;
  EXIF verileri temizlenir.
- Dosya adları UUID'dir (`projects/<projeId>/<uuid>.webp`); kullanıcı girdisi
  path'e girmez.

---

## 8. Local Development

```powershell
npm install
npm run prisma:generate   # generated client: lib/generated/prisma (gitignore'da)
npm run dev
```

- `DATABASE_URL` **olmadan**: public site statik `data/projects.ts` verisiyle
  çalışır; `/admin` giriş ister ama dashboard "veritabanı yapılandırılmamış"
  mesajı gösterir. Bu normaldir.
- `DATABASE_URL` **ile**: önce `npm run db:migrate`, sonra `npm run db:seed`,
  sonra `npm run admin:create` — ardından `/admin/giris`'ten giriş yapın.
- Veritabanını görsel incelemek için: `npm run db:studio`.

---

## 9. Panel Kullanımı

- **Giriş**: `/admin/giris` — 7 gün oturum, brute-force rate limit'li.
- **Projeler**: arama + durum filtreleri (Taslak/Yayında/Arşiv/360° Tur
  var-yok/Vitrin). Silme yoktur; yalnızca **Arşivle** (geri alınabilir).
- **Durumlar**: `DRAFT` → yalnızca panelde; `PUBLISHED` → sitede görünür;
  `ARCHIVED` → siteden kalkar, panelde durur.
- **Yayınlama koşulları**: kapak görseli zorunlu; Matterport turu girildiyse
  poster görseli de zorunlu.
- **Slug değişimi**: yayınlanmış projenin slug'ı değişirse eski adresten
  yeni adrese kalıcı (301) yönlendirme otomatik oluşturulur — eski linkler
  kırılmaz.
- **Matterport**: iframe kodu veya URL yapıştırılabilir; sistem model ID'yi
  ayıklar ve normalize eder. Proje başına en fazla **bir** tur.
- **Kopyala**: projenin taslak kopyasını üretir; Matterport turu ve vitrin
  işareti kopyalanmaz, görsel dosyaları paylaşılır (kopya silinse bile
  orijinalin dosyası silinmez).
- **Önizleme**: taslakları yayınlamadan gerçek site şablonunda gösterir.

Yayınlama/güncelleme sonrası ilgili sayfalar (`/`, `/projeler`,
`/projeler/<slug>`, sitemap) **redeploy gerekmeden** anında yenilenir
(`revalidatePath`). Normal ziyaretçi trafiği için sayfalar 5 dakikalık
ISR önbelleğiyle sunulur.

---

## 10. Güvenlik Özeti

- Public signup kapalı (`disableSignUp: true`); hesap yalnızca CLI ile açılır.
- `proxy.ts` oturumsuz istekleri `/admin/giris`'e yönlendirir; API'ler 401 döner.
- Cookie kontrolü sadece ilk perdedir: her admin sayfası ve her server action
  sunucu tarafında `requireAdmin` (oturum + OWNER rol) doğrular.
- Tüm form verileri sunucuda Zod ile yeniden doğrulanır; client doğrulaması
  güvenlik sınırı değildir.
- Admin rotaları `noindex` + `robots.txt`'te `Disallow: /admin`, `/api/`.
- Audit log: oluşturma/güncelleme/yayınlama/arşivleme/medya işlemleri
  kim-ne-ne zaman kaydı tutar (şifre/token asla metadata'ya yazılmaz).
- Rate limit: Better Auth pencere başına istek sınırı uygular.
- Görsel yükleme: gerçek içerik doğrulama, boyut/piksel sınırı, UUID dosya
  adı, EXIF temizleme.

---

## 11. Sorun Giderme

| Belirti | Neden / Çözüm |
| --- | --- |
| Production'da proje sayfaları 500 + logda `DbConfigurationError` | `DATABASE_URL` Railway Variables'da tanımlı değil. Ekleyip redeploy edin. |
| Girişte "Sunucu yapılandırması eksik" / 503 | `AUTH_SECRET` veya `DATABASE_URL` eksik. |
| Giriş oluyor ama hemen tekrar giriş sayfasına düşüyor | `AUTH_URL` production adresiyle eşleşmiyor (cookie domain uyumsuzluğu). |
| Görsel yüklemede "storage yapılandırılmamış" | `S3_*` değişkenlerinden biri eksik — Bölüm 7. |
| Yüklenen görsel sitede görünmüyor | `S3_PUBLIC_BASE_URL` bucket'ın gerçek public adresi değil. |
| `migrate deploy` "No migration found" diyor | Migration klasörü commit'lenmemiş — Bölüm 4, Adım 1. |
| Seed "DATABASE_URL tanımlı değil" diyor | Ortam değişkenini aynı PowerShell oturumunda export ettiğinizden emin olun. |
| Panelde yayınladım ama sitede eski hâli görünüyor | 5 dk ISR + anında revalidate vardır; hâlâ eskiyse CDN/browser cache'ini yenileyin (Ctrl+F5). |

---

## 12. Yedekleme Önerisi

- Railway Postgres için otomatik backup'ı açın (Railway → Postgres →
  Backups) veya periyodik `pg_dump` alın.
- Object storage bucket'ı için sağlayıcının versiyonlama/backup özelliğini
  değerlendirin. Panelde hard delete olmadığı için (arşivleme modeli) veri
  kaybı riski düşüktür; yine de migration öncesi yedek alın.

---

## 13. Dosya Haritası (Hızlı Referans)

```
prisma/schema.prisma            Veri modeli (Project, ProjectMedia, SlugRedirect, AuditLog, auth tabloları)
prisma.config.ts                Prisma 7 yapılandırması (datasource + seed komutu)
prisma/seed.ts                  İdempotent seed (data/projects.ts → DB)
scripts/create-admin.ts         İlk OWNER hesabı (npm run admin:create)
proxy.ts                        /admin ve /api/admin route koruması
lib/db/                         Prisma client tekil örneği + yapılandırma hataları
lib/auth/                       Better Auth örneği + sunucu guard'ları + client
lib/projects/repository.ts      Public veri erişimi (yalnızca PUBLISHED)
lib/projects/admin-repository.ts Panel veri erişimi (tüm durumlar)
lib/projects/actions.ts         Server action'lar (tümü requireAdmin + Zod)
lib/storage/                    S3 uyumlu storage adapter'ı
lib/media/process.ts            sharp doğrulama + WebP optimizasyon
lib/audit.ts                    Audit log yazıcı
app/admin/                      Panel sayfaları + admin.css tasarım sistemi
components/admin/               Panel bileşenleri (form, medya, dnd sıralama)
components/projects/ProjectDetail.tsx  Ortak proje detay şablonu (site + önizleme)
data/projects.ts                Seed kaynağı + dev/build fallback (runtime'da birincil kaynak DEĞİL)
```
