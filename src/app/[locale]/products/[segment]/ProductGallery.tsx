"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import detailStyles from "./detail.module.css";

interface ProductGalleryProps {
  images: string[];
  altText: string;
  basePartNumber?: string;
  companyName?: string;
}

export function ProductGallery({ images, altText, basePartNumber, companyName = "Ahmed Dawod Bearings" }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [model, setModel] = useState(basePartNumber);

  useEffect(() => {
    setModel(basePartNumber);
  }, [basePartNumber]);

  useEffect(() => {
    function handler(e: Event) {
      const ev = e as CustomEvent<string>;
      setModel(ev.detail || basePartNumber);
    }
    window.addEventListener("modelSelected", handler);
    return () => window.removeEventListener("modelSelected", handler);
  }, [basePartNumber]);

  if (!images || images.length === 0) return null;

  return (
    <div className={detailStyles.galleryContainer}>
      <div className={detailStyles.visualCard}>
        <div className={detailStyles.imageWrap} style={{ position: "relative" }}>
          <Image
            src={images[activeIndex]}
            alt={altText}
            width={600}
            height={600}
            className={`${detailStyles.productImage} ${images[activeIndex].endsWith(".svg") ? detailStyles.svgProductImage : ""}`}
            priority
            sizes="(max-width: 860px) 100vw, 50vw"
            unoptimized={images[activeIndex].endsWith(".svg")}
          />
          {images[activeIndex].endsWith(".svg") && model && (
            <div className={detailStyles.svgTextOverlay}>
              <span className={detailStyles.svgModelText}>{model}</span>
            </div>
          )}
        </div>
      </div>
      
      {images.length > 1 && (
        <div className={detailStyles.thumbnailRow}>
          {images.map((img, idx) => (
            <button 
              key={idx} 
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`${detailStyles.thumbnailBtn} ${activeIndex === idx ? detailStyles.thumbnailActive : ""}`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${altText} thumbnail ${idx + 1}`}
                width={80}
                height={80}
                className={detailStyles.thumbnailImg}
                unoptimized={img.endsWith(".svg")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
