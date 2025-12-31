'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Package, 
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useState } from 'react'
import { DashboardScreenshot } from '@/components/DashboardScreenshot'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background gradient - seulement bleu pastel */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(150, 185, 220, 0.1), white, rgba(150, 185, 220, 0.1))' }} />
        
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
                className="inline-block mb-8"
              >
                <Logo size="lg" showText={false} className="mx-auto lg:mx-0" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900"
              >
                Gérez votre activité
                <span className="block mt-2" style={{ color: 'rgb(150, 185, 220)' }}>
                  en toute simplicité
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                La solution moderne pour organiser vos clients, planifier vos rendez-vous, 
                gérer vos finances et suivre votre activité en temps réel.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 h-14 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
                    style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 py-6 h-14 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all duration-300"
                  >
                    Se connecter
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side - Screenshot visible directly */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl bg-white">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="w-full h-full relative rounded-lg overflow-hidden"
                >
                  <DashboardScreenshot />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating elements - seulement bleu */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: 'rgb(150, 185, 220)' }}
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: 'rgb(150, 185, 220)' }}
        />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Des outils puissants et intuitifs pour gérer votre activité au quotidien
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="group"
              >
                <div 
                  className={`
                    relative h-full p-6 rounded-2xl border-2 transition-all duration-500
                    ${hoveredFeature === index 
                      ? 'shadow-2xl scale-105' 
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-lg hover:shadow-xl'
                    }
                  `}
                  style={hoveredFeature === index ? { borderColor: 'rgba(150, 185, 220, 0.7)', backgroundColor: 'rgba(150, 185, 220, 0.1)' } : {}}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: hoveredFeature === index ? 1.1 : 1,
                      rotate: hoveredFeature === index ? [0, -10, 10, -10, 0] : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500
                      ${hoveredFeature === index 
                        ? 'text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700'
                      }
                    `}
                    style={hoveredFeature === index 
                      ? { backgroundColor: 'rgb(150, 185, 220)' }
                      : hoveredFeature === null ? {} : { backgroundColor: 'rgba(150, 185, 220, 0.2)' }
                    }
                  >
                    <feature.icon className="w-6 h-6" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 transition-colors"
                      style={hoveredFeature === index ? { color: 'rgb(150, 185, 220)' } : {}}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                    {feature.description}
                  </p>

                  {/* Hover details */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: hoveredFeature === index ? 1 : 0,
                      height: hoveredFeature === index ? 'auto' : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 mt-4">
                      {feature.benefits.map((benefit, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: hoveredFeature === index ? 1 : 0,
                            x: hoveredFeature === index ? 0 : -10
                          }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(150, 185, 220)' }} />
                          <span>{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Decorative gradient on hover - seulement bleu */}
                  {hoveredFeature === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ backgroundColor: 'rgba(150, 185, 220, 0.05)' }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24" style={{ background: 'linear-gradient(to bottom right, rgba(150, 185, 220, 0.1), white)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Pourquoi nous choisir ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à simplifier votre gestion ?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Rejoignez dès aujourd'hui et découvrez comment gagner du temps sur vos tâches administratives.
            </p>
            <Link href="/auth/register">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-14 bg-white hover:bg-gray-100 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group"
                style={{ color: 'rgb(150, 185, 220)' }}
              >
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Gestion Clients',
    description: 'Centralisez toutes les informations de vos clients en un seul endroit.',
    icon: Users,
    benefits: [
      'Fiche client complète et personnalisable',
      'Historique des interactions',
      'Recherche rapide et intuitive',
    ],
  },
  {
    title: 'Planning Intelligent',
    description: 'Organisez vos rendez-vous avec un calendrier interactif et des rappels automatiques.',
    icon: Calendar,
    benefits: [
      'Vue jour, semaine, mois',
      'Rappels automatiques',
      'Gestion des disponibilités',
    ],
  },
  {
    title: 'Devis & Factures',
    description: 'Créez des documents professionnels en quelques clics, exportables en PDF.',
    icon: FileText,
    benefits: [
      'Templates personnalisables',
      'Export PDF automatique',
      'Suivi des paiements',
    ],
  },
  {
    title: 'Suivi Financier',
    description: 'Visualisez vos revenus, dépenses et bénéfices avec des graphiques détaillés.',
    icon: TrendingUp,
    benefits: [
      'Tableaux de bord en temps réel',
      'Objectifs et indicateurs',
      'Rapports personnalisés',
    ],
  },
  {
    title: 'Gestion Stock',
    description: 'Suivez votre matériel et recevez des alertes quand les stocks sont bas.',
    icon: Package,
    benefits: [
      'Inventaire en temps réel',
      'Alertes automatiques',
      'Historique des mouvements',
    ],
  },
  {
    title: 'Analytics Avancés',
    description: 'Analysez vos performances et identifiez les opportunités d\'optimisation.',
    icon: BarChart3,
    benefits: [
      'Tableaux de bord personnalisés',
      'Tendances et prévisions',
      'Rapports détaillés',
    ],
  },
]

const benefits = [
  {
    title: 'Rapide',
    icon: Zap,
    description: 'Interface intuitive qui vous fait gagner du temps au quotidien.',
  },
  {
    title: 'Sécurisé',
    icon: Shield,
    description: 'Vos données sont protégées avec les dernières technologies de sécurité.',
  },
  {
    title: 'Moderne',
    icon: BarChart3,
    description: 'Des outils modernes et performants pour gérer votre activité efficacement.',
  },
]
