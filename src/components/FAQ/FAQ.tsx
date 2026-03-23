"use client";
import { useState } from "react";
import styles from "./FAQ.module.css";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  items: FAQItem[];
}

export function FAQ({ title, items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  // FAQPage structured data for Google
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className={styles.faqSection}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className={styles.faqTitle}>{title}</h2>
      <div className={styles.faqList}>
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
              <button
                className={styles.faqQuestion}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <svg
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                  width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
