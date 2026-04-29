// ─── Google Analytics 4 — Custom Event Tracking ──────────────────────────────
// Centralised helper so every component calls the same typed API.
// GA_MEASUREMENT_ID is loaded via the gtag script in layout.tsx.

export const GA_MEASUREMENT_ID = "G-ZZ8S37D53P";

// ── Core gtag wrapper ─────────────────────────────────────────────────────────
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// ── Page view (handled automatically by GA4, but useful for SPA navigations) ─
export function trackPageView(url: string) {
  gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

// ── Custom Events ─────────────────────────────────────────────────────────────

/** AI Assistant — opened the chat widget */
export function trackAiOpen() {
  gtag("event", "ai_assistant_open", { event_category: "AI" });
}

/** AI Assistant — sent a text message */
export function trackAiMessage(messageLength: number) {
  gtag("event", "ai_chat_message", {
    event_category: "AI",
    message_length: messageLength,
  });
}

/** AI Assistant — uploaded an image for visual search */
export function trackAiImageSearch() {
  gtag("event", "ai_image_search", { event_category: "AI" });
}

/** AI Assistant — clicked a suggestion chip */
export function trackAiSuggestionClick(suggestion: string) {
  gtag("event", "ai_suggestion_click", {
    event_category: "AI",
    suggestion,
  });
}

/** WhatsApp — floating button clicked */
export function trackWhatsAppClick(source: "floating_button" | "product_card" | "order_form" | "ai_assistant") {
  gtag("event", "whatsapp_click", {
    event_category: "WhatsApp",
    source,
  });
}

/** Product — card clicked (from listing page) */
export function trackProductClick(productSlug: string, productBrand: string) {
  gtag("event", "product_click", {
    event_category: "Product",
    product_slug: productSlug,
    product_brand: productBrand,
  });
}

/** Product — detail page viewed */
export function trackProductView(productSlug: string, productBrand: string, price: number | null) {
  gtag("event", "view_item", {
    event_category: "Product",
    product_slug: productSlug,
    product_brand: productBrand,
    value: price ?? 0,
    currency: "EGP",
  });
}

/** Order — modal opened (clicked "Order via WhatsApp") */
export function trackOrderModalOpen(productSlug: string) {
  gtag("event", "begin_checkout", {
    event_category: "Order",
    product_slug: productSlug,
  });
}

/** Order — successfully submitted */
export function trackOrderSubmit(orderNumber: string, total: number, paymentMethod: string) {
  gtag("event", "purchase", {
    event_category: "Order",
    transaction_id: orderNumber,
    value: total,
    currency: "EGP",
    payment_method: paymentMethod,
  });
}

/** Coupon — applied a coupon code */
export function trackCouponApply(code: string, valid: boolean) {
  gtag("event", "coupon_apply", {
    event_category: "Coupon",
    coupon_code: code,
    coupon_valid: valid,
  });
}

/** Search — used the search bar */
export function trackSearch(query: string, resultsCount: number) {
  gtag("event", "search", {
    event_category: "Search",
    search_term: query,
    results_count: resultsCount,
  });
}

/** Contact — phone number clicked */
export function trackPhoneClick() {
  gtag("event", "phone_click", { event_category: "Contact" });
}

/** Navigation — category/brand filter used */
export function trackFilterUse(filterType: string, filterValue: string) {
  gtag("event", "filter_use", {
    event_category: "Navigation",
    filter_type: filterType,
    filter_value: filterValue,
  });
}
