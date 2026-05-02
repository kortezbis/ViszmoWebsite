/**
 * Shown when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing.
 * Use the same values as WebApp-Vis and the iOS app so one Supabase project backs everything.
 */
export default function SupabaseConfigScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 shadow-lg">
        <h1 className="text-xl font-bold font-heading mb-2">Connect Supabase</h1>
        <p className="text-sm text-foreground-secondary leading-relaxed mb-4">
          Add your project credentials to a <code className="text-xs bg-surface-hover px-1.5 py-0.5 rounded">.env.local</code> file
          in the dashvis folder. Use the same values as the Expo / iOS app, with{' '}
          <code className="text-xs bg-surface-hover px-1.5 py-0.5 rounded">VITE_</code> instead of <code className="text-xs bg-surface-hover px-1.5 py-0.5 rounded">EXPO_PUBLIC_</code> (Viszmo may
          use a custom URL like <code className="text-xs bg-surface-hover px-1.5 py-0.5 rounded">https://api.viszmo.com</code>).
        </p>
        <pre className="text-xs bg-background border border-border rounded-xl p-4 overflow-x-auto text-foreground-secondary whitespace-pre-wrap">
{`VITE_SUPABASE_URL=https://api.viszmo.com
VITE_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
        <p className="text-xs text-foreground-muted mt-4">Restart the Vite dev server after saving.</p>
      </div>
    </div>
  )
}
