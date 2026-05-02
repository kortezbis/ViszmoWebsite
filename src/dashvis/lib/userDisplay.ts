import type { User } from '@supabase/supabase-js'

export function userInitials(user: User | null, emailFallback: string | null): string {
  if (!user && !emailFallback) return '?'
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    emailFallback
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
