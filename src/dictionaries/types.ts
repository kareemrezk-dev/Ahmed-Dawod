// Explicit Dictionary interface — string-widened so all locales can satisfy it

export interface HeroSlide {
  eyebrow: string;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
  ctaHref: string;
}

export interface MegaMenuCategory {
  label: string;
  href: string;
  icon: string;
}

export interface Stat {
  number: string;
  label: string;
}

export interface Dictionary {
  meta: {
    siteName: string;
    slogan: string;
    description: string;
    titleTemplate: string;
  };
  company: {
    name: string;
    slogan: string;
    established: string;
    address: string;
    country: string;
    phone: string;
    phoneIntl: string;
    whatsapp: string;
    whatsappIntl: string;
    email: string;
    facebook: string;
    instagram: string;
  };
  categories: {
    title: string;
    items: readonly string[];
  };
  marketing: {
    tagline1: string;
    tagline2: string;
    tagline3: string;
  };
  nav: {
    home: string;
    products: string;
    about: string;
    contact: string;
    search: string;
  };
  contact: {
    title: string;
    whatsappLabel: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
  };
  hero: {
    slides: HeroSlide[];
  };
  megaMenu: {
    title: string;
    categories: MegaMenuCategory[];
  };
  search: {
    placeholder: string;
    noResults: string;
    resultsFor: string;
    resultsCount: string;
    viewAll: string;
    close: string;
    hint: string;
  };
  products: {
    title: string;
    subtitle: string;
    filterTitle: string;
    filterCategory: string;
    filterBrand: string;
    filterSize: string;
    filterAll: string;
    clearFilters: string;
    resultsCount: string;
    empty: string;
    specsHeading: string;
    inquiryHeading: string;
    whatsappBtn: string;
    relatedTitle: string;
    breadcrumbProducts: string;
    modelLabel: string;
    brandLabel: string;
    categoryLabel: string;
    sizeLabel: string;
    selectSize: string;
    pagination: {
      prev: string;
      next: string;
      page: string;
    };
  };
  brands: {
    title: string;
    subtitle: string;
    viewBrand: string;
  };
  about: {
    eyebrow: string;
    title: string;
    body: string;
    stats: Stat[];
    cta: string;
  };
  footer: {
    rights: string;
    quickLinks: string;
    followUs: string;
  };
  backToTop: string;
  genuine: string;
  sinceBadge: string;
  certifiedBrands: string;
  browseLabel: string;
  viewProducts: string;
  whatsappInquiry: string;
  callLabel: string;
  faq: {
    title: string;
    items: { question: string; answer: string }[];
  };
}
