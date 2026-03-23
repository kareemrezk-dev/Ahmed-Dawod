"use client";
import React from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import styles from "./BrandsSlider.module.css";

interface BrandsSliderProps { locale: Locale; dict: Dictionary; }

const BRANDS = [
  { name: "HIWIN", src: "/brands/hiwin.svg", color: "#003A8C" },
  { name: "FAG", src: "/brands/fag.svg", color: "#E30613" },
  { name: "SKF", src: "/brands/skf.svg", color: "#0068B2", scale: 0.75 },
  { name: "NSK", src: "/brands/nsk.svg", color: "#003DA5" },
  { name: "NTN", src: "/brands/ntn.svg", color: "#003087", scale: 0.7 },
  { name: "INA", src: "/brands/ina.svg", color: "#009640" },
  { name: "ABBA", src: "/brands/abba.svg", color: "#0055A5" },
  { name: "PMI", src: "/brands/pmi.svg", color: "#E3000F" },
  { name: "ENC", src: "/brands/enc.svg", color: "#333" },
  { name: "HTB", src: "/brands/htb.svg", color: "#0033A0" },
  { name: "RHP", src: "/brands/rhp.svg", color: "#ED1C24" },
  { name: "THK", src: "/brands/thk.svg", color: "#E80018" },
  { name: "IKO", src: "/brands/iko.svg", color: "#004DA0" },
  { name: "Rexroth", src: "/brands/rexroth.svg", color: "#003375" },
  { name: "Koyo", src: "/brands/koyo.svg", color: "#00AEEF" },
  { name: "TBI", src: "/brands/tbi.svg", color: "#E3000F" },
  { name: "NACHI", src: "/brands/nachi.svg", color: "#E50012" },
  { name: "Stieber", src: "/brands/stieber.svg", color: "#002D62" },
  { name: "TIMKEN", src: "/brands/timken.svg", color: "#007940" },
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
            <div key={`${brand.name}-${i}`} className={styles.logoCard}
              style={brand.color ? { "--brand-color": brand.color } as React.CSSProperties : undefined}>
              <div className={styles.logoInner}>
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={120}
                  height={40}
                  className={styles.logoImg}
                  style={brand.scale ? { transform: `scale(${brand.scale})` } : undefined}
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
