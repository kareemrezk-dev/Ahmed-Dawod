"use client";
import React from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import styles from "./BrandsSlider.module.css";

interface BrandsSliderProps { locale: Locale; dict: Dictionary; }

const BRANDS = [
  { name: "SKF", src: "/brands/SKF.png" },
  { name: "NSK", src: "/brands/NSK.png" },
  { name: "NTN", src: "/brands/NTN.png" },
  { name: "FAG", src: "/brands/FAG.webp", scale: 0.85 },
  { name: "TIMKEN", src: "/brands/TIMKEN.png" },
  { name: "NACHI", src: "/brands/NACHI.png" },
  { name: "THK", src: "/brands/THK.png" },
  { name: "INA", src: "/brands/INA.png" },
  { name: "HIWIN", src: "/brands/HIWIN.png" },
];

export function BrandsSlider({ locale, dict }: BrandsSliderProps) {
  const repeated = [...BRANDS, ...BRANDS, ...BRANDS];
  return (
    <section className={styles.section} aria-labelledby="brands-heading">
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowRule} />
          <span className={styles.eyebrowText}>{dict.brands.title}</span>
          <span className={styles.eyebrowRule} />
        </div>
        <p className={styles.subtitle}>{dict.brands.subtitle}</p>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.rail}>
          {repeated.map((brand, i) => (
            <div key={`${brand.name}-${i}`} className={styles.logoCard}>
              <div className={styles.logoInner} style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}>
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={120}
                  height={40}
                  className={styles.logoImg}
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
