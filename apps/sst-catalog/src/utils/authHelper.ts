/**
 * authHelper.ts — Keamanan autentikasi Master Admin GalanganShop.
 *
 * Implementasi pilihan dari implementation_plan.md:
 * "Secure admin access using SHA-256 PIN and role-based password protection."
 *
 * Semua kata sandi / PIN admin disimpan sebagai hash SHA-256 (tidak pernah plaintext
 * di Firestore atau sessionStorage). Web Crypto API digunakan karena tersedia di
 * semua browser modern dan secure context (localhost / https pages.dev).
 */

export async function sha256Hash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Memeriksa apakah nilai tersimpan dalam format hash SHA-256 (64 karakter heksadesimal).
 * Digunakan untuk migrasi backward-compatible dari data lama yang masih plaintext.
 */
export function isSha256Hash(value: string | undefined | null): boolean {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

/**
 * Hash default password bawaan 'Dear2226' (dihasilkan sekali, nilai konstan).
 * Digunakan sebagai default di initialData.ts agar tidak perlu async di module scope.
 */
export const DEFAULT_ADMIN_PASSWORD_HASH =
  '582ca0553e7abdac990e8c761fa3c164533c6e6b49bc8bd7c4ea7c0cd4e294fb'; // SHA-256('Dear2226')
