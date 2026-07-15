import { FilterStack } from './FilterStack.jsx'
import { UploadZone }  from './UploadZone.jsx'
import styles from './Preview.module.css'

/**
 * Preview — renders only the visible FilterStack.
 * Contains no export-specific logic and no hidden rendering containers;
 * export is produced independently by the canvas pipeline in
 * src/rendering/, sharing config with FilterStack (see src/rendering/filterConfig.js).
 */
export function Preview({
  previewRef,
  imgSrc,
  controls,
  imgRef,
  onFile,
  onImageLoad,
  onPreviewTap,
  controlsVisible,
}) {
  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div
      className={styles.wrap}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {!imgSrc && <UploadZone onFile={onFile} />}

      {imgSrc && (
        <div className={styles.tapTarget} onClick={onPreviewTap}>
          <FilterStack
            previewRef={previewRef}
            imgSrc={imgSrc}
            controls={controls}
            imgRef={imgRef}
            onLoad={onImageLoad}
          />

          {!controlsVisible && (
            <div className={styles.hint}>tap to show controls</div>
          )}
        </div>
      )}
    </div>
  )
}
