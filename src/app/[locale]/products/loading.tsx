import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb skeleton */}
        <div className={styles.breadcrumb}>
          <div className={`${styles.skel} ${styles.skelShort}`} />
          <div className={`${styles.skel} ${styles.skelTiny}`} />
          <div className={`${styles.skel} ${styles.skelMed}`} />
        </div>

        {/* Title skeleton */}
        <div className={styles.header}>
          <div className={`${styles.skel} ${styles.skelTitle}`} />
          <div className={`${styles.skel} ${styles.skelSubtitle}`} />
        </div>

        {/* Grid skeleton */}
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={`${styles.skel} ${styles.skelImage}`} />
              <div className={styles.cardBody}>
                <div className={`${styles.skel} ${styles.skelLine}`} />
                <div className={`${styles.skel} ${styles.skelLineShort}`} />
                <div className={`${styles.skel} ${styles.skelBtn}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
