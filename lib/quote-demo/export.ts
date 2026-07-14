// Client-side PDF/JPEG export — bağımlılıklar butona basılınca dynamic import
// edilir (ana bundle büyümez). Server-side renderer / R2 yüklemesi YOK (demo).

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export function safeSlug(input: string): string {
  const map: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o',
    ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return input
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function download(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function pagesToJpegs(pages: HTMLElement[]): Promise<string[]> {
  const { toJpeg } = await import('html-to-image');
  const urls: string[] = [];
  for (const page of pages) {
    // Sayfa elementinin doğal (ölçeklenmemiş) A4 boyutu kullanılır
    const url = await toJpeg(page, {
      quality: 0.96,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
    urls.push(url);
  }
  return urls;
}

export async function exportPdf(pages: HTMLElement[], baseName: string): Promise<void> {
  const [{ jsPDF }, urls] = await Promise.all([
    import('jspdf'),
    pagesToJpegs(pages),
  ]);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  urls.forEach((url, i) => {
    if (i > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(url, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
  });
  pdf.save(`${baseName}.pdf`);
}

export async function exportJpeg(pages: HTMLElement[], baseName: string, quoteNo: string): Promise<void> {
  const urls = await pagesToJpegs(pages);
  if (urls.length === 1) {
    download(urls[0], `${baseName}.jpg`);
    return;
  }
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  urls.forEach((url, i) => {
    const base64 = url.split(',')[1];
    zip.file(`${safeSlug(quoteNo)}-sayfa-${i + 1}.jpg`, base64, { base64: true });
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  const href = URL.createObjectURL(blob);
  download(href, `${baseName}-jpeg.zip`);
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}
