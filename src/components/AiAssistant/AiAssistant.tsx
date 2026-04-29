"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";
import styles from "./AiAssistant.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 preview for image messages
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

interface AiAssistantProps {
  locale: Locale;
  dict: Dictionary;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatMessageContent(content: string, locale: Locale): JSX.Element {
  // Convert markdown-style links [text](url) to clickable links
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
        // Convert **bold** to <strong>
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
          const boldMatch = bp.match(/\*\*([^*]+)\*\*/);
          if (boldMatch) {
            return <strong key={`${i}-${j}`}>{boldMatch[1]}</strong>;
          }
          return <span key={`${i}-${j}`}>{bp}</span>;
        });
      })}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AiAssistant({ locale, dict }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const isRtl = locale === "ar";
  const ai = dict.aiAssistant;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          role: "assistant",
          content: ai.welcomeMessage,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen, messages.length, ai.welcomeMessage]);

  // Hide badge after opening
  useEffect(() => {
    if (isOpen) setShowBadge(false);
  }, [isOpen]);

  // ─── Send text message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      // Build conversation history for API
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
      const reply = data.reply || ai.errorMessage;

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: ai.errorMessage,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, locale, ai.errorMessage]);

  // ─── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (isLoading) return;

      // Validate file
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content: ai.imageTooLarge,
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        // Add user message with image preview
        const userMsg: Message = {
          id: generateId(),
          role: "user",
          content: ai.imageUploaded,
          image: base64,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
          const res = await fetch("/api/ai/image-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, locale }),
          });

          const data = await res.json();

          const analysisMsg: Message = {
            id: generateId(),
            role: "assistant",
            content:
              data.message ||
              (locale === "ar"
                ? "تم تحليل الصورة"
                : "Image analyzed"),
            products: data.products || [],
            timestamp: Date.now(),
          };

          // Add analysis description if available
          if (data.analysis) {
            const desc =
              locale === "ar"
                ? data.analysis.description_ar
                : data.analysis.description_en;
            if (desc) {
              analysisMsg.content = `${desc}\n\n${analysisMsg.content}`;
            }
          }

          setMessages((prev) => [...prev, analysisMsg]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: "assistant",
              content: ai.errorMessage,
              timestamp: Date.now(),
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [isLoading, locale, ai]
  );

  // ─── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleImageUpload(file);
    },
    [handleImageUpload]
  );

  // ─── Keyboard ───────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    },
    []
  );

  // Quick suggestions
  const handleSuggestion = useCallback(
    (text: string) => {
      setInput(text);
      setTimeout(() => {
        // Trigger send after setting input
        const fakeInput = text;
        if (!fakeInput.trim() || isLoading) return;

        const userMsg: Message = {
          id: generateId(),
          role: "user",
          content: fakeInput,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        setInput("");

        fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
              { role: "user", parts: [{ text: fakeInput }] },
            ],
            locale,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: data.reply || ai.errorMessage,
                timestamp: Date.now(),
              },
            ]);
          })
          .catch(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: ai.errorMessage,
                timestamp: Date.now(),
              },
            ]);
          })
          .finally(() => setIsLoading(false));
      }, 50);
    },
    [isLoading, messages, locale, ai.errorMessage]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating AI Button */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label={ai.title}
        title={ai.title}
      >
        <div className={styles.fabInner}>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <path d="M10 21v1a2 2 0 1 0 4 0v-1" />
            <line x1="9" y1="17" x2="15" y2="17" />
            <circle cx="10" cy="9" r="1" fill="currentColor" />
            <circle cx="14" cy="9" r="1" fill="currentColor" />
          </svg>
        </div>
        {showBadge && <span className={styles.fabBadge}>AI</span>}
        <div className={styles.fabPulse} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={styles.overlay}
          dir={isRtl ? "rtl" : "ltr"}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.window}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.avatarWrap}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                    <circle cx="10" cy="9" r="1" fill="currentColor" />
                    <circle cx="14" cy="9" r="1" fill="currentColor" />
                  </svg>
                  <span className={styles.onlineDot} />
                </div>
                <div className={styles.headerText}>
                  <span className={styles.headerTitle}>{ai.title}</span>
                  <span className={styles.headerSub}>{ai.subtitle}</span>
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label={dict.search.close}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            {/* Chat Body */}
            <div
              className={`${styles.body} ${isDragging ? styles.bodyDragging : ""}`}
              ref={chatBodyRef}
            >
              {isDragging && (
                <div className={styles.dragOverlay}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p>{ai.dropImage}</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : styles.msgAssistant}`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.msgAvatar}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className={styles.msgBubble}>
                    {msg.image && (
                      <div className={styles.msgImage}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.image}
                          alt={ai.imageUploaded}
                          className={styles.msgImageImg}
                        />
                      </div>
                    )}
                    <div className={styles.msgText}>
                      {formatMessageContent(msg.content, locale)}
                    </div>
                    {/* Product cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className={styles.productCards}>
                        {msg.products.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/${locale}/products/${p.slug}`}
                            className={styles.productCard}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className={styles.productCardImg}>
                              {p.image ? (
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  width={48}
                                  height={48}
                                  className={styles.productCardImgInner}
                                  unoptimized={p.image.endsWith(".svg")}
                                />
                              ) : (
                                <div className={styles.productCardPlaceholder}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className={styles.productCardInfo}>
                              <span className={styles.productCardModel}>
                                {p.brand} {p.modelNumber}
                              </span>
                              <span className={styles.productCardName}>
                                {p.name}
                              </span>
                              <span className={styles.productCardCat}>
                                {p.category}
                              </span>
                            </div>
                            <svg
                              className={styles.productCardArrow}
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                transform: isRtl ? "scaleX(-1)" : "none",
                              }}
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    )}
                    {/* WhatsApp CTA button — appears on assistant messages mentioning WhatsApp */}
                    {msg.role === "assistant" &&
                      (msg.content.includes("واتساب") || msg.content.includes("WhatsApp") || msg.content.includes("01065445000")) && (() => {
                        // Find last user message before this assistant message
                        const msgIndex = messages.findIndex((m) => m.id === msg.id);
                        const prevUserMsgs = messages.slice(0, msgIndex).filter((m) => m.role === "user");
                        const lastUserQuestion = prevUserMsgs.length > 0
                          ? prevUserMsgs[prevUserMsgs.length - 1].content
                          : "";
                        const waMsg = lastUserQuestion
                          ? (locale === "ar"
                              ? `السلام عليكم، كنت بستفسر عن: ${lastUserQuestion}`
                              : `Hello, I was asking about: ${lastUserQuestion}`)
                          : (locale === "ar"
                              ? "السلام عليكم، لدي استفسار بخصوص منتجاتكم."
                              : "Hello, I have an inquiry about your products.");
                        const waUrl = `https://wa.me/201065445000?text=${encodeURIComponent(waMsg)}`;
                        return (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappCta}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {locale === "ar" ? "تواصل عبر الواتساب" : "Chat on WhatsApp"}
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                    </svg>
                  </div>
                  <div className={`${styles.msgBubble} ${styles.typingBubble}`}>
                    <div className={styles.typingDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions (only when few messages) */}
            {messages.length <= 1 && !isLoading && (
              <div className={styles.suggestions}>
                {ai.suggestions.map((s, i) => (
                  <button
                    key={i}
                    className={styles.suggestionBtn}
                    onClick={() => handleSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className={styles.inputArea}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
              <button
                className={styles.imageBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                aria-label={ai.uploadImage}
                title={ai.uploadImage}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={ai.inputPlaceholder}
                rows={1}
                disabled={isLoading}
                dir="auto"
              />
              <button
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label={ai.send}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    transform: isRtl ? "scaleX(-1)" : "none",
                  }}
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <span>{ai.poweredBy}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
