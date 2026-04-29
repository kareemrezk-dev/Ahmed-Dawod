"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { SearchOverlay } from "@/components/SearchOverlay/SearchOverlay";
import { LocaleSwitcher } from "@/components/LocaleSwitcher/LocaleSwitcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { searchProducts, getProductName, getProductImagePath, getProductImageAlt } from "@/lib/products";
import { CartIcon } from "@/components/Cart/CartIcon";
import { CartSidebar } from "@/components/Cart/CartSidebar";

interface NavbarClientProps {
  locale: Locale;
  dict: Dictionary;
}

/* ── SVG icons ─────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 13 13" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s ease" }}
    >
      <path d="M2 4l4.5 4.5L11 4" />
    </svg>
  );
}

function MenuOpen() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function MenuClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/* ── Category icon SVGs ─────────────────────────────────────── */
function CategoryIconSvg({ type }: { type: string }) {
  const base = { width: 40, height: 40, viewBox: "0 0 36 36", fill: "none" as const, "aria-hidden": true as const };
  switch (type) {
    case "bearing":
      return (
        <svg {...base}>
          <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          {[0,1,2,3,4,5,6,7].map((i) => { const a=(i/8)*2*Math.PI; return <circle key={i} cx={18+11*Math.cos(a)} cy={18+11*Math.sin(a)} r="2.5" fill="currentColor" opacity="0.6" />; })}
          <circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.8" />
        </svg>
      );
    case "linear":
      return (
        <svg {...base}>
          <rect x="4" y="13" width="28" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <rect x="8" y="16" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="22" y="16" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
          <line x1="4" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        </svg>
      );
    case "ballscrew":
      return (
        <svg {...base}>
          <line x1="6" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
          {[8,12,16,20,24,28].map((x) => <circle key={x} cx={x} cy="18" r="2.2" fill="currentColor" opacity="0.65" />)}
          <rect x="4" y="14" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          <rect x="28" y="14" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </svg>
      );
    case "chrome":
      return (
        <svg {...base}>
          <rect x="14" y="4" width="8" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <rect x="16" y="4" width="4" height="28" rx="2" fill="currentColor" opacity="0.12" />
          <line x1="14" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <line x1="14" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <line x1="14" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        </svg>
      );
    case "leadscrew":
      return (
        <svg {...base}>
          <line x1="18" y1="4" x2="18" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {[6,9,12,15,18,21,24,27,30].map((y,i) => (
            <path key={i} d={`M${i%2===0?14:22} ${y} L${i%2===0?22:14} ${y+3}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          ))}
        </svg>
      );
    case "fastener":
      return (
        <svg {...base}>
          <circle cx="18" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <rect x="16" y="15" width="4" height="17" rx="2" fill="currentColor" opacity="0.5" />
          <line x1="13" y1="27" x2="23" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="13" y1="30" x2="23" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "housing":
      return (
        <svg {...base}>
          <rect x="4" y="20" width="28" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <circle cx="18" cy="20" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <circle cx="18" cy="20" r="3" fill="currentColor" opacity="0.4" />
          <circle cx="7" cy="28" r="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <circle cx="29" cy="28" r="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case "pulley":
      return (
        <svg {...base}>
          <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <circle cx="18" cy="18" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
          <circle cx="18" cy="18" r="3" fill="currentColor" opacity="0.7" />
          {[0,1,2,3,4,5].map((i) => { const a=(i/6)*2*Math.PI; return <line key={i} x1={18+5*Math.cos(a)} y1={18+5*Math.sin(a)} x2={18+10*Math.cos(a)} y2={18+10*Math.sin(a)} stroke="currentColor" strokeWidth="1.2" opacity="0.5" />; })}
        </svg>
      );
    case "misc":
      return (
        <svg {...base}>
          <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <rect x="20" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <rect x="4" y="20" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <circle cx="26" cy="26" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <circle cx="26" cy="26" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...base}>
          <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
  }
}

/* ── Inline Search Bar ──────────────────────────────────────── */
function NavSearchBar({
  placeholder, locale, onOpen, dict,
}: { placeholder: string; locale: string; onOpen: (query: string) => void; dict: Dictionary }) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchProducts>>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (value.trim().length < 1) { setResults([]); return; }
    const t = setTimeout(() => {
      setResults(searchProducts(value).slice(0, 5));
      setActiveIdx(-1);
    }, 100);
    return () => clearTimeout(t);
  }, [value]);

  function expand() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 40);
  }

  function collapse() {
    setExpanded(false);
    setValue("");
    setResults([]);
  }

  function goToProduct(slug: string) {
    collapse();
    router.push(`/${locale}/products/${slug}`);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        collapse();
      }
    }
    if (expanded) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { collapse(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); return; }
    if (e.key === "Enter") {
      if (activeIdx >= 0 && results[activeIdx]) { goToProduct(results[activeIdx].slug); return; }
      if (value.trim().length >= 1) {
        collapse();
        router.push(`/${locale}/products?q=${encodeURIComponent(value.trim())}`);
      }
    }
  }

  const showDropdown = expanded && value.trim().length >= 1 && results.length > 0;

  return (
    <div
      ref={wrapRef}
      className={`${styles.searchBar} ${expanded ? styles.searchBarExpanded : ""}`}
      role="search"
    >
      <button
        type="button"
        className={styles.searchBarIcon}
        onClick={expanded ? () => {} : expand}
        aria-label={placeholder}
        tabIndex={expanded ? -1 : 0}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="search"
        className={styles.searchBarInput}
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        autoComplete="off"
        tabIndex={expanded ? 0 : -1}
        dir={locale === "ar" ? "rtl" : "ltr"}
      />
      {expanded && value && (
        <button type="button" className={styles.searchBarClear} onClick={collapse} aria-label="Clear">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
        </button>
      )}

      {/* Inline suggestions dropdown */}
      {showDropdown && (
        <div className={styles.navDropdown}>
          <ul className={styles.navDropdownList}>
            {results.map((p, i) => (
              <li
                key={p.slug}
                className={`${styles.navDropdownItem} ${i === activeIdx ? styles.navDropdownItemActive : ""}`}
                onMouseDown={() => goToProduct(p.slug)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className={styles.navDropdownThumb}>
                  <Image
                    src={getProductImagePath(p)}
                    alt={getProductImageAlt(p)}
                    width={32}
                    height={32}
                    className={styles.navDropdownThumbImg}
                    unoptimized={getProductImagePath(p).endsWith(".svg")}
                  />
                </span>
                <span className={styles.navDropdownText}>
                  <span className={styles.navDropdownModel}>{p.brand} {p.modelNumber}</span>
                  <span className={styles.navDropdownName}>{getProductName(p, locale as Locale)}</span>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.navDropdownViewAll}
            onMouseDown={() => {
              collapse();
              router.push(`/${locale}/products?q=${encodeURIComponent(value.trim())}`);
            }}
          >
            {dict.search.viewAll}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: locale === 'ar' ? 'scaleX(-1)' : 'none' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export function NavbarClient({ locale, dict }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Scroll shadow
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu when route changes
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close mega menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        megaRef.current &&
        !megaRef.current.contains(e.target as Node) &&
        productsButtonRef.current &&
        !productsButtonRef.current.contains(e.target as Node)
      ) {
        setMegaOpen(false);
      }
    }
    if (megaOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [megaOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setMegaOpen(false); setMobileOpen(false); }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const closeMega = useCallback(() => setMegaOpen(false), []);
  const openMega = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }, []);
  const delayCloseMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);
  const cancelCloseMega = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
  }, []);
  const closeSearch = useCallback(() => { setSearchOpen(false); setSearchInitialQuery(""); }, []);

  const navLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/configurator`, label: dict.nav.sizeFinder },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <>
      <nav
        className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}
        aria-label="Main navigation"
      >
        <div className={styles.inner}>
          {/* Logo */}
          <Link href={`/${locale}`} className={styles.brand} aria-label={dict.company.name}>
            <Image
              src="/logo.svg"
              alt={dict.company.name}
              width={160}
              height={87}
              className={styles.brandLogo}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className={styles.desktopNav}>
            <Link href={`/${locale}`} className={[styles.navLink, (pathname === "/" + locale || pathname === "/" + locale + "/") ? styles.navLinkActive : ""].join(" ")}>{dict.nav.home}</Link>

            {/* Products trigger — hover opens mega, click navigates to /products */}
            <div
              className={styles.productsTrigger}
              onMouseEnter={openMega}
              onMouseLeave={delayCloseMega}
            >
              <Link
                href={`/${locale}/products`}
                className={[styles.navLink, styles.productsBtn, pathname.startsWith("/" + locale + "/products") ? styles.navLinkActive : ""].join(" ")}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                {dict.nav.products}
                <ChevronDown open={megaOpen} />
              </Link>
            </div>

            <Link href={`/${locale}/configurator`} prefetch={false} className={[styles.navLink, pathname.startsWith("/" + locale + "/configurator") ? styles.navLinkActive : ""].join(" ")}>{dict.nav.sizeFinder}</Link>
            <Link href={`/${locale}/about`} prefetch={false} className={[styles.navLink, pathname.startsWith("/" + locale + "/about") ? styles.navLinkActive : ""].join(" ")}>{dict.nav.about}</Link>
            <Link href={`/${locale}/contact`} prefetch={false} className={[styles.navLink, pathname.startsWith("/" + locale + "/contact") ? styles.navLinkActive : ""].join(" ")}>{dict.nav.contact}</Link>
            <Link href={`/${locale}/ai`} prefetch={false} className={[styles.navLink, styles.aiLink, pathname.startsWith("/" + locale + "/ai") ? styles.navLinkActive : ""].join(" ")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{marginInlineEnd: 4}}>
                <path d="M12 1.5l1.6 4.8c.4 1.2 1.4 2.2 2.6 2.6l4.8 1.6-4.8 1.6c-1.2.4-2.2 1.4-2.6 2.6L12 19.5l-1.6-4.8c-.4-1.2-1.4-2.2-2.6-2.6L3 10.5l4.8-1.6c1.2-.4 2.2-1.4 2.6-2.6L12 1.5z"/>
                <path d="M19 15l.7 2.1c.2.6.7 1.1 1.3 1.3L23 19l-2.1.7c-.6.2-1.1.7-1.3 1.3L19 23l-.7-2.1c-.2-.6-.7-1.1-1.3-1.3L15 19l2.1-.7c.6-.2 1.1-.7 1.3-1.3L19 15z"/>
              </svg>
              {locale === "ar" ? "المساعد الذكي" : "AI Assistant"}
            </Link>
          </div>
          {/* Right cluster */}
          <div className={styles.rightCluster}>
            <LocaleSwitcher locale={locale} />
            <NavSearchBar
              placeholder={dict.search.placeholder}
              locale={locale}
              dict={dict}
              onOpen={(q) => { setSearchInitialQuery(q); setSearchOpen(true); }}
            />
            <CartIcon />
            <button
              className={styles.menuButton}
              onClick={() => setMobileOpen((p) => !p)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <MenuClose /> : <MenuOpen />}
            </button>
          </div>
        </div>

        <CartSidebar locale={locale} dict={dict} />

        {/* ── Mega Menu ────────────────────────────────────── */}
        {megaOpen && (
          <div ref={megaRef} className={styles.megaMenu} role="region" aria-label={dict.megaMenu.title}
            onMouseEnter={cancelCloseMega}
            onMouseLeave={delayCloseMega}>
            <div className={styles.megaInner}>
              <p className={styles.megaTitle}>{dict.megaMenu.title}</p>
              <div className={styles.megaGrid}>
                {dict.megaMenu.categories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={`/${locale}/${cat.href}`}
                    className={styles.megaCard}
                    prefetch={false}
                    onClick={closeMega}
                  >
                    <span className={styles.megaCardIcon}>
                      <CategoryIconSvg type={cat.icon} />
                    </span>
                    <span className={styles.megaCardLabel}>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile nav ───────────────────────────────────── */}
        <div
          id="mobile-nav"
          className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ""}`}
          aria-hidden={!mobileOpen}
        >
          <Link href={`/${locale}`} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
            {dict.nav.home}
          </Link>

          {/* Mobile products accordion */}
          <div className={styles.mobileProductsSection}>
            <button
              className={`${styles.mobileNavLink} ${styles.mobileProductsBtn}`}
              onClick={() => setMegaOpen((p) => !p)}
              aria-expanded={megaOpen}
            >
              {dict.nav.products}
              <ChevronDown open={megaOpen} />
            </button>
            {megaOpen && (
              <div className={styles.mobileMegaGrid}>
                {dict.megaMenu.categories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={`/${locale}/${cat.href}`}
                    className={styles.mobileMegaItem}
                    prefetch={false}
                    onClick={() => { setMobileOpen(false); setMegaOpen(false); }}
                  >
                    <span className={styles.mobileMegaIcon}><CategoryIconSvg type={cat.icon} /></span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}

          <Link href={`/${locale}/ai`} prefetch={false} className={`${styles.mobileNavLink} ${styles.aiMobileLink}`} onClick={() => setMobileOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{marginInlineEnd: 6}}>
              <path d="M12 1.5l1.6 4.8c.4 1.2 1.4 2.2 2.6 2.6l4.8 1.6-4.8 1.6c-1.2.4-2.2 1.4-2.6 2.6L12 19.5l-1.6-4.8c-.4-1.2-1.4-2.2-2.6-2.6L3 10.5l4.8-1.6c1.2-.4 2.2-1.4 2.6-2.6L12 1.5z"/>
              <path d="M19 15l.7 2.1c.2.6.7 1.1 1.3 1.3L23 19l-2.1.7c-.6.2-1.1.7-1.3 1.3L19 23l-.7-2.1c-.2-.6-.7-1.1-1.3-1.3L15 19l2.1-.7c.6-.2 1.1-.7 1.3-1.3L19 15z"/>
            </svg>
            {locale === "ar" ? "المساعد الذكي" : "AI Assistant"}
          </Link>

          <div className={styles.mobileBottom}>
            <button className={styles.mobileSearchBtn} onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>
              <SearchIcon />
              <span>{dict.nav.search}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay — rendered outside navbar */}
      <SearchOverlay locale={locale} dict={dict} isOpen={searchOpen} onClose={closeSearch} initialQuery={searchInitialQuery} />
    </>
  );
}
