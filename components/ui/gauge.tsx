'use client'

import { motion } from 'framer-motion'

interface GaugeProps {
  value: number // 0-100 (peut être négatif pour les bénéfices négatifs)
  title?: string
  subtitle?: string
  size?: number
}

export function Gauge({ value, title, subtitle, size = 200 }: GaugeProps) {
  // Limiter la valeur entre 0 et 100 (0 si négatif)
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  // Déterminer la couleur en fonction du pourcentage
  const getColor = (val: number) => {
    if (val < 33) return '#ef4444' // Rouge
    if (val < 66) return '#f97316' // Orange
    return '#10b981' // Vert
  }
  
  const color = getColor(clampedValue)
  
  // Paramètres de l'arc
  const centerX = size / 2
  const centerY = size * 0.55
  const radius = size * 0.35
  const strokeWidth = size * 0.08
  
  // Arc complet de 180° (de -90° à 90°, soit de gauche à droite)
  const startAngle = -90 // Début à gauche
  const endAngle = 90 // Fin à droite
  const totalAngle = 180
  
  // Calcul de l'arc de fond (gris)
  const backgroundArc = describeArc(centerX, centerY, radius, startAngle, endAngle)
  
  // Calcul de l'arc de progression (coloré)
  const progressAngle = startAngle + (clampedValue / 100) * totalAngle
  const progressArc = describeArc(centerX, centerY, radius, startAngle, progressAngle)
  
  // Calcul de la position de l'aiguille
  const needleLength = radius - strokeWidth
  const needleAngleRad = (startAngle + (clampedValue / 100) * totalAngle) * (Math.PI / 180)
  const needleX = centerX + needleLength * Math.cos(needleAngleRad)
  const needleY = centerY + needleLength * Math.sin(needleAngleRad)
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        <defs>
          {/* Gradient pour l'arc de progression */}
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#f97316" />
            <stop offset="66%" stopColor="#f97316" />
            <stop offset="66%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Arc de fond (gris) */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Arc de progression (avec gradient) */}
        <motion.path
          d={progressArc}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Marqueurs et labels */}
        {[0, 25, 50, 75, 100].map((mark) => {
          const markAngleRad = (startAngle + (mark / 100) * totalAngle) * (Math.PI / 180)
          const markRadius = radius + strokeWidth * 0.5
          const labelRadius = radius + strokeWidth * 1.2
          
          const x1 = centerX + radius * Math.cos(markAngleRad)
          const y1 = centerY + radius * Math.sin(markAngleRad)
          const x2 = centerX + markRadius * Math.cos(markAngleRad)
          const y2 = centerY + markRadius * Math.sin(markAngleRad)
          const labelX = centerX + labelRadius * Math.cos(markAngleRad)
          const labelY = centerY + labelRadius * Math.sin(markAngleRad)
          
          return (
            <g key={mark}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth={size * 0.008}
                strokeLinecap="round"
              />
              <text
                x={labelX}
                y={labelY + size * 0.015}
                textAnchor="middle"
                fontSize={size * 0.06}
                fill="#6b7280"
                fontWeight="600"
              >
                {mark}
              </text>
            </g>
          )
        })}
        
        {/* Aiguille */}
        <motion.line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth={size * 0.012}
          strokeLinecap="round"
          initial={{ 
            x2: centerX + needleLength * Math.cos(startAngle * Math.PI / 180),
            y2: centerY + needleLength * Math.sin(startAngle * Math.PI / 180)
          }}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
        
        {/* Point central de l'aiguille */}
        <circle
          cx={centerX}
          cy={centerY}
          r={size * 0.035}
          fill={color}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={size * 0.02}
          fill="#ffffff"
        />
      </svg>
      
      {/* Valeur centrale */}
      <motion.div
        className="text-center -mt-6"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="text-5xl font-bold" style={{ color }}>
          {Math.round(clampedValue)}%
        </div>
        {title && (
          <div className="text-sm font-semibold text-muted-foreground mt-2">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Fonction helper pour créer un arc SVG
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ")
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

