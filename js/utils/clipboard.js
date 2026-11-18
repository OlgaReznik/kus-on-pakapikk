function copyWithTextarea(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.append(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyWithTextarea(text);
  }
}

/** Copies text and briefly shows "Kopeeritud ✓" on the button that was clicked. */
export async function copyWithFeedback(text, button) {
  const copied = await copyText(text);
  if (!copied || !button) return;
  const originalLabel = button.textContent;
  button.textContent = 'Kopeeritud ✓';
  setTimeout(() => { button.textContent = originalLabel; }, 1500);
}
