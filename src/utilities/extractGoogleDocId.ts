/**
 * Extract Google Doc ID from URL or return ID if already provided
 * 
 * Supports:
 * - Full URL: https://docs.google.com/document/d/DOC_ID/edit
 * - Short URL: https://docs.google.com/document/d/DOC_ID
 * - Just ID: DOC_ID
 */

export function extractGoogleDocId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Trim whitespace
  const trimmed = input.trim()

  // If it's already just an ID (no slashes, no protocol), return it
  if (!trimmed.includes('/') && !trimmed.includes('http')) {
    return trimmed
  }

  // Try to extract from URL patterns
  // Pattern 1: /document/d/DOC_ID/ or /document/d/DOC_ID
  const match1 = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
  if (match1 && match1[1]) {
    return match1[1]
  }

  // Pattern 2: /d/DOC_ID/ or /d/DOC_ID
  const match2 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match2 && match2[1]) {
    return match2[1]
  }

  // Pattern 3: Just the ID at the end of URL
  const match3 = trimmed.match(/([a-zA-Z0-9_-]{20,})/)
  if (match3 && match3[1] && match3[1].length >= 20) {
    return match3[1]
  }

  return null
}

/**
 * Validate if a string looks like a valid Google Doc ID
 */
export function isValidGoogleDocId(docId: string): boolean {
  // Google Doc IDs are typically 20-44 characters, alphanumeric with dashes and underscores
  return /^[a-zA-Z0-9_-]{20,44}$/.test(docId)
}

