// src/core/docx/buildDate.ts

export function buildDate(): Record<string, string> {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear() % 100).padStart(2, '0');

  return {
    today: `${dd}.${mm}.${yy}`,
  };
}