import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { isSignedIn, isLoading: authLoading } = useAuth()

  const errCode = searchParams.get('error')
  const errDesc = searchParams.get('error_description')
  const oauthError = errCode ? `${errCode}: ${errDesc || 'Authentication failed'}` : ''

  useEffect(() => {
    if (isSupabaseConfigured && isSignedIn && !authLoading) {
      const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
      navigate(path, { replace: true })
    }
  }, [isSignedIn, authLoading, navigate, redirectTo])

  const afterAuthRedirect = () => {
    const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
    return `${window.location.origin}${path}`
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message)
        return
      }
      const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
      navigate(path, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabase) return
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: afterAuthRedirect(),
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    if (!supabase) return
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: afterAuthRedirect(), scopes: 'email name' },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured) {
    return null
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground-secondary">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          <div className="flex flex-col items-center mb-8 text-center">
            <img src="/logos/fullViszmologo.png" alt="Viszmo" className="h-9 object-contain mb-6" />
            <h1 className="text-2xl font-bold font-heading tracking-tight mb-1">Welcome back</h1>
            <p className="text-foreground-secondary text-sm">Log in with the same account as the iOS app.</p>
          </div>

          <div className="w-full rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-6 shadow-xl">
            <div className="flex flex-col gap-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-surface-hover/50 hover:bg-surface-hover text-sm font-semibold text-foreground transition-colors disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-foreground text-background hover:opacity-90 text-sm font-semibold transition-opacity disabled:opacity-50"
              >
                <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current" aria-hidden>
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                Sign in with Apple
              </button>
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-2 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">or</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground-secondary uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-surface-hover/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground-secondary uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-surface-hover/40 border border-border rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {(error || oauthError) && (
                <p className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error || oauthError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign in
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-foreground-secondary mt-6">
            Use the same email and password (or Apple / Google) as the iOS app.
          </p>
        </div>
      </div>
    </div>
  )
}
