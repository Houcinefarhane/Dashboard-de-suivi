'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, Palette, Type, Save, Eye, Settings, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { generateInvoicePDF } from '@/lib/pdf-generator'

export default function PersonnalisationPage() {
  const [customization, setCustomization] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    logoUrl: '',
    showLogo: true,
    primaryColorR: 150,
    primaryColorG: 185,
    primaryColorB: 220,
    footerText: 'Merci de votre confiance !',
    headerText: '',
    showLegalInfo: true,
    showCompanyInfo: true,
    // Informations légales
    siren: '',
    siret: '',
    kbis: '',
    rcs: '',
    vatNumber: '',
    capital: '',
    legalAddress: '',
    customFields: [] as Array<{ id: string; label: string; value: string; position: 'header' | 'footer' | 'client' }>,
  })

  useEffect(() => {
    fetchCustomization()
  }, [])

  const fetchCustomization = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/invoice-customization')
      if (res.ok) {
        const data = await res.json()
        setCustomization(data)
        setFormData({
          logoUrl: data.logoUrl || '',
          showLogo: data.showLogo ?? true,
          primaryColorR: data.primaryColorR ?? 150,
          primaryColorG: data.primaryColorG ?? 185,
          primaryColorB: data.primaryColorB ?? 220,
          footerText: data.footerText || 'Merci de votre confiance !',
          headerText: data.headerText || '',
          showLegalInfo: data.showLegalInfo ?? true,
          showCompanyInfo: data.showCompanyInfo ?? true,
          siren: data.siren || '',
          siret: data.siret || '',
          kbis: data.kbis || '',
          rcs: data.rcs || '',
          vatNumber: data.vatNumber || '',
          capital: data.capital || '',
          legalAddress: data.legalAddress || '',
          customFields: (data.customFields as any) || [],
        })
      }
    } catch (error) {
      console.error('Error fetching customization:', error)
      toast.show({
        title: 'Erreur',
        message: 'Impossible de charger les paramètres',
        type: 'info',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/invoice-customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setCustomization(data)
        toast.show({
          title: 'Paramètres sauvegardés',
          message: 'Vos préférences ont été mises à jour',
          type: 'info',
        })
      } else {
        const errorData = await res.json()
        toast.show({
          title: 'Erreur',
          message: errorData.error || 'Impossible de sauvegarder les paramètres',
          type: 'info',
        })
      }
    } catch (error) {
      console.error('Error saving customization:', error)
      toast.show({
        title: 'Erreur',
        message: 'Impossible de sauvegarder les paramètres',
        type: 'info',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    try {
      const res = await fetch('/api/invoices?limit=1')
      if (res.ok) {
        const data = await res.json()
        if (data.invoices && data.invoices.length > 0) {
          const invoice = data.invoices[0]
          const artisanRes = await fetch('/api/artisan')
          if (artisanRes.ok) {
            const artisan = await artisanRes.json()
            const customizationRes = await fetch('/api/invoice-customization')
            let customization = null
            if (customizationRes.ok) {
              customization = await customizationRes.json()
            }
            generateInvoicePDF({ ...invoice, artisan, customization })
          }
        } else {
          toast.show({
            title: 'Aucune facture',
            message: 'Créez d\'abord une facture pour voir l\'aperçu',
            type: 'info',
          })
        }
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      toast.show({
        title: 'Erreur',
        message: 'Impossible de générer l\'aperçu',
        type: 'info',
      })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({ ...formData, logoUrl: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...formData.customFields,
        { id: Date.now().toString(), label: '', value: '', position: 'footer' },
      ],
    })
  }

  const removeCustomField = (id: string) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((f) => f.id !== id),
    })
  }

  const updateCustomField = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      ),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Personnalisation</h1>
          <p className="text-muted-foreground">
            Personnalisez l'apparence de vos factures et devis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              <CardTitle>Logo</CardTitle>
            </div>
            <CardDescription>
              Ajoutez votre logo sur les factures et devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="showLogo" className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="showLogo"
                checked={formData.showLogo}
                onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Afficher le logo</span>
            </Label>
            {formData.showLogo && (
              <>
                <div>
                  <Label htmlFor="logo">Fichier logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats acceptés: PNG, JPG, SVG (max 2MB)
                  </p>
                </div>
                {formData.logoUrl && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-2">Aperçu du logo:</p>
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <CardTitle>Couleurs</CardTitle>
            </div>
            <CardDescription>
              Personnalisez les couleurs de vos factures et devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={`#${formData.primaryColorR.toString(16).padStart(2, '0')}${formData.primaryColorG.toString(16).padStart(2, '0')}${formData.primaryColorB.toString(16).padStart(2, '0')}`}
                  onChange={(e) => {
                    const hex = e.target.value.replace('#', '')
                    const r = parseInt(hex.substr(0, 2), 16)
                    const g = parseInt(hex.substr(2, 2), 16)
                    const b = parseInt(hex.substr(4, 2), 16)
                    setFormData({
                      ...formData,
                      primaryColorR: r,
                      primaryColorG: g,
                      primaryColorB: b,
                    })
                  }}
                  className="w-16 h-16 rounded border cursor-pointer"
                />
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="colorR" className="text-xs">Rouge</Label>
                    <Input
                      id="colorR"
                      type="number"
                      min="0"
                      max="255"
                      value={formData.primaryColorR}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColorR: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorG" className="text-xs">Vert</Label>
                    <Input
                      id="colorG"
                      type="number"
                      min="0"
                      max="255"
                      value={formData.primaryColorG}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColorG: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorB" className="text-xs">Bleu</Label>
                    <Input
                      id="colorB"
                      type="number"
                      min="0"
                      max="255"
                      value={formData.primaryColorB}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primaryColorB: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cette couleur sera utilisée pour les en-têtes et les éléments importants
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Textes personnalisés */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              <CardTitle>Textes personnalisés</CardTitle>
            </div>
            <CardDescription>
              Ajoutez des messages personnalisés sur vos factures et devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="footerText">Texte de pied de page</Label>
              <Input
                id="footerText"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                placeholder="Merci de votre confiance !"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ce texte apparaîtra en bas de chaque facture et devis
              </p>
            </div>
            <div>
              <Label htmlFor="headerText">Texte d'en-tête (optionnel)</Label>
              <Input
                id="headerText"
                value={formData.headerText}
                onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                placeholder="Votre message personnalisé"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Texte optionnel à afficher en haut de la facture ou du devis
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Options d'affichage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Options d'affichage</CardTitle>
            </div>
            <CardDescription>
              Configurez les informations affichées sur les factures et devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="showCompanyInfo" className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="showCompanyInfo"
                checked={formData.showCompanyInfo}
                onChange={(e) => setFormData({ ...formData, showCompanyInfo: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Afficher les informations de l'entreprise (adresse, téléphone)</span>
            </Label>
            <Label htmlFor="showLegalInfo" className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="showLegalInfo"
                checked={formData.showLegalInfo}
                onChange={(e) => setFormData({ ...formData, showLegalInfo: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Afficher les informations légales (SIRET, SIREN, etc.)</span>
            </Label>
          </CardContent>
        </Card>
      </div>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>Informations légales</CardTitle>
          </div>
          <CardDescription>
            Renseignez vos informations légales pour qu'elles apparaissent sur vos factures et devis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siren">SIREN</Label>
              <Input
                id="siren"
                value={formData.siren}
                onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                placeholder="123 456 789"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                placeholder="123 456 789 00012"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="rcs">RCS</Label>
              <Input
                id="rcs"
                value={formData.rcs}
                onChange={(e) => setFormData({ ...formData, rcs: e.target.value })}
                placeholder="RCS Paris B 123 456 789"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="kbis">KBIS</Label>
              <Input
                id="kbis"
                value={formData.kbis}
                onChange={(e) => setFormData({ ...formData, kbis: e.target.value })}
                placeholder="Numéro KBIS"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="vatNumber">TVA Intracommunautaire</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                placeholder="FR12 345678901"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="capital">Capital social</Label>
              <Input
                id="capital"
                value={formData.capital}
                onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                placeholder="10 000 €"
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="legalAddress">Siège social</Label>
            <Input
              id="legalAddress"
              value={formData.legalAddress}
              onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
              placeholder="123 Rue Example, 75001 Paris"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Champs personnalisés */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Champs personnalisés
              </CardTitle>
              <CardDescription>
                Ajoutez des champs personnalisés à afficher sur vos factures et devis
              </CardDescription>
            </div>
            <Button onClick={addCustomField} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un champ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.customFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun champ personnalisé. Cliquez sur "Ajouter un champ" pour en créer un.
            </p>
          ) : (
            formData.customFields.map((field) => (
              <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`field-label-${field.id}`}>Libellé</Label>
                    <Input
                      id={`field-label-${field.id}`}
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                      placeholder="Ex: Numéro de commande"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-value-${field.id}`}>Valeur</Label>
                    <Input
                      id={`field-value-${field.id}`}
                      value={field.value}
                      onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                      placeholder="Ex: CMD-2024-001"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-position-${field.id}`}>Position</Label>
                    <select
                      id={`field-position-${field.id}`}
                      value={field.position}
                      onChange={(e) => updateCustomField(field.id, 'position', e.target.value)}
                      className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="header">En-tête</option>
                      <option value="footer">Pied de page</option>
                      <option value="client">Section client</option>
                    </select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomField(field.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

