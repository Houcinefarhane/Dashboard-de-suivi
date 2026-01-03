'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, CheckCircle } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Vérifier si l'utilisateur vient de s'inscrire
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
    }
  }, [searchParams])

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
      
      console.log('Login response:', {
        ok: res.ok,
        status: res.status,
        success: data.success,
        error: data.error,
        hasCookie: document.cookie.includes('artisanId')
      })

      if (res.ok && data.success) {
        console.log('Connexion réussie, redirection...')
        console.log('Données reçues:', data)
        // Attendre un peu pour que le cookie soit bien défini côté navigateur
        await new Promise(resolve => setTimeout(resolve, 500))
        // Utiliser window.location pour forcer un rechargement complet et prendre en compte les cookies
        window.location.href = '/dashboard'
        return // Important : arrêter l'exécution ici
      } else {
        console.error('Erreur de connexion:', data)
        console.error('Status:', res.status)
        console.error('Response OK:', res.ok)
        if (data.requiresEmailVerification) {
          setRequiresVerification(true)
          setError(data.error || 'Votre email n\'a pas été vérifié. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.')
        } else {
          // Afficher l'erreur avec les suggestions si disponibles
          let errorMsg = data.error || 'Erreur de connexion'
          if (data.suggestion) {
            errorMsg += `\n\nSuggestion: ${data.suggestion}`
          }
          if (data.code) {
            errorMsg += `\n\nCode d'erreur: ${data.code}`
          }
          setError(errorMsg)
        }
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      console.error('Error details:', err)
      setError(err?.message || 'Une erreur est survenue. Vérifiez votre connexion internet.')
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
              <Building2 className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
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
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
              </motion.div>
            )}
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
                  className={`rounded-lg p-3 ${
                    requiresVerification 
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}
                >
                  <p className={`text-sm ${requiresVerification ? 'text-yellow-800 dark:text-yellow-200' : 'text-destructive'}`}>
                    {error}
                  </p>
                  {requiresVerification && (
                    <div className="mt-3 space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setResending(true)
                          setResendMessage('')
                          try {
                            // Utiliser la nouvelle route Supabase pour renvoyer l'email de vérification
                            const res = await fetch('/api/auth/resend-supabase-verification', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email }),
                            })
                            const data = await res.json()
                            if (res.ok) {
                              setResendMessage(data.message || 'Un nouveau lien a été envoyé à votre adresse email.')
                            } else {
                              setResendMessage(data.error || 'Erreur lors de l\'envoi')
                            }
                          } catch (err) {
                            setResendMessage('Une erreur est survenue')
                          } finally {
                            setResending(false)
                          }
                        }}
                        disabled={resending}
                        className="w-full"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {resending ? 'Envoi...' : 'Renvoyer l\'email de vérification'}
                      </Button>
                      {resendMessage && (
                        <p className="text-xs text-green-700 dark:text-green-400">{resendMessage}</p>
                      )}
                    </div>
                  )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-4"><div>Chargement...</div></div>}>
      <LoginContent />
    </Suspense>
  )
}

