import { prisma } from './prisma'

interface CreateNotificationParams {
  artisanId: string
  type: 'intervention_status' | 'invoice_overdue' | 'intervention_reminder'
  title: string
  message: string
  clientId?: string
  interventionId?: string
  invoiceId?: string
  metadata?: any
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        artisanId: params.artisanId,
        clientId: params.clientId || null,
        interventionId: params.interventionId || null,
        invoiceId: params.invoiceId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    })

    // Note: L'envoi d'email/SMS au client peut être implémenté ici si nécessaire
    // await sendNotificationEmail(notification)
    // await sendNotificationSMS(notification)

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Créer une notification quand le statut d'une intervention change
export async function notifyInterventionStatusChange(
  interventionId: string,
  oldStatus: string,
  newStatus: string,
  artisanId: string,
  clientId: string,
  clientName: string,
  interventionTitle: string
) {
  const statusMessages: Record<string, string> = {
    in_progress: 'a commencé',
    completed: 'est terminée',
    cancelled: 'a été annulée',
  }

  if (oldStatus === newStatus) {
    console.log('Statut identique, pas de notification')
    return null
  }

  const message = statusMessages[newStatus]
  if (!message) {
    console.log(`Pas de message pour le statut: ${newStatus}`)
    return null
  }

  console.log(`Création notification: ${oldStatus} -> ${newStatus}`)
  
  const notification = await createNotification({
    artisanId,
    type: 'intervention_status',
    title: `Intervention ${message}`,
    message: `L'intervention "${interventionTitle}" pour ${clientName} ${message}.`,
    clientId,
    interventionId,
    metadata: {
      oldStatus,
      newStatus,
      interventionTitle,
    },
  })

  console.log('Notification créée avec succès:', notification.id)
  return notification
}

// Vérifier et créer des rappels pour les interventions à venir
export async function checkInterventionReminders(artisanId: string) {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

  // Interventions dans les 24 prochaines heures (demain)
  const interventions24h = await prisma.intervention.findMany({
    where: {
      artisanId,
      status: {
        in: ['planned'], // Seulement les interventions planifiées
      },
      date: {
        gte: tomorrow,
        lt: dayAfterTomorrow,
      },
    },
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
  })

  // Interventions aujourd'hui
  const todayInterventions = await prisma.intervention.findMany({
    where: {
      artisanId,
      status: {
        in: ['planned'], // Seulement les interventions planifiées
      },
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
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
  })

  // Créer des rappels pour les interventions dans 24h
  for (const intervention of interventions24h) {
    // Vérifier si un rappel existe déjà pour cette intervention (24h avant)
    // On vérifie toutes les notifications de type reminder pour cette intervention créées aujourd'hui
    const existingReminders = await prisma.notification.findMany({
      where: {
        artisanId,
        type: 'intervention_reminder',
        interventionId: intervention.id,
        createdAt: {
          gte: today, // Depuis le début de la journée
        },
      },
    })

    // Vérifier si un rappel 24h existe déjà
    const has24hReminder = existingReminders.some(notif => {
      if (!notif.metadata) return false
      try {
        const metadata = JSON.parse(notif.metadata)
        return metadata.reminderType === '24h'
      } catch {
        return false
      }
    })

    if (!has24hReminder) {
      const interventionDate = new Date(intervention.date)
      const timeStr = interventionDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

      await createNotification({
        artisanId,
        type: 'intervention_reminder',
        title: `Rappel intervention demain - ${intervention.title}`,
        message: `L'intervention "${intervention.title}" pour ${intervention.client.firstName} ${intervention.client.lastName} est prévue demain à ${timeStr}.${intervention.address ? ` Adresse: ${intervention.address}` : ''}`,
        clientId: intervention.client.id,
        interventionId: intervention.id,
        metadata: {
          reminderType: '24h',
          interventionDate: intervention.date,
          interventionTitle: intervention.title,
        },
      })
    }
  }

  // Créer des rappels pour les interventions aujourd'hui
  for (const intervention of todayInterventions) {
    // Vérifier si un rappel existe déjà pour cette intervention (jour même)
    const existingReminders = await prisma.notification.findMany({
      where: {
        artisanId,
        type: 'intervention_reminder',
        interventionId: intervention.id,
        createdAt: {
          gte: today, // Depuis le début de la journée
        },
      },
    })

    // Vérifier si un rappel "today" existe déjà
    const hasTodayReminder = existingReminders.some(notif => {
      if (!notif.metadata) return false
      try {
        const metadata = JSON.parse(notif.metadata)
        return metadata.reminderType === 'today'
      } catch {
        return false
      }
    })

    if (!hasTodayReminder) {
      const interventionDate = new Date(intervention.date)
      const timeStr = interventionDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

      await createNotification({
        artisanId,
        type: 'intervention_reminder',
        title: `Rappel intervention aujourd'hui - ${intervention.title}`,
        message: `L'intervention "${intervention.title}" pour ${intervention.client.firstName} ${intervention.client.lastName} est prévue aujourd'hui à ${timeStr}.${intervention.address ? ` Adresse: ${intervention.address}` : ''}`,
        clientId: intervention.client.id,
        interventionId: intervention.id,
        metadata: {
          reminderType: 'today',
          interventionDate: intervention.date,
          interventionTitle: intervention.title,
        },
      })
    }
  }

  return {
    reminders24h: interventions24h.length,
    remindersToday: todayInterventions.length,
  }
}

// Détecter et créer des notifications pour les factures en retard
export async function checkOverdueInvoices(artisanId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      artisanId,
      status: {
        in: ['sent', 'draft'],
      },
      dueDate: {
        lt: today,
      },
    },
    include: {
      client: true,
    },
  })

  for (const invoice of overdueInvoices) {
    // Vérifier si une notification existe déjà pour cette facture
    const existingNotification = await prisma.notification.findFirst({
      where: {
        artisanId,
        type: 'invoice_overdue',
        invoiceId: invoice.id,
        createdAt: {
          gte: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Dernières 24h
        },
      },
    })

    if (!existingNotification) {
      const daysOverdue = Math.floor(
        (today.getTime() - new Date(invoice.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
      )

      await createNotification({
        artisanId,
        type: 'invoice_overdue',
        title: `Facture en retard - ${invoice.invoiceNumber}`,
        message: `La facture #${invoice.invoiceNumber} de ${invoice.client.firstName} ${invoice.client.lastName} est en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}. Montant: ${invoice.total.toFixed(2)} €`,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total,
          daysOverdue,
        },
      })
    }
  }
}

// Envoyer une relance pour une facture en retard avec escalade automatique
export async function sendInvoiceReminder(
  invoiceId: string,
  artisanId: string,
  method: 'notification' | 'email' | 'sms' = 'notification'
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      artisanId,
    },
    include: {
      client: true,
      reminders: {
        orderBy: { reminderNumber: 'desc' },
        take: 1,
      },
    },
  })

  if (!invoice) {
    throw new Error('Facture non trouvée')
  }

  // Vérifier si la facture est en retard
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null

  if (!dueDate || dueDate >= today) {
    throw new Error('La facture n\'est pas en retard')
  }

  // Déterminer le numéro de relance (1, 2, ou 3)
  const lastReminder = invoice.reminders[0]
  const reminderNumber = lastReminder ? lastReminder.reminderNumber + 1 : 1

  if (reminderNumber > 3) {
    throw new Error('Nombre maximum de relances atteint (3)')
  }

  const daysOverdue = Math.floor(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Messages selon le numéro de relance
  const reminderMessages: Record<number, { title: string; message: string }> = {
    1: {
      title: `1ère relance - Facture ${invoice.invoiceNumber}`,
      message: `Bonjour ${invoice.client.firstName} ${invoice.client.lastName},\n\nNous vous rappelons que la facture #${invoice.invoiceNumber} d'un montant de ${invoice.total.toFixed(2)} € est en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}.\n\nMerci de régler cette facture dans les plus brefs délais.\n\nCordialement`,
    },
    2: {
      title: `2ème relance - Facture ${invoice.invoiceNumber}`,
      message: `Bonjour ${invoice.client.firstName} ${invoice.client.lastName},\n\nNous vous rappelons une nouvelle fois que la facture #${invoice.invoiceNumber} d'un montant de ${invoice.total.toFixed(2)} € est en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}.\n\nNous vous prions de bien vouloir régler cette facture dans les plus brefs délais.\n\nCordialement`,
    },
    3: {
      title: `3ème relance - Facture ${invoice.invoiceNumber}`,
      message: `Bonjour ${invoice.client.firstName} ${invoice.client.lastName},\n\nDernière relance concernant la facture #${invoice.invoiceNumber} d'un montant de ${invoice.total.toFixed(2)} €, en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}.\n\nNous vous demandons de régler cette facture immédiatement. À défaut, nous nous verrons contraints d'engager des poursuites.\n\nCordialement`,
    },
  }

  const reminderContent = reminderMessages[reminderNumber]

  // Créer l'enregistrement de relance
  const reminder = await prisma.invoiceReminder.create({
    data: {
      invoiceId: invoice.id,
      artisanId,
      reminderNumber,
      method,
      message: reminderContent.message,
      status: 'sent',
    },
  })

  // Créer une notification pour l'artisan
  await createNotification({
    artisanId,
    type: 'invoice_overdue',
    title: reminderContent.title,
    message: `Relance ${reminderNumber} envoyée pour la facture #${invoice.invoiceNumber} de ${invoice.client.firstName} ${invoice.client.lastName}. Montant: ${invoice.total.toFixed(2)} €`,
    clientId: invoice.clientId,
    invoiceId: invoice.id,
    metadata: {
      reminderNumber,
      method,
      daysOverdue,
    },
  })

  // Note: L'envoi d'email/SMS au client peut être implémenté ici si nécessaire
  // if (method === 'email' && invoice.client.email) {
  //   await sendEmail(invoice.client.email, reminderContent.title, reminderContent.message)
  // }
  // if (method === 'sms' && invoice.client.phone) {
  //   await sendSMS(invoice.client.phone, reminderContent.message)
  // }

  return reminder
}

// Vérifier et envoyer automatiquement les relances pour toutes les factures en retard
export async function checkAndSendInvoiceReminders(artisanId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      artisanId,
      status: {
        in: ['sent', 'draft', 'overdue'],
      },
      dueDate: {
        lt: today,
      },
    },
    include: {
      client: true,
      reminders: {
        orderBy: { reminderNumber: 'desc' },
      },
    },
  })

  const results = []

  for (const invoice of overdueInvoices) {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null
    if (!dueDate) continue

    const daysOverdue = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Déterminer quelle relance envoyer selon les jours de retard
    const lastReminder = invoice.reminders[0]
    const lastReminderNumber = lastReminder ? lastReminder.reminderNumber : 0
    const lastReminderDate = lastReminder ? new Date(lastReminder.sentAt) : dueDate
    const daysSinceLastReminder = Math.floor(
      (today.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    let shouldSendReminder = false
    let reminderNumber = 1

    // Logique d'escalade :
    // - 1ère relance : 7 jours après l'échéance
    // - 2ème relance : 7 jours après la 1ère relance (14 jours après échéance)
    // - 3ème relance : 7 jours après la 2ème relance (21 jours après échéance)
    if (lastReminderNumber === 0 && daysOverdue >= 7) {
      shouldSendReminder = true
      reminderNumber = 1
    } else if (lastReminderNumber === 1 && daysSinceLastReminder >= 7) {
      shouldSendReminder = true
      reminderNumber = 2
    } else if (lastReminderNumber === 2 && daysSinceLastReminder >= 7) {
      shouldSendReminder = true
      reminderNumber = 3
    }

    if (shouldSendReminder && lastReminderNumber < 3) {
      try {
        const reminder = await sendInvoiceReminder(invoice.id, artisanId, 'notification')
        results.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          reminderNumber,
          success: true,
        })
      } catch (error) {
        console.error(`Erreur lors de l'envoi de la relance pour ${invoice.invoiceNumber}:`, error)
        results.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          reminderNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        })
      }
    }
  }

  return results
}

