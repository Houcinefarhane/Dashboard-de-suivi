'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  X, Plus, Target, CheckCircle2, RefreshCw, Trash2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface KeyResult {
  id: string
  title: string
  metric: string
  targetValue: number
  currentValue: number
  unit: string
}

interface FinancialObjective {
  id: string
  title: string
  description: string | null
  period: string
  year: number
  month: number | null
  status: string
  keyResults: KeyResult[]
}

interface ObjectivesModalProps {
  isOpen: boolean
  onClose: () => void
}

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const metricLabels: Record<string, string> = {
  revenue: 'Revenus',
  profit: 'Bénéfice',
  expenses: 'Dépenses',
  newClients: 'Nouveaux clients',
  interventions: 'Interventions',
}

export function ObjectivesModal({ isOpen, onClose }: ObjectivesModalProps) {
  const [objectives, setObjectives] = useState<FinancialObjective[]>([])
  const [loading, setLoading] = useState(false)
  const [showObjectiveForm, setShowObjectiveForm] = useState(false)

  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    keyResults: [
      { title: '', metric: 'revenue', targetValue: '', unit: '€' },
    ],
  })

  // Charger les objectifs
  useEffect(() => {
    if (isOpen) {
      fetchObjectives()
    }
  }, [isOpen])

  const fetchObjectives = async () => {
    try {
      const res = await fetch('/api/financial-objectives')
      if (res.ok) {
        const data = await res.json()
        setObjectives(data)
      }
    } catch (error) {
      console.error('Error fetching objectives:', error)
    }
  }

  const handleSubmitObjective = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/financial-objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: objectiveForm.title,
          description: objectiveForm.description || null,
          period: objectiveForm.period,
          year: objectiveForm.year,
          month: objectiveForm.period === 'monthly' ? objectiveForm.month : null,
          keyResults: objectiveForm.keyResults
            .filter((kr) => kr.title && kr.targetValue)
            .map((kr) => ({
              title: kr.title,
              metric: kr.metric,
              targetValue: parseFloat(kr.targetValue),
              unit: kr.unit,
            })),
        }),
      })

      if (res.ok) {
        await fetchObjectives()
        setShowObjectiveForm(false)
        setObjectiveForm({
          title: '',
          description: '',
          period: 'monthly',
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          keyResults: [{ title: '', metric: 'revenue', targetValue: '', unit: '€' }],
        })
      }
    } catch (error) {
      console.error('Error creating objective:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteObjective = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return

    try {
      const res = await fetch(`/api/financial-objectives/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchObjectives()
      }
    } catch (error) {
      console.error('Error deleting objective:', error)
    }
  }

  const handleSyncObjective = async (id: string) => {
    try {
      const res = await fetch('/api/financial-objectives/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectiveId: id }),
      })
      if (res.ok) {
        await fetchObjectives()
      }
    } catch (error) {
      console.error('Error syncing objective:', error)
    }
  }

  const addKeyResult = () => {
    setObjectiveForm({
      ...objectiveForm,
      keyResults: [
        ...objectiveForm.keyResults,
        { title: '', metric: 'revenue', targetValue: '', unit: '€' },
      ],
    })
  }

  const removeKeyResult = (index: number) => {
    setObjectiveForm({
      ...objectiveForm,
      keyResults: objectiveForm.keyResults.filter((_, i) => i !== index),
    })
  }

  const updateKeyResult = (index: number, field: string, value: any) => {
    const newKeyResults = [...objectiveForm.keyResults]
    newKeyResults[index] = { ...newKeyResults[index], [field]: value }
    setObjectiveForm({ ...objectiveForm, keyResults: newKeyResults })
  }

  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0
    const progress = (current / target) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6" />
                Objectifs OKR
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Définissez et suivez vos objectifs financiers
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Bouton créer objectif */}
            {!showObjectiveForm && (
              <Button onClick={() => setShowObjectiveForm(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Créer un nouvel objectif
              </Button>
            )}

            {/* Formulaire objectif */}
            {showObjectiveForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Nouvel objectif</CardTitle>
                  <CardDescription>
                    Définissez un objectif avec des résultats clés mesurables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitObjective} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="obj-title">Titre de l'objectif *</Label>
                      <Input
                        id="obj-title"
                        value={objectiveForm.title}
                        onChange={(e) =>
                          setObjectiveForm({ ...objectiveForm, title: e.target.value })
                        }
                        placeholder="Ex: Augmenter le chiffre d'affaires"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="obj-description">Description</Label>
                      <Input
                        id="obj-description"
                        value={objectiveForm.description}
                        onChange={(e) =>
                          setObjectiveForm({ ...objectiveForm, description: e.target.value })
                        }
                        placeholder="Description optionnelle"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="obj-period">Période *</Label>
                        <select
                          id="obj-period"
                          value={objectiveForm.period}
                          onChange={(e) =>
                            setObjectiveForm({ ...objectiveForm, period: e.target.value })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="monthly">Mensuel</option>
                          <option value="annual">Annuel</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="obj-year">Année *</Label>
                        <Input
                          id="obj-year"
                          type="number"
                          value={objectiveForm.year}
                          onChange={(e) =>
                            setObjectiveForm({ ...objectiveForm, year: parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>

                      {objectiveForm.period === 'monthly' && (
                        <div className="space-y-2">
                          <Label htmlFor="obj-month">Mois *</Label>
                          <select
                            id="obj-month"
                            value={objectiveForm.month}
                            onChange={(e) =>
                              setObjectiveForm({ ...objectiveForm, month: parseInt(e.target.value) })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            required
                          >
                            {months.map((month, index) => (
                              <option key={index} value={index + 1}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Key Results */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Résultats clés *</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addKeyResult}>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un résultat
                        </Button>
                      </div>

                      {objectiveForm.keyResults.map((kr, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-3">
                                  <Input
                                    placeholder="Titre du résultat clé"
                                    value={kr.title}
                                    onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                                    required
                                  />

                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      value={kr.metric}
                                      onChange={(e) => {
                                        updateKeyResult(index, 'metric', e.target.value)
                                        // Mettre à jour l'unité automatiquement
                                        const unit = ['revenue', 'profit', 'expenses'].includes(e.target.value) ? '€' : ''
                                        updateKeyResult(index, 'unit', unit)
                                      }}
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      required
                                    >
                                      <option value="revenue">Revenus</option>
                                      <option value="profit">Bénéfice</option>
                                      <option value="expenses">Dépenses</option>
                                      <option value="newClients">Nouveaux clients</option>
                                      <option value="interventions">Interventions</option>
                                    </select>

                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Objectif"
                                      value={kr.targetValue}
                                      onChange={(e) => updateKeyResult(index, 'targetValue', e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>

                                {objectiveForm.keyResults.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeKeyResult(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowObjectiveForm(false)
                          setObjectiveForm({
                            title: '',
                            description: '',
                            period: 'monthly',
                            year: new Date().getFullYear(),
                            month: new Date().getMonth() + 1,
                            keyResults: [{ title: '', metric: 'revenue', targetValue: '', unit: '€' }],
                          })
                        }}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Création...' : 'Créer l\'objectif'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Liste des objectifs */}
            {objectives.length > 0 ? (
              <div className="space-y-4">
                {objectives.map((objective) => (
                  <Card key={objective.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{objective.title}</h3>
                            {objective.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {objective.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {objective.period === 'monthly'
                                ? `${months[objective.month! - 1]} ${objective.year}`
                                : `Année ${objective.year}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncObjective(objective.id)}
                              title="Synchroniser avec les données réelles"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteObjective(objective.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Key Results */}
                        <div className="space-y-3">
                          {objective.keyResults.map((kr) => {
                            const progress = getProgress(kr.currentValue, kr.targetValue)
                            const isCompleted = progress >= 100

                            return (
                              <div key={kr.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{kr.title}</span>
                                  <span className="text-muted-foreground">
                                    {kr.unit === '€' 
                                      ? `${formatCurrency(kr.currentValue)} / ${formatCurrency(kr.targetValue)}`
                                      : `${kr.currentValue.toFixed(0)} / ${kr.targetValue.toFixed(0)} ${kr.unit}`
                                    }
                                  </span>
                                </div>
                                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                                      isCompleted ? 'bg-green-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className={isCompleted ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                    {progress.toFixed(0)}%
                                  </span>
                                  {isCompleted && (
                                    <span className="flex items-center gap-1 text-green-600 font-medium">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Atteint
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !showObjectiveForm && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun objectif défini pour le moment.</p>
                  <p className="text-sm mt-2">Créez votre premier objectif pour commencer le suivi.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

