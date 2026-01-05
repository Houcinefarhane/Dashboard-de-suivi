'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  data: object
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = 'structured-data'
    
    // Supprimer l'ancien script s'il existe
    const existingScript = document.getElementById('structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    document.head.appendChild(script)
    
    return () => {
      const scriptToRemove = document.getElementById('structured-data')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data])
  
  return null
}

