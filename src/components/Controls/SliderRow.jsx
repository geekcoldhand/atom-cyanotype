import styles from './SliderRow.module.css'

/**
 * A single labeled range slider row.
 *
 * @param {string}   label      - display label
 * @param {string}   sliderKey  - the control key (used to set min for contrastSoft)
 * @param {number}   value      - current value
 * @param {function} onChange   - called with new numeric value
 */
export function SliderRow({ label, sliderKey, value, onChange }) {
  const min = sliderKey === 'contrastSoft' ? -50 : 0

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <input
        type="range"
        min={min}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className={styles.slider}
      />
      <span className={styles.value}>{value}</span>
    </div>
  )
}
