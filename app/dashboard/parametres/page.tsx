'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, Shield } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function ParametresPage() {
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isOAuthOnly, setIsOAuthOnly] = useState(false)

  // Vérifier si le compte est OAuth uniquement
  useEffect(() => {
    const checkAccountType = async () => {
      try {
        const res = await fetch('/api/artisan')
        if (res.ok) {
          const artisan = await res.json()
          // Si pas de mot de passe, c'est OAuth uniquement
          // On ne peut pas vraiment vérifier ça côté client, mais on peut essayer
        }
      } catch (error) {
        console.error('Error checking account type:', error)
      }
    }
    checkAccountType()
  }, [])

  // Valider la force du mot de passe en temps réel
  useEffect(() => {
    if (!formData.newPassword) {
      setPasswordStrength({ score: 0, feedback: [] })
      return
    }

    const feedback: string[] = []
    let score = 0

    // Longueur minimale
    if (formData.newPassword.length >= 8) {
      score += 1
    } else {
      feedback.push('Au moins 8 caractères')
    }

    // Lettre minuscule
    if (/[a-z]/.test(formData.newPassword)) {
      score += 1
    } else {
      feedback.push('Une lettre minuscule')
    }

    // Lettre majuscule
    if (/[A-Z]/.test(formData.newPassword)) {
      score += 1
    } else {
      feedback.push('Une lettre majuscule')
    }

    // Chiffre
    if (/[0-9]/.test(formData.newPassword)) {
      score += 1
    } else {
      feedback.push('Un chiffre')
    }

    // Caractère spécial
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword)) {
      score += 1
    } else {
      feedback.push('Un caractère spécial')
    }

    // Longueur supplémentaire
    if (formData.newPassword.length >= 12) {
      score += 1
    }

    setPasswordStrength({ score, feedback })
  }, [formData.newPassword])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (passwordStrength.score < 4) {
      newErrors.newPassword = 'Le mot de passe ne respecte pas les critères de sécurité'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'ancien'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        // Réinitialiser le formulaire
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setPasswordStrength({ score: 0, feedback: [] })
        
        toast.show({
          title: 'Mot de passe modifié',
          message: 'Votre mot de passe a été modifié avec succès',
          type: 'info',
        })
      } else {
        // Gérer les erreurs spécifiques
        if (data.oauthOnly) {
          setIsOAuthOnly(true)
          toast.show({
            title: 'Compte OAuth',
            message: 'Ce compte utilise une connexion OAuth. Vous ne pouvez pas définir de mot de passe.',
            type: 'info',
          })
        } else if (data.details && Array.isArray(data.details)) {
          // Erreurs de validation détaillées
          const newErrors: { [key: string]: string } = {}
          if (data.details.some((d: string) => d.includes('minuscule'))) {
            newErrors.newPassword = 'Le mot de passe doit contenir au moins une lettre minuscule'
          } else if (data.details.some((d: string) => d.includes('majuscule'))) {
            newErrors.newPassword = 'Le mot de passe doit contenir au moins une lettre majuscule'
          } else if (data.details.some((d: string) => d.includes('chiffre'))) {
            newErrors.newPassword = 'Le mot de passe doit contenir au moins un chiffre'
          } else if (data.details.some((d: string) => d.includes('caractère spécial'))) {
            newErrors.newPassword = 'Le mot de passe doit contenir au moins un caractère spécial'
          } else {
            newErrors.newPassword = data.details.join(', ')
          }
          setErrors(newErrors)
        } else {
          setErrors({ submit: data.error || 'Erreur lors de la modification du mot de passe' })
          toast.show({
            title: 'Erreur',
            message: data.error || 'Impossible de modifier le mot de passe',
            type: 'info',
          })
        }
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' })
      toast.show({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la modification du mot de passe',
        type: 'info',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 0) return 'bg-gray-200'
    if (passwordStrength.score <= 2) return 'bg-red-500'
    if (passwordStrength.score <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score === 0) return 'Aucun'
    if (passwordStrength.score <= 2) return 'Faible'
    if (passwordStrength.score <= 4) return 'Moyen'
    return 'Fort'
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos paramètres de compte et votre sécurité
          </p>
        </div>
      </motion.div>

      {isOAuthOnly ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <CardTitle>Compte OAuth</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Votre compte utilise une connexion OAuth (Google). Vous ne pouvez pas définir de mot de passe.
              Pour vous connecter, utilisez le bouton "Se connecter avec Google".
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <CardTitle>Changer mon mot de passe</CardTitle>
            </div>
            <CardDescription>
              Modifiez votre mot de passe pour renforcer la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mot de passe actuel */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, currentPassword: e.target.value })
                      if (errors.currentPassword) {
                        setErrors({ ...errors, currentPassword: '' })
                      }
                    }}
                    className={errors.currentPassword ? 'border-destructive' : ''}
                    placeholder="Entrez votre mot de passe actuel"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, newPassword: e.target.value })
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: '' })
                      }
                    }}
                    className={errors.newPassword ? 'border-destructive' : ''}
                    placeholder="Entrez votre nouveau mot de passe"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Indicateur de force du mot de passe */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Force du mot de passe:</span>
                      <span className={`font-medium ${
                        passwordStrength.score <= 2 ? 'text-red-500' :
                        passwordStrength.score <= 4 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-medium">Critères requis:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-red-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {passwordStrength.score >= 4 && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Mot de passe sécurisé
                      </p>
                    )}
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirmation du mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value })
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: '' })
                      }
                    }}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Les mots de passe correspondent
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Erreur générale */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Informations de sécurité */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Recommandations de sécurité</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Utilisez un mot de passe unique que vous n'utilisez nulle part ailleurs</li>
                      <li>Évitez les informations personnelles (nom, date de naissance, etc.)</li>
                      <li>Changez régulièrement votre mot de passe</li>
                      <li>Ne partagez jamais votre mot de passe</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                    setErrors({})
                    setPasswordStrength({ score: 0, feedback: [] })
                  }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || passwordStrength.score < 4}>
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

