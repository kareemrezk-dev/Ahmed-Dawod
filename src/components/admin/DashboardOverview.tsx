"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./DashboardOverview.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    weekOrders: number;
    weekRevenue: number;
    monthOrders: number;
    monthRevenue: number;
    customersCount: number;
    productsCount: number;
    avgOrderValue: number;
    couponUsage: number;
  };
  statusCounts: Record<string, number>;
  paymentCounts: Record<string, number>;
  topProducts: Array<{
    name: string;
    brand: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    total: number;
    status: string;
    payment_method: string;
    created_at: string;
    customer_name: string;
    customer_phone: string;
  }>;
  dailyOrders: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString("ar-EG");
}

function fmtPrice(n: number): string {
  return n.toLocaleString("ar-EG") + " ج.م";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString("ar-EG");
}

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.loading}>
        <span>❌ فشل تحميل البيانات</span>
        <button onClick={fetchData} style={{ color: "#60a5fa", background: "none", border: "1px solid rgba(96,165,250,0.3)", padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { overview, statusCounts, paymentCounts, topProducts, recentOrders, dailyOrders } = data;
  const maxDailyOrders = Math.max(...dailyOrders.map(d => d.orders), 1);

  return (
    <div className={styles.dashWrap}>

      {/* ── Stats Cards ── */}
      <div className={styles.statsGrid}>
        {/* Today Revenue */}
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className={styles.statLabel}>إيرادات اليوم</span>
          <span className={styles.statValue}>{fmtPrice(overview.todayRevenue)}</span>
          <span className={styles.statSub}>{overview.todayOrders} طلب اليوم</span>
        </div>

        {/* Month Revenue */}
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className={styles.statLabel}>إيرادات الشهر</span>
          <span className={styles.statValue}>{fmtPrice(overview.monthRevenue)}</span>
          <span className={styles.statSub}>{overview.monthOrders} طلب هذا الشهر</span>
        </div>

        {/* Total Orders */}
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <span className={styles.statLabel}>إجمالي الطلبات</span>
          <span className={styles.statValue}>{fmtNum(overview.totalOrders)}</span>
          <span className={`${styles.statSub} ${styles.statSubGreen}`}>
            إجمالي: {fmtPrice(overview.totalRevenue)}
          </span>
        </div>

        {/* Customers */}
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className={styles.statLabel}>العملاء</span>
          <span className={styles.statValue}>{fmtNum(overview.customersCount)}</span>
          <span className={styles.statSub}>متوسط الطلب: {fmtPrice(overview.avgOrderValue)}</span>
        </div>
      </div>

      {/* ── Chart + Status ── */}
      <div className={styles.twoCol}>
        {/* Daily Chart */}
        <div className={styles.chartCard}>
          <div className={styles.sectionTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            الطلبات — آخر 14 يوم
          </div>
          <div className={styles.chartBars}>
            {dailyOrders.map((d) => (
              <div key={d.date} className={styles.chartBar}>
                <span className={styles.chartBarValue}>{d.orders > 0 ? d.orders : ""}</span>
                <div
                  className={styles.chartBarFill}
                  style={{ height: `${Math.max((d.orders / maxDailyOrders) * 100, 4)}%` }}
                  title={`${d.date}: ${d.orders} طلب — ${fmtPrice(d.revenue)}`}
                />
                <span className={styles.chartBarLabel}>
                  {new Date(d.date + "T00:00:00").toLocaleDateString("ar-EG", { day: "numeric", month: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status + Payment */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className={styles.miniCard}>
            <div className={styles.sectionTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              حالة الطلبات
            </div>
            <div className={styles.miniList}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className={styles.miniRow}>
                  <span className={styles.miniLabel}>
                    <span className={`${styles.statusDot} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof styles] || ""}`} />
                    {STATUS_LABELS[status] || status}
                  </span>
                  <span className={styles.miniValue}>{count}</span>
                </div>
              ))}
              {Object.keys(statusCounts).length === 0 && (
                <div className={styles.miniRow}>
                  <span className={styles.miniLabel}>لا توجد طلبات بعد</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.miniCard}>
            <div className={styles.sectionTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              طرق الدفع
            </div>
            <div className={styles.miniList}>
              {Object.entries(paymentCounts).map(([method, count]) => (
                <div key={method} className={styles.miniRow}>
                  <span className={styles.miniLabel}>{method}</span>
                  <span className={styles.miniValue}>{count}</span>
                </div>
              ))}
              {Object.keys(paymentCounts).length === 0 && (
                <div className={styles.miniRow}>
                  <span className={styles.miniLabel}>لا توجد بيانات</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Products ── */}
      {topProducts.length > 0 && (
        <div className={styles.topProductsCard}>
          <div className={styles.sectionTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            أكثر المنتجات طلباً
          </div>
          <table className={styles.topTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>الماركة</th>
                <th>الكمية</th>
                <th>الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name}>
                  <td>
                    <div className={`${styles.topRank} ${i === 0 ? styles.topRank1 : i === 1 ? styles.topRank2 : i === 2 ? styles.topRank3 : ""}`}>
                      {i + 1}
                    </div>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.brand || "—"}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{p.quantity}</td>
                  <td className={styles.totalBadge}>{fmtPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Recent Orders ── */}
      <div className={styles.recentCard}>
        <div className={styles.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          آخر الطلبات
        </div>
        {recentOrders.length > 0 ? (
          <table className={styles.recentTable}>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
                <th>الدفع</th>
                <th>الوقت</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => {
                const statusKey = o.status as string;
                const badgeClass = styles[`statusBadge${statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}` as keyof typeof styles] || styles.statusBadgePending;
                return (
                  <tr key={o.id}>
                    <td><span className={styles.orderNum}>{o.order_number}</span></td>
                    <td>
                      <div>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: "#4b5563", direction: "ltr", textAlign: "right" }}>{o.customer_phone}</div>
                    </td>
                    <td><span className={styles.totalBadge}>{fmtPrice(Number(o.total))}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${badgeClass}`}>
                        {STATUS_LABELS[statusKey] || statusKey}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#9ca3af" }}>{o.payment_method}</td>
                    <td><span className={styles.timeAgo}>{timeAgo(o.created_at)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>
            لا توجد طلبات بعد
          </div>
        )}
      </div>
    </div>
  );
}
