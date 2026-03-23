"use client";
import { useState } from "react";
import styles from "./ShareButton.module.css";

interface ShareButtonProps {
  title: string;
  locale: string;
}

const LABELS = {
  ar: { share: "مشاركة", copied: "تم النسخ!", copy: "نسخ الرابط", wa: "واتساب", close: "إغلاق" },
  en: { share: "Share", copied: "Copied!", copy: "Copy Link", wa: "WhatsApp", close: "Close" },
  cn: { share: "分享", copied: "已复制！", copy: "复制链接", wa: "WhatsApp", close: "关闭" },
} as const;

export function ShareButton({ title, locale }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.en;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const shareWa = () => {
    const waText = encodeURIComponent(`${title}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${waText}`, "_blank", "noopener,noreferrer");
  };

  const handleClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: window.location.href }); return; } catch { /* cancelled */ }
    }
    setOpen((v) => !v);
  };

  return (
    <div className={styles.wrap}>
      <button className={styles.btn} onClick={handleClick} aria-label={L.share}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
        </svg>
        <span>{L.share}</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.dropdown} role="dialog" aria-label={L.share}>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label={L.close}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <button className={styles.shareOption} onClick={copyLink}>
              {copied
                ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg><span style={{color:"#22c55e"}}>{L.copied}</span></>
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>{L.copy}</span></>
              }
            </button>
            <button className={styles.shareOption} onClick={shareWa}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              <span>{L.wa}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
