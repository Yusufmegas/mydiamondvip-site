// Public görünüm modeli — kaynak bağımsız (DB veya statik seed verisi).
// Mevcut public bileşenler (ShowcaseCard, MatterportExperience, ProjectGallery)
// bu şekli kullanır; alan adları eski data/projects.ts yapısıyla birebirdir.

export interface MatterportTourView {
  title: string;
  embedUrl: string;
  poster: string;
}

export type GalleryOrientationView = 'landscape' | 'portrait' | 'square' | 'wide';

export interface ProjectGalleryItemView {
  src: string;
  alt: string;
  caption?: string;
  orientation?: GalleryOrientationView;
  objectPosition?: string;
}

export interface ProjectView {
  slug: string;
  title: string;
  vehicle: string;
  categories: string[];
  operations: string[];
  summary: string;
  description: string;
  materials: string[];
  image: string;
  matterportTour?: MatterportTourView;
  gallery: ProjectGalleryItemView[];
  keywords: string[];
  seoTitle?: string;
  seoDescription?: string;
  robotsIndex?: boolean;
}
