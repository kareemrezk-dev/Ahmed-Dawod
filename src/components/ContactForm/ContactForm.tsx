"use client";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { getAllCategoriesLocalized } from "@/lib/products";
import styles from "./ContactForm.module.css";

interface FormState { name: string; phone: string; category: string; message: string; }
const initialState: FormState = { name: "", phone: "", category: "", message: "" };

export function ContactForm({ locale, whatsappNumber }: { locale: Locale; whatsappNumber: string }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isAr = locale === "ar";

  const categories = getAllCategoriesLocalized(locale);
  const L = {
    name: isAr ? "الاسم الكامل" : "Full Name",
    phone: isAr ? "رقم الهاتف" : "Phone Number",
    category: isAr ? "نوع المنتج المطلوب" : "Required Product Type",
    message: isAr ? "تفاصيل الطلب أو الاستفسار" : "Inquiry / Order Details",
    submit: isAr ? "إرسال الاستفسار" : "Send Inquiry",
    sending: isAr ? "جارٍ الإرسال..." : "Sending...",
    selectCat: isAr ? "اختر الفئة" : "Select category",
    successTitle: isAr ? "تم الاستلام، شكراً لك!" : "Received — thank you!",
    successBody: isAr ? "سيتواصل معك فريق أحمد داود في أقرب وقت ممكن." : "The Ahmed Dawod team will contact you as soon as possible.",
    reset: isAr ? "إرسال استفسار آخر" : "Send another inquiry",
    errRequired: isAr ? "هذا الحقل مطلوب" : "This field is required",
  };

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = L.errRequired;
    if (!form.phone.trim()) {
      e.phone = L.errRequired;
    } else if (!/^[\d\s\-+()]{8,20}$/.test(form.phone.trim())) {
      e.phone = isAr ? "رقم هاتف غير صالح" : "Invalid phone number";
    }
    if (!form.message.trim()) e.message = L.errRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = ev.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormState]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const lines = [
      isAr ? `الاسم: ${form.name}` : `Name: ${form.name}`,
      isAr ? `الهاتف: ${form.phone}` : `Phone: ${form.phone}`,
      form.category ? (isAr ? `الفئة: ${form.category}` : `Category: ${form.category}`) : null,
      isAr ? `التفاصيل: ${form.message}` : `Details: ${form.message}`,
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(lines)}`;
    setTimeout(() => { window.open(url, "_blank", "noopener,noreferrer"); setLoading(false); setSubmitted(true); }, 600);
  }

  if (submitted) return (
    <div className={styles.successBox} role="status">
      <svg className={styles.successIcon} width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle cx="22" cy="22" r="20" stroke="#1d4ed8" strokeWidth="2" opacity="0.4" />
        <path d="M13 22l6 6 12-12" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className={styles.successTitle}>{L.successTitle}</p>
      <p className={styles.successSubtitle}>{L.successBody}</p>
      <button className={styles.resetBtn} onClick={() => { setForm(initialState); setSubmitted(false); }}>{L.reset}</button>
    </div>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="c-name" className={styles.label}>{L.name}<span className={styles.required} aria-hidden="true">*</span></label>
          <input id="c-name" name="name" type="text" autoComplete="name" className={styles.input} value={form.name} onChange={handleChange} aria-required="true" aria-invalid={!!errors.name} />
          {errors.name && <span className={styles.errorMsg} role="alert">{errors.name}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="c-phone" className={styles.label}>{L.phone}<span className={styles.required} aria-hidden="true">*</span></label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" className={styles.input} value={form.phone} onChange={handleChange} aria-required="true" aria-invalid={!!errors.phone} dir="ltr" />
          {errors.phone && <span className={styles.errorMsg} role="alert">{errors.phone}</span>}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="c-category" className={styles.label}>{L.category}</label>
        <div className={styles.selectWrapper}>
          <select id="c-category" name="category" className={styles.select} value={form.category} onChange={handleChange}>
            <option value="">{L.selectCat}</option>
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <svg className={styles.selectArrow} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="c-message" className={styles.label}>{L.message}<span className={styles.required} aria-hidden="true">*</span></label>
        <textarea id="c-message" name="message" className={styles.textarea} value={form.message} onChange={handleChange} aria-required="true" aria-invalid={!!errors.message} rows={5} />
        {errors.message && <span className={styles.errorMsg} role="alert">{errors.message}</span>}
      </div>
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? L.sending : <><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>{L.submit}</>}
      </button>
    </form>
  );
}
