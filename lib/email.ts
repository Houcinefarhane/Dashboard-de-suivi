import { Resend } from 'resend'

// Initialiser Resend avec vérification de la clé API
const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) {
  console.warn('RESEND_API_KEY n\'est pas définie dans les variables d\'environnement')
  console.warn('Les emails de vérification ne seront pas envoyés')
} else {
  console.log('RESEND_API_KEY chargée')
}

let resend: Resend | null = null
try {
  if (resendApiKey) {
    resend = new Resend(resendApiKey)
    console.log('Resend initialisé avec succès')
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Resend:', error)
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  if (!resend) {
    console.error('Resend n\'est pas initialisé. Vérifiez RESEND_API_KEY dans .env')
    return { success: false, error: 'Service d\'email non configuré' }
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  try {
    console.log('Tentative d\'envoi d\'email à:', email)
    console.log('Depuis:', fromEmail)
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Vérifiez votre adresse email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vérification de votre email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue ${name} !</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Merci de vous être inscrit sur Dashboard Artisan. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Vérifier mon email
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
                ${verificationUrl}
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Ce lien expirera dans 24 heures.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) {
      console.error(' Erreur Resend:', result.error)
      
      // Si c'est une erreur de domaine non vérifié, donner un message plus clair
      if (result.error.statusCode === 403 && result.error.message?.includes('verify a domain')) {
        console.error(' Domaine non vérifié dans Resend')
        console.error('Solution: Vérifiez un domaine dans Resend ou utilisez votre email de compte pour les tests')
        return { 
          success: false, 
          error: 'Domaine email non vérifié. En mode test, Resend ne permet d\'envoyer qu\'à votre adresse email de compte. Vérifiez un domaine dans Resend pour envoyer à d\'autres adresses.' 
        }
      }
      
      return { success: false, error: result.error.message || 'Erreur lors de l\'envoi' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erreur envoi email:', error)
    console.error('Email error details:', {
      message: error?.message,
      name: error?.name,
      response: error?.response,
    })
    // Ne pas lancer l'erreur, retourner un objet avec success: false
    return { success: false, error: error?.message || 'Erreur lors de l\'envoi de l\'email' }
  }
}

