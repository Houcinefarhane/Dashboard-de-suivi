'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, CreditCard, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { formatCurrency } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

interface SubscriptionData {
  subscription: {
    id: string
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    priceId: string
  } | null
  status: string
}

export default function AbonnementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSubscription()
    
    // Vérifier les paramètres d'URL pour les messages
    if (searchParams.get('success') === 'true') {
      setMessage({ type: 'success', text: 'Abonnement activé avec succès !' })
      fetchSubscription()
    }
    if (searchParams.get('canceled') === 'true') {
      setMessage({ type: 'error', text: 'Paiement annulé' })
    }
  }, [searchParams])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (planId: 'monthly' | 'yearly') => {
    setProcessing(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la création de la session de paiement' })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
    } finally {
      setProcessing(false)
    }
  }

  const handlePortal = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'ouverture du portail' })
      }
    } catch (error) {
      console.error('Portal error:', error)
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-500 border border-green-500/30">
            Actif
          </span>
        )
      case 'trialing':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-500 border border-blue-500/30">
            Essai
          </span>
        )
      case 'past_due':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            Paiement en retard
          </span>
        )
      case 'canceled':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-500 border border-gray-500/30">
            Annulé
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-500 border border-gray-500/30">
            Inactif
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const currentPlan = subscription?.subscription?.priceId 
    ? Object.values(PLANS).find(p => p.priceId === subscription.subscription.priceId)
    : null

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et vos factures
          </p>
        </div>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </motion.div>
      )}

      {/* Statut actuel */}
      {subscription?.subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Abonnement actuel</CardTitle>
                <CardDescription>
                  {currentPlan?.name || 'Plan actif'}
                </CardDescription>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-semibold capitalize">{subscription.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prochain paiement</p>
                <p className="font-semibold">
                  {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            {subscription.subscription.cancelAtPeriodEnd && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-500">
                  Attention: Votre abonnement sera annulé à la fin de la période actuelle.
                </p>
              </div>
            )}
            <Button
              onClick={handlePortal}
              disabled={processing}
              variant="outline"
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {processing ? 'Chargement...' : 'Gérer mon abonnement'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans disponibles */}
      {!isActive && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Choisissez votre plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(PLANS).map(([planId, plan]) => (
              <Card key={planId} className="relative">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-muted-foreground"> / {plan.interval === 'month' ? 'mois' : 'an'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Accès complet au dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Gestion illimitée de clients</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Devis et factures illimités</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Géolocalisation et optimisation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Support par email</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => handleCheckout(planId as 'monthly' | 'yearly')}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        S'abonner
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

