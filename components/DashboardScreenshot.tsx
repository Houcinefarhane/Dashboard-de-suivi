'use client'

import { Users, Calendar, FileText, TrendingUp, Bell, Moon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

export function DashboardScreenshot() {
  return (
    <div 
      className="w-full h-full bg-[#F5F5F5] flex"
      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', minHeight: '100%' }}
    >
      {/* Sidebar */}
      <div className="w-48 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-900">ArtisanPro</h2>
          <p className="text-[10px] text-gray-500">Gestion professionnelle</p>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)', color: 'rgb(150, 185, 220)' }}>
            <Calendar className="w-3 h-3" />
            Tableau de bord
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <Users className="w-3 h-3" />
            Clients
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <Calendar className="w-3 h-3" />
            Planning
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <TrendingUp className="w-3 h-3" />
            Géolocalisation
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <FileText className="w-3 h-3" />
            Devis
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <FileText className="w-3 h-3" />
            Factures
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <TrendingUp className="w-3 h-3" />
            Dépenses
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <TrendingUp className="w-3 h-3" />
            Finances
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <FileText className="w-3 h-3" />
            Stock
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50 relative">
            <Bell className="w-3 h-3" />
            Notifications
            <span className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">8</span>
          </div>
        </nav>
        <div className="p-2 border-t border-gray-200 space-y-1">
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <Moon className="w-3 h-3" />
            Thème
          </div>
          <div className="px-2 py-1.5 rounded-lg text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <LogOut className="w-3 h-3" />
            Déconnexion
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#F5F5F5]">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-xs text-gray-500">Vue d'ensemble de votre activité</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">Facture</button>
              <button className="px-3 py-1.5 text-xs rounded-lg text-white" style={{ backgroundColor: 'rgb(150, 185, 220)' }}>Intervention</button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
                  <Users className="w-4 h-4" style={{ color: 'rgb(150, 185, 220)' }} />
                </div>
                <span className="text-[10px] text-green-600 flex items-center gap-1">
                  ↗ +12%
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-0.5">50</div>
              <div className="text-[10px] text-gray-500">Clients actifs</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                  <Calendar className="w-4 h-4 text-gray-700" />
                </div>
                <span className="text-[10px] text-green-600 flex items-center gap-1">
                  ↗ +5
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-0.5">0</div>
              <div className="text-[10px] text-gray-500">À venir cette semaine</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-[10px] text-red-600 flex items-center gap-1">
                  ↘ -11%
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-0.5">2 540,43 €</div>
              <div className="text-[10px] text-gray-500">Ce mois-ci</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100">
                  <FileText className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-[10px] text-green-600 flex items-center gap-1">
                  ↗ 11 en attente
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-0.5">11</div>
              <div className="text-[10px] text-gray-500">En attente de paiement</div>
            </div>
          </div>

          {/* Calendar Heatmap */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Carte d'activité mensuelle</h3>
              <div className="flex items-center gap-2">
                <button className="p-0.5 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-3 h-3 text-gray-600" />
                </button>
                <span className="text-xs font-medium text-gray-700">décembre 2025</span>
                <button className="p-0.5 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-3">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-[10px] text-gray-500 text-center py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i + 1
                const activity = day === 1 ? 2 : day === 9 ? 3 : day === 16 ? 1 : day === 31 ? 0 : Math.floor(Math.random() * 2)
                const intensity = activity === 0 ? 0 : activity === 1 ? 0.3 : activity === 2 ? 0.6 : 0.9
                return (
                  <div
                    key={i}
                    className={`h-6 rounded text-[10px] flex items-center justify-center border ${
                      day === 31 ? 'border-2' : 'border-transparent'
                    }`}
                    style={{
                      backgroundColor: intensity > 0 ? `rgba(34, 197, 94, ${intensity})` : '#F5F5F5',
                      borderColor: day === 31 ? 'rgb(150, 185, 220)' : 'transparent',
                      color: intensity > 0.5 ? 'white' : 'gray'
                    }}
                  >
                    {day <= 31 ? day : ''}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-500">
              <span>Moins</span>
              <div className="flex gap-0.5">
                {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                  <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: `rgba(34, 197, 94, ${opacity})` }} />
                ))}
              </div>
              <span>Plus</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Operations */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Opérations en cours</h3>
                  <p className="text-[10px] text-gray-500">Vue d'ensemble</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500 text-sm">⚠</span>
                  <h4 className="text-xs font-semibold text-gray-900">Factures en retard (11)</h4>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-xs font-medium text-gray-900">#FAC-0004</div>
                    <div className="text-[10px] text-gray-600">Christophe Mercier 49</div>
                    <div className="text-[10px] font-semibold text-gray-900 mt-0.5">492,92 €</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-xs font-medium text-gray-900">#FAC-0006</div>
                    <div className="text-[10px] text-gray-600">Céline Girard 21</div>
                    <div className="text-[10px] font-semibold text-gray-900 mt-0.5">1355,26 €</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Revenue Chart */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Revenus</h3>
                  <p className="text-[10px] text-gray-500">Évolution sur 6 derniers mois</p>
                </div>
              </div>
              <div className="h-32 flex items-end justify-between gap-1.5">
                {[40, 60, 80, 70, 50, 45].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${height}%`,
                        backgroundColor: 'rgb(150, 185, 220)',
                        background: `linear-gradient(to top, rgb(150, 185, 220), rgba(150, 185, 220, 0.3))`
                      }}
                    />
                    <div className="text-[10px] text-gray-500 mt-1">{i + 1}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500">
                <span>1700</span>
                <span>2550</span>
                <span>3400</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
