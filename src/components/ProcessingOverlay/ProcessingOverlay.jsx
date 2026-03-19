import styles from './ProcessingOverlay.module.css'

export function ProcessingOverlay({ visible }) {
  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
      <div className={styles.label}>Developing film…</div>
    </div>
  )
}
