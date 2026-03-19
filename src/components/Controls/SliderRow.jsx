import styles from './SliderRow.module.css'

/**
 * A single labeled range slider row.
 *
 * @param {string}   label    - display label
 * @param {number}   value    - current 0–100 value
 * @param {function} onChange - called with new numeric value
 */
export function SliderRow({ label, value, onChange }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className={styles.slider}
      />
      <span className={styles.value}>{value}</span>
    </div>
  )
}
