'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function EmailSentPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResend = async () => {
    if (!email) return
    
    setResending(true)
    setResendMessage('')
    
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setResendMessage('Un nouveau lien a été envoyé à votre adresse email.')
      } else {
        setResendMessage(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      setResendMessage('Une erreur est survenue')
    } finally {
      setResending(false)
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Mail className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-semibold">
                Vérifiez votre email
              </CardTitle>
              <CardDescription className="mt-2">
                Un lien de vérification a été envoyé à
              </CardDescription>
              <p className="mt-2 font-medium text-primary">{email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Prochaines étapes :</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Ouvrez votre boîte de réception</li>
                <li>Cliquez sur le lien de vérification dans l'email</li>
                <li>Vous serez automatiquement connecté</li>
              </ol>
            </div>

            {resendMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3"
              >
                <p className="text-sm text-green-700 dark:text-green-400">{resendMessage}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Vous n'avez pas reçu l'email ?
              </p>
              <Button 
                onClick={handleResend} 
                variant="outline" 
                className="w-full"
                disabled={resending}
              >
                {resending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  Retour à la connexion
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

