"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import { trackAiOpen, trackAiMessage, trackAiImageSearch, trackAiSuggestionClick, trackWhatsAppClick } from "@/lib/analytics";
import styles from "./page.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  products?: ProductResult[];
  timestamp: number;
}

interface ProductResult {
  slug: string;
  modelNumber: string;
  brand: string;
  name: string;
  category: string;
  topCategory: string;
  image: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatMessageContent(content: string): JSX.Element {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          return (
            <Link key={i} href={linkMatch[2]} className={styles.inlineLink}>
              {linkMatch[1]}
            </Link>
          );
        }
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
          const boldMatch = bp.match(/\*\*([^*]+)\*\*/);
          if (boldMatch) return <strong key={`${i}-${j}`}>{boldMatch[1]}</strong>;
          return <span key={`${i}-${j}`}>{bp}</span>;
        });
      })}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AiFullPage({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [started, setStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRtl = locale === "ar";
  const ai = dict.aiAssistant;

  useEffect(() => { trackAiOpen(); }, []);

  useEffect(() => {
    if (started) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, started]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [started]);

  // ─── Send text message ────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;

    if (!started) setStarted(true);

    const userMsg: Message = { id: generateId(), role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    trackAiMessage(text.length);

    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, locale }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: data.reply || ai.errorMessage, timestamp: Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: ai.errorMessage, timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, locale, ai.errorMessage, started]);

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(async (file: File) => {
    if (isLoading || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: ai.imageTooLarge, timestamp: Date.now() }]);
      return;
    }

    if (!started) setStarted(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const userMsg: Message = { id: generateId(), role: "user", content: ai.imageUploaded, image: base64, timestamp: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      trackAiImageSearch();

      try {
        const res = await fetch("/api/ai/image-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, locale }),
        });
        const data = await res.json();
        const analysisMsg: Message = {
          id: generateId(), role: "assistant",
          content: data.message || (locale === "ar" ? "تم تحليل الصورة" : "Image analyzed"),
          products: data.products || [], timestamp: Date.now(),
        };
        if (data.analysis) {
          const desc = locale === "ar" ? data.analysis.description_ar : data.analysis.description_en;
          if (desc) analysisMsg.content = `${desc}\n\n${analysisMsg.content}`;
        }
        setMessages((prev) => [...prev, analysisMsg]);
      } catch {
        setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: ai.errorMessage, timestamp: Date.now() }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [isLoading, locale, ai, started]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => { setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  const handleSuggestion = useCallback((text: string) => {
    trackAiSuggestionClick(text);
    sendMessage(text);
  }, [sendMessage]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page} dir={isRtl ? "rtl" : "ltr"} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerAvatar}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <circle cx="10" cy="9" r="1" fill="currentColor" /><circle cx="14" cy="9" r="1" fill="currentColor" />
            </svg>
            <span className={styles.headerDot} />
          </div>
          <div className={styles.headerInfo}>
            <h1>{ai.title}</h1>
            <p>{ai.subtitle}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Link href={`/${locale}`} className={styles.headerLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {isRtl ? "الرئيسية" : "Home"}
          </Link>
          <Link href={`/${locale}/products`} className={styles.headerLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
            </svg>
            {isRtl ? "المنتجات" : "Products"}
          </Link>
        </div>
      </header>

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {/* Welcome screen (before conversation starts) */}
          {!started && (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  <path d="M10 21v1a2 2 0 1 0 4 0v-1" /><line x1="9" y1="17" x2="15" y2="17" />
                  <circle cx="10" cy="9" r="1" fill="currentColor" /><circle cx="14" cy="9" r="1" fill="currentColor" />
                </svg>
              </div>
              <h2 className={styles.welcomeTitle}>{ai.title}</h2>
              <p className={styles.welcomeSubtitle}>
                {isRtl
                  ? "اسألني عن أي منتج، أو ارفع صورة وأنا هساعدك تلاقي اللي محتاجه من رولمان البلي وقطع الغيار."
                  : "Ask me about any product, or upload an image and I'll help you find the right bearing or spare part."}
              </p>

              {/* Capabilities */}
              <div className={styles.capabilities}>
                <div className={styles.capabilityCard}>
                  <div className={`${styles.capabilityIcon} ${styles.capIconBlue}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </div>
                  <h3>{isRtl ? "بحث ذكي" : "Smart Search"}</h3>
                  <p>{isRtl ? "ابحث بالموديل أو الماركة أو المقاس" : "Search by model, brand, or size"}</p>
                </div>
                <div className={styles.capabilityCard}>
                  <div className={`${styles.capabilityIcon} ${styles.capIconAmber}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  </div>
                  <h3>{isRtl ? "بحث بالصور" : "Visual Search"}</h3>
                  <p>{isRtl ? "ارفع صورة وأحدد المنتج لك" : "Upload a photo and I'll identify it"}</p>
                </div>
                <div className={styles.capabilityCard}>
                  <div className={`${styles.capabilityIcon} ${styles.capIconGreen}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3>{isRtl ? "استشارة فنية" : "Expert Advice"}</h3>
                  <p>{isRtl ? "نصائح لاختيار المنتج المناسب" : "Tips for choosing the right product"}</p>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className={styles.suggestions}>
                {ai.suggestions.map((s, i) => (
                  <button key={i} className={styles.sugBtn} onClick={() => handleSuggestion(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : styles.msgAssistant}`}>
              {msg.role === "assistant" && (
                <div className={styles.msgAvatar}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  </svg>
                </div>
              )}
              <div className={styles.msgBubble}>
                {msg.image && (
                  <div className={styles.msgImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.image} alt={ai.imageUploaded} className={styles.msgImageImg} />
                  </div>
                )}
                <div>{formatMessageContent(msg.content)}</div>
                {/* Product cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className={styles.productCards}>
                    {msg.products.map((p) => (
                      <Link key={p.slug} href={`/${locale}/products/${p.slug}`} className={styles.productCard}>
                        <div className={styles.productCardImg}>
                          {p.image ? (
                            <Image src={p.image} alt={p.name} width={48} height={48} className={styles.productCardImgInner} unoptimized={p.image.endsWith(".svg")} />
                          ) : (
                            <div className={styles.productCardPlaceholder}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                            </div>
                          )}
                        </div>
                        <div className={styles.productCardInfo}>
                          <span className={styles.productCardModel}>{p.brand} {p.modelNumber}</span>
                          <span className={styles.productCardName}>{p.name}</span>
                          <span className={styles.productCardCat}>{p.category}</span>
                        </div>
                        <svg className={styles.productCardArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: isRtl ? "scaleX(-1)" : "none" }}>
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
                {/* WhatsApp CTA */}
                {msg.role === "assistant" && (msg.content.includes("واتساب") || msg.content.includes("WhatsApp") || msg.content.includes("01065445000")) && (() => {
                  const msgIndex = messages.findIndex((m) => m.id === msg.id);
                  const prevUserMsgs = messages.slice(0, msgIndex).filter((m) => m.role === "user");
                  const lastQ = prevUserMsgs.length > 0 ? prevUserMsgs[prevUserMsgs.length - 1].content : "";
                  const waMsg = lastQ
                    ? (isRtl ? `السلام عليكم، كنت بستفسر عن: ${lastQ}` : `Hello, I was asking about: ${lastQ}`)
                    : (isRtl ? "السلام عليكم، لدي استفسار بخصوص منتجاتكم." : "Hello, I have an inquiry about your products.");
                  return (
                    <a href={`https://wa.me/201065445000?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappCta} onClick={() => trackWhatsAppClick("ai_assistant")}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      {isRtl ? "تواصل عبر الواتساب" : "Chat on WhatsApp"}
                    </a>
                  );
                })()}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className={`${styles.msgRow} ${styles.msgAssistant}`}>
              <div className={styles.msgAvatar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                </svg>
              </div>
              <div className={`${styles.msgBubble} ${styles.typingBubble}`}>
                <div className={styles.typingDots}><span /><span /><span /></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputWrap}>
          <div className={styles.inputBar}>
            <input type="file" ref={fileInputRef} accept="image/*" className={styles.fileInput} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); e.target.value = ""; }} />
            <button className={styles.inputBarBtn} onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label={ai.uploadImage} title={ai.uploadImage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <textarea
              ref={inputRef}
              className={styles.inputBarTextarea}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={ai.inputPlaceholder}
              rows={1}
              disabled={isLoading}
              dir="auto"
            />
            <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={!input.trim() || isLoading} aria-label={ai.send}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ transform: isRtl ? "scaleX(-1)" : "none" }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <div className={styles.footer}><span>{ai.poweredBy}</span></div>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className={styles.dragOverlay}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
          </svg>
          <p>{ai.dropImage}</p>
        </div>
      )}
    </div>
  );
}
