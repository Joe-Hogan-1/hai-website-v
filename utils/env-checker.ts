export function checkEnvironmentVariables() {
  const variables = {
    NEXT_PUBLIC_FORMSPREE_ENDPOINT: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT,
    FORMSPREE_ENDPOINT: process.env.FORMSPREE_ENDPOINT,
  }

  const missing = Object.entries(variables)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  return {
    variables,
    missing,
    allPresent: missing.length === 0,
  }
}
