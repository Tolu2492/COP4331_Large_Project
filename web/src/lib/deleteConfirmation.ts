// Keep delete confirmation logic in one place so the UI stays consistent.
export function confirmDelete(
  message = 'Delete this recipe?',
  detailMessage = ''
): boolean {
  let fullMessage = message;

  if (detailMessage) {
    fullMessage = `${message}

${detailMessage}`;
  }

  return window.confirm(fullMessage);
}
