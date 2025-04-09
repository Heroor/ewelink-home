export function randomString(length: number) {
  return Array.from({ length }, () => (Math.random() * 36 | 0).toString(36)).join('')
}
