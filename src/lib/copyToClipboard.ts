/**
 * Copy-to-clipboard utilities that work on iOS/Safari and desktop.
 * Used by BookingDetailSheet and can be reused elsewhere.
 */

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(typeof window !== 'undefined' && (window as unknown as { MSStream?: unknown }).MSStream)
  )
}

/** Converts any value to plain text (no HTML) for clipboard. Max 2000 chars. */
export function toPlainCopyableText(value: unknown): string {
  if (typeof document === 'undefined') return String(value ?? '').trim()
  const div = document.createElement('div')
  div.textContent = value == null ? '' : String(value)
  return (div.textContent ?? '').trim().slice(0, 2000)
}

/**
 * Copy to clipboard that works on iPhone/Safari iOS.
 * On iOS: textarea + contentEditable + Range/Selection + setSelectionRange + execCommand('copy').
 */
export function copyToClipboardCrossBrowser(value: unknown): boolean {
  if (typeof document === 'undefined') return false
  const safe = toPlainCopyableText(value)
  if (!safe) return false

  const textarea = document.createElement('textarea')
  textarea.value = safe
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.width = '100px'
  textarea.style.minHeight = '1em'
  textarea.style.padding = '0'
  textarea.style.border = 'none'
  textarea.style.outline = 'none'
  textarea.style.boxShadow = 'none'
  textarea.style.background = 'transparent'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)

  if (isIOS()) {
    textarea.contentEditable = 'true'
    textarea.readOnly = true
    const range = document.createRange()
    range.selectNodeContents(textarea)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
    textarea.setSelectionRange(0, safe.length)
  } else {
    textarea.select()
  }

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(textarea)
  return ok
}
