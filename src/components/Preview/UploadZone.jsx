import { useRef } from 'react'
import styles from './UploadZone.module.css'

export function UploadZone({ onFile }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  return (
    <div className={styles.zone} onClick={() => inputRef.current?.click()}>
      <div className={styles.icon}>+</div>
      <div className={styles.label}>Upload a photo</div>
      <div className={styles.hint}>tap to browse · jpg, png, heic</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={handleChange}
      />
    </div>
  )
}
