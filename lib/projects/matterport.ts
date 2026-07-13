// Matterport URL doğrulama ve normalizasyonu.
// Yalnızca resmi Matterport host'ları; iframe HTML yapıştırılırsa src güvenle
// çıkarılır, diğer HTML asla saklanmaz. Arbitrary iframe/başka domain yasak.

const ALLOWED_HOSTS = new Set(['my.matterport.com', 'matterport.com', 'www.matterport.com']);
const MODEL_ID_PATTERN = /^[A-Za-z0-9]{8,16}$/;

export interface NormalizedMatterport {
  embedUrl: string;
  modelId: string;
}

/** iframe HTML'i verildiyse src attribute'unu çıkarır; değilse girdiyi döndürür. */
export function extractUrlCandidate(input: string): string {
  const trimmed = input.trim();
  if (trimmed.toLowerCase().includes('<iframe')) {
    const m = /src\s*=\s*["']([^"']+)["']/i.exec(trimmed);
    return m ? m[1] : '';
  }
  return trimmed;
}

/** HTTPS + izinli host + geçerli m parametresi zorunlu. Temiz URL üretir. */
export function normalizeMatterportUrl(input: string): NormalizedMatterport | { error: string } {
  const candidate = extractUrlCandidate(input);
  if (!candidate) return { error: 'Matterport URL bulunamadı.' };

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { error: 'Geçersiz URL formatı.' };
  }

  if (url.protocol !== 'https:') return { error: 'Matterport URL HTTPS olmalı.' };
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    return { error: 'Yalnızca my.matterport.com bağlantıları kabul edilir.' };
  }

  const modelId = url.searchParams.get('m') ?? '';
  if (!MODEL_ID_PATTERN.test(modelId)) {
    return { error: 'URL içinde geçerli bir Matterport model ID (m parametresi) bulunamadı.' };
  }

  return {
    embedUrl: `https://my.matterport.com/show/?m=${modelId}`,
    modelId,
  };
}
