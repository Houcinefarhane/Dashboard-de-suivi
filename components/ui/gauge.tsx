'use client'

import { motion } from 'framer-motion'

interface GaugeProps {
  value: number // 0-100
  title?: string
  subtitle?: string
  size?: number
}

export function Gauge({ value, title, subtitle, size = 200 }: GaugeProps) {
  // Limiter la valeur entre 0 et 100
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  // Calculer l'angle (0° = gauche, 180° = droite)
  const angle = (clampedValue / 100) * 180
  
  // Déterminer la couleur en fonction du pourcentage
  const getColor = (val: number) => {
    if (val < 33) return '#ef4444' // Rouge
    if (val < 66) return '#f97316' // Orange
    return '#10b981' // Vert
  }
  
  const color = getColor(clampedValue)
  
  // Calculer les coordonnées de l'aiguille
  const needleLength = size * 0.35
  const centerX = size / 2
  const centerY = size / 2
  const needleAngle = (angle - 90) * (Math.PI / 180) // Convertir en radians, -90 pour partir de gauche
  const needleX = centerX + needleLength * Math.cos(needleAngle)
  const needleY = centerY + needleLength * Math.sin(needleAngle)
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Fond du gauge (arc) */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Arc de fond (gris) */}
        <path
          d={`M ${size * 0.1} ${centerY} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${centerY}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
        />
        
        {/* Arc de progression (coloré) */}
        <motion.path
          d={`M ${size * 0.1} ${centerY} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${centerY}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          strokeDasharray={`${(clampedValue / 100) * (Math.PI * size * 0.4)} ${Math.PI * size * 0.4}`}
          initial={{ strokeDasharray: `0 ${Math.PI * size * 0.4}` }}
          animate={{ strokeDasharray: `${(clampedValue / 100) * (Math.PI * size * 0.4)} ${Math.PI * size * 0.4}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Aiguille */}
        <motion.line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth={size * 0.015}
          strokeLinecap="round"
          initial={{ x2: centerX - needleLength, y2: centerY }}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
        
        {/* Point central */}
        <circle
          cx={centerX}
          cy={centerY}
          r={size * 0.04}
          fill={color}
        />
        
        {/* Marqueurs */}
        {[0, 25, 50, 75, 100].map((mark) => {
          const markAngle = ((mark / 100) * 180 - 90) * (Math.PI / 180)
          const outerRadius = size * 0.4
          const innerRadius = size * 0.34
          const x1 = centerX + outerRadius * Math.cos(markAngle)
          const y1 = centerY + outerRadius * Math.sin(markAngle)
          const x2 = centerX + innerRadius * Math.cos(markAngle)
          const y2 = centerY + innerRadius * Math.sin(markAngle)
          
          return (
            <g key={mark}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth={size * 0.008}
              />
              <text
                x={centerX + (size * 0.46) * Math.cos(markAngle)}
                y={centerY + (size * 0.46) * Math.sin(markAngle) + size * 0.015}
                textAnchor="middle"
                fontSize={size * 0.06}
                fill="#6b7280"
                fontWeight="500"
              >
                {mark}
              </text>
            </g>
          )
        })}
      </svg>
      
      {/* Valeur centrale */}
      <motion.div
        className="text-center -mt-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="text-4xl font-bold" style={{ color }}>
          {Math.round(clampedValue)}%
        </div>
        {title && (
          <div className="text-sm font-medium text-muted-foreground mt-1">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </div>
        )}
      </motion.div>
    </div>
  )
}

