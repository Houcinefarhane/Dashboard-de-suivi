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
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Phone,
  Mail
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useState } from 'react'
import Image from 'next/image'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="md" showText={false} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(150, 185, 220)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(150, 185, 220)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                Avantages
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(150, 185, 220)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(150, 185, 220)'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                FAQ
              </button>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Se connecter
                </Button>
              </Link>
              <a
                href="mailto:houcine.farhane@outlook.fr?subject=Demande d'information - Gestion Pro"
                className="text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
              >
                Nous contacter
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-3"
            >
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Avantages
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                FAQ
              </button>
              <div className="px-4 pt-2 space-y-2 border-t border-gray-200 mt-2">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">
                    Se connecter
                  </Button>
                </Link>
                <a
                  href="mailto:houcine.farhane@outlook.fr?subject=Demande d'information - Gestion Pro"
                  className="block w-full text-white text-center px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                >
                  Nous contacter
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16">
        {/* Background gradient - seulement bleu pastel */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(150, 185, 220, 0.1), white, rgba(150, 185, 220, 0.1))' }} />
        
        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left lg:col-span-2"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
                className="inline-block mb-4"
              >
                <Logo size="lg" showText={false} className="mx-auto lg:mx-0" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-gray-900"
              >
                Gérez votre activité
                <span className="block mt-1" style={{ color: 'rgb(150, 185, 220)' }}>
                  en toute simplicité
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                La solution moderne pour organiser vos clients, planifier vos rendez-vous, 
                gérer vos finances et suivre votre activité en temps réel.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-lg px-8 py-6 h-14 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
                >
                  Voir les tarifs
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
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
              className="relative hidden lg:block lg:col-span-3"
            >
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl bg-white">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="w-full h-full relative rounded-lg overflow-hidden"
                >
                  <Image
                    src="/dashboard-screenshot.png"
                    alt="Aperçu du tableau de bord"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1024px) 0vw, 60vw"
                  />
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
      <section id="features" className="py-12 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Des outils puissants et intuitifs pour gérer votre activité au quotidien
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    relative h-full p-4 rounded-xl border-2 transition-all duration-500
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
                      w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500
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
                    <feature.icon className="w-5 h-5" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors"
                      style={hoveredFeature === index ? { color: 'rgb(150, 185, 220)' } : {}}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3 text-sm">
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
      <section id="benefits" className="py-12 scroll-mt-16" style={{ background: 'linear-gradient(to bottom right, rgba(150, 185, 220, 0.1), white)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pourquoi nous choisir ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>
                    <benefit.icon className="w-6 h-6 text-white" />
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

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Option 1: Paiement unique */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="h-full p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Paiement unique
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold" style={{ color: 'rgb(150, 185, 220)' }}>
                      900€
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Accès à vie, sans engagement
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Toutes les fonctionnalités incluses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Mises à jour automatiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Support technique inclus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Accès complet à toutes les fonctionnalités</span>
                  </li>
                </ul>
                <a
                  href="mailto:houcine.farhane@outlook.fr?subject=Demande d'information - Gestion Pro - Paiement unique"
                  className="block w-full h-12 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
                >
                  Nous contacter
                </a>
              </div>
            </motion.div>

            {/* Option 2: Abonnement mensuel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-xs font-semibold text-white shadow-lg" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>
                  Le plus populaire
                </span>
              </div>
              <div className="h-full p-6 rounded-2xl border-2 shadow-xl transition-all duration-300" style={{ borderColor: 'rgb(150, 185, 220)', backgroundColor: 'rgba(150, 185, 220, 0.05)' }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Abonnement mensuel
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold" style={{ color: 'rgb(150, 185, 220)' }}>
                      120€
                    </span>
                    <span className="text-gray-600 text-lg ml-2">/mois</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Résiliable à tout moment
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Toutes les fonctionnalités incluses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Mises à jour automatiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Support technique inclus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Accès complet à toutes les fonctionnalités</span>
                  </li>
                </ul>
                <a
                  href="mailto:houcine.farhane@outlook.fr?subject=Demande d'information - Gestion Pro - Paiement unique"
                  className="block w-full h-12 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
                >
                  Nous contacter
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 text-sm">
              Les deux formules incluent toutes les fonctionnalités. Aucun frais caché.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à simplifier votre gestion ?
            </h2>
            <p className="text-lg mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Rejoignez dès aujourd'hui et découvrez comment gagner du temps sur vos tâches administratives.
            </p>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-lg px-8 py-6 h-14 bg-white hover:bg-gray-100 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-lg inline-flex items-center"
              style={{ color: 'rgb(150, 185, 220)' }}
            >
              Voir les tarifs
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'rgb(150, 185, 220)' }}>
              Questions fréquentes
            </h2>
            <p className="text-lg text-gray-600">
              Tout ce que vous devez savoir sur notre solution
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    style={{ color: 'rgb(150, 185, 220)' }}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === index ? 'auto' : 0,
                    opacity: openFaq === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Une question ? Besoin d'un devis personnalisé ? N'hésitez pas à nous contacter.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="tel:0785691300"
                className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
                  <Phone className="w-6 h-6" style={{ color: 'rgb(150, 185, 220)' }} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <p className="text-lg font-semibold text-gray-900">07 85 69 13 00</p>
                </div>
              </a>
              <a
                href="mailto:houcine.farhane@outlook.fr?subject=Demande d'information - Gestion Pro"
                className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
                  <Mail className="w-6 h-6" style={{ color: 'rgb(150, 185, 220)' }} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">houcine.farhane@outlook.fr</p>
                </div>
              </a>
            </div>
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
      'Fiche client complète',
      'Recherche rapide et intuitive',
      'Export des données en CSV',
    ],
  },
  {
    title: 'Planning Intelligent',
    description: 'Organisez vos rendez-vous avec un calendrier interactif et des rappels automatiques.',
    icon: Calendar,
    benefits: [
      'Vue jour, semaine, mois',
      'Rappels automatiques des interventions',
      'Photos avant/après',
    ],
  },
  {
    title: 'Devis & Factures',
    description: 'Créez des documents professionnels en quelques clics, exportables en PDF.',
    icon: FileText,
    benefits: [
      'Personnalisation complète (logo, couleurs, champs)',
      'Export PDF automatique',
      'Suivi des statuts et paiements',
    ],
  },
  {
    title: 'Suivi Financier',
    description: 'Visualisez vos revenus, dépenses et bénéfices avec des graphiques détaillés.',
    icon: TrendingUp,
    benefits: [
      'Tableaux de bord en temps réel',
      'Objectifs financiers',
      'Graphiques et statistiques',
    ],
  },
  {
    title: 'Gestion Stock',
    description: 'Suivez votre matériel et recevez des alertes quand les stocks sont bas.',
    icon: Package,
    benefits: [
      'Inventaire en temps réel',
      'Alertes stock faible',
      'Gestion par catégories',
    ],
  },
  {
    title: 'Analytics & Rapports',
    description: 'Analysez vos performances avec des graphiques et statistiques.',
    icon: BarChart3,
    benefits: [
      'Tableaux de bord personnalisés',
      'Graphiques de tendances',
      'Export des données',
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

const faqData = [
  {
    question: 'Comment créer mon compte ?',
    answer: 'La création de compte est simple. Cliquez sur "Créer mon compte" et remplissez le formulaire avec vos informations. Vous pourrez choisir votre formule (paiement unique 900€ ou abonnement 120€/mois) et commencer à utiliser la plateforme immédiatement.',
  },
  {
    question: 'Quels sont les tarifs ?',
    answer: 'Nous proposons deux formules : un paiement unique de 900€ pour un accès à vie, ou un abonnement mensuel de 120€/mois résiliable à tout moment. Les deux formules incluent toutes les fonctionnalités, les mises à jour et le support technique.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Nous utilisons les dernières technologies de sécurité, incluant le chiffrement des données, des sauvegardes régulières et une authentification sécurisée. Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers.',
  },
  {
    question: 'Puis-je exporter mes données ?',
    answer: 'Oui, vous pouvez exporter vos données en CSV (factures, devis, clients, dépenses, interventions) et en PDF (factures et devis). Les exports sont disponibles directement depuis chaque module.',
  },
  {
    question: 'Y a-t-il une application mobile ?',
    answer: 'Notre solution est entièrement responsive et fonctionne parfaitement sur tous les appareils mobiles (smartphones, tablettes) via votre navigateur web. Pas besoin d\'installer une application.',
  },
  {
    question: 'Puis-je personnaliser les documents (factures, devis) ?',
    answer: 'Oui, vous pouvez personnaliser vos documents avec votre logo, vos couleurs, vos textes personnalisés, vos informations légales (SIREN, SIRET, RCS, KBIS, TVA, Capital) et ajouter des champs personnalisés. Tout est configurable dans le module Personnalisation.',
  },
  {
    question: 'Comment fonctionne le support client ?',
    answer: 'Vous pouvez nous contacter par email (houcine.farhane@outlook.fr) ou par téléphone (07 85 69 13 00) pour toute question ou assistance. Nous répondons dans les meilleurs délais.',
  },
  {
    question: 'Puis-je migrer mes données depuis un autre système ?',
    answer: 'Pour l\'instant, l\'import de données n\'est pas disponible directement dans l\'interface. Contactez-nous si vous avez besoin d\'aide pour migrer vos données, nous pouvons vous assister dans ce processus.',
  },
]
