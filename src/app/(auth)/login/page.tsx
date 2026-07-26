'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { login } from './actions'
import { ArrowRight, Lock } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-24 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background ethereal mesh (optional) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-10">
          <div className="h-16 w-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg">
            <Lock size={28} strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="mt-2 text-center text-4xl font-bold tracking-tighter text-foreground mb-2">
          ZyncStaff
        </h2>
        <p className="text-center text-muted-foreground tracking-wide uppercase text-[10px] font-mono mb-8">
          Private Workforce Compliance
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="double-bezel-outer mx-4 sm:mx-0">
          <div className="double-bezel-inner py-12 px-6 sm:px-10">
            <form action={onSubmit} className="space-y-6">

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium rounded-xl p-4 border border-destructive/20 transition-spring">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-full bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
                    {!loading && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20 transition-spring group-hover:translate-x-1">
                        <ArrowRight size={16} strokeWidth={2} />
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
