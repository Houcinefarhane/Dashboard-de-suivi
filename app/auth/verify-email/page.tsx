'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de vérification manquant')
      return
    }

    // Vérifier l'email
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json()
        
        if (res.ok && data.success) {
          setStatus('success')
          setMessage(data.message || 'Email vérifié avec succès !')
          setEmail(data.artisan?.email || '')
          
          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          if (data.error?.includes('expiré')) {
            setStatus('expired')
            setMessage(data.error)
          } else {
            setStatus('error')
            setMessage(data.error || 'Erreur lors de la vérification')
          }
        }
      })
      .catch((error) => {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('Une erreur est survenue lors de la vérification')
      })
  }, [token, router])

  const handleResend = async () => {
    if (!email) return
    
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Un nouveau lien de vérification a été envoyé à votre adresse email.')
        setStatus('success')
      } else {
        setMessage(data.error || 'Erreur lors de l\'envoi')
        setStatus('error')
      }
    } catch (error) {
      setMessage('Une erreur est survenue')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border bg-card shadow-xl">
          <CardHeader className="text-center space-y-4">
            {status === 'loading' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>
            )}
            {(status === 'error' || status === 'expired') && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
              >
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </motion.div>
            )}
            <div>
              <CardTitle className="text-2xl font-semibold">
                {status === 'loading' && 'Vérification en cours...'}
                {status === 'success' && 'Email vérifié !'}
                {(status === 'error' || status === 'expired') && 'Erreur de vérification'}
              </CardTitle>
              <CardDescription className="mt-2">
                {message}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground"
              >
                <p>Redirection vers le dashboard...</p>
              </motion.div>
            )}
            
            {status === 'expired' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Le lien de vérification a expiré. Veuillez demander un nouveau lien.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Votre adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <Button onClick={handleResend} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer l'email de vérification
                </Button>
              </div>
            )}
            
            {status === 'error' && !token && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Aucun token de vérification trouvé.
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Aller à la page de connexion
                  </Button>
                </Link>
              </div>
            )}
            
            {status === 'error' && token && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Le lien de vérification est invalide ou a expiré.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Votre adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <Button onClick={handleResend} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer l'email de vérification
                </Button>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Aller à la page de connexion
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

