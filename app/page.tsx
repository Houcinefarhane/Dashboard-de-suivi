'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Calendar, FileText, TrendingUp, Package, Sparkles } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background dark">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <Logo size="lg" showText={false} className="mx-auto" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Dashboard Artisan
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La solution moderne pour gérer votre activité de plombier, serrurier ou artisan
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8 py-6 h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg hover:shadow-xl transition-all">
                Commencer maintenant
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="h-full border border-border bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-secondary-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <CardTitle className="text-3xl">Valeur ajoutée unique</CardTitle>
              <CardDescription className="text-lg">
                Notre intelligence artificielle analyse vos données pour vous proposer des insights précieux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Suggestions intelligentes pour optimiser vos tarifs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Prédiction des besoins en matériel
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Rappels automatiques pour les entretiens périodiques
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Analytics avancés pour maximiser vos revenus
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

const features = [
  {
    title: 'Gestion Clients',
    description: 'Organisez tous vos clients en un seul endroit avec leurs informations complètes',
    icon: Wrench,
  },
  {
    title: 'Planning Intelligent',
    description: 'Planifiez vos interventions avec un calendrier interactif et des rappels automatiques',
    icon: Calendar,
  },
  {
    title: 'Devis & Factures',
    description: 'Créez des devis et factures professionnels en quelques clics, exportables en PDF',
    icon: FileText,
  },
  {
    title: 'Suivi Financier',
    description: 'Visualisez vos revenus, dépenses et bénéfices avec des graphiques détaillés',
    icon: TrendingUp,
  },
  {
    title: 'Gestion Stock',
    description: 'Suivez votre matériel et recevez des alertes quand les stocks sont bas',
    icon: Package,
  },
  {
    title: 'Analytics Avancés',
    description: 'Découvrez vos services les plus rentables et optimisez votre activité',
    icon: Sparkles,
  },
]

