import { prisma } from './prisma'
import { createNotification } from './notifications'

interface ReminderConfig {
  daysAfterDue: number // Jours après l'échéance pour envoyer la relance
  reminderNumber: number // 1, 2, 3 pour l'escalade
  method: 'notification' | 'email' | 'sms'
}

// Configuration des relances (escalade)
const REMINDER_CONFIGS: ReminderConfig[] = [
  { daysAfterDue: 0, reminderNumber: 1, method: 'notification' }, // Le jour de l'échéance
  { daysAfterDue: 7, reminderNumber: 2, method: 'notification' }, // 7 jours après
  { daysAfterDue: 14, reminderNumber: 3, method: 'notification' }, // 14 jours après
]

// Vérifier et créer des relances pour les factures en retard
export async function checkAndCreateInvoiceReminders(artisanId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Récupérer toutes les factures en retard non payées
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      artisanId,
      status: {
        in: ['sent', 'draft', 'overdue'],
      },
      dueDate: {
        not: null,
        lte: today, // Échues ou en retard
      },
    },
    include: {
      client: true,
      reminders: {
        orderBy: { reminderNumber: 'desc' },
        take: 1, // Dernière relance
      },
    },
  })

  const results = {
    remindersCreated: 0,
    remindersSkipped: 0,
  }

  for (const invoice of overdueInvoices) {
    if (!invoice.dueDate) continue

    const daysOverdue = Math.floor(
      (today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Déterminer quelle relance doit être envoyée
    let reminderToSend: ReminderConfig | null = null
    const lastReminder = invoice.reminders[0]

    for (const config of REMINDER_CONFIGS) {
      const shouldSend = daysOverdue >= config.daysAfterDue

      if (shouldSend) {
        // Vérifier si cette relance a déjà été envoyée
        const alreadySent = lastReminder && lastReminder.reminderNumber >= config.reminderNumber

        if (!alreadySent) {
          reminderToSend = config
          break
        }
      }
    }

    if (reminderToSend) {
      // Créer la relance
      const reminderMessage = getReminderMessage(
        invoice.invoiceNumber,
        invoice.client.firstName,
        invoice.client.lastName,
        invoice.total,
        daysOverdue,
        reminderToSend.reminderNumber
      )

      try {
        // Créer l'enregistrement de relance
        const reminder = await prisma.invoiceReminder.create({
          data: {
            invoiceId: invoice.id,
            artisanId: invoice.artisanId,
            reminderNumber: reminderToSend.reminderNumber,
            method: reminderToSend.method,
            status: 'sent',
            message: reminderMessage,
          },
        })

        // Créer une notification pour l'artisan
        await createNotification({
          artisanId,
          type: 'invoice_overdue',
          title: `Relance ${reminderToSend.reminderNumber} - Facture ${invoice.invoiceNumber}`,
          message: reminderMessage,
          clientId: invoice.clientId,
          invoiceId: invoice.id,
          metadata: {
            reminderNumber: reminderToSend.reminderNumber,
            daysOverdue,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.total,
          },
        })

        // Note: L'envoi d'email/SMS au client peut être implémenté ici si nécessaire
        // if (reminderToSend.method === 'email' && invoice.client.email) {
        //   await sendReminderEmail(invoice, reminderToSend.reminderNumber)
        // }
        // if (reminderToSend.method === 'sms' && invoice.client.phone) {
        //   await sendReminderSMS(invoice, reminderToSend.reminderNumber)
        // }

        results.remindersCreated++
      } catch (error) {
        console.error(`Erreur lors de la création de la relance pour la facture ${invoice.invoiceNumber}:`, error)
        results.remindersSkipped++
      }
    } else {
      results.remindersSkipped++
    }
  }

  return results
}

// Générer le message de relance
function getReminderMessage(
  invoiceNumber: string,
  clientFirstName: string,
  clientLastName: string,
  amount: number,
  daysOverdue: number,
  reminderNumber: number
): string {
  const clientName = `${clientFirstName} ${clientLastName}`
  const amountStr = amount.toFixed(2).replace('.', ',')
  
  const messages: Record<number, string> = {
    1: `Rappel: La facture #${invoiceNumber} de ${clientName} (${amountStr} €) est échue depuis ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}.`,
    2: `Relance 2: La facture #${invoiceNumber} de ${clientName} (${amountStr} €) est en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}. Merci de régulariser rapidement.`,
    3: `Relance 3 - URGENT: La facture #${invoiceNumber} de ${clientName} (${amountStr} €) est en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}. Veuillez contacter le client immédiatement.`,
  }

  return messages[reminderNumber] || messages[1]
}

// Récupérer l'historique des relances pour une facture
export async function getInvoiceReminders(invoiceId: string, artisanId: string) {
  return await prisma.invoiceReminder.findMany({
    where: {
      invoiceId,
      artisanId,
    },
    orderBy: {
      sentAt: 'desc',
    },
  })
}

// Récupérer toutes les relances d'un artisan
export async function getAllReminders(artisanId: string) {
  return await prisma.invoiceReminder.findMany({
    where: {
      artisanId,
    },
    include: {
      invoice: {
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
  })
}

