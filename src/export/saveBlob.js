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
export async function saveBlob(blob, filename = 'atom-cyanotype.jpg') {
  const file = new File([blob], filename, { type: 'image/jpeg' })

  // Mobile share 
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'ATOM — Cyanotype Film',
    })
    return
  }

  // Desktop / fallback: programmatic download link
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
