const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function randomSegment(length: number) {
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)]
  }
  return result
}

export function formatInviteCode(segment: string) {
  return `DBC-${segment}`
}

export async function generateUniqueInviteCode(
  checkExists: (code: string) => Promise<boolean>,
  maxAttempts = 8,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = formatInviteCode(randomSegment(6))
    const exists = await checkExists(code)
    if (!exists) {
      return code
    }
  }

  throw new Error('Failed to generate a unique invite code')
}
