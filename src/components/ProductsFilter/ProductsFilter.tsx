'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useMemo } from 'react';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/dictionaries/types';
import styles from './ProductsFilter.module.css';

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface ProductsFilterProps {
  locale: Locale;
  dict: Dictionary;
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  sizeOptions: FilterOption[];
  activeCategory: string | null;
  activeBrand: string | null;
  activeSize: string | null;
  onClose?: () => void;
}

function FilterSection({
  title,
  options,
  activeValue,
  onSelect,
  allLabel,
  showSearch,
  searchPlaceholder,
  hideOptionsUntilSearch,
}: {
  title: string;
  options: FilterOption[];
  activeValue: string | null;
  onSelect: (val: string | null) => void;
  allLabel: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  hideOptionsUntilSearch?: boolean;
}) {
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!showSearch || !query.trim()) {
      if (hideOptionsUntilSearch) {
        return activeValue
          ? options.filter((o) => o.value === activeValue)
          : [];
      }
      return options;
    }
    const lowerQuery = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lowerQuery));
  }, [options, query, showSearch, hideOptionsUntilSearch, activeValue]);

  const needsScroll = filteredOptions.length > 6;

  return (
    <div className={styles.section}>
      <span className={styles.sectionTitle}>{title}</span>
      {showSearch && (
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={searchPlaceholder || 'بحث...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      )}
      <div className={needsScroll || showSearch ? styles.scrollableList : ''}>
        <button
          className={`${styles.option} ${!activeValue ? styles.optionActive : ''}`}
          onClick={() => onSelect(null)}
          aria-pressed={!activeValue}
        >
          <span
            className={`${styles.optionDot} ${!activeValue ? styles.optionDotActive : ''}`}
          />
          <span className={styles.optionLabel}>{allLabel}</span>
          <span
            className={`${styles.count} ${!activeValue ? styles.countActive : ''}`}
          >
            {options.reduce((a, o) => a + o.count, 0)}
          </span>
        </button>
        {filteredOptions.length === 0 && query.trim() !== '' ? (
          <div
            style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            لم يتم العثور على نتائج
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isActive = activeValue === opt.value;
            return (
              <button
                key={opt.value}
                className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                onClick={() => onSelect(isActive ? null : opt.value)}
                aria-pressed={isActive}
              >
                <span
                  className={`${styles.optionDot} ${isActive ? styles.optionDotActive : ''}`}
                />
                <span className={styles.optionLabel}>{opt.label}</span>
                <span
                  className={`${styles.count} ${isActive ? styles.countActive : ''}`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ProductsFilter({
  locale,
  dict,
  categoryOptions,
  brandOptions,
  sizeOptions,
  activeCategory,
  activeBrand,
  activeSize,
  onClose,
}: ProductsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value) {
        p.set(key, value);
      } else {
        p.delete(key);
      }
      // Reset page to 1 when filters change
      p.delete('page');
      router.push(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActiveFilters = activeCategory || activeBrand || activeSize;

  return (
    <div
      className={styles.filter}
      role="complementary"
      aria-label={dict.products.filterTitle}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>{dict.products.filterTitle}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasActiveFilters && (
            <button className={styles.clearBtn} onClick={clearAll}>
              {dict.products.clearFilters}
            </button>
          )}
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      {categoryOptions.length > 0 && (
        <FilterSection
          title={dict.products.filterCategory}
          options={categoryOptions}
          activeValue={activeCategory}
          onSelect={(val) => updateParam('category', val)}
          allLabel={dict.products.filterAll}
        />
      )}

      <div className={styles.divider} />

      {/* Brand filter */}
      {brandOptions.length > 0 && (
        <FilterSection
          title={dict.products.filterBrand}
          options={brandOptions}
          activeValue={activeBrand}
          onSelect={(val) => updateParam('brand', val)}
          allLabel={dict.products.filterAll}
          showSearch={brandOptions.length > 6}
          searchPlaceholder={
            locale === 'ar'
              ? 'بحث بالماركة...'
              : locale === 'en'
                ? 'Search brand...'
                : '搜索品牌...'
          }
        />
      )}

      <div className={styles.divider} />

      {/* Size filter */}
      {sizeOptions.length > 0 && (
        <FilterSection
          title={dict.products.filterSize}
          options={sizeOptions}
          activeValue={activeSize}
          onSelect={(val) => updateParam('size', val)}
          allLabel={dict.products.filterAll}
          showSearch={sizeOptions.length > 6}
          searchPlaceholder={
            locale === 'ar'
              ? 'بحث بالمقاس...'
              : locale === 'en'
                ? 'Search size...'
                : '搜索尺寸...'
          }
          hideOptionsUntilSearch={true}
        />
      )}
    </div>
  );
}
