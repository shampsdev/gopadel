export function parsePadelProfiles(profilesText: string | null | undefined): string[] {
  if (!profilesText || !profilesText.trim()) {
    return []
  }
  
  return profilesText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

export function formatUrl(url: string): string {
  if (!url) return ''
  
  // Если URL не начинается с http:// или https://, добавляем https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  
  return url
}

export function getDisplayName(url: string): string {
  try {
    const urlObj = new URL(formatUrl(url))
    const hostname = urlObj.hostname.replace('www.', '')
    
    if (hostname.includes('lunda')) return 'Lunda Padel'    
    return hostname
  } catch {
    return url.length > 30 ? `${url.substring(0, 30)}...` : url
  }
} 