/**
 * Anti-spam utility with multiple lightweight protection methods
 */

// Check if the form was submitted too quickly (likely a bot)
export function isSubmittedTooQuickly(startTime: number, minTimeSeconds = 3): boolean {
  const submissionTime = Date.now()
  const elapsedSeconds = (submissionTime - startTime) / 1000
  return elapsedSeconds < minTimeSeconds
}

// Generate a simple form token
export function generateFormToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Validate form token format (not a full security check, just format validation)
export function isValidTokenFormat(token: string): boolean {
  if (!token) return false

  const parts = token.split("-")
  return parts.length === 2 && !isNaN(Number(parts[0])) && parts[1].length > 5
}

// Simple bot detection based on common patterns
export function hasCommonBotPatterns(formData: FormData): boolean {
  // Check for common spam patterns in message fields
  const message = ((formData.get("message") as string) || "").toLowerCase()

  // Common spam keywords
  const spamKeywords = [
    "viagra",
    "cialis",
    "casino",
    "lottery",
    "prize",
    "winner",
    "bitcoin",
    "investment",
    "loan",
    "mortgage",
    "debt",
    "weight loss",
    "diet pill",
    "http://",
    "https://",
    "www.",
  ]

  // Check for spam keywords
  for (const keyword of spamKeywords) {
    if (message.includes(keyword)) {
      return true
    }
  }

  // Check for excessive URLs (common in spam)
  const urlCount = (message.match(/https?:\/\//g) || []).length
  if (urlCount > 2) {
    return true
  }

  return false
}

// Lightweight spam score calculation
export function calculateSpamScore(formData: FormData, startTime: number): number {
  let score = 0

  // Time-based checks (too fast = suspicious)
  const elapsedSeconds = (Date.now() - startTime) / 1000
  if (elapsedSeconds < 2) score += 3
  else if (elapsedSeconds < 5) score += 1

  // Content-based checks
  const message = ((formData.get("message") as string) || "").toLowerCase()

  // Check for excessive capitalization
  const upperCaseRatio =
    message.split("").filter((c) => c === c.toUpperCase() && c.match(/[A-Z]/)).length / message.length
  if (upperCaseRatio > 0.5 && message.length > 20) score += 2

  // Check for repetitive characters
  if (/(.)\1{4,}/.test(message)) score += 1

  // Check for common spam phrases
  if (/\b(free|discount|offer|cheap|buy|sell|earn|income)\b/i.test(message)) score += 1

  // Check for excessive URLs
  const urlCount = (message.match(/https?:\/\//g) || []).length
  score += Math.min(urlCount, 3)

  return score
}

// Main anti-spam check function
export function isLikelySpam(
  formData: FormData,
  startTime: number,
  token: string,
): { isSpam: boolean; reason?: string } {
  // Check submission time
  if (isSubmittedTooQuickly(startTime, 2)) {
    return { isSpam: true, reason: "submitted-too-quickly" }
  }

  // Check token format
  if (!isValidTokenFormat(token)) {
    return { isSpam: true, reason: "invalid-token" }
  }

  // Check for common bot patterns
  if (hasCommonBotPatterns(formData)) {
    return { isSpam: true, reason: "spam-content-detected" }
  }

  // Calculate overall spam score
  const spamScore = calculateSpamScore(formData, startTime)
  if (spamScore >= 5) {
    return { isSpam: true, reason: "high-spam-score" }
  }

  return { isSpam: false }
}
