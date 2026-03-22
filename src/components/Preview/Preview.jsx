import { FilterStack } from './FilterStack.jsx'
import { UploadZone }  from './UploadZone.jsx'
import styles from './Preview.module.css'

/**
 * The central preview area.
 * Shows <UploadZone> until an image is loaded, then switches to <FilterStack>.
 * Handles drag-and-drop on the whole container.
 */
export function Preview({ imgSrc, controls, imgRef, canvasRef, onFile, onImageLoad }) {
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
      {!imgSrc && (
        <UploadZone onFile={onFile} />
      )}

      {imgSrc && (
        <FilterStack
          imgSrc={imgSrc}
          controls={controls}
          imgRef={imgRef}
          canvasRef={canvasRef}
          onLoad={onImageLoad}
        />
      )}
    </div>
  )
}
