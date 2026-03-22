/**
 * Saves a blob to the user's device.
 *
 * On iOS / Android: invokes the native share sheet via navigator.share({ files })
 * so the user can save to Photos, Files, or any app.
 *
 * On desktop: triggers a direct <a> download.
 *
 * IMPORTANT: must be called with no artificial delays (no setTimeout) between
 * the user tap and this call — iOS Safari enforces that navigator.share() is
 * invoked within the same user-gesture call stack as the originating tap.
 */

/**
 * Detects a genuine touch-primary mobile device using maxTouchPoints only.
 * No userAgent sniffing — UA strings are unreliable on modern iOS/Android
 * and break for iPad in desktop-browsing mode.
 *
 * Desktop Mac:   maxTouchPoints === 0
 * iOS / Android: maxTouchPoints >= 5
 * Threshold >=2  catches all real touch devices while excluding all mice.
 */
function isMobileDevice() {
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints >= 2
}

export async function saveBlob(blob, filename = 'atom-cyanotype.jpg') {
  const file = new File([blob], filename, { type: 'image/jpeg' })

  // Mobile share sheet — iOS Safari / Android Chrome only.
  if (
    isMobileDevice() &&
    typeof navigator.share    === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: 'ATOM — Cyanotype Film' })
      return
    } catch (err) {
      // AbortError = user dismissed the sheet. Not an error — just return.
      if (err.name === 'AbortError') return
      // Any other error falls through to the download fallback.
      console.warn('navigator.share failed, falling back to download:', err)
    }
  }

  // Desktop + fallback: programmatic <a> download
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
