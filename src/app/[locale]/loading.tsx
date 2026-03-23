import styles from "./global-loading.module.css";

export default function GlobalLoading() {
  return (
    <div className={styles.wrap} aria-label="Loading" role="status">
      <div className={styles.spinner} />
    </div>
  );
}
