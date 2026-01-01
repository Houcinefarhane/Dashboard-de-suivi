'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, Palette, Type, Save, Eye } from 'lucide-react'
import { toast } from '@/lib/toast'
import { generateInvoicePDF } from '@/lib/pdf-generator'

interface InvoiceCustomization {
  id: string
  logoUrl: string | null
  showLogo: boolean
  primaryColorR: number
  primaryColorG: number
  primaryColorB: number
  footerText: string | null
  headerText: string | null
  showLegalInfo: boolean
  showCompanyInfo: boolean
}

export default function ParametresFacturesPage() {
  const [customization, setCustomization] = useState<InvoiceCustomization | null>(null)
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
          message: 'Vos préférences de facture ont été mises à jour',
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
    // Récupérer une facture exemple pour le preview
    try {
      const res = await fetch('/api/invoices?limit=1')
      if (res.ok) {
        const data = await res.json()
        if (data.invoices && data.invoices.length > 0) {
          const invoice = data.invoices[0]
          const artisanRes = await fetch('/api/artisan')
          if (artisanRes.ok) {
            const artisan = await artisanRes.json()
            // Générer le PDF avec les paramètres actuels (sera mis à jour dans le générateur)
            generateInvoicePDF({ ...invoice, artisan })
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
      // Pour l'instant, on stocke juste le nom du fichier
      // Dans une vraie app, il faudrait uploader vers un service de stockage (S3, Cloudinary, etc.)
      const reader = new FileReader()
      reader.onloadend = () => {
        // Convertir en base64 pour stockage temporaire
        const base64 = reader.result as string
        setFormData({ ...formData, logoUrl: base64 })
      }
      reader.readAsDataURL(file)
    }
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
          <h1 className="text-4xl font-bold mb-2">Personnalisation des factures</h1>
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
              Ajoutez votre logo sur les factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
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
            </div>
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
              Personnalisez les couleurs de vos factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={`rgb(${formData.primaryColorR}, ${formData.primaryColorG}, ${formData.primaryColorB})`}
                  onChange={(e) => {
                    const rgb = e.target.value.match(/\d+/g)
                    if (rgb) {
                      setFormData({
                        ...formData,
                        primaryColorR: parseInt(rgb[0]),
                        primaryColorG: parseInt(rgb[1]),
                        primaryColorB: parseInt(rgb[2]),
                      })
                    }
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
              Ajoutez des messages personnalisés sur vos factures
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
                Ce texte apparaîtra en bas de chaque facture
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
                Texte optionnel à afficher en haut de la facture
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
              Configurez les informations affichées sur les factures
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
    </div>
  )
}

