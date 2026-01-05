'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale/fr'

interface Subscription {
  id: string
  stripeStatus: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
}

export default function AbonnementPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [status, setStatus] = useState<string>('loading')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [canceled, setCanceled] = useState(false)

  useEffect(() => {
    // Vérifier les paramètres URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    }
    if (params.get('canceled') === 'true') {
      setCanceled(true)
      setTimeout(() => setCanceled(false), 5000)
    }

    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/subscription')
      if (res.ok) {
        const data = await res.json()
        setStatus(data.status)
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erreur lors de la création de la session de paiement')
      }
    } catch (error) {
      setError('Erreur lors de la création de la session de paiement')
    } finally {
      setLoading(false)
    }
  }

  const handlePortal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erreur lors de l\'ouverture du portail')
      }
    } catch (error) {
      setError('Erreur lors de l\'ouverture du portail')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Actif
        </span>
      )
    }
    if (status === 'past_due') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
          <XCircle className="w-4 h-4" />
          En retard de paiement
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
        <XCircle className="w-4 h-4" />
        Inactif
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Abonnement</h1>
        <p className="text-gray-600 mb-8">
          Gérez votre abonnement Billiev
        </p>

        {/* Messages de succès/erreur */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Paiement réussi ! Votre abonnement est maintenant actif.</span>
            </div>
          </div>
        )}

        {canceled && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Paiement annulé. Vous pouvez réessayer à tout moment.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Carte d'abonnement */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Abonnement mensuel
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: 'rgb(150, 185, 220)' }}>
                  49€
                </span>
                <span className="text-gray-600">HT /mois</span>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {status === 'active' && subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Période actuelle</p>
                    <p className="font-semibold text-gray-900">
                      {subscription.currentPeriodStart && subscription.currentPeriodEnd
                        ? `${format(new Date(subscription.currentPeriodStart), 'd MMM yyyy', { locale: fr })} - ${format(new Date(subscription.currentPeriodEnd), 'd MMM yyyy', { locale: fr })}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Statut Stripe</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {subscription.stripeStatus || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Votre abonnement sera annulé à la fin de la période actuelle.
                  </p>
                </div>
              )}

              <Button
                onClick={handlePortal}
                disabled={loading}
                className="w-full"
                style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Gérer mon abonnement
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                  <span className="text-gray-700">Toutes les fonctionnalités incluses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                  <span className="text-gray-700">Mises à jour automatiques</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                  <span className="text-gray-700">Support technique</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                  <span className="text-gray-700">Résiliable à tout moment</span>
                </li>
              </ul>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 text-lg font-medium"
                style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    S'abonner maintenant
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Questions fréquentes</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong className="text-gray-900">Puis-je annuler à tout moment ?</strong>
              <br />
              Oui, vous pouvez annuler votre abonnement à tout moment depuis le portail de gestion.
            </p>
            <p>
              <strong className="text-gray-900">Quels moyens de paiement sont acceptés ?</strong>
              <br />
              Nous acceptons toutes les cartes bancaires via Stripe.
            </p>
            <p>
              <strong className="text-gray-900">Y a-t-il des frais cachés ?</strong>
              <br />
              Non, le prix affiché est le prix final. Aucun frais caché.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

