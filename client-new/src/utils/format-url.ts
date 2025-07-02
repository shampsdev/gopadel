export function formatUrl(url: string): string {
  if (!url) return "";

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }

  return url;
}

export function getDisplayName(url: string): string {
  const hasCyrillic = /[а-яё]/i.test(url);
  if (hasCyrillic) {
    return url.length > 30 ? `${url.substring(0, 30)}...` : url;
  }

  try {
    const urlObj = new URL(formatUrl(url));
    const hostname = urlObj.hostname.replace("www.", "");

    if (hostname.includes("lunda")) return "Lunda Padel";
    return hostname;
  } catch {
    return url.length > 30 ? `${url.substring(0, 30)}...` : url;
  }
}
