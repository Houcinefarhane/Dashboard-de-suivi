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
  Mail,
  MessageCircle
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { StructuredData } from '@/components/StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://billiev.com'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDemoPopup, setShowDemoPopup] = useState(false)
  // Plus besoin du toggle, seulement mensuel

  // Afficher le popup après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Vérifier si l'utilisateur n'a pas déjà fermé le popup (localStorage)
      const hasClosedPopup = localStorage.getItem('billiev-demo-popup-closed')
      if (!hasClosedPopup) {
        setShowDemoPopup(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileMenuOpen(false)
    }
  }

  const handleClosePopup = () => {
    setShowDemoPopup(false)
    localStorage.setItem('billiev-demo-popup-closed', 'true')
  }

  const handleContactDemo = () => {
    scrollToSection('contact')
    setShowDemoPopup(false)
  }

  // Données structurées JSON-LD optimisées pour SEO + GEO (définies après faqData)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Billiev',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'ERP complet pour artisans : gestion clients, planning, factures, stock et finances dans une seule interface moderne. Économisez 10-15 heures par semaine.',
        url: baseUrl,
        screenshot: `${baseUrl}/Attached_image.png`,
        offers: {
          '@type': 'Offer',
          price: '49',
          priceCurrency: 'EUR',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '49',
            priceCurrency: 'EUR',
            billingDuration: 'P1M',
          },
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/auth/register`,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          ratingCount: '2',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: [
          'Gestion clients',
          'Planning interventions',
          'Facturation',
          'Devis',
          'Gestion stock',
          'Suivi financier',
          'Géolocalisation',
          'Photos avant/après',
        ],
        applicationSubCategory: 'ERP Artisan',
        softwareVersion: '1.0',
        releaseNotes: 'Solution complète pour artisans avec toutes les fonctionnalités nécessaires.',
      },
      {
        '@type': 'Organization',
        name: 'Billiev',
        url: baseUrl,
        logo: `${baseUrl}/logo-billieve.png`,
        sameAs: [
          baseUrl,
          `${baseUrl}/blog`,
          `${baseUrl}/statistiques-artisans`,
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+33-7-85-69-13-00',
          contactType: 'customer service',
          email: 'houcine.farhane@outlook.fr',
          availableLanguage: ['French'],
          areaServed: 'FR',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqData.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}#webpage`,
        url: baseUrl,
        name: 'Billiev - ERP Complet pour Artisans',
        description: 'L\'ERP complet qui remplace 5 outils pour gérer votre entreprise artisanale. Clients, Planning, Factures, Stock, Finances. Essai gratuit 14 jours.',
        inLanguage: 'fr-FR',
        isPartOf: {
          '@id': `${baseUrl}#website`,
        },
        about: {
          '@id': `${baseUrl}#software`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        url: baseUrl,
        name: 'Billiev',
        description: 'ERP complet pour artisans',
        publisher: {
          '@id': `${baseUrl}#organization`,
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={structuredData} />
      
      {/* Demo Popup */}
      {showDemoPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClosePopup}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-2"
            style={{ borderColor: 'rgb(150, 185, 220)' }}
          >
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
                <MessageCircle className="w-8 h-8" style={{ color: 'rgb(150, 185, 220)' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Vous êtes artisan ?
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Je peux vous montrer Billiev en 15 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContactDemo}
                className="flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
              >
                Réserver une démo
              </button>
              <a
                href="tel:0785691300"
                className="flex-1 px-6 py-3 rounded-lg font-medium border-2 transition-all duration-300 hover:shadow-lg text-center flex items-center justify-center"
                style={{ 
                  borderColor: 'rgb(150, 185, 220)',
                  color: 'rgb(150, 185, 220)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(150, 185, 220, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                07 85 69 13 00
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Logo size="md" showText={false} />
              <span className="hidden sm:block text-sm font-medium text-gray-600 tracking-wider">
                BILLIEV IN YOUR BUSINESS
              </span>
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
              <button
                onClick={() => scrollToSection('contact')}
                className="text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
              >
                Nous contacter
              </button>
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
                <button
                  onClick={() => {
                    scrollToSection('contact')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-white text-center px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                >
                  Nous contacter
                </button>
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
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-gray-900">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Arrêtez de perdre du temps sur l'administratif
                </motion.span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-gray-600 mb-2 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Devis, planning, factures et suivi financier réunis dans un seul outil simple pour artisans.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="flex flex-wrap items-center gap-3 mb-4 max-w-xl mx-auto lg:mx-0"
              >
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">Clients</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">Planning</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">Facturation</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">Gestion</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">Finances</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border-2 border-green-200 max-w-xl mx-auto lg:mx-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-base font-semibold text-green-700">
                    Essai gratuit de 14 jours - Sans engagement
                  </span>
                </div>
              </motion.div>
              
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
                    src="/Attached_image.png"
                    alt="Aperçu du tableau de bord Billiev - ERP complet pour artisans avec gestion clients, planning, factures, stock et finances"
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
              Tout ce dont vous avez besoin pour gérer votre activité
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Version orientée artisan : des solutions concrètes à vos problèmes quotidiens
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

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez comment Billiev transforme leur quotidien
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Testimonial 1 - Jordan Lopes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "Billiev a complètement transformé ma façon de travailler. Avant, je perdais des heures chaque semaine à jongler entre plusieurs outils. Maintenant, tout est centralisé dans une seule interface moderne et intuitive. La gestion des factures et du planning est devenue un jeu d'enfant ! J'ai économisé 12 heures par semaine."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  JL
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Jordan Lopes</p>
                  <p className="text-sm text-gray-600">Plombier, Paris • 3 ans d'expérience</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Utilisateur actif depuis 2 mois
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Testé pendant la bêta
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "En tant qu'artisan indépendant, j'avais besoin d'un outil simple mais complet. Billiev répond parfaitement à mes besoins : gestion des clients, planning des interventions, facturation et suivi financier. L'interface est moderne et je n'ai eu besoin d'aucune formation pour m'y retrouver. Un vrai gain de temps ! J'ai réduit mes factures en retard de 40%."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                  MD
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Marie Dubois</p>
                  <p className="text-sm text-gray-600">Électricienne, Lyon • 5 ans d'expérience</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-medium text-green-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Utilisateur actif depuis 1 mois
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Testé pendant la bêta
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-4">
              Choisissez la formule qui correspond à vos besoins
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-green-50 border-2 border-green-200 mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-base font-semibold text-green-700">
                Essai gratuit de 14 jours - Sans engagement, sans carte bancaire
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="p-8 rounded-2xl border-2 shadow-xl transition-all duration-300" style={{ 
                borderColor: 'rgb(150, 185, 220)',
                backgroundColor: 'rgba(150, 185, 220, 0.05)'
              }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Abonnement mensuel
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold" style={{ color: 'rgb(150, 185, 220)' }}>
                      49€
                    </span>
                    <span className="text-gray-600 text-lg ml-2">HT /mois</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Résiliable à tout moment
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-700">14 jours d'essai gratuit</span>
                  </div>
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
                    <span className="text-gray-700 text-sm">Support technique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(150, 185, 220)' }} />
                    <span className="text-gray-700 text-sm">Accès complet à toutes les fonctionnalités</span>
                  </li>
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full h-12 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(150, 185, 220)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(130, 165, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(150, 185, 220)'}
                >
                  Commencer l'essai gratuit
                </Link>
              </div>
            </motion.div>
          </motion.div>

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

      {/* Footer avec liens discrets */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Billiev</h3>
              <p className="text-sm text-gray-600">
                L'ERP complet pour gérer votre entreprise artisanale en toute simplicité.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ressources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/statistiques-artisans" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Statistiques
                  </Link>
                </li>
                <li>
                  <Link href="/alternatives" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Comparatif
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="tel:+33785691300" className="hover:text-gray-900 transition-colors">
                    📞 07 85 69 13 00
                  </a>
                </li>
                <li>
                  <a href="mailto:houcine.farhane@outlook.fr" className="hover:text-gray-900 transition-colors">
                    ✉️ houcine.farhane@outlook.fr
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            <p>© 2026 Billiev. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-gray-50 scroll-mt-16">
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
                href="mailto:houcine.farhane@outlook.fr?subject=Demande d'information - Billiev"
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
    title: 'Clients',
    description: 'Fini les infos clients éparpillées',
    icon: Users,
    benefits: [
      'Toutes les infos clients centralisées',
      'Recherche rapide et intuitive',
      'Export des données en CSV',
    ],
  },
  {
    title: 'Planning',
    description: 'Plus aucun rendez-vous oublié',
    icon: Calendar,
    benefits: [
      'Vue jour, semaine, mois',
      'Rappels automatiques des interventions',
      'Photos avant/après',
    ],
  },
  {
    title: 'Devis & Factures',
    description: 'Devis envoyés, factures encaissées plus vite',
    icon: FileText,
    benefits: [
      'Personnalisation complète (logo, couleurs, champs)',
      'Export PDF automatique',
      'Suivi des statuts et paiements',
    ],
  },
  {
    title: 'Finances',
    description: 'Savoir ce que vous gagnez vraiment',
    icon: TrendingUp,
    benefits: [
      'Tableaux de bord en temps réel',
      'Objectifs financiers',
      'Graphiques et statistiques',
    ],
  },
  {
    title: 'Stock',
    description: 'Ne plus manquer de matériel sur un chantier',
    icon: Package,
    benefits: [
      'Inventaire en temps réel',
      'Alertes stock faible',
      'Gestion par catégories',
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
    answer: 'Pour créer un compte, contactez-nous par email (houcine.farhane@outlook.fr) ou par téléphone (07 85 69 13 00) pour obtenir un code d\'invitation. Une fois le code obtenu, vous pourrez créer votre compte et accéder à l\'abonnement mensuel de 49€ HT/mois.',
  },
  {
    question: 'Quels sont les tarifs ?',
    answer: 'Nous proposons un abonnement mensuel de 49€ HT/mois, résiliable à tout moment. L\'abonnement inclut toutes les fonctionnalités, les mises à jour automatiques et le support technique.',
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
    question: 'Puis-je personnaliser les documents (factures, devis) ?',
    answer: 'Oui, vous pouvez personnaliser vos documents avec votre logo, vos couleurs, vos textes personnalisés, vos informations légales (SIREN, SIRET, RCS, KBIS, TVA, Capital) et ajouter des champs personnalisés. Tout est configurable dans le module Personnalisation.',
  },
  {
    question: 'Comment fonctionne le support client ?',
    answer: 'Vous pouvez nous contacter par email (houcine.farhane@outlook.fr) ou par téléphone (07 85 69 13 00) pour toute question ou assistance. Nous répondons dans les meilleurs délais.',
  },
]
