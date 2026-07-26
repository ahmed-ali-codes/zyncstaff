'use client'

import { useState } from 'react'
import { updatePasswordAction } from '@/app/actions/auth'
import { Lock, Loader2, CheckCircle2 } from 'lucide-react'

export function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePasswordAction(password)
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="double-bezel-outer">
      <div className="double-bezel-inner p-6 bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Lock size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tighter">Change Password</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Update your account password securely.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-destructive text-sm font-medium p-3 rounded-lg bg-destructive/10">
              {error}
            </div>
          )}

          {success && (
            <div className="text-emerald-600 text-sm font-medium p-3 rounded-lg bg-emerald-500/10 flex items-center gap-2">
              <CheckCircle2 size={16} /> Password updated successfully!
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Updating...</>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
