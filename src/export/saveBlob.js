/**
 * Saves a blob to the user's device.
 *
 * On iOS / Android: invokes the native share sheet via navigator.share({ files })
 * which lets the user save to Photos, Files, or any app.
 *
 * On desktop: triggers a direct <a> download.
 *
 * @param {Blob}   blob
 * @param {string} [filename='atom-cyanotype.jpg']
 */
/**
 * Returns true only on genuine touch-primary mobile devices.
 * navigator.canShare exists on macOS Safari too, so we cannot
 * use it alone — we need a secondary touch signal.
 */
function isMobileDevice() {
  // maxTouchPoints > 1 is the most reliable cross-browser signal.
  // A mouse-only Mac always reports 0; iOS/Android report 5+.
  return (
    typeof navigator !== 'undefined' &&
    navigator.maxTouchPoints > 1 &&
    /android|iphone|ipad|ipod/i.test(navigator.userAgent)
  )
}

export async function saveBlob(blob, filename = 'atom-cyanotype.jpg') {
  const file = new File([blob], filename, { type: 'image/jpeg' })

  // Mobile share sheet — iOS Safari / Android Chrome only.
  // Explicitly excluded: macOS Safari, macOS Chrome, desktop browsers
  // that implement navigator.share but should still download directly.
  if (
    isMobileDevice() &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: 'ATOM — Cyanotype Film' })
      return
    } catch (err) {
      // User cancelled share or share failed — fall through to download
      if (err.name !== 'AbortError') console.warn('Share failed:', err)
    }
  }

  // Desktop + fallback: direct <a> download
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
