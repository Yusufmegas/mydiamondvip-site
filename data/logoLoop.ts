// Logo Loop marka verileri — public/images/logo-loop/ altındaki dosyalarla eşleşir.
// Tüm görseller 200×130 şeffaf PNG; width/height layout shift'i önlemek için sabittir.

export type LoopLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const loopLogos: LoopLogo[] = [
  { src: '/images/logo-loop/mercedes-benz.png', alt: 'Mercedes-Benz', width: 200, height: 130 },
  { src: '/images/logo-loop/bmw.png', alt: 'BMW', width: 200, height: 130 },
  { src: '/images/logo-loop/porsche.png', alt: 'Porsche', width: 200, height: 130 },
  { src: '/images/logo-loop/rolls-royce.png', alt: 'Rolls-Royce', width: 200, height: 130 },
  { src: '/images/logo-loop/bentley.png', alt: 'Bentley', width: 200, height: 130 },
  { src: '/images/logo-loop/ferrari.png', alt: 'Ferrari', width: 200, height: 130 },
  { src: '/images/logo-loop/maserati.png', alt: 'Maserati', width: 200, height: 130 },
  { src: '/images/logo-loop/mclaren.png', alt: 'McLaren', width: 200, height: 130 },
  { src: '/images/logo-loop/bugatti.png', alt: 'Bugatti', width: 200, height: 130 },
  { src: '/images/logo-loop/pagani.png', alt: 'Pagani', width: 200, height: 130 },
  { src: '/images/logo-loop/cadillac.png', alt: 'Cadillac', width: 200, height: 130 },
  { src: '/images/logo-loop/volkswagen.png', alt: 'Volkswagen', width: 200, height: 130 },
];
