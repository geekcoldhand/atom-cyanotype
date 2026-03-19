import styles from './Header.module.css'

export function Header({ hasImage, processing, onSave }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          AT<span className={styles.accent}>○</span>M
        </div>
        <div className={styles.sub}>Cyanotype Film</div>
      </div>

      <button
        className={styles.saveBtn}
        onClick={onSave}
        disabled={!hasImage || processing}
      >
        {processing ? 'Saving…' : 'Save'}
      </button>
    </header>
  )
}
