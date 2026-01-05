import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Utiliser www.billiev.com pour la cohérence avec Google Search Console
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.billiev.com'
  
  const blogArticles = [
    'comment-facturer-plus-rapidement-artisan',
    'meilleur-outil-gratuit-gestion-artisan-2026',
    'comment-organiser-planning-interventions',
    'gerer-stock-materiaux-artisan',
    'logiciel-plombier-serrurier-electricien',
  ]
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/statistiques-artisans`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogArticles.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}

