import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Utiliser www.billiev.com pour la cohérence avec Google Search Console
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.billiev.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}

