'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important pour les cookies
      })

      const data = await res.json()

      if (res.ok && data.success) {
        console.log('Connexion réussie, redirection...')
        console.log('Données reçues:', data)
        // Attendre un peu plus longtemps pour que le cookie soit bien défini
        await new Promise(resolve => setTimeout(resolve, 500))
        // Forcer un refresh complet pour que les cookies soient bien pris en compte
        window.location.href = '/dashboard'
      } else {
        console.error('Erreur de connexion:', data)
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden dark">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <Card className="border border-border bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg"
            >
              <Wrench className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Connexion
              </CardTitle>
              <CardDescription className="text-sm">
                Accédez à votre espace professionnel
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-3"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground">
                  Nouveau ?
                </span>
              </div>
            </div>
            <Link href="/auth/register">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium"
              >
                Créer un compte
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

