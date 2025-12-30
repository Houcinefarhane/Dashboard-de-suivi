'use client'

import { motion } from 'framer-motion'

interface GaugeProps {
  value: number // 0-100
  title?: string
  subtitle?: string
  size?: number
}

export function Gauge({ value, title, subtitle, size = 250 }: GaugeProps) {
  // Limiter la valeur entre 0 et 100
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  const centerX = size / 2
  const centerY = size * 0.65
  const radius = size * 0.38
  const strokeWidth = size * 0.12
  
  // Configuration des segments colorés
  const segments = [
    { start: 0, end: 20, color: '#dc2626' },      // Rouge foncé
    { start: 20, end: 35, color: '#ea580c' },     // Orange-rouge
    { start: 35, end: 50, color: '#f59e0b' },     // Orange
    { start: 50, end: 65, color: '#eab308' },     // Jaune
    { start: 65, end: 80, color: '#84cc16' },     // Vert clair
    { start: 80, end: 100, color: '#22c55e' },    // Vert
  ]
  
  // Fonction pour créer un segment d'arc
  const createSegmentPath = (startPercent: number, endPercent: number) => {
    const startAngle = -180 + (startPercent / 100) * 180
    const endAngle = -180 + (endPercent / 100) * 180
    
    const start = polarToCartesian(centerX, centerY, radius, startAngle)
    const end = polarToCartesian(centerX, centerY, radius, endAngle)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }
  
  // Calculer l'angle de l'aiguille
  const needleAngle = -180 + (clampedValue / 100) * 180
  const needleLength = radius - strokeWidth * 0.3
  const needleEnd = polarToCartesian(centerX, centerY, needleLength, needleAngle)
  
  // Créer le chemin de l'aiguille (forme de flèche)
  const needleWidth = size * 0.03
  const needleBase1 = polarToCartesian(centerX, centerY, needleWidth, needleAngle - 90)
  const needleBase2 = polarToCartesian(centerX, centerY, needleWidth, needleAngle + 90)
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
        {/* Segments colorés */}
        {segments.map((segment, index) => (
          <motion.path
            key={index}
            d={createSegmentPath(segment.start, segment.end)}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          />
        ))}
        
        {/* Petits traits de marquage */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((mark) => {
          const angle = -180 + (mark / 100) * 180
          const innerRadius = radius - strokeWidth / 2 - size * 0.02
          const outerRadius = radius - strokeWidth / 2 + size * 0.02
          const inner = polarToCartesian(centerX, centerY, innerRadius, angle)
          const outer = polarToCartesian(centerX, centerY, outerRadius, angle)
          
          return (
            <line
              key={mark}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#ffffff"
              strokeWidth={size * 0.006}
              strokeLinecap="round"
            />
          )
        })}
        
        {/* Labels 0 et 100 */}
        <text
          x={size * 0.12}
          y={centerY + size * 0.02}
          fontSize={size * 0.08}
          fontWeight="bold"
          fill="#374151"
          textAnchor="middle"
        >
          0
        </text>
        <text
          x={size * 0.88}
          y={centerY + size * 0.02}
          fontSize={size * 0.08}
          fontWeight="bold"
          fill="#374151"
          textAnchor="middle"
        >
          100
        </text>
        
        {/* Aiguille */}
        <motion.path
          d={`M ${needleBase1.x} ${needleBase1.y} L ${needleEnd.x} ${needleEnd.y} L ${needleBase2.x} ${needleBase2.y} Z`}
          fill="#1f2937"
          initial={{ 
            d: `M ${polarToCartesian(centerX, centerY, needleWidth, -180 - 90).x} ${polarToCartesian(centerX, centerY, needleWidth, -180 - 90).y} L ${polarToCartesian(centerX, centerY, needleLength, -180).x} ${polarToCartesian(centerX, centerY, needleLength, -180).y} L ${polarToCartesian(centerX, centerY, needleWidth, -180 + 90).x} ${polarToCartesian(centerX, centerY, needleWidth, -180 + 90).y} Z`
          }}
          animate={{ 
            d: `M ${needleBase1.x} ${needleBase1.y} L ${needleEnd.x} ${needleEnd.y} L ${needleBase2.x} ${needleBase2.y} Z`
          }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
        />
        
        {/* Centre de l'aiguille */}
        <circle
          cx={centerX}
          cy={centerY}
          r={size * 0.04}
          fill="#1f2937"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={size * 0.025}
          fill="#ffffff"
        />
      </svg>
      
      {/* Valeur et texte */}
      <motion.div
        className="text-center -mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="text-5xl font-bold text-gray-800">
          {Math.round(clampedValue)}%
        </div>
        {title && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                title === 'Revenus' ? 'bg-green-600' : title === 'Bénéfice' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              {title}
            </span>
          </div>
        )}
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-2 font-medium">
            {subtitle}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

